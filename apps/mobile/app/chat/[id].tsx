import React, { useEffect, useState, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useStore } from '../../src/store'
import { sendMessage, getMessages, onMessage, getSession, sendReadReceipt } from '../../src/services'

interface ChatMsg {
  id: string
  type: 'outgoing' | 'incoming'
  body: string
  time: string
  sender?: string
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const roomId = decodeURIComponent(id ?? '')
  const { userId } = useStore()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [text, setText] = useState('')
  const [replyingTo, setReplyingTo] = useState<ChatMsg | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Load messages
  useEffect(() => {
    if (!roomId) return
    getMessages(roomId, 50).then(msgs => {
      const chatMsgs = msgs.map(m => ({
        id: m.id,
        type: (m.senderId === userId ? 'outgoing' : 'incoming') as 'outgoing' | 'incoming',
        body: m.content.type === 'text' ? m.content.body : '[media]',
        time: new Date(m.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        sender: m.senderId,
      })).reverse()
      setMessages(chatMsgs)
      // Send read receipt
      if (msgs.length > 0) sendReadReceipt(roomId, msgs[msgs.length - 1].id).catch(() => {})
    }).catch(() => {})
  }, [roomId, userId])

  // Listen for new messages
  useEffect(() => {
    const unsub = onMessage(msg => {
      if (msg.roomId === roomId && msg.content.type === 'text') {
        const newMsg: ChatMsg = {
          id: msg.id,
          type: msg.senderId === userId ? 'outgoing' : 'incoming',
          body: msg.content.body,
          time: new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          sender: msg.senderId,
        }
        setMessages(prev => [...prev, newMsg])
        sendReadReceipt(roomId, msg.id).catch(() => {})
      }
    })
    return unsub
  }, [roomId, userId])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || !roomId) return
    setText('')
    const replyId = replyingTo?.id
    setReplyingTo(null)
    try {
      const msg = await sendMessage(roomId, trimmed, replyId)
      setMessages(prev => [...prev, {
        id: msg.id, type: 'outgoing', body: trimmed,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {}
  }

  const renderBubble = ({ item }: { item: ChatMsg }) => (
    <TouchableOpacity
      style={[s.bubble, item.type === 'outgoing' ? s.outgoing : s.incoming]}
      onLongPress={() => setReplyingTo(item)}
      activeOpacity={0.7}
    >
      <Text style={s.bubbleText}>{item.body}</Text>
      <Text style={s.bubbleTime}>{item.time}</Text>
    </TouchableOpacity>
  )

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: '聊天', headerStyle: { backgroundColor: '#128C7E' }, headerTintColor: '#fff' }} />
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderBubble}
          keyExtractor={i => i.id}
          contentContainerStyle={s.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Reply preview */}
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
  bubbleTime: { fontSize: 11, color: '#667781', textAlign: 'right', marginTop: 2 },
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
