import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { isSyncing } from '../../src/services'
import { useEffect, useState } from 'react'

function SyncDot() {
  const [syncing, setSyncing] = useState(false)
  useEffect(() => {
    const check = () => setSyncing(isSyncing())
    check()
    const timer = setInterval(check, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text style={{ fontSize: 18, color: '#fff', fontWeight: '600' }}>🦦 Ottie</Text>
      <View style={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: syncing ? '#4ade80' : '#f87171',
      }} />
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#128C7E' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#25D366',
        tabBarInactiveTintColor: '#667781',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '聊天',
          headerTitle: () => <SyncDot />,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: '联系人',
          headerTitle: '联系人',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: '设备',
          headerTitle: '设备',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🖥️</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          headerTitle: '设置',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  )
}
