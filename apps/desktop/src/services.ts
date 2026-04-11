/**
 * 服务层：封装 OttieMatrix + OttieAgentAdapter，供 UI 调用
 *
 * IM 层（本文件）不包含任何 Agent 逻辑（改写、意图识别、回复生成）。
 * 所有 Agent 能力通过 OttieAgentAdapter 接口获得。
 */

import { OttieMatrix } from '@ottie-im/matrix'
import type { OttieMessage, Unsubscribe, OttieAgentAdapter } from '@ottie-im/contracts'
import { MissionControlAdapter } from '@ottie-im/agent-adapter'

const MATRIX_BASE_URL = import.meta.env.VITE_MATRIX_URL ?? 'http://localhost:8008'
const REG_TOKEN = import.meta.env.VITE_REG_TOKEN ?? 'ottie-dev-token'
const CREDENTIALS_KEY = 'ottie_credentials'

// ---- Singletons ----

let matrix: OttieMatrix | null = null
let agent: OttieAgentAdapter | null = null
let syncing = false
let reconnectTimer: ReturnType<typeof setTimeout> | undefined

export function getMatrix(): OttieMatrix {
  if (!matrix) throw new Error('Not logged in')
  return matrix
}

export function getAgent(): OttieAgentAdapter {
  if (!agent) throw new Error('Agent not initialized')
  return agent
}

// ---- Agent ----

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:18790'

export function initAgent() {
  // 读取用户保存的 LLM 配置
  let llmConfig: any = undefined
  try {
    const saved = localStorage.getItem('ottie_agent_config')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.apiKey) {
        llmConfig = {
          provider: (parsed.provider ?? 'custom') as any,
          apiKey: parsed.apiKey,
          model: parsed.model,
          baseUrl: parsed.baseUrl,
        }
      }
    }
  } catch {}

  // 读取 Paseo 配置（设备执行层）
  let paseoConfig: any = undefined
  try {
    const saved = localStorage.getItem('ottie_paseo_config')
    if (saved) paseoConfig = JSON.parse(saved)
  } catch {}

  const adapter = new MissionControlAdapter({
    name: 'Ottie',
    persona: '友好、得体、简洁',
    gatewayUrl: GATEWAY_URL,
    agentId: 'personal',
    deviceAgentId: 'device',
    autoApproveThreshold: 0.8,
    boundaries: [],
    llm: llmConfig,
    paseo: paseoConfig ?? {
      daemonUrl: import.meta.env.VITE_PASEO_URL ?? 'http://localhost:6767',
      defaultProvider: 'claude',
    },
  })
  agent = adapter
  adapter.start()
}

// ---- Credentials ----

function saveCredentials(username: string, password: string) {
  try { localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ username, password })) } catch {}
}
function loadCredentials(): { username: string; password: string } | null {
  try { const r = localStorage.getItem(CREDENTIALS_KEY); return r ? JSON.parse(r) : null } catch { return null }
}
function clearCredentials() {
  try { localStorage.removeItem(CREDENTIALS_KEY) } catch {}
}

// ---- Reconnection ----

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = undefined
    try {
      const { useAppStore } = await import('./store')
      useAppStore.getState().setConnectionStatus('reconnecting')
      const creds = loadCredentials()
      if (creds && !syncing) {
        matrix = new OttieMatrix({ baseUrl: MATRIX_BASE_URL })
        await matrix.login(creds.username, creds.password)
        await matrix.startSync()
        syncing = true
        useAppStore.getState().setConnectionStatus('connected')
      }
    } catch { scheduleReconnect() }
  }, 5000)
}

// ---- Auth ----

export async function login(username: string, password: string): Promise<string> {
  matrix = new OttieMatrix({ baseUrl: MATRIX_BASE_URL })
  const session = await matrix.login(username, password)
  saveCredentials(username, password)
  return session.userId
}

export async function register(username: string, password: string): Promise<string> {
  matrix = new OttieMatrix({ baseUrl: MATRIX_BASE_URL })
  const session = await matrix.register(username, password, REG_TOKEN)
  saveCredentials(username, password)
  return session.userId
}

export async function logout(): Promise<void> {
  clearCredentials()
  try { const keys = Object.keys(localStorage); for (const k of keys) if (k.startsWith('ottie_cache_')) localStorage.removeItem(k) } catch {}
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = undefined }
  if (agent) { await agent.stop(); agent = null }
  if (matrix) { matrix.stopSync(); await matrix.logout().catch(() => {}); matrix = null; syncing = false }
}

