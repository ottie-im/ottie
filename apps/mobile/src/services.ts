/**
 * 移动端服务层
 *
 * 跟桌面端类似但更精简——移动端不跑 Agent，只连 Matrix。
 * Agent 改写/意图识别通过桌面端的 Agent 处理（同一个 Matrix 账号）。
 */

import { OttieMatrix } from '@ottie-im/matrix'
import type { OttieMessage, Unsubscribe } from '@ottie-im/contracts'

// 默认连本机 Tuwunel，实际使用时改成服务器地址
const MATRIX_BASE_URL = 'http://localhost:8008'
const REG_TOKEN = 'ottie-dev-token'

let matrix: OttieMatrix | null = null
let syncing = false

export function getMatrix(): OttieMatrix {
  if (!matrix) throw new Error('Not logged in')
  return matrix
}

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

export async function sendMessage(roomId: string, body: string): Promise<OttieMessage> {
  return getMatrix().sendMessage(roomId, { type: 'text', body })
}

export async function getMessages(roomId: string, limit = 50): Promise<OttieMessage[]> {
  return getMatrix().getMessages(roomId, limit)
}

export function onMessage(callback: (msg: OttieMessage) => void): Unsubscribe {
  return getMatrix().onMessage(callback)
}

export function getRooms() { return getMatrix().getRooms() }
export function getSession() { return matrix?.getSession() ?? null }
export function getFriends() { return getMatrix().getFriends() }
