/**
 * 移动端服务层
 *
 * 移动端不跑 Agent——改写/意图识别由桌面端 Agent 处理。
 * 但消息直接发送不经过 Agent 改写，用户在手机上的输入直接发出。
 * 如果需要 Agent 改写，用户应在桌面端操作。
 */

import { OttieMatrix } from '@ottie-im/matrix'
import type { OttieMessage, Unsubscribe } from '@ottie-im/contracts'

const MATRIX_BASE_URL = process.env.EXPO_PUBLIC_MATRIX_URL ?? 'http://localhost:8008'
const REG_TOKEN = process.env.EXPO_PUBLIC_REG_TOKEN ?? 'ottie-dev-token'

let matrix: OttieMatrix | null = null
let syncing = false

export function getMatrix(): OttieMatrix {
  if (!matrix) throw new Error('Not logged in')
  return matrix
}

// Auth
export async function login(username: string, password: string): Promise<string> {
  matrix = new OttieMatrix({ baseUrl: MATRIX_BASE_URL })
  const session = await matrix.login(username, password)
  return session.userId
}

export async function register(username: string, password: string): Promise<string> {
  matrix = new OttieMatrix({ baseUrl: MATRIX_BASE_URL })
  const session = await matrix.register(username, password, REG_TOKEN)
  return session.userId
}

export async function startSync(): Promise<void> {
  if (syncing) return
  await getMatrix().startSync()
  syncing = true
}

// Messages
export async function sendMessage(roomId: string, body: string, replyTo?: string): Promise<OttieMessage> {
  return getMatrix().sendMessage(roomId, { type: 'text', body }, replyTo)
}

export async function getMessages(roomId: string, limit = 50): Promise<OttieMessage[]> {
  return getMatrix().getMessages(roomId, limit)
}

export function onMessage(callback: (msg: OttieMessage) => void): Unsubscribe {
  return getMatrix().onMessage(callback)
}

// Friends
export function getRooms() { return getMatrix().getRooms() }
export function getSession() { return matrix?.getSession() ?? null }
export function getFriends() { return getMatrix().getFriends() }
export async function searchUsers(query: string) { return getMatrix().searchUsers(query) }
export async function sendFriendRequest(userId: string) { return getMatrix().sendFriendRequest(userId) }
export async function respondToFriendRequest(roomId: string, accept: boolean) { return getMatrix().respondToFriendRequest(roomId, accept) }

// Profile
export async function getProfile(userId?: string) { return getMatrix().getProfile(userId) }
export async function setDisplayName(name: string) { return getMatrix().setDisplayName(name) }

// Presence
export async function sendReadReceipt(roomId: string, eventId: string) { return getMatrix().sendReadReceipt(roomId, eventId) }
