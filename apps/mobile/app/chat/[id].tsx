import React, { useEffect, useState, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useStore } from '../../src/store'
import { sendMessage, getMessages, onMessage, getSession } from '../../src/services'

interface ChatMsg {
  id: string
  type: 'outgoing' | 'incoming'
  body: string
  time: string
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const roomId = decodeURIComponent(id ?? '')
  const { userId } = useStore()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [text, setText] = useState('')
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
      })).reverse()
      setMessages(chatMsgs)
    }).catch(() => {})
  }, [roomId, userId])

  // Listen for new messages
  useEffect(() => {
    const unsub = onMessage(msg => {
      if (msg.roomId === roomId && msg.content.type === 'text') {
        setMessages(prev => [...prev, {
          id: msg.id,
          type: msg.senderId === userId ? 'outgoing' : 'incoming',
          body: msg.content.body,
          time: new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        }])
      }
    })
    return unsub
  }, [roomId, userId])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || !roomId) return
    setText('')
    try {
      const msg = await sendMessage(roomId, trimmed)
      setMessages(prev => [...prev, {
        id: msg.id, type: 'outgoing', body: trimmed,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {}
  }

  const renderBubble = ({ item }: { item: ChatMsg }) => (
    <View style={[s.bubble, item.type === 'outgoing' ? s.outgoing : s.incoming]}>
      <Text style={s.bubbleText}>{item.body}</Text>
      <Text style={s.bubbleTime}>{item.time}</Text>
    </View>
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
        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            value={text}
            onChangeText={setText}
            placeholder="跟 Ottie 说..."
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingHorizontal: 16, backgroundColor: '#f0f2f5', borderTopWidth: 1, borderTopColor: '#e9edef' },
  input: { flex: 1, height: 40, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, fontSize: 15, color: '#111b21' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: '#e9edef' },
  sendIcon: { color: '#fff', fontSize: 18 },
})
