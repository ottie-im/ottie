import { create } from 'zustand'
import type { ConversationItem } from '@ottie-im/ui'
import type { Friend, FriendRequest, BlockedUser } from '@ottie-im/contracts'

interface AppState {
  // Auth
  loggedIn: boolean
  userId: string | null
  setLoggedIn: (userId: string) => void
  setLoggedOut: () => void

  // View
  currentView: 'chat' | 'settings'
  sidebarView: 'chats' | 'contacts'
  setCurrentView: (view: 'chat' | 'settings') => void
  setSidebarView: (view: 'chats' | 'contacts') => void

  // Conversations
  conversations: ConversationItem[]
  activeConversationId: string | null
  setConversations: (convs: ConversationItem[]) => void
  setActiveConversation: (id: string) => void

  // Messages
  messages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  setMessages: (msgs: ChatMessage[]) => void
  updateMessageStatus: (id: string, status: 'sent' | 'read') => void

  // Approval (sending side)
  pendingApproval: PendingApproval | null
  setPendingApproval: (approval: PendingApproval | null) => void

  // Decision (receiving side)
  pendingDecision: PendingDecision | null
  setPendingDecision: (decision: PendingDecision | null) => void

  // Typing
  typingUsers: Record<string, string[]> // roomId → userIds
  setTypingUsers: (roomId: string, userIds: string[]) => void

  // Presence
  presenceMap: Record<string, 'online' | 'offline' | 'unavailable'>
  setPresence: (userId: string, presence: 'online' | 'offline' | 'unavailable') => void

  // Contacts
  friends: Friend[]
  friendRequests: FriendRequest[]
  blockedUsers: BlockedUser[]
  setFriends: (friends: Friend[]) => void
  setFriendRequests: (reqs: FriendRequest[]) => void
  setBlockedUsers: (users: BlockedUser[]) => void

  // Search
  searchQuery: string
  searchResults: ChatMessage[]
  setSearchQuery: (query: string) => void
  setSearchResults: (results: ChatMessage[]) => void
}

export interface ChatMessage {
  id: string
  type: 'outgoing' | 'incoming' | 'intent'
  body: string
  time: string
  senderId?: string
  status?: 'sent' | 'read'
  // Media
  mediaType?: 'image' | 'file'
  mediaUrl?: string
  fileName?: string
  mimeType?: string
}

export interface PendingDecision {
  messageId: string
  roomId: string
  senderName: string
  originalMessage: string
  intentType: string
  intentSummary: string
  suggestedActions: { label: string; response: string }[]
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
  setLoggedOut: () => set({
    loggedIn: false, userId: null, conversations: [], messages: [],
    activeConversationId: null, friends: [], friendRequests: [], blockedUsers: [],
    typingUsers: {}, presenceMap: {},
  }),

  currentView: 'chat',
  sidebarView: 'chats',
  setCurrentView: (currentView) => set({ currentView }),
  setSidebarView: (sidebarView) => set({ sidebarView }),

  conversations: [],
  activeConversationId: null,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id, messages: [] }),

  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (messages) => set({ messages }),
  updateMessageStatus: (id, status) => set((s) => ({
    messages: s.messages.map(m => m.id === id ? { ...m, status } : m),
  })),

  pendingApproval: null,
  setPendingApproval: (pendingApproval) => set({ pendingApproval }),

  pendingDecision: null,
  setPendingDecision: (pendingDecision) => set({ pendingDecision }),

  typingUsers: {},
  setTypingUsers: (roomId, userIds) => set((s) => ({
    typingUsers: { ...s.typingUsers, [roomId]: userIds },
  })),

  presenceMap: {},
  setPresence: (userId, presence) => set((s) => ({
    presenceMap: { ...s.presenceMap, [userId]: presence },
  })),

  friends: [],
  friendRequests: [],
  blockedUsers: [],
  setFriends: (friends) => set({ friends }),
  setFriendRequests: (friendRequests) => set({ friendRequests }),
  setBlockedUsers: (blockedUsers) => set({ blockedUsers }),

  searchQuery: '',
  searchResults: [],
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
}))