export async function tryAutoLogin(): Promise<string | null> {
  const creds = loadCredentials()
  if (!creds) return null
  try { return await login(creds.username, creds.password) }
  catch { clearCredentials(); return null }
}

// ---- Sync ----

export async function startSync(): Promise<void> {
  if (syncing) return
  await getMatrix().startSync()
  syncing = true
}

// ---- Messages (pure IM, no Agent logic) ----

export async function sendMessage(roomId: string, body: string, replyTo?: string, ottieMeta?: Record<string, unknown>): Promise<OttieMessage> {
  const content: any = { type: 'text', body }
  if (ottieMeta) content.ottie_meta = ottieMeta
  return getMatrix().sendMessage(roomId, content, replyTo)
}
export async function getMessages(roomId: string, limit = 50): Promise<OttieMessage[]> {
  return getMatrix().getMessages(roomId, limit)
}
export function onMessage(callback: (msg: OttieMessage) => void): Unsubscribe {
  return getMatrix().onMessage(callback)
}
export async function recallMessage(roomId: string, messageId: string): Promise<void> {
  return getMatrix().recallMessage(roomId, messageId)
}

// ---- Friends ----

export async function searchUsers(query: string) { return getMatrix().searchUsers(query) }
export function onFriendRequest(callback: (req: any) => void) { return getMatrix().onFriendRequest(callback) }
export async function sendFriendRequest(userId: string, message?: string) { return getMatrix().sendFriendRequest(userId, message) }
export async function respondToFriendRequest(roomId: string, accept: boolean) { return getMatrix().respondToFriendRequest(roomId, accept) }
export function getFriends() { return getMatrix().getFriends() }

// ---- Block ----

export async function blockUser(userId: string) { return getMatrix().blockUser(userId) }
export async function unblockUser(userId: string) { return getMatrix().unblockUser(userId) }

// ---- Typing / Presence / Receipts ----

export async function sendTyping(roomId: string, isTyping: boolean) { return getMatrix().sendTyping(roomId, isTyping) }
export function onTyping(callback: (roomId: string, userIds: string[]) => void) { return getMatrix().onTyping(callback) }
export async function setPresence(status: 'online' | 'offline' | 'unavailable') { return getMatrix().setPresence(status) }
export function getPresence(userId: string) { return getMatrix().getPresence(userId) }
export function onPresenceChange(callback: (userId: string, presence: 'online' | 'offline' | 'unavailable') => void) { return getMatrix().onPresenceChange(callback) }
export async function sendReadReceipt(roomId: string, eventId: string) { return getMatrix().sendReadReceipt(roomId, eventId) }
export function onReadReceipt(callback: (roomId: string, userId: string, eventId: string) => void) { return getMatrix().onReadReceipt(callback) }

// ---- File Upload ----

export async function uploadAndSendImage(roomId: string, file: File) {
  const m = getMatrix(); const url = await m.uploadContent(file); return m.sendImageMessage(roomId, file, url)
}
export async function uploadAndSendFile(roomId: string, file: File) {
  const m = getMatrix(); const url = await m.uploadContent(file); return m.sendFileMessage(roomId, file, url)
}
export function mxcToHttp(mxcUrl: string): string { return getMatrix().mxcToHttp(mxcUrl) }

// ---- Profile ----

export async function setDisplayName(name: string) { return getMatrix().setDisplayName(name) }
export async function setAvatar(file: File) { return getMatrix().setAvatar(file) }
export async function getProfile(userId?: string) { return getMatrix().getProfile(userId) }

// ---- Search ----

export async function searchMessages(query: string, roomId?: string) { return getMatrix().searchMessages(query, roomId) }

// ---- Rooms ----

export function getRooms() { return getMatrix().getRooms() }
export function getSession() { return matrix?.getSession() ?? null }

// ---- QR / Invite ----

export function generateInviteUri(): string { return getMatrix().generateInviteUri() }
export function parseInviteUri(uri: string) { return (getMatrix().constructor as any).parseInviteUri(uri) }

// ---- Device Agent Status ----

export function getDeviceAgentStatus(): { daemonStatus: string; agents: any[] } | null {
  try {
    const a = getAgent() as any
    const paseo = a.getPaseo?.()
    return paseo?.getStatus() ?? null
  } catch { return null }
}
