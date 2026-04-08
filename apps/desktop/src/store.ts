import { create } from 'zustand'
import type { ConversationItem } from '@ottie-im/ui'
import type { Friend, FriendRequest, BlockedUser } from '@ottie-im/contracts'

interface AppState {
  // Auth
  loggedIn: boolean
  userId: string | null
  setLoggedIn: (userId: string) => void
  setLoggedOut: () => void

  // Connection
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected'
  setConnectionStatus: (status: 'connected' | 'reconnecting' | 'disconnected') => void

  // Global error (toast-style, auto-dismiss)
  globalError: string | null
  setGlobalError: (error: string | null) => void

  // Loading states
  isSyncing: boolean
  isSendingMessage: boolean
  isLLMProcessing: boolean
  setIsSyncing: (v: boolean) => void
  setIsSendingMessage: (v: boolean) => void
  setIsLLMProcessing: (v: boolean) => void

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

  // Reply
  replyingTo: { id: string; sender: string; body: string } | null
  setReplyingTo: (msg: { id: string; sender: string; body: string } | null) => void

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

  // Screen notifications
  screenNotifications: ScreenNotification[]
  addScreenNotification: (n: ScreenNotification) => void
  removeScreenNotification: (id: string) => void

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
  // Reply
  replyTo?: { sender: string; body: string }
}

export interface ScreenNotification {
  id: string
  type: 'gui-popup' | 'cli-prompt' | 'screen-change' | 'user-action'
  content: string
  sourceApp?: string
  actionRequired: boolean
  timestamp: string
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
    typingUsers: {}, presenceMap: {}, connectionStatus: 'disconnected' as const,
  }),

  connectionStatus: 'disconnected' as const,
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  globalError: null,
  setGlobalError: (globalError) => set({ globalError }),

  isSyncing: false,
  isSendingMessage: false,
  isLLMProcessing: false,
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setIsSendingMessage: (isSendingMessage) => set({ isSendingMessage }),
  setIsLLMProcessing: (isLLMProcessing) => set({ isLLMProcessing }),

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

  replyingTo: null,
  setReplyingTo: (replyingTo) => set({ replyingTo }),

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

  screenNotifications: [],
  addScreenNotification: (n) => set((s) => ({
    screenNotifications: [...s.screenNotifications.slice(-9), n], // keep last 10
  })),
  removeScreenNotification: (id) => set((s) => ({
    screenNotifications: s.screenNotifications.filter(n => n.id !== id),
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
