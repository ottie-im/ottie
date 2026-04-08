import sdk, { MatrixClient, MatrixEvent, Room, RoomMemberEvent, RoomEvent, ClientEvent, Direction } from 'matrix-js-sdk'
import type {
  OttieMessage,
  OttieMessageContent,
  Unsubscribe,
  Friend,
  FriendRequest,
  FriendGroup,
  BlockedUser,
  MessageRecall,
  OttieUser,
} from '@ottie-im/contracts'

// ---- Types ----

export interface OttieMatrixConfig {
  baseUrl: string
}

export interface Session {
  accessToken: string
  userId: string
  deviceId: string
}

// ---- Helper: convert Matrix event → OttieMessage ----

function matrixEventToOttieMessage(event: MatrixEvent): OttieMessage {
  const content = event.getContent()
  const msgContent: OttieMessageContent = content.msgtype === 'm.text'
    ? { type: 'text', body: content.body ?? '' }
    : content.msgtype === 'm.file'
      ? { type: 'file', filename: content.body ?? '', url: content.url ?? '', mimeType: content.info?.mimetype ?? 'application/octet-stream' }
      : { type: 'text', body: content.body ?? '' }

  return {
    id: event.getId() ?? '',
    roomId: event.getRoomId() ?? '',
    senderId: event.getSender() ?? '',
    timestamp: event.getTs(),
    type: msgContent.type === 'file' ? 'file' : 'text',
    content: msgContent,
  }
}

// ---- OttieMatrix class ----

export class OttieMatrix {
  private config: OttieMatrixConfig
  private client: MatrixClient | null = null
  private session: Session | null = null
  private friendGroups: Map<string, string> = new Map() // userId → group name
  private blockedUsers: Map<string, BlockedUser> = new Map()

  constructor(config: OttieMatrixConfig) {
    this.config = config
  }

  // ============================================================
  // 登录 / 注册 / 登出
  // ============================================================

  async register(username: string, password: string, token?: string): Promise<Session> {
    const tempClient = sdk.createClient({ baseUrl: this.config.baseUrl })

    // Step 1: initiate registration to get session
    let session: string
    try {
      const resp = await tempClient.registerRequest({ username, password, auth: { type: 'm.login.dummy' } })
      // If registration succeeds without token (unlikely with our config)
      this.session = {
        accessToken: resp.access_token!,
        userId: resp.user_id,
        deviceId: resp.device_id!,
      }
      this.initClient()
      return this.session
    } catch (err: any) {
      if (err.data?.session) {
        session = err.data.session
      } else {
        throw err
      }
    }

    // Step 2: complete with registration token
    const resp = await tempClient.registerRequest({
      username,
      password,
      auth: {
        type: 'm.login.registration_token',
        token: token ?? '',
        session,
      },
    })

    this.session = {
      accessToken: resp.access_token!,
      userId: resp.user_id,
      deviceId: resp.device_id!,
    }
    this.initClient()
    return this.session
  }

  async login(username: string, password: string): Promise<Session> {
    const tempClient = sdk.createClient({ baseUrl: this.config.baseUrl })
    const resp = await tempClient.login('m.login.password', {
      user: username,
      password,
    })

    this.session = {
      accessToken: resp.access_token!,
      userId: resp.user_id,
      deviceId: resp.device_id!,
    }
    this.initClient()
    return this.session
  }

  async logout(): Promise<void> {
    if (this.client) {
      this.client.stopClient()
      try {
        await this.client.logout(true)
      } catch {
        // ignore logout errors
      }
      this.client = null
    }
    this.session = null
  }

  private initClient(): void {
    if (!this.session) throw new Error('Not logged in')
    this.client = sdk.createClient({
      baseUrl: this.config.baseUrl,
      accessToken: this.session.accessToken,
      userId: this.session.userId,
      deviceId: this.session.deviceId,
    })
  }

  private ensureClient(): MatrixClient {
    if (!this.client) throw new Error('Not logged in')
    return this.client
  }

  // ============================================================
  // 同步
  // ============================================================

