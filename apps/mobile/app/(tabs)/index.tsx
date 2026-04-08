import React, { useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useStore } from '../../src/store'
import { getRooms, getSession, getPresence } from '../../src/services'

interface ConvItem {
  id: string
  name: string
  lastMessage: string
  time: string
  initial: string
}

export default function ChatsTab() {
  const { conversations, setConversations } = useStore()

  const refresh = useCallback(() => {
    try {
      const rooms = getRooms()
      const session = getSession()
      if (!rooms || !session) return

      const convs: ConvItem[] = rooms
        .filter((r: any) => r.getMyMembership() === 'join')
        .map((room: any) => {
          const members = room.getJoinedMembers()
          const other = members.find((m: any) => m.userId !== session.userId)
          const lastEvent = room.timeline?.[room.timeline.length - 1]
          const name = other?.name ?? room.name ?? room.roomId
          return {
            id: room.roomId,
            name,
            lastMessage: lastEvent?.getContent()?.body ?? '',
            time: lastEvent ? new Date(lastEvent.getTs()).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '',
            initial: name.charAt(0).toUpperCase(),
          }
        })
        .filter((c: ConvItem) => c.name)

      setConversations(convs)
    } catch {}
  }, [setConversations])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [refresh])

  const renderItem = ({ item }: { item: ConvItem }) => (
    <TouchableOpacity style={s.item} onPress={() => router.push(`/chat/${encodeURIComponent(item.id)}`)}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{item.initial}</Text>
      </View>
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
          <Text style={s.emptyIcon}>🦦</Text>
          <Text style={s.emptyText}>还没有聊天</Text>
          <Text style={s.emptyHint}>添加好友开始对话</Text>
        </View>
      ) : (
        <FlatList data={conversations} renderItem={renderItem} keyExtractor={i => i.id} />
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
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '500', color: '#111b21' },
  emptyHint: { fontSize: 14, color: '#667781', marginTop: 8 },
})
