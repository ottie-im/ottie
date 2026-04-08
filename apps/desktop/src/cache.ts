/**
 * 本地缓存层
 *
 * 缓存会话列表和每个房间的最近消息到 localStorage。
 * 打开 App 时先显示缓存数据，后台同步到新数据后更新。
 */

import type { ConversationItem } from '@ottie-im/ui'
import type { ChatMessage } from './store'

const CONVERSATIONS_KEY = 'ottie_cache_conversations'
const MESSAGES_KEY_PREFIX = 'ottie_cache_messages_'
const MAX_CACHED_MESSAGES = 50
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 天

interface CacheEnvelope<T> {
  data: T
  timestamp: number
}

function write<T>(key: string, data: T): void {
  try {
    const envelope: CacheEnvelope<T> = { data, timestamp: Date.now() }
    localStorage.setItem(key, JSON.stringify(envelope))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const envelope: CacheEnvelope<T> = JSON.parse(raw)
    // Expire old cache
    if (Date.now() - envelope.timestamp > MAX_CACHE_AGE_MS) {
      localStorage.removeItem(key)
      return null
    }
    return envelope.data
  } catch {
    return null
  }
}

// ---- Conversations ----

export function cacheConversations(conversations: ConversationItem[]): void {
  write(CONVERSATIONS_KEY, conversations)
}

export function loadCachedConversations(): ConversationItem[] {
  return read<ConversationItem[]>(CONVERSATIONS_KEY) ?? []
}

// ---- Messages per room ----

export function cacheMessages(roomId: string, messages: ChatMessage[]): void {
  // Only cache the last N messages
  const toCache = messages.slice(-MAX_CACHED_MESSAGES)
  write(MESSAGES_KEY_PREFIX + roomId, toCache)
}

export function loadCachedMessages(roomId: string): ChatMessage[] {
  return read<ChatMessage[]>(MESSAGES_KEY_PREFIX + roomId) ?? []
}

// ---- Clear all cache (on logout) ----

export function clearCache(): void {
  try {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith('ottie_cache_')) {
        localStorage.removeItem(key)
      }
    }
  } catch {}
}
