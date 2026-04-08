import { create } from 'zustand'
import type { ConversationItem } from '@ottie-im/ui'

interface AppState {
  // Auth
  loggedIn: boolean
  userId: string | null
  setLoggedIn: (userId: string) => void
  setLoggedOut: () => void

  // Conversations
  conversations: ConversationItem[]
  activeConversationId: string | null
  setConversations: (convs: ConversationItem[]) => void
  setActiveConversation: (id: string) => void

  // Messages for active conversation
  messages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  setMessages: (msgs: ChatMessage[]) => void

  // Approval
  pendingApproval: PendingApproval | null
  setPendingApproval: (approval: PendingApproval | null) => void
}

export interface ChatMessage {
  id: string
  type: 'outgoing' | 'incoming' | 'intent'
  body: string
  time: string
  senderId?: string
}

export interface PendingApproval {
  requestId: string
  draft: string
  originalIntent: string
  targetRoom: string
}

export const useAppStore = create<AppState>((set) => ({
  loggedIn: false,
  userId: null,
  setLoggedIn: (userId) => set({ loggedIn: true, userId }),
  setLoggedOut: () => set({ loggedIn: false, userId: null, conversations: [], messages: [], activeConversationId: null }),

  conversations: [],
  activeConversationId: null,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id, messages: [] }),

  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (messages) => set({ messages }),

  pendingApproval: null,
  setPendingApproval: (pendingApproval) => set({ pendingApproval }),
}))
