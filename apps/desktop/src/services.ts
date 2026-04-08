/**
 * 服务层：封装 OttieMatrix + OpenClawAdapter，供 UI 调用
 *
 * 全局单例，登录后初始化，登出后销毁。
 */

import { OttieMatrix } from '@ottie-im/matrix'
import type { OttieMessage, OttieMessageContent, ApprovalRequest, ApprovalDecision, Unsubscribe } from '@ottie-im/contracts'

const MATRIX_BASE_URL = 'http://localhost:8008'
const REG_TOKEN = 'ottie-dev-token'

// ---- Singleton ----

let matrix: OttieMatrix | null = null
let syncing = false

export function getMatrix(): OttieMatrix {
  if (!matrix) throw new Error('Not logged in')
  return matrix
}

// ---- Auth ----

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

export async function logout(): Promise<void> {
  if (matrix) {
    matrix.stopSync()
    await matrix.logout()
    matrix = null
    syncing = false
  }
}

// ---- Sync ----

export async function startSync(): Promise<void> {
  if (syncing) return
  const m = getMatrix()
  await m.startSync()
  syncing = true
}

// ---- Messages ----

export async function sendMessage(roomId: string, body: string): Promise<OttieMessage> {
  const m = getMatrix()
  return m.sendMessage(roomId, { type: 'text', body })
}

export async function getMessages(roomId: string, limit = 50): Promise<OttieMessage[]> {
  const m = getMatrix()
  return m.getMessages(roomId, limit)
}

export function onMessage(callback: (msg: OttieMessage) => void): Unsubscribe {
  const m = getMatrix()
  return m.onMessage(callback)
}

// ---- Recall ----

export async function recallMessage(roomId: string, messageId: string): Promise<void> {
  const m = getMatrix()
  return m.recallMessage(roomId, messageId)
}

// ---- Friends ----

export async function searchUsers(query: string) {
  const m = getMatrix()
  return m.searchUsers(query)
}

export async function sendFriendRequest(userId: string, message?: string) {
  const m = getMatrix()
  return m.sendFriendRequest(userId, message)
}

export async function respondToFriendRequest(roomId: string, accept: boolean) {
  const m = getMatrix()
  return m.respondToFriendRequest(roomId, accept)
}

export function getFriends() {
  const m = getMatrix()
  return m.getFriends()
}

// ---- Block ----

export async function blockUser(userId: string) {
  const m = getMatrix()
  return m.blockUser(userId)
}

export async function unblockUser(userId: string) {
  const m = getMatrix()
  return m.unblockUser(userId)
}

// ---- Typing ----

export async function sendTyping(roomId: string, isTyping: boolean): Promise<void> {
  const m = getMatrix()
  return m.sendTyping(roomId, isTyping)
}

export function onTyping(callback: (roomId: string, userIds: string[]) => void) {
  const m = getMatrix()
  return m.onTyping(callback)
}

// ---- Presence ----

export async function setPresence(status: 'online' | 'offline' | 'unavailable') {
  const m = getMatrix()
  return m.setPresence(status)
}

export function getPresence(userId: string) {
  const m = getMatrix()
  return m.getPresence(userId)
}

export function onPresenceChange(callback: (userId: string, presence: 'online' | 'offline' | 'unavailable') => void) {
  const m = getMatrix()
  return m.onPresenceChange(callback)
}

// ---- Read Receipts ----

export async function sendReadReceipt(roomId: string, eventId: string) {
  const m = getMatrix()
  return m.sendReadReceipt(roomId, eventId)
}

export function onReadReceipt(callback: (roomId: string, userId: string, eventId: string) => void) {
  const m = getMatrix()
  return m.onReadReceipt(callback)
}

// ---- File Upload ----

export async function uploadAndSendImage(roomId: string, file: File) {
  const m = getMatrix()
  const mxcUrl = await m.uploadContent(file)
  return m.sendImageMessage(roomId, file, mxcUrl)
}

export async function uploadAndSendFile(roomId: string, file: File) {
  const m = getMatrix()
  const mxcUrl = await m.uploadContent(file)
  return m.sendFileMessage(roomId, file, mxcUrl)
}

export function mxcToHttp(mxcUrl: string): string {
  const m = getMatrix()
  return m.mxcToHttp(mxcUrl)
}

// ---- Profile ----

export async function setDisplayName(name: string) {
  const m = getMatrix()
  return m.setDisplayName(name)
}

export async function setAvatar(file: File) {
  const m = getMatrix()
  return m.setAvatar(file)
}

export async function getProfile(userId?: string) {
  const m = getMatrix()
  return m.getProfile(userId)
}

// ---- Search ----

export async function searchMessages(query: string, roomId?: string) {
  const m = getMatrix()
  return m.searchMessages(query, roomId)
}

// ---- Rooms ----

export function getRooms() {
  const m = getMatrix()
  return m.getRooms()
}

export function getSession() {
  return matrix?.getSession() ?? null
}

// ---- Simple rewrite (inline, no separate Agent process for now) ----

const COMMAND_PATTERNS = [
  { pattern: /^(帮我|替我|跟他|跟她|告诉他|告诉她|问他|问她|和他说|和她说|跟他说|跟她说)(.+)/, extract: 2 },
  { pattern: /^(tell him|tell her|ask him|ask her|let him know|let her know)\s+(.+)/i, extract: 2 },
]

export function rewriteIntent(intent: string): string {
  let text = intent.trim()

  for (const { pattern, extract } of COMMAND_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[extract]) {
      text = match[extract].trim()
      break
    }
  }

  if (text && !/[。？！.?!]$/.test(text)) {
    if (/吗|呢|么|嘛|不$|没$|\?/.test(text)) {
      text += '？'
    } else {
      text += '。'
    }
  }

  if (/^[a-z]/.test(text)) {
    text = text.charAt(0).toUpperCase() + text.slice(1)
  }

  return text
}