  async startSync(): Promise<void> {
    const client = this.ensureClient()
    await client.startClient({ initialSyncLimit: 20 })

    // Wait for initial sync
    await new Promise<void>((resolve) => {
      const onSync = (state: string) => {
        if (state === 'PREPARED') {
          client.removeListener(ClientEvent.Sync, onSync)
          resolve()
        }
      }
      client.on(ClientEvent.Sync, onSync)
    })
  }

  stopSync(): void {
    this.client?.stopClient()
  }

  // ============================================================
  // 消息收发
  // ============================================================

  async sendMessage(roomId: string, content: OttieMessageContent): Promise<OttieMessage> {
    const client = this.ensureClient()
    let matrixContent: Record<string, unknown>

    if (content.type === 'text') {
      matrixContent = { msgtype: 'm.text', body: content.body }
    } else if (content.type === 'file') {
      matrixContent = { msgtype: 'm.file', body: content.filename, url: content.url, info: { mimetype: content.mimeType } }
    } else {
      matrixContent = { msgtype: 'm.text', body: JSON.stringify(content) }
    }

    const resp = await client.sendEvent(roomId, 'm.room.message' as any, matrixContent)

    return {
      id: resp.event_id,
      roomId,
      senderId: this.session!.userId,
      timestamp: Date.now(),
      type: content.type === 'file' ? 'file' : 'text',
      content,
    }
  }

  onMessage(callback: (msg: OttieMessage) => void): Unsubscribe {
    const client = this.ensureClient()
    const handler = (event: MatrixEvent) => {
      if (event.getType() !== 'm.room.message') return
      // Skip own messages
      if (event.getSender() === this.session?.userId) return
      // Skip redacted messages
      if (event.isRedacted()) return
      callback(matrixEventToOttieMessage(event))
    }
    client.on(RoomEvent.Timeline, handler)
    return () => client.removeListener(RoomEvent.Timeline, handler)
  }

  async getMessages(roomId: string, limit = 50): Promise<OttieMessage[]> {
    const client = this.ensureClient()
    const resp = await client.createMessagesRequest(roomId, '', limit, Direction.Backward)
    return (resp.chunk ?? [])
      .filter((e: any) => e.type === 'm.room.message' && !e.unsigned?.redacted_because)
      .map((e: any) => {
        const content: OttieMessageContent = e.content.msgtype === 'm.text'
          ? { type: 'text', body: e.content.body }
          : { type: 'text', body: e.content.body ?? '' }
        return {
          id: e.event_id,
          roomId,
          senderId: e.sender,
          timestamp: e.origin_server_ts,
          type: 'text' as const,
          content,
        }
      })
  }

  // ============================================================
  // 消息撤回
  // ============================================================

  async recallMessage(roomId: string, messageId: string): Promise<void> {
    const client = this.ensureClient()
    await client.redactEvent(roomId, messageId)
  }

  onMessageRecall(callback: (recall: MessageRecall) => void): Unsubscribe {
    const client = this.ensureClient()
    const handler = (event: MatrixEvent) => {
      if (event.getType() !== 'm.room.redaction') return
      callback({
        messageId: event.getAssociatedId() ?? '',
        roomId: event.getRoomId() ?? '',
        recalledBy: event.getSender() ?? '',
        timestamp: event.getTs(),
      })
    }
    client.on(RoomEvent.Timeline, handler)
    return () => client.removeListener(RoomEvent.Timeline, handler)
  }

  // ============================================================
  // 好友管理
  // ============================================================

  async searchUsers(query: string): Promise<Pick<OttieUser, 'matrixId' | 'displayName' | 'avatarUrl'>[]> {
    const client = this.ensureClient()
    const resp = await client.searchUserDirectory({ term: query })
    return resp.results.map((u: any) => ({
      matrixId: u.user_id,
      displayName: u.display_name ?? u.user_id,
      avatarUrl: u.avatar_url,
    }))
  }

