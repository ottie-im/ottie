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

// ---- LLM Agent ----

import OpenAI from 'openai'

interface LLMConfig {
  baseUrl: string
  apiKey: string
  model: string
}

let llm: OpenAI | null = null
let llmModel = ''

// Default: no LLM, use rule engine
let llmEnabled = false

export function configureLLM(config: LLMConfig) {
  llm = new OpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true,
  })
  llmModel = config.model
  llmEnabled = true
}

export function isLLMEnabled(): boolean {
  return llmEnabled
}

async function llmChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  if (!llm) throw new Error('LLM not configured')
  const resp = await llm.chat.completions.create({
    model: llmModel,
    messages,
    temperature: opts?.temperature ?? 0.7,
    max_tokens: opts?.maxTokens ?? 500,
  })
  return resp.choices[0]?.message?.content ?? ''
}

// ---- Rewrite (rule engine fallback + LLM) ----

const COMMAND_PATTERNS = [
  { pattern: /^(帮我|替我|跟他|跟她|告诉他|告诉她|问他|问她|和他说|和她说|跟他说|跟她说)(.+)/, extract: 2 },
  { pattern: /^(tell him|tell her|ask him|ask her|let him know|let her know)\s+(.+)/i, extract: 2 },
]

function ruleRewrite(intent: string): string {
  let text = intent.trim()
  for (const { pattern, extract } of COMMAND_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[extract]) {
      text = match[extract].trim()
      break
    }
  }
  if (text && !/[。？！.?!]$/.test(text)) {
    text += /吗|呢|么|嘛|不$|没$|\?/.test(text) ? '？' : '。'
  }
  if (/^[a-z]/.test(text)) {
    text = text.charAt(0).toUpperCase() + text.slice(1)
  }
  return text
}

export async function rewriteIntent(intent: string): Promise<string> {
  if (!llmEnabled) return ruleRewrite(intent)

  try {
    return await llmChat([
      { role: 'system', content: `你是 Ottie，AI IM 秘书。把用户的口语化指令改写成适合发送给对方的得体消息。
规则：保持原始意图，提取指令中真正要发的内容（如"帮我问他..."→去掉前缀），语言跟随用户，简洁自然。只输出改写后的消息。` },
      { role: 'user', content: intent },
    ], { temperature: 0.6, maxTokens: 200 })
  } catch {
    return ruleRewrite(intent)
  }
}

// ---- Intent Detection (receiving side) ----

export interface DetectedIntent {
  type: 'invitation' | 'question' | 'request' | 'info' | 'greeting' | 'general'
  summary: string
  suggestedActions: { label: string; response: string }[]
}

function ruleDetectIntent(message: string): DetectedIntent {
  const m = message.toLowerCase()
  if (/吃饭|聚餐|约|一起去|周[一二三四五六日末]/.test(m)) {
    return { type: 'invitation', summary: '邀请你一起活动', suggestedActions: [
      { label: '好的', response: '好的呀！' }, { label: '没空', response: '不好意思，没空呢。' },
    ]}
  }
  if (/吗|呢|么|？|\?|怎么|什么|哪|多少|几/.test(m)) {
    return { type: 'question', summary: '向你提问', suggestedActions: [
      { label: '好的', response: '好的。' }, { label: '不行', response: '不太方便。' },
    ]}
  }
  if (/帮|麻烦|请|能不能|可以/.test(m)) {
    return { type: 'request', summary: '请你帮忙', suggestedActions: [
      { label: '没问题', response: '没问题！' }, { label: '不方便', response: '不太方便，抱歉。' },
    ]}
  }
  if (/你好|嗨|hi|hello|hey/.test(m)) {
    return { type: 'greeting', summary: '跟你打招呼', suggestedActions: [
      { label: '你好', response: '你好！' },
    ]}
  }
  return { type: 'general', summary: message.slice(0, 30), suggestedActions: [
    { label: '收到', response: '收到。' }, { label: '好的', response: '好的。' },
  ]}
}

export async function detectIntent(message: string, senderName?: string): Promise<DetectedIntent> {
  if (!llmEnabled) return ruleDetectIntent(message)

  try {
    const raw = await llmChat([
      { role: 'system', content: `分析收到的消息，判断意图并给出建议回复选项。
输出严格 JSON：{"type":"invitation|question|request|info|greeting|general","summary":"一句话总结","suggestedActions":[{"label":"按钮文字2-4字","response":"点击后的回复"}]}
- suggestedActions 最多 3 个，第一个是正面回应
- 回复自然得体${senderName ? `\n发送者：${senderName}` : ''}` },
      { role: 'user', content: message },
    ], { temperature: 0.3, maxTokens: 300 })

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch {}

  return ruleDetectIntent(message)
}

// ---- Compose Reply (after user picks an action) ----

export async function composeReply(originalMessage: string, userChoice: string): Promise<string> {
  if (!llmEnabled) return userChoice

  try {
    return await llmChat([
      { role: 'system', content: '根据用户的选择生成一条得体的回复。简洁自然，只输出回复内容。' },
      { role: 'user', content: `收到的消息：${originalMessage}\n我的选择：${userChoice}\n请生成回复：` },
    ], { temperature: 0.6, maxTokens: 150 })
  } catch {
    return userChoice
  }
}
