import { create } from 'zustand'

// ============================================================
// 审批/决策类型
// ============================================================

export interface PendingApproval {
  requestId: string
  draft: string
  originalIntent: string
  targetRoomId: string
}

export interface SuggestedAction {
  label: string
  response: string
}

export interface PendingDecision {
  messageId: string
  roomId: string
  senderName: string
  originalMessage: string
  intentType: string
  intentSummary: string
  suggestedActions: SuggestedAction[]
}

// ============================================================
// 连接状态
// ============================================================

export type ConnectionStatus = 'idle' | 'connecting' | 'online' | 'offline' | 'error'

// ============================================================
// Store
// ============================================================

interface MobileState {
  // Auth
  loggedIn: boolean
  userId: string | null
  setLoggedIn: (userId: string) => void
  setLoggedOut: () => void

  // Conversations
  conversations: any[]
  setConversations: (convs: any[]) => void

  // Messages
  messages: any[]
  setMessages: (msgs: any[]) => void
  addMessage: (msg: any) => void

  // Connection
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void

  // Streaming (Agent tab)
  streamingOutput: string
  isStreaming: boolean
  appendStreamChunk: (chunk: string) => void
  startStreaming: () => void
  stopStreaming: (finalOutput?: string) => void

  // Approval (sending side)
  pendingApproval: PendingApproval | null
  setPendingApproval: (approval: PendingApproval | null) => void

  // Decision (receiving side)
  pendingDecision: PendingDecision | null
  setPendingDecision: (decision: PendingDecision | null) => void
}

export const useStore = create<MobileState>((set) => ({
  // Auth
  loggedIn: false,
  userId: null,
  setLoggedIn: (userId) => set({ loggedIn: true, userId }),
  setLoggedOut: () => set({
    loggedIn: false, userId: null, conversations: [], messages: [],
    pendingApproval: null, pendingDecision: null,
    streamingOutput: '', isStreaming: false,
  }),

  // Conversations
  conversations: [],
  setConversations: (conversations) => set({ conversations }),

  // Messages
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  // Connection
  connectionStatus: 'idle',
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  // Streaming
  streamingOutput: '',
  isStreaming: false,
  appendStreamChunk: (chunk) => set((s) => ({ streamingOutput: s.streamingOutput + chunk })),
  startStreaming: () => set({ streamingOutput: '', isStreaming: true }),
  stopStreaming: (finalOutput) => set((s) => ({
    isStreaming: false,
    streamingOutput: finalOutput ?? s.streamingOutput,
  })),

  // Approval
  pendingApproval: null,
  setPendingApproval: (pendingApproval) => set({ pendingApproval }),

  // Decision
  pendingDecision: null,
  setPendingDecision: (pendingDecision) => set({ pendingDecision }),
}))
