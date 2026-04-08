import React, { useEffect, useCallback } from 'react'
import { useAppStore } from './store'
import type { ChatMessage } from './store'
import { OttieSidebar, OttieChatHeader, OttieBubble, OttieApproval, OttieInput } from '@ottie-im/ui'
import type { ConversationItem } from '@ottie-im/ui'
import {
  sendMessage, getMessages, onMessage, getRooms, getFriends,
  getSession, rewriteIntent, searchUsers, sendFriendRequest,
} from './services'

function formatTime(ts?: number): string {
  const d = ts ? new Date(ts) : new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function roomsToConversations(): ConversationItem[] {
  try {
    const rooms = getRooms()
    const session = getSession()
    if (!rooms || !session) return []

    return rooms
      .filter(r => r.getMyMembership() === 'join')
      .map(room => {
        const members = room.getJoinedMembers()
        const other = members.find(m => m.userId !== session.userId)
        const lastEvent = room.timeline?.[room.timeline.length - 1]

        return {
          id: room.roomId,
          name: other?.name ?? room.name ?? room.roomId,
          lastMessage: lastEvent?.getContent()?.body as string | undefined,
          time: lastEvent ? formatTime(lastEvent.getTs()) : '',
          online: undefined,
        }
      })
      .filter(c => c.name)
  } catch {
    return []
  }
}

export function MainLayout() {
  const {
    conversations, activeConversationId, setActiveConversation, setConversations,
    messages, addMessage, setMessages,
    pendingApproval, setPendingApproval,
    userId,
  } = useAppStore()

  // Load conversations from Matrix rooms
  const refreshConversations = useCallback(() => {
    const convs = roomsToConversations()
    if (convs.length > 0) {
      setConversations(convs)
    }
  }, [setConversations])

  useEffect(() => {
    refreshConversations()
    const interval = setInterval(refreshConversations, 3000)
    return () => clearInterval(interval)
  }, [refreshConversations])

  // Listen for incoming messages
  useEffect(() => {
    const unsub = onMessage((msg) => {
      if (msg.roomId === activeConversationId && msg.content.type === 'text') {
        addMessage({
          id: msg.id,
          type: 'incoming',
          body: msg.content.body,
          time: formatTime(msg.timestamp),
          senderId: msg.senderId,
        })
      }
      refreshConversations()
    })
    return unsub
  }, [activeConversationId, addMessage, refreshConversations])

  // Load messages when switching conversation
  useEffect(() => {
    if (!activeConversationId) return
    getMessages(activeConversationId, 30)
      .then(msgs => {
        const chatMsgs: ChatMessage[] = msgs.map(m => ({
          id: m.id,
          type: m.senderId === userId ? 'outgoing' : 'incoming',
          body: m.content.type === 'text' ? m.content.body : '[unsupported]',
          time: formatTime(m.timestamp),
          senderId: m.senderId,
        }))
        setMessages(chatMsgs)
      })
      .catch(() => setMessages([]))
  }, [activeConversationId, userId, setMessages])

  const activeConv = conversations.find(c => c.id === activeConversationId)

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id)
  }

  const handleSend = (text: string) => {
    if (!activeConversationId) return

    // Show user intent
    addMessage({
      id: `intent_${Date.now()}`,
      type: 'intent',
      body: text,
      time: formatTime(),
    })

    // Rewrite and show approval
    const rewritten = rewriteIntent(text)
    setPendingApproval({
      requestId: `approval_${Date.now()}`,
      draft: rewritten,
      originalIntent: text,
      targetRoom: activeConversationId,
    })
  }

  const handleApprove = async () => {
    if (!pendingApproval) return
    try {
      const msg = await sendMessage(pendingApproval.targetRoom, pendingApproval.draft)
      addMessage({
        id: msg.id,
        type: 'outgoing',
        body: pendingApproval.draft,
        time: formatTime(),
      })
    } catch (err) {
      console.error('Failed to send:', err)
    }
    setPendingApproval(null)
  }

  const handleEdit = () => {
    // For now, approve as-is. TODO: open edit modal
    handleApprove()
  }

  const handleReject = () => {
    setPendingApproval(null)
  }

  // Empty state
  if (conversations.length === 0 && !activeConversationId) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <div style={{ width: '320px', height: '100%' }}>
          <OttieSidebar conversations={[]} activeId={undefined} onSelect={() => {}} />
        </div>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', color: 'var(--text-secondary)', fontFamily: 'var(--font-family)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🦦</div>
          <div style={{ fontSize: '16px' }}>还没有聊天</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>搜索用户添加好友开始聊天</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <div style={{ width: '320px', minWidth: '320px', maxWidth: '420px', height: '100%' }}>
        <OttieSidebar
          conversations={conversations}
          activeId={activeConversationId ?? undefined}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {activeConv ? (
          <>
            <OttieChatHeader
              name={activeConv.name}
              avatarUrl={activeConv.avatarUrl}
              online={activeConv.online}
            />

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'var(--white)',
              }}
            >
              {messages.map(msg => (
                <OttieBubble
                  key={msg.id}
                  type={msg.type}
                  body={msg.body}
                  time={msg.time}
                />
              ))}

              {pendingApproval && (
                <OttieApproval
                  draft={pendingApproval.draft}
                  originalIntent={pendingApproval.originalIntent}
                  onApprove={handleApprove}
                  onEdit={handleEdit}
                  onReject={handleReject}
                />
              )}
            </div>

            <OttieInput onSend={handleSend} />
          </>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-family)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <div style={{ fontSize: '16px' }}>选择一个聊天开始对话</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