  async sendFriendRequest(userId: string, message?: string): Promise<FriendRequest> {
    const client = this.ensureClient()

    // Create a 1v1 DM room and invite the user
    const resp = await client.createRoom({
      invite: [userId],
      is_direct: true,
      preset: 'trusted_private_chat' as any,
      name: undefined,
      topic: message,
    })

    return {
      id: resp.room_id,
      from: this.session!.userId,
      to: userId,
      timestamp: Date.now(),
      message,
      status: 'pending',
    }
  }

  async respondToFriendRequest(roomId: string, accept: boolean): Promise<void> {
    const client = this.ensureClient()
    if (accept) {
      await client.joinRoom(roomId)
    } else {
      await client.leave(roomId)
    }
  }

  onFriendRequest(callback: (req: FriendRequest) => void): Unsubscribe {
    const client = this.ensureClient()
    const handler = (event: MatrixEvent, member: any) => {
      if (
        member.membership === 'invite' &&
        member.userId === this.session?.userId
      ) {
        const room = client.getRoom(member.roomId)
        const isDirect = room?.getMyMembership() === 'invite'
        if (isDirect) {
          callback({
            id: member.roomId,
            from: event.getSender() ?? '',
            to: this.session!.userId,
            timestamp: event.getTs(),
            message: room?.currentState?.getStateEvents('m.room.topic', '')?.getContent()?.topic,
            status: 'pending',
          })
        }
      }
    }
    client.on(RoomMemberEvent.Membership, handler)
    return () => client.removeListener(RoomMemberEvent.Membership, handler)
  }

  getFriends(): Friend[] {
    const client = this.ensureClient()
    const rooms = client.getRooms()
    const friends: Friend[] = []

    for (const room of rooms) {
      // Check if this is a DM (direct message) room
      const members = room.getJoinedMembers()
      if (members.length === 2 && room.getMyMembership() === 'join') {
        const other = members.find(m => m.userId !== this.session?.userId)
        if (other && !this.blockedUsers.has(other.userId)) {
          friends.push({
            userId: other.userId,
            displayName: other.name ?? other.userId,
            avatarUrl: other.getAvatarUrl(this.config.baseUrl, 64, 64, 'crop', false, false) ?? undefined,
            roomId: room.roomId,
            addedAt: room.getLastActiveTimestamp() ?? 0,
            group: this.friendGroups.get(other.userId),
          })
        }
      }
    }

    return friends
  }

  // ============================================================
  // 好友分组
  // ============================================================

  setFriendGroup(userId: string, group: string): void {
    this.friendGroups.set(userId, group)
  }

  removeFriendGroup(userId: string): void {
    this.friendGroups.delete(userId)
  }

  getFriendGroups(): FriendGroup[] {
    const groups = new Map<string, string[]>()
    for (const [userId, group] of this.friendGroups) {
      if (!groups.has(group)) groups.set(group, [])
      groups.get(group)!.push(userId)
    }
    return Array.from(groups.entries()).map(([name, memberIds]) => ({ name, memberIds }))
  }

  // ============================================================
  // 黑名单
  // ============================================================

  async blockUser(userId: string, reason?: string): Promise<void> {
    const client = this.ensureClient()
    // Matrix ignore list
    const ignoreList = client.getIgnoredUsers()
    if (!ignoreList.includes(userId)) {
      await client.setIgnoredUsers([...ignoreList, userId])
    }
    this.blockedUsers.set(userId, {
      userId,
      blockedAt: Date.now(),
      reason,
    })
  }

  async unblockUser(userId: string): Promise<void> {
    const client = this.ensureClient()
    const ignoreList = client.getIgnoredUsers()
    await client.setIgnoredUsers(ignoreList.filter(id => id !== userId))
    this.blockedUsers.delete(userId)
  }

  getBlockedUsers(): BlockedUser[] {
    return Array.from(this.blockedUsers.values())
  }

  isBlocked(userId: string): boolean {
    return this.blockedUsers.has(userId)
  }

  // ============================================================
  // 房间
  // ============================================================

  getRooms(): Room[] {
    return this.ensureClient().getRooms()
  }

  getSession(): Session | null {
    return this.session
  }
}
