import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native'
import { useStore } from '../../src/store'
import { getProfile, setDisplayName, getMatrix } from '../../src/services'

export default function SettingsTab() {
  const { userId, setLoggedOut } = useStore()
  const [displayName, setName] = useState(userId ?? '')
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    getProfile().then(p => setName(p.displayName)).catch(() => {})
  }, [])

  const handleSaveName = async () => {
    if (nameInput.trim() && nameInput !== displayName) {
      try {
        await setDisplayName(nameInput.trim())
        setName(nameInput.trim())
      } catch {}
    }
    setEditing(false)
  }

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: () => setLoggedOut() },
    ])
  }

  // Agent info
  let agentName = 'Ottie'
  let agentStatus = '运行中'
  let agentCaps: string[] = []
  try {
    // Agent info not available on mobile (runs on desktop)
    agentName = 'Ottie（远程）'
    agentStatus = '桌面端运行'
    agentCaps = ['改写', '审批', '意图识别']
  } catch {}

  return (
    <ScrollView style={s.container}>
      {/* Profile */}
      <View style={s.card}>
        <View style={s.profileRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {editing ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={s.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  onSubmitEditing={handleSaveName}
                  autoFocus
                />
                <TouchableOpacity style={s.saveBtn} onPress={handleSaveName}>
                  <Text style={{ color: '#fff', fontWeight: '500' }}>保存</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setNameInput(displayName); setEditing(true) }}>
                <Text style={s.name}>{displayName} ✏️</Text>
              </TouchableOpacity>
            )}
            <Text style={s.userId}>{userId}</Text>
          </View>
        </View>
      </View>

      {/* Agent */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Agent</Text>
        <View style={s.agentRow}>
          <Text style={{ fontSize: 24 }}>🦦</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.agentName}>{agentName}</Text>
            <Text style={s.agentStatus}>● {agentStatus}</Text>
          </View>
        </View>
        <View style={s.capsRow}>
          {agentCaps.map((cap, i) => (
            <View key={i} style={s.capBadge}>
              <Text style={s.capText}>{cap}</Text>
            </View>
          ))}
        </View>
        <Text style={s.hint}>
          移动端不运行 Agent。改写和意图识别由桌面端的 Agent 处理。
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>退出登录</Text>
      </TouchableOpacity>

      <View style={{ height: 48 }} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '500' },
  name: { fontSize: 18, fontWeight: '500', color: '#111b21' },
  userId: { fontSize: 13, color: '#8696a0', marginTop: 2 },
  nameInput: { flex: 1, height: 36, borderWidth: 1, borderColor: '#e9edef', borderRadius: 6, paddingHorizontal: 8, fontSize: 16, color: '#111b21' },
  saveBtn: { backgroundColor: '#25D366', borderRadius: 6, paddingHorizontal: 12, justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111b21', marginBottom: 12 },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  agentName: { fontSize: 14, fontWeight: '500', color: '#111b21' },
  agentStatus: { fontSize: 12, color: '#25D366' },
  capsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 8 },
  capBadge: { backgroundColor: '#f0f2f5', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  capText: { fontSize: 11, color: '#667781' },
  hint: { fontSize: 12, color: '#8696a0', lineHeight: 18 },
  logoutBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '500' },
})
