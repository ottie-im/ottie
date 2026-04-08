import React, { useEffect, useCallback, useRef, useState } from 'react'
import { useAppStore } from './store'
import type { ChatMessage } from './store'
import {
  OttieSidebar, OttieChatHeader, OttieBubble, OttieApproval, OttieInput,
  OttieContactPanel,
} from '@ottie-im/ui'
import type { ConversationItem } from '@ottie-im/ui'
import {
  sendMessage, getMessages, onMessage, getRooms, getFriends,
  getSession, rewriteIntent, searchUsers, sendFriendRequest,
  respondToFriendRequest, sendTyping, onTyping,
  onPresenceChange, getPresence, sendReadReceipt, onReadReceipt,
  uploadAndSendImage, uploadAndSendFile, mxcToHttp,
  searchMessages,
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
          online: other ? getPresence(other.userId) === 'online' : undefined,
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
    messages, addMessage, setMessages, updateMessageStatus,
    pendingApproval, setPendingApproval,
    userId,
    sidebarView, setSidebarView, setCurrentView,
    typingUsers, setTypingUsers,
    presenceMap, setPresence: setPresenceState,
    friends, setFriends,
  } = useAppStore()

  const [userSearchResults, setUserSearchResults] = useState<any[]>([])
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingApproval])

  // Load conversations
  const refreshConversations = useCallback(() => {
    const convs = roomsToConversations()
    if (convs.length > 0) setConversations(convs)
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
        // Send read receipt for incoming message
        sendReadReceipt(msg.roomId, msg.id).catch(() => {})
      }
      refreshConversations()
    })
    return unsub
  }, [activeConversationId, addMessage, refreshConversations])

  // Listen for typing indicators
  useEffect(() => {
    const unsub = onTyping((roomId, userIds) => {
      setTypingUsers(roomId, userIds)
    })
    return unsub
  }, [setTypingUsers])

  // Listen for presence changes
  useEffect(() => {
    const unsub = onPresenceChange((uid, presence) => {
      setPresenceState(uid, presence)
    })
    return unsub
  }, [setPresenceState])

  // Listen for read receipts
  useEffect(() => {
    const unsub = onReadReceipt((roomId, _userId, eventId) => {
      if (roomId === activeConversationId) {
        updateMessageStatus(eventId, 'read')
      }
    })
    return unsub
  }, [activeConversationId, updateMessageStatus])

  // Load messages when switching conversation
  useEffect(() => {
    if (!activeConversationId) return
    getMessages(activeConversationId, 50)
      .then(msgs => {
        const chatMsgs: ChatMessage[] = msgs.map(m => {
          const isOutgoing = m.senderId === userId
          const content = m.content as any
          const mediaType = content.type === 'file'
            ? (content.mimeType?.startsWith('image/') ? 'image' : 'file')
            : undefined
          return {
            id: m.id,
            type: isOutgoing ? 'outgoing' : 'incoming',
            body: content.type === 'text' ? content.body : (content.filename ?? ''),
            time: formatTime(m.timestamp),
            senderId: m.senderId,
            status: isOutgoing ? 'sent' as const : undefined,
            mediaType: mediaType as 'image' | 'file' | undefined,
            mediaUrl: content.url ? mxcToHttp(content.url) : undefined,
            fileName: content.filename,
            mimeType: content.mimeType,
          }
        })
        setMessages(chatMsgs)
        // Send read receipt for last message
        if (msgs.length > 0) {
          sendReadReceipt(activeConversationId, msgs[msgs.length - 1].id).catch(() => {})
        }
      })
      .catch(() => setMessages([]))
  }, [activeConversationId, userId, setMessages])

  // Refresh friends when needed
  useEffect(() => {
    try { setFriends(getFriends()) } catch {}
  }, [conversations, setFriends])

  const activeConv = conversations.find(c => c.id === activeConversationId)
  const activeTyping = activeConversationId ? (typingUsers[activeConversationId] ?? []) : []
  const typingText = activeTyping.length > 0 ? '正在输入...' : undefined

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id)
    setSidebarView('chats')
  }

  const handleInputChange = () => {
    if (!activeConversationId) return
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    sendTyping(activeConversationId, true).catch(() => {})
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(activeConversationId, false).catch(() => {})
    }, 3000)
  }

  const handleSend = (text: string) => {
    if (!activeConversationId) return
    // Stop typing
    sendTyping(activeConversationId, false).catch(() => {})

    addMessage({ id: `intent_${Date.now()}`, type: 'intent', body: text, time: formatTime() })

    const rewritten = rewriteIntent(text)
    setPendingApproval({
      requestId: `approval_${Date.now()}`,
      draft: rewritten,
      originalIntent: text,
      targetRoom: activeConversationId,
    })
  }

  const handleAttach = async (file: File) => {
    if (!activeConversationId) return
    try {
      const isImage = file.type.startsWith('image/')
      if (isImage) {
        const msg = await uploadAndSendImage(activeConversationId, file)
        addMessage({
          id: msg.id, type: 'outgoing', body: '', time: formatTime(),
          mediaType: 'image', mediaUrl: mxcToHttp(msg.content.type === 'file' ? msg.content.url : ''),
          fileName: file.name,
        })
      } else {
        const msg = await uploadAndSendFile(activeConversationId, file)
        addMessage({
          id: msg.id, type: 'outgoing', body: '', time: formatTime(),
          mediaType: 'file', fileName: file.name, mimeType: file.type,
        })
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const handleApprove = async () => {
    if (!pendingApproval) return
    try {
      const msg = await sendMessage(pendingApproval.targetRoom, pendingApproval.draft)
      addMessage({
        id: msg.id, type: 'outgoing', body: pendingApproval.draft,
        time: formatTime(), status: 'sent',
      })
    } catch (err) {
      console.error('Send failed:', err)
    }
    setPendingApproval(null)
  }

  const handleReject = () => setPendingApproval(null)

  // Contact panel handlers
  const handleUserSearch = async (query: string) => {
    const results = await searchUsers(query)
    setUserSearchResults(results)
  }

  const handleAddFriend = async (uid: string) => {
    await sendFriendRequest(uid)
    setUserSearchResults(prev => prev.filter(u => u.matrixId !== uid))
  }

  const handleAcceptRequest = async (roomId: string) => {
    await respondToFriendRequest(roomId, true)
    refreshConversations()
  }

  const handleRejectRequest = async (roomId: string) => {
    await respondToFriendRequest(roomId, false)
  }

  // Search
  const { searchQuery, searchResults, setSearchQuery, setSearchResults } = useAppStore()
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return
    const results = await searchMessages(searchQuery)
    setSearchResults(results.map(m => ({
      id: m.id, type: 'incoming' as const,
      body: m.content.type === 'text' ? m.content.body : '', time: formatTime(m.timestamp),
      senderId: m.senderId,
    })))
  }

  const handleSearchResultClick = (roomId: string) => {
    setActiveConversation(roomId)
    setSearchQuery('')
    setSearchResults([])
  }

  // Contact panel
  const contactsPanel = (
    <OttieContactPanel
      friends={friends}
      friendRequests={[]}
      onStartChat={handleSelectConversation}
      onAcceptRequest={handleAcceptRequest}
      onRejectRequest={handleRejectRequest}
      onSearch={handleUserSearch}
      searchResults={userSearchResults}
      onAddFriend={handleAddFriend}
    />
  )

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <div style={{ width: '320px', minWidth: '320px', maxWidth: '420px', height: '100%' }}>
        <OttieSidebar
          conversations={conversations}
          activeId={activeConversationId ?? undefined}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          sidebarView={sidebarView}
          onViewChange={setSidebarView}
          onSettingsClick={() => setCurrentView('settings')}
          contactsPanel={contactsPanel}
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
              typingText={typingText}
            />

            <div
              style={{
                flex: 1, overflowY: 'auto', padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '4px',
                background: 'var(--white)',
              }}
            >
              {/* Search results overlay */}
              {searchResults.length > 0 && searchQuery ? (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                    搜索结果：{searchResults.length} 条
                  </div>
                  {searchResults.map(r => (
                    <div key={r.id} onClick={() => handleSearchResultClick(activeConversationId!)}
                      style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: 'var(--snow-white)' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{r.body}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{r.time}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <OttieBubble
                      key={msg.id}
                      type={msg.type}
                      body={msg.body}
                      time={msg.time}
                      status={msg.status}
                      mediaType={msg.mediaType}
                      mediaUrl={msg.mediaUrl}
                      fileName={msg.fileName}
                    />
                  ))}
                  {pendingApproval && (
                    <OttieApproval
                      draft={pendingApproval.draft}
                      originalIntent={pendingApproval.originalIntent}
                      onApprove={handleApprove}
                      onEdit={handleApprove}
                      onReject={handleReject}
                    />
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div onKeyDown={handleInputChange}>
              <OttieInput onSend={handleSend} onAttach={handleAttach} />
            </div>
          </>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-family)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🦦</div>
              <div style={{ fontSize: '16px' }}>选择一个聊天或添加好友开始对话</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
