/**
 * 移动端服务层 — Matrix REST API + /sync 长轮询实时同步
 *
 * matrix-js-sdk 依赖 Node.js crypto/buffer，在 React Native 不可用。
 * 移动端直接调 Matrix REST API，用 /sync 长轮询实现实时消息接收。
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

const MATRIX_URL = process.env.EXPO_PUBLIC_MATRIX_URL ?? 'https://ottie.claws.company'
const REG_TOKEN = process.env.EXPO_PUBLIC_REG_TOKEN ?? 'ottie-dev-token'
const SESSION_KEY = 'ottie_session'

let accessToken: string | null = null
let userId: string | null = null

// Sync 状态
let syncToken: string | null = null
let syncRunning = false
let messageCallbacks: Set<(msg: any) => void> = new Set()

function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (accessToken) h['Authorization'] = `Bearer ${accessToken}`
  return h
}

async function api(method: string, path: string, body?: any) {
  const resp = await fetch(`${MATRIX_URL}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  return resp.json()
}

// ============================================================
// Auth
// ============================================================

export async function login(username: string, password: string): Promise<string> {
  const data = await api('POST', '/_matrix/client/v3/login', {
    type: 'm.login.password',
    identifier: { type: 'm.id.user', user: username },
    password,
  })
  if (data.errcode) throw new Error(data.error ?? data.errcode)
  accessToken = data.access_token
  userId = data.user_id
  await saveSession()
  startSync()
  return data.user_id
}

export async function register(username: string, password: string): Promise<string> {
  // Step 1
  const step1 = await api('POST', '/_matrix/client/v3/register', {
    username, password, auth: { type: 'm.login.dummy' },
  })
  const session = step1.session
  if (!session) {
    if (step1.access_token) {
      accessToken = step1.access_token; userId = step1.user_id
      await saveSession()
      startSync()
      return step1.user_id
    }
    throw new Error(step1.error ?? 'Registration failed')
  }
  // Step 2
  const step2 = await api('POST', '/_matrix/client/v3/register', {
    username, password, auth: { type: 'm.login.registration_token', token: REG_TOKEN, session },
  })
  if (step2.errcode) throw new Error(step2.error ?? step2.errcode)
  accessToken = step2.access_token
  userId = step2.user_id
  await saveSession()
  startSync()
  return step2.user_id
}

export async function logout(): Promise<void> {
  stopSync()
  try { await api('POST', '/_matrix/client/v3/logout') } catch {}
  accessToken = null
  userId = null
  await AsyncStorage.removeItem(SESSION_KEY)
}

export function getSession() { return accessToken ? { userId, accessToken } : null }
export function getUserId() { return userId }

// ============================================================
// Session 持久化
// ============================================================

async function saveSession() {
  if (accessToken && userId) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken, userId }))
  }
}

export async function restoreSession(): Promise<boolean> {
  try {
    const saved = await AsyncStorage.getItem(SESSION_KEY)
    if (!saved) return false
    const { accessToken: token, userId: uid } = JSON.parse(saved)
    if (!token || !uid) return false
    accessToken = token
    userId = uid
    // 验证 token 是否仍然有效
    const whoami = await api('GET', '/_matrix/client/v3/account/whoami')
    if (whoami.errcode) {
      accessToken = null; userId = null
      await AsyncStorage.removeItem(SESSION_KEY)
      return false
    }
    startSync()
    return true
  } catch {
    return false
  }
}

// ============================================================
// QR 扫码登录 — 从桌面端扫码获取 server URL + 登录信息
// ============================================================

export interface QRLoginData {
  serverUrl: string
  userId: string
  // 注意：不传 accessToken，只传服务器地址让手机自己登录
}

export function parseQRCode(data: string): QRLoginData | null {
  try {
    // QR 格式: ottie://login?server=xxx&user=xxx
    if (data.startsWith('ottie://login')) {
      const url = new URL(data)
      return {
        serverUrl: url.searchParams.get('server') ?? MATRIX_URL,
        userId: url.searchParams.get('user') ?? '',
      }
    }
    // 尝试 JSON 格式
    const parsed = JSON.parse(data)
    if (parsed.serverUrl) return parsed as QRLoginData
    return null
  } catch {
    return null
  }
}

// ============================================================
// Sync 长轮询 — 实时消息接收
// ============================================================

export function startSync() {
  if (syncRunning || !accessToken) return
  syncRunning = true

  // 异步启动，不阻塞
  ;(async () => {
    try {
      // 首次 sync — 不等待，只拿 next_batch token
      const initial = await api('GET',
        '/_matrix/client/v3/sync?timeout=0&filter={"room":{"timeline":{"limit":1}}}')
      if (initial.errcode) { syncRunning = false; return }
      syncToken = initial.next_batch
      // 开始长轮询
      syncLoop()
    } catch {
      syncRunning = false
    }
  })()
}

async function syncLoop() {
  while (syncRunning && accessToken && syncToken) {
    try {
      const data = await api('GET',
        `/_matrix/client/v3/sync?since=${syncToken}&timeout=30000&filter={"room":{"timeline":{"limit":50}}}`)

      if (data.errcode) {
        // Token 失效 → 停止
        if (data.errcode === 'M_UNKNOWN_TOKEN') { syncRunning = false; return }
        await delay(5000)
        continue
      }

      syncToken = data.next_batch

      // 处理加入的房间里的新消息
      const rooms = data.rooms?.join ?? {}
      for (const [roomId, room] of Object.entries(rooms as Record<string, any>)) {
        const events = room.timeline?.events ?? []
        for (const event of events) {
          if (event.type === 'm.room.message') {
            const msg = {
              id: event.event_id,
              roomId,
              senderId: event.sender,
              timestamp: event.origin_server_ts,
              content: {
                type: 'text',
                body: event.content?.body ?? '',
              },
            }
            for (const cb of messageCallbacks) {
              try { cb(msg) } catch {}
            }
          }
        }
      }
    } catch {
      // 网络错误 → 等 5 秒重试
      await delay(5000)
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export function onMessage(callback: (msg: any) => void): () => void {
  messageCallbacks.add(callback)
  return () => messageCallbacks.delete(callback)
}

export function stopSync() {
  syncRunning = false
  messageCallbacks.clear()
  syncToken = null
}

export function isSyncing(): boolean {
  return syncRunning
}

// ============================================================
// Rooms
// ============================================================

export async function getJoinedRooms(): Promise<string[]> {
  const data = await api('GET', '/_matrix/client/v3/joined_rooms')
  return data.joined_rooms ?? []
}

export async function getRoomMessages(roomId: string, limit = 30): Promise<any[]> {
  const data = await api('GET', `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/messages?dir=b&limit=${limit}`)
  return (data.chunk ?? []).filter((e: any) => e.type === 'm.room.message').reverse()
}

// ============================================================
// Messages
// ============================================================

export async function sendMessage(roomId: string, body: string, replyTo?: string): Promise<any> {
  const txnId = `m${Date.now()}`
  const content: any = { msgtype: 'm.text', body }
  if (replyTo) {
    content['m.relates_to'] = { 'm.in_reply_to': { event_id: replyTo } }
  }
  return api('PUT', `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${txnId}`, content)
}

// ============================================================
// Friends
// ============================================================

export async function searchUsers(query: string): Promise<any[]> {
  const data = await api('POST', '/_matrix/client/v3/user_directory/search', { search_term: query })
  return data.results ?? []
}

export async function sendFriendRequest(targetUserId: string): Promise<string> {
  const data = await api('POST', '/_matrix/client/v3/createRoom', {
    invite: [targetUserId], is_direct: true,
  })
  return data.room_id
}

export async function joinRoom(roomId: string): Promise<void> {
  await api('POST', `/_matrix/client/v3/join/${encodeURIComponent(roomId)}`, {})
}

// ============================================================
// Profile
// ============================================================

export async function getProfile(uid?: string): Promise<{ displayname: string; avatar_url?: string }> {
  const target = uid ?? userId
  return api('GET', `/_matrix/client/v3/profile/${encodeURIComponent(target!)}`)
}

export async function setDisplayName(name: string): Promise<void> {
  await api('PUT', `/_matrix/client/v3/profile/${encodeURIComponent(userId!)}/displayname`, { displayname: name })
}

// ============================================================
// Read receipt
// ============================================================

export async function sendReadReceipt(roomId: string, eventId: string): Promise<void> {
  await api('POST', `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/receipt/m.read/${encodeURIComponent(eventId)}`, {})
}

// ============================================================
// Room members
// ============================================================

export async function getRoomMembers(roomId: string): Promise<any[]> {
  const data = await api('GET', `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/joined_members`)
  return Object.entries(data.joined ?? {}).map(([id, info]: [string, any]) => ({
    userId: id, displayName: info.display_name ?? id,
  }))
}
