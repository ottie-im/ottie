import React, { useEffect, useCallback, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useStore } from '../../src/store'
import { getJoinedRooms, getRoomMembers, getRoomMessages, getUserId, onMessage } from '../../src/services'

interface ConvItem {
  id: string
  name: string
  lastMessage: string
  time: string
  initial: string
}

export default function ChatsTab() {
  const { conversations, setConversations } = useStore()
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const uid = getUserId()
      if (!uid) return
      const roomIds = await getJoinedRooms()
      const convs: ConvItem[] = []
      for (const roomId of roomIds.slice(0, 20)) {
        try {
          const members = await getRoomMembers(roomId)
          const other = members.find(m => m.userId !== uid)
          const msgs = await getRoomMessages(roomId, 1)
          const lastMsg = msgs[msgs.length - 1]
          const name = other?.displayName ?? roomId
          convs.push({
            id: roomId,
            name,
            lastMessage: lastMsg?.content?.body ?? '',
            time: lastMsg ? new Date(lastMsg.origin_server_ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '',
            initial: name.charAt(0).toUpperCase(),
          })
        } catch {}
      }
      setConversations(convs)
    } catch {}
  }, [setConversations])

  useEffect(() => { refresh() }, [refresh])

  // 实时消息 → 更新对话列表
  useEffect(() => {
    const unsub = onMessage(() => {
      refresh()
    })
    return unsub
  }, [refresh])

  const onRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false) }

  const renderItem = ({ item }: { item: ConvItem }) => (
    <TouchableOpacity style={s.item} onPress={() => router.push(`/chat/${encodeURIComponent(item.id)}?name=${encodeURIComponent(item.name)}`)}>
      <View style={s.avatar}><Text style={s.avatarText}>{item.initial}</Text></View>
      <View style={s.itemContent}>
        <View style={s.itemHeader}>
          <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={s.itemTime}>{item.time}</Text>
        </View>
        <Text style={s.itemMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={s.container}>
      {conversations.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🦦</Text>
          <Text style={{ fontSize: 18, fontWeight: '500', color: '#111b21' }}>还没有聊天</Text>
          <Text style={{ fontSize: 14, color: '#667781', marginTop: 8 }}>添加好友开始对话</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={i => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#25D366" />}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e9edef' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '500' },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemName: { fontSize: 16, fontWeight: '500', color: '#111b21', flex: 1 },
  itemTime: { fontSize: 12, color: '#667781' },
  itemMessage: { fontSize: 14, color: '#667781' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})
