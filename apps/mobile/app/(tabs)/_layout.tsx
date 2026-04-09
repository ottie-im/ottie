import { Tabs } from 'expo-router'
import { Text } from 'react-native'

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
          headerTitle: '🦦 Ottie',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: '联系人',
          headerTitle: '联系人',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: '设备',
          headerTitle: '设备',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🖥️</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          headerTitle: '设置',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  )
}
