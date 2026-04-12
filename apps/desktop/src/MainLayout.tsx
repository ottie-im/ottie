import React, { useEffect, useCallback, useRef, useState } from 'react'
import { useAppStore } from './store'
import type { ChatMessage } from './store'
import { cacheConversations, loadCachedConversations, cacheMessages, loadCachedMessages } from './cache'
import {
  OttieSidebar, OttieChatHeader, OttieBubble, OttieApproval, OttieInput,
  OttieContactPanel, OttieDecisionCard, OttieScreenNotification,
} from '@ottie-im/ui'
import type { ConversationItem } from '@ottie-im/ui'
import type { SuggestedAction, DecisionRequest } from '@ottie-im/contracts'
import { TabBar } from './components/TabBar'
import { TerminalView } from './components/TerminalView'
import {
  sendMessage, getMessages, onMessage, getRooms, getFriends,
  getSession, getAgent, searchUsers, sendFriendRequest,
  respondToFriendRequest, sendTyping, onTyping,
  onPresenceChange, getPresence, sendReadReceipt, onReadReceipt,
  uploadAndSendImage, uploadAndSendFile, mxcToHttp,
  searchMessages, onFriendRequest, getDeviceAgentStatus,
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
    friends, setFriends, friendRequests, setFriendRequests,
    pendingDecision, setPendingDecision,
    isSendingMessage, setIsSendingMessage,
    isLLMProcessing, setIsLLMProcessing,
    setGlobalError,
    screenNotifications, addScreenNotification, removeScreenNotification,
    replyingTo, setReplyingTo,
    tabs, activeTabId,
  } = useAppStore()

  const [userSearchResults, setUserSearchResults] = useState<any[]>([])
  const [deviceStatus, setDeviceStatus] = useState<{ daemonStatus: string; agents: any[] } | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingApproval, pendingDecision])

  // Poll device agent status when in device room
  useEffect(() => {
    if (activeConversationId !== DEVICE_ROOM_ID) return
    const check = () => setDeviceStatus(getDeviceAgentStatus())
    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [activeConversationId])

  // Load conversations — show cache first, then refresh from server
  // 虚拟联系人：我的电脑（直接跟 OpenClaw 对话）
  const DEVICE_ROOM_ID = '__ottie_device__'
  const deviceOnline = deviceStatus?.daemonStatus === 'connected'
  const agentCount = deviceStatus?.agents?.length ?? 0
  const deviceConversation: ConversationItem = {
    id: DEVICE_ROOM_ID,
    name: '🖥️ 我的电脑',
    lastMessage: deviceOnline
      ? `设备已连接 · ${agentCount} 个 agent`
      : '设备助手',
    time: '',
    online: true,
  }

  const refreshConversations = useCallback(() => {
    const convs = roomsToConversations()
    // 在列表头部插入虚拟设备联系人
    const withDevice = [deviceConversation, ...convs]
    setConversations(withDevice)
    if (convs.length > 0) cacheConversations(convs)
  }, [setConversations])

  useEffect(() => {
    // Immediately show cached conversations
    const cached = loadCachedConversations()
    if (cached.length > 0) setConversations(cached)
    // Then refresh from server
    refreshConversations()
    const interval = setInterval(refreshConversations, 3000)
    return () => clearInterval(interval)
  }, [refreshConversations, setConversations])

  // Cache messages on change
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      cacheMessages(activeConversationId, messages)
    }
  }, [messages, activeConversationId])

  // Wire up Agent callbacks (onDraft → show approval, onDecision → show decision card)
  useEffect(() => {
    try {
      const a = getAgent()
      const unsubDraft = a.onDraft((draft) => {
        setPendingApproval({
          requestId: draft.id,
          draft: draft.draft,
          originalIntent: draft.originalIntent,
          targetRoom: draft.targetRoom,
        })
        setIsLLMProcessing(false)
      })
      const unsubDecision = a.onDecision?.((decision: DecisionRequest) => {
        setPendingDecision({
          messageId: decision.messageId,
          roomId: decision.roomId,
          senderName: decision.senderName,
          originalMessage: decision.originalMessage,
          intentType: decision.intent.type,
          intentSummary: decision.intent.summary,
          suggestedActions: decision.intent.suggestedActions,
        })
      })
      // Listen for screen notifications (Phase 4 — device awareness)
      const unsubNotification = a.onNotification((event) => {
        // 设备房间：把通知结果显示为聊天消息
        const store = useAppStore.getState()
        if (store.activeConversationId === DEVICE_ROOM_ID) {
          // 找到最近的 status 消息并替换，或追加新消息
          const statusMsg = store.messages.find(m => m.body.startsWith('⏳'))
          if (statusMsg) {
            store.setMessages(store.messages.map(m => m.id === statusMsg.id
              ? { ...m, body: event.content, status: 'sent' as const }
              : m
            ))
          } else {
            store.addMessage({
              id: `device_${Date.now()}`,
              type: 'agent-output',
              body: event.content,
              time: formatTime(event.timestamp),
            })
          }
        }
        addScreenNotification({
          id: `screen_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: event.type,
          content: event.content,
          sourceApp: event.sourceApp,
          actionRequired: event.actionRequired,
          timestamp: formatTime(event.timestamp),
        })
      })
      return () => { unsubDraft(); unsubDecision?.(); unsubNotification() }
    } catch { return () => {} }
  }, [setPendingApproval, setPendingDecision, setIsLLMProcessing, addScreenNotification])

  // Listen for incoming messages → delegate to Agent for intent detection
  useEffect(() => {
    const unsub = onMessage(async (msg) => {
      if (msg.content.type === 'text') {
        // 如果是当前对话，显示消息
        if (msg.roomId === activeConversationId) {
          addMessage({
            id: msg.id, type: 'incoming', body: msg.content.body,
            time: formatTime(msg.timestamp), senderId: msg.senderId,
          })
          sendReadReceipt(msg.roomId, msg.id).catch(() => {})
        }

        // 所有房间的消息都交给 Agent 做意图识别（不限于当前对话）
        try {
          const a = getAgent()
          const senderName = conversations.find(c => c.id === msg.roomId)?.name ?? msg.senderId
          if (a.onIncomingMessage) await a.onIncomingMessage(msg, senderName)
        } catch {}
      }
      refreshConversations()
    })
    return unsub
  }, [activeConversationId, addMessage, refreshConversations, conversations])

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

  // Load messages when switching conversation — show cache first, then fetch
  useEffect(() => {
    if (!activeConversationId) return

    // 虚拟设备房间：不从 Matrix 加载消息
    if (activeConversationId === DEVICE_ROOM_ID) {
      const cached = loadCachedMessages(activeConversationId)
      if (cached.length > 0) setMessages(cached)
      else {
        const status = getDeviceAgentStatus()
        const connected = status?.daemonStatus === 'connected'
        const welcomeText = connected
          ? `设备已连接（${status!.agents?.length ?? 0} 个 agent 可用）。你可以让我执行代码、搜索信息、操作文件等。`
          : '你好！我是你的设备助手。你可以让我打开浏览器、搜索信息、执行命令等。试试说"打开浏览器搜索今天的天气"'
        setMessages([{
          id: 'device_welcome',
          type: 'incoming' as const,
          body: welcomeText,
          time: formatTime(),
          senderId: 'device',
        }])
      }
      return
    }

    // Immediately show cached messages
    const cached = loadCachedMessages(activeConversationId)
    if (cached.length > 0) setMessages(cached)

    // Then fetch from server
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
            type: isOutgoing ? 'agent-output' : 'incoming',
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
        chatMsgs.reverse()
        setMessages(chatMsgs)
        cacheMessages(activeConversationId, chatMsgs)
        if (msgs.length > 0) {
          sendReadReceipt(activeConversationId, msgs[msgs.length - 1].id).catch(() => {})
        }
      })
      .catch(() => {
        // If fetch fails, keep showing cached messages
        if (cached.length === 0) setMessages([])
      })
  }, [activeConversationId, userId, setMessages])

  // Refresh friends when needed
  useEffect(() => {
    try { setFriends(getFriends()) } catch {}
  }, [conversations, setFriends])

  // Listen for incoming friend requests
  useEffect(() => {
    try {
      const unsub = onFriendRequest((req: any) => {
        const current = useAppStore.getState().friendRequests
        if (!current.some(r => r.id === req.id)) {
          setFriendRequests([...current, req])
        }
      })
      return unsub
    } catch { return () => {} }
  }, [setFriendRequests])

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

  const handleSend = async (text: string) => {
    if (!activeConversationId) return

    addMessage({ id: `intent_${Date.now()}`, type: 'user-intent', body: text, time: formatTime() })

    // 🖥️ 设备对话：走 adapter 的 sendCommand（内部自动路由到 Paseo 或 OpenClaw）
    if (activeConversationId === DEVICE_ROOM_ID) {
      setIsLLMProcessing(true)

      const statusId = `status_${Date.now()}`
      addMessage({
        id: statusId,
        type: 'agent-output',
        body: '⏳ 正在执行...',
        time: formatTime(),
      })

      try {
        const a = getAgent()
        // sendCommand 内部根据 Paseo 可用性自动路由
        // 结果通过 onNotification 回调返回
        await a.sendCommand?.({
          targetDeviceId: 'local',
          command: 'exec',
          args: { intent: text },
          requireApproval: false,
        })
      } catch (err: any) {
        const msgs = useAppStore.getState().messages
        useAppStore.getState().setMessages(msgs.map(m => m.id === statusId
          ? { ...m, body: `⚠️ ${err?.message ?? '设备 Agent 不可用'}` }
          : m
        ))
      } finally {
        setIsLLMProcessing(false)
      }
      return
    }

    // 普通对话：走 Agent 改写 → 审批流程
    sendTyping(activeConversationId, false).catch(() => {})
    setIsLLMProcessing(true)
    try {
      const a = getAgent()
      await a.onMessage({
        id: `input_${Date.now()}`,
        roomId: activeConversationId,
        senderId: userId ?? '',
        timestamp: Date.now(),
        type: 'text',
        content: { type: 'text', body: text },
      })
    } catch {
      setPendingApproval({
        requestId: `approval_${Date.now()}`,
        draft: text,
        originalIntent: text,
        targetRoom: activeConversationId,
      })
      setIsLLMProcessing(false)
    }
  }

  const handleAttach = async (file: File) => {
    if (!activeConversationId) return
    try {
      const isImage = file.type.startsWith('image/')
      if (isImage) {
        const msg = await uploadAndSendImage(activeConversationId, file)
        addMessage({
          id: msg.id, type: 'agent-output', body: '', time: formatTime(),
          mediaType: 'image', mediaUrl: mxcToHttp(msg.content.type === 'file' ? msg.content.url : ''),
          fileName: file.name,
        })
      } else {
        const msg = await uploadAndSendFile(activeConversationId, file)
        addMessage({
          id: msg.id, type: 'agent-output', body: '', time: formatTime(),
          mediaType: 'file', fileName: file.name, mimeType: file.type,
        })
      }
    } catch (err: any) {
      setGlobalError('文件上传失败：' + (err.message ?? '请重试'))
    }
  }

  const handleApprove = async () => {
    if (!pendingApproval) return
    setIsSendingMessage(true)
    try {
      // 附带原始意图 metadata，接收方的 Agent 可以读取
      const ottieMeta: Record<string, unknown> = {
        originalIntent: pendingApproval.originalIntent,
      }
      // 检测是否包含设备操作意图
      if (/电脑上|设备上|文件.*发给|发.*文件给|帮我.*搜|帮我.*查|帮我.*找|帮我.*打开|截图|浏览器/.test(pendingApproval.originalIntent)) {
        ottieMeta.intentType = 'device_request'
      }
      const msg = await sendMessage(pendingApproval.targetRoom, pendingApproval.draft, replyingTo?.id, ottieMeta)
      addMessage({
        id: msg.id, type: 'agent-output', body: pendingApproval.draft,
        time: formatTime(), status: 'sent',
        replyTo: replyingTo ? { sender: replyingTo.sender, body: replyingTo.body } : undefined,
      })
    } catch (err: any) {
      setGlobalError('消息发送失败：' + (err.message ?? '请重试'))
    } finally {
      setIsSendingMessage(false)
    }
    setPendingApproval(null)
    setReplyingTo(null)
  }

  const handleReject = () => setPendingApproval(null)

  // Receiving-side: user picks an action from the decision card → delegate to Agent
  const handleDecisionAction = async (action: SuggestedAction) => {
    if (!pendingDecision) return

    // 设备操作请求 → adapter 接管（多步审批），不在这里创建 approval
    if (action.response.startsWith('__device_exec__:')) {
      try {
        const a = getAgent()
        if (a.onDecisionAction) {
          await a.onDecisionAction(pendingDecision.originalMessage, action)
        }
      } catch {}
      setPendingDecision(null)
      // adapter 会通过 onDraft callback 推出审批卡片
      return
    }

    let reply = action.response
    try {
      const a = getAgent()
      if (a.onDecisionAction) {
        reply = await a.onDecisionAction(pendingDecision.originalMessage, action)
      }
    } catch {}
    setPendingApproval({
      requestId: `reply_${Date.now()}`,
      draft: reply,
      originalIntent: `回复 ${pendingDecision.senderName}：${action.label}`,
      targetRoom: pendingDecision.roomId,
    })
    setPendingDecision(null)
  }

  const handleDecisionCustomReply = () => {
    // Dismiss decision card, let user type freely
    setPendingDecision(null)
  }

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
      friendRequests={friendRequests}
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
        <TabBar />

        {/* Terminal tab content */}
        {tabs.find(t => t.id === activeTabId)?.type === 'terminal' && (
          <div style={{ flex: 1 }}>
            <TerminalView />
          </div>
        )}

        {/* Chat tab content (default) */}
        {(tabs.find(t => t.id === activeTabId)?.type ?? 'chat') === 'chat' && activeConv ? (
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
                display: 'flex', flexDirection: 'column', gap: '6px',
                background: 'var(--white)',
                justifyContent: 'flex-end',
                minHeight: 0,
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
                  {messages.length === 0 && !pendingApproval && !pendingDecision && !isLLMProcessing && (
                    <div style={{
                      textAlign: 'center', color: 'var(--text-tertiary)',
                      fontSize: '14px', padding: '40px 0',
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                      还没有消息，说点什么吧
                    </div>
                  )}
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
                      replyTo={msg.replyTo}
                      onReply={() => setReplyingTo({ id: msg.id, sender: msg.senderId ?? 'unknown', body: msg.body })}
                    />
                  ))}
                  {isLLMProcessing && (
                    <div style={{
                      alignSelf: 'flex-end', padding: '8px 12px',
                      fontSize: '13px', color: 'var(--text-tertiary)',
                      fontStyle: 'italic', fontFamily: 'var(--font-family)',
                    }}>
                      🦦 Ottie 正在思考...
                    </div>
                  )}
                  {screenNotifications.map(n => (
                    <OttieScreenNotification
                      key={n.id}
                      type={n.type}
                      content={n.content}
                      sourceApp={n.sourceApp}
                      actionRequired={n.actionRequired}
                      timestamp={n.timestamp}
                      onDismiss={() => removeScreenNotification(n.id)}
                    />
                  ))}
                  {pendingDecision && (
                    <OttieDecisionCard
                      senderName={pendingDecision.senderName}
                      originalMessage={pendingDecision.originalMessage}
                      intentSummary={pendingDecision.intentSummary}
                      intentType={pendingDecision.intentType}
                      actions={pendingDecision.suggestedActions}
                      onAction={handleDecisionAction}
                      onCustomReply={handleDecisionCustomReply}
                    />
                  )}
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
              <OttieInput
                onSend={handleSend}
                onAttach={handleAttach}
                disabled={isSendingMessage || isLLMProcessing}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            </div>
          </>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-family)',
          }}>
            <div style={{ textAlign: 'center', maxWidth: '300px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🦦</div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                欢迎使用 Ottie
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
                {conversations.length === 0
                  ? '点击左上角 👤 联系人图标，搜索并添加好友开始聊天'
                  : '选择左侧的聊天开始对话'}
              </div>
              {conversations.length === 0 && (
                <button
                  onClick={() => setSidebarView('contacts')}
                  style={{
                    background: 'var(--ottie-green)', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'var(--font-family)',
                  }}
                >
                  添加好友
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
