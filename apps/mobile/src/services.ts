/**
 * 移动端服务层 — 纯 HTTP fetch，不依赖 matrix-js-sdk
 *
 * matrix-js-sdk 依赖 Node.js crypto/buffer，在 React Native 不可用。
 * 移动端直接调 Matrix REST API。
 */

const MATRIX_URL = process.env.EXPO_PUBLIC_MATRIX_URL ?? 'https://ottie.claws.company'
const REG_TOKEN = process.env.EXPO_PUBLIC_REG_TOKEN ?? 'ottie-dev-token'

let accessToken: string | null = null
let userId: string | null = null

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

// Auth
export async function login(username: string, password: string): Promise<string> {
  const data = await api('POST', '/_matrix/client/v3/login', {
    type: 'm.login.password',
    identifier: { type: 'm.id.user', user: username },
    password,
  })
  if (data.errcode) throw new Error(data.error ?? data.errcode)
  accessToken = data.access_token
  userId = data.user_id
  return data.user_id
}

export async function register(username: string, password: string): Promise<string> {
  // Step 1
  const step1 = await api('POST', '/_matrix/client/v3/register', {
    username, password, auth: { type: 'm.login.dummy' },
  })
  const session = step1.session
  if (!session) {
    if (step1.access_token) { accessToken = step1.access_token; userId = step1.user_id; return step1.user_id }
    throw new Error(step1.error ?? 'Registration failed')
  }
  // Step 2
  const step2 = await api('POST', '/_matrix/client/v3/register', {
    username, password, auth: { type: 'm.login.registration_token', token: REG_TOKEN, session },
  })
  if (step2.errcode) throw new Error(step2.error ?? step2.errcode)
  accessToken = step2.access_token
  userId = step2.user_id
  return step2.user_id
}

export function getSession() { return accessToken ? { userId, accessToken } : null }
export function getUserId() { return userId }

// Rooms
export async function getJoinedRooms(): Promise<string[]> {
  const data = await api('GET', '/_matrix/client/v3/joined_rooms')
  return data.joined_rooms ?? []
}

export async function getRoomMessages(roomId: string, limit = 30): Promise<any[]> {
  const data = await api('GET', `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/messages?dir=b&limit=${limit}`)
  return (data.chunk ?? []).filter((e: any) => e.type === 'm.room.message').reverse()
}

// Messages
export async function sendMessage(roomId: string, body: string): Promise<any> {
  const txnId = `m${Date.now()}`
  return api('PUT', `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${txnId}`, {
    msgtype: 'm.text', body,
  })
}

// Friends
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

// Profile
export async function getProfile(uid?: string): Promise<{ displayname: string; avatar_url?: string }> {
  const target = uid ?? userId
  return api('GET', `/_matrix/client/v3/profile/${encodeURIComponent(target!)}`)
}

export async function setDisplayName(name: string): Promise<void> {
  await api('PUT', `/_matrix/client/v3/profile/${encodeURIComponent(userId!)}/displayname`, { displayname: name })
}

// Read receipt
export async function sendReadReceipt(roomId: string, eventId: string): Promise<void> {
  await api('POST', `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/receipt/m.read/${encodeURIComponent(eventId)}`, {})
}

// Room members (to get room name)
export async function getRoomMembers(roomId: string): Promise<any[]> {
  const data = await api('GET', `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/joined_members`)
  return Object.entries(data.joined ?? {}).map(([id, info]: [string, any]) => ({
    userId: id, displayName: info.display_name ?? id,
  }))
}
