import { create } from 'zustand'

interface MobileState {
  loggedIn: boolean
  userId: string | null
  setLoggedIn: (userId: string) => void
  setLoggedOut: () => void

  conversations: any[]
  setConversations: (convs: any[]) => void

  messages: any[]
  setMessages: (msgs: any[]) => void
  addMessage: (msg: any) => void
}

export const useStore = create<MobileState>((set) => ({
  loggedIn: false,
  userId: null,
  setLoggedIn: (userId) => set({ loggedIn: true, userId }),
  setLoggedOut: () => set({ loggedIn: false, userId: null, conversations: [], messages: [] }),

  conversations: [],
  setConversations: (conversations) => set({ conversations }),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
}))
