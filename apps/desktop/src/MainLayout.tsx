import React from 'react'
import { useAppStore } from './store'
import type { ChatMessage } from './store'
import { OttieSidebar, OttieChatHeader, OttieBubble, OttieApproval, OttieInput } from '@ottie-im/ui'
import type { ConversationItem } from '@ottie-im/ui'

// Demo data for initial development
const DEMO_CONVERSATIONS: ConversationItem[] = [
  { id: '1', name: 'Alice', lastMessage: '周五见！', time: '14:30', unread: 1, online: true },
  { id: '2', name: 'Bob', lastMessage: '收到，谢谢', time: '12:15', online: false },
  { id: '3', name: '产品群', lastMessage: '设计稿更新了', time: '昨天', unread: 3 },
]

const DEMO_MESSAGES: ChatMessage[] = [
  { id: 'm1', type: 'incoming', body: '周五晚上有空吗？想一起吃个饭', time: '14:25', senderId: '@alice:localhost' },
  { id: 'm2', type: 'intent', body: '帮我说好的，问她去哪吃', time: '14:28' },
  { id: 'm3', type: 'outgoing', body: '好的呀！你想去哪里吃？', time: '14:28' },
  { id: 'm4', type: 'incoming', body: '那家新开的川菜馆怎么样？', time: '14:30', senderId: '@alice:localhost' },
]

function formatTime(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

export function MainLayout() {
  const {
    conversations, activeConversationId, setActiveConversation,
    messages, addMessage, setMessages,
    pendingApproval, setPendingApproval,
  } = useAppStore()

  // Use demo data if no real data
  const displayConvs = conversations.length > 0 ? conversations : DEMO_CONVERSATIONS
  const displayMsgs = messages.length > 0 ? messages : (activeConversationId ? [] : DEMO_MESSAGES)
  const activeConv = displayConvs.find(c => c.id === activeConversationId) ?? displayConvs[0]

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id)
    // TODO: load messages from OttieMatrix.getMessages()
    setMessages([])
  }

  const handleSend = (text: string) => {
    // Show user intent
    addMessage({
      id: `intent_${Date.now()}`,
      type: 'intent',
      body: text,
      time: formatTime(),
    })

    // TODO: send to OttieAgentAdapter.onMessage() for rewrite
    // For now, simulate approval
    setTimeout(() => {
      setPendingApproval({
        requestId: `approval_${Date.now()}`,
        draft: text.replace(/^(帮我|跟他说|问他)/, '').trim() + '。',
        originalIntent: text,
        targetRoom: activeConv?.id ?? '',
      })
    }, 500)
  }

  const handleApprove = () => {
    if (!pendingApproval) return
    addMessage({
      id: `out_${Date.now()}`,
      type: 'outgoing',
      body: pendingApproval.draft,
      time: formatTime(),
    })
    setPendingApproval(null)
    // TODO: OttieMatrix.sendMessage()
  }

  const handleEdit = () => {
    // TODO: open edit modal
    handleApprove()
  }

  const handleReject = () => {
    setPendingApproval(null)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <div style={{ width: '320px', minWidth: '320px', maxWidth: '420px', height: '100%' }}>
        <OttieSidebar
          conversations={displayConvs}
          activeId={activeConversationId ?? activeConv?.id}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {activeConv && (
          <OttieChatHeader
            name={activeConv.name}
            avatarUrl={activeConv.avatarUrl}
            online={activeConv.online}
          />
        )}

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
          {displayMsgs.map(msg => (
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

        {/* Input */}
        <OttieInput onSend={handleSend} />
      </div>
    </div>
  )
}
