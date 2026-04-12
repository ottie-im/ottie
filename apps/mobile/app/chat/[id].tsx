import React, { useEffect, useState, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useStore } from '../../src/store'
import { sendMessage, getRoomMessages, getUserId, sendReadReceipt, onMessage, aiRewrite, aiDetectIntent, isAIAvailable } from '../../src/services'
import { ApprovalCard } from '../../src/components/ApprovalCard'
import { DecisionCard } from '../../src/components/DecisionCard'

interface ChatMsg {
  id: string
  type: 'agent-output' | 'incoming'
  body: string
  time: string
  sender?: string
  status?: 'sent' | 'read'
}

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>()
  const roomId = decodeURIComponent(id ?? '')
  const contactName = name ? decodeURIComponent(name) : '聊天'
  const userId = getUserId()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [text, setText] = useState('')
  const [replyingTo, setReplyingTo] = useState<ChatMsg | null>(null)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (!roomId) return
    getRoomMessages(roomId, 50).then(msgs => {
      const chatMsgs = msgs.map(m => ({
        id: m.event_id,
        type: (m.sender === userId ? 'agent-output' : 'incoming') as 'agent-output' | 'incoming',
        body: m.content?.body ?? '[media]',
        time: new Date(m.origin_server_ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        sender: m.senderId,
        status: m.senderId === userId ? 'sent' as const : undefined,
      })).reverse()
      setMessages(chatMsgs)
      if (msgs.length > 0) sendReadReceipt(roomId, msgs[msgs.length - 1].id).catch(() => {})
    }).catch(() => {})
  }, [roomId, userId])

  useEffect(() => {
    const unsub = onMessage(msg => {
      if (msg.roomId === roomId && msg.content.type === 'text') {
        setMessages(prev => [...prev, {
          id: msg.id,
          type: msg.senderId === userId ? 'agent-output' : 'incoming',
          body: msg.content.body,
          time: new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          sender: msg.senderId,
          status: msg.senderId === userId ? 'sent' as const : undefined,
        }])
        sendReadReceipt(roomId, msg.id).catch(() => {})
      }
    })
    return unsub
  }, [roomId, userId])

  // 审批/决策状态
  const { pendingApproval, setPendingApproval, pendingDecision, setPendingDecision } = useStore()
  const [aiEnabled, setAiEnabled] = useState(false)

  useEffect(() => {
    isAIAvailable().then(setAiEnabled).catch(() => setAiEnabled(false))
  }, [])

  // 收到消息时做意图识别
  useEffect(() => {
    if (!aiEnabled) return
    const unsub = onMessage(async (msg: any) => {
      if (msg.roomId === roomId && msg.senderId !== userId) {
        try {
          const intent = await aiDetectIntent(msg.content?.body ?? '')
          if (intent && intent.suggestedActions?.length > 0) {
            setPendingDecision({
              messageId: msg.id,
              roomId,
              senderName: msg.senderId?.replace(/@(.+):.*/, '$1') ?? '',
              originalMessage: msg.content?.body ?? '',
              intentType: intent.type,
              intentSummary: intent.summary,
              suggestedActions: intent.suggestedActions,
            })
          }
        } catch {}
      }
    })
    return unsub
  }, [roomId, userId, aiEnabled, setPendingDecision])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || !roomId) return
    setText('')
    const replyId = replyingTo?.id
    setReplyingTo(null)

    // 如果 AI 可用，先走改写→审批流程
    if (aiEnabled) {
      try {
        const rewritten = await aiRewrite(trimmed)
        if (rewritten && rewritten !== trimmed) {
          setPendingApproval({
            requestId: `approval_${Date.now()}`,
            draft: rewritten,
            originalIntent: trimmed,
            targetRoomId: roomId,
          })
          return // 等审批
        }
      } catch {} // AI 失败则直接发送
    }

    // 直接发送（无 AI 或 AI 失败）
    try {
      const msg = await sendMessage(roomId, trimmed, replyId)
      setMessages(prev => [...prev, {
        id: msg.event_id ?? msg.id, type: 'agent-output', body: trimmed, status: 'sent',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {}
  }

  // 审批通过 → 发送
  const handleApprove = async (finalText: string) => {
    if (!pendingApproval) return
    setPendingApproval(null)
    try {
      const msg = await sendMessage(pendingApproval.targetRoomId, finalText)
      setMessages(prev => [...prev, {
        id: msg.event_id ?? msg.id, type: 'agent-output', body: finalText, status: 'sent',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {}
  }

  // 审批拒绝
  const handleReject = () => {
    setPendingApproval(null)
  }

  // 决策选择 → 发送回复
  const handleSelectAction = async (action: { label: string; response: string }) => {
    setPendingDecision(null)
    try {
      const msg = await sendMessage(roomId, action.response)
      setMessages(prev => [...prev, {
        id: msg.event_id ?? msg.id, type: 'agent-output', body: action.response, status: 'sent',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {}
  }

  const handleCustomReply = async (replyText: string) => {
    setPendingDecision(null)
    try {
      const msg = await sendMessage(roomId, replyText)
      setMessages(prev => [...prev, {
        id: msg.event_id ?? msg.id, type: 'agent-output', body: replyText, status: 'sent',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {}
  }

  const renderBubble = ({ item }: { item: ChatMsg }) => (
    <TouchableOpacity
      style={[s.bubble, item.type === 'agent-output' ? s.outgoing : s.incoming]}
      onLongPress={() => setReplyingTo(item)}
      activeOpacity={0.7}
    >
      <Text style={s.bubbleText}>{item.body}</Text>
      <View style={s.bubbleFooter}>
        <Text style={s.bubbleTime}>{item.time}</Text>
        {item.type === 'agent-output' && (
          <Text style={[s.checkmark, item.status === 'read' && s.checkmarkRead]}>
            {item.status === 'read' ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        headerTitle: contactName,
        headerStyle: { backgroundColor: '#128C7E' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '500' },
      }} />
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderBubble}
          keyExtractor={i => i.id}
          contentContainerStyle={s.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={s.emptyChat}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>💬</Text>
              <Text style={{ color: '#667781', fontSize: 14 }}>还没有消息，说点什么吧</Text>
            </View>
          }
        />

        {/* 决策卡片（收到消息的建议回复） */}
        {pendingDecision && pendingDecision.roomId === roomId && (
          <DecisionCard
            senderName={pendingDecision.senderName}
            originalMessage={pendingDecision.originalMessage}
            intentSummary={pendingDecision.intentSummary}
            suggestedActions={pendingDecision.suggestedActions}
            onSelectAction={handleSelectAction}
            onCustomReply={handleCustomReply}
            onDismiss={() => setPendingDecision(null)}
          />
        )}

        {/* 审批卡片（发送前的改写审批） */}
        {pendingApproval && pendingApproval.targetRoomId === roomId && (
          <ApprovalCard
            draft={pendingApproval.draft}
            originalIntent={pendingApproval.originalIntent}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        {replyingTo && (
          <View style={s.replyBar}>
            <View style={s.replyContent}>
              <Text style={s.replySender}>{replyingTo.sender ?? ''}</Text>
              <Text style={s.replyBody} numberOfLines={1}>{replyingTo.body}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Text style={s.replyClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            value={text}
            onChangeText={setText}
            placeholder="发消息..."
            placeholderTextColor="#8696a0"
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={[s.sendBtn, !text.trim() && s.sendBtnDisabled]} onPress={handleSend} disabled={!text.trim()}>
            <Text style={s.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageList: { padding: 16, paddingBottom: 8, flexGrow: 1, justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', padding: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 6 },
  outgoing: { alignSelf: 'flex-end', backgroundColor: '#dcf8c6', borderBottomRightRadius: 0 },
  incoming: { alignSelf: 'flex-start', backgroundColor: '#f7f8fa', borderBottomLeftRadius: 0, borderWidth: 1, borderColor: '#e9edef' },
  bubbleText: { fontSize: 14.2, lineHeight: 20, color: '#111b21' },
  bubbleFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 2 },
  bubbleTime: { fontSize: 11, color: '#667781' },
  checkmark: { fontSize: 11, color: '#667781' },
  checkmarkRead: { color: '#53bdeb' },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  replyBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#f7f8fa', borderTopWidth: 1, borderTopColor: '#e9edef', borderLeftWidth: 3, borderLeftColor: '#25D366' },
  replyContent: { flex: 1 },
  replySender: { fontSize: 11, fontWeight: '500', color: '#075E54' },
  replyBody: { fontSize: 12, color: '#667781' },
  replyClose: { fontSize: 16, color: '#8696a0', paddingHorizontal: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingHorizontal: 16, backgroundColor: '#f0f2f5', borderTopWidth: 1, borderTopColor: '#e9edef' },
  input: { flex: 1, height: 40, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, fontSize: 15, color: '#111b21' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: '#e9edef' },
  sendIcon: { color: '#fff', fontSize: 18 },
})
