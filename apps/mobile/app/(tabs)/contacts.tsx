import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { getFriends, searchUsers, sendFriendRequest } from '../../src/services'

interface FriendItem { userId: string; displayName: string; roomId: string }
interface SearchResult { matrixId: string; displayName: string }

type Tab = 'friends' | 'search'

export default function ContactsTab() {
  const [tab, setTab] = useState<Tab>('friends')
  const [friends, setFriends] = useState<FriendItem[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    try { setFriends(getFriends()) } catch {}
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    try {
      const r = await searchUsers(query.trim())
      setResults(r)
    } catch {}
  }

  const handleAdd = async (userId: string) => {
    try {
      await sendFriendRequest(userId)
      Alert.alert('已发送', '好友请求已发送')
      setResults(prev => prev.filter(r => r.matrixId !== userId))
    } catch (err: any) {
      Alert.alert('失败', err.message ?? '发送失败')
    }
  }

  return (
    <View style={s.container}>
      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === 'friends' && s.tabActive]} onPress={() => setTab('friends')}>
          <Text style={[s.tabText, tab === 'friends' && s.tabTextActive]}>好友 ({friends.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'search' && s.tabActive]} onPress={() => setTab('search')}>
          <Text style={[s.tabText, tab === 'search' && s.tabTextActive]}>➕ 添加</Text>
        </TouchableOpacity>
      </View>

      {tab === 'friends' ? (
        friends.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>👤</Text>
            <Text style={s.emptyText}>还没有好友</Text>
            <TouchableOpacity style={s.addBtn} onPress={() => setTab('search')}>
              <Text style={s.addBtnText}>搜索添加好友</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={i => i.userId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.friendItem}
                onPress={() => router.push(`/chat/${encodeURIComponent(item.roomId)}`)}
              >
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{item.displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={s.friendName}>{item.displayName}</Text>
                  <Text style={s.friendId}>{item.userId}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      ) : (
        <View style={s.searchContainer}>
          <View style={s.searchBar}>
            <TextInput
              style={s.searchInput}
              placeholder="输入用户名搜索"
              placeholderTextColor="#8696a0"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
              <Text style={{ color: '#fff', fontWeight: '500' }}>搜索</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={results}
            keyExtractor={i => i.matrixId}
            renderItem={({ item }) => (
              <View style={s.resultItem}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{item.displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.friendName}>{item.displayName}</Text>
                  <Text style={s.friendId}>{item.matrixId}</Text>
                </View>
                <TouchableOpacity style={s.addSmall} onPress={() => handleAdd(item.matrixId)}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>添加</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={query ? <Text style={s.noResult}>没有找到用户</Text> : null}
          />
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e9edef' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#25D366' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#667781' },
  tabTextActive: { color: '#25D366' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#667781', marginBottom: 16 },
  addBtn: { backgroundColor: '#25D366', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontWeight: '500' },
  friendItem: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e9edef' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  friendName: { fontSize: 14, fontWeight: '500', color: '#111b21' },
  friendId: { fontSize: 12, color: '#8696a0' },
  searchContainer: { flex: 1, padding: 12 },
  searchBar: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, height: 40, borderWidth: 1, borderColor: '#e9edef', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#111b21' },
  searchBtn: { backgroundColor: '#25D366', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8 },
  addSmall: { backgroundColor: '#25D366', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  noResult: { textAlign: 'center', color: '#8696a0', marginTop: 24 },
})
