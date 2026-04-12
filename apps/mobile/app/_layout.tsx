import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { setupNotifications, requestNotificationPermission } from '../src/services'

// 初始化通知处理器
setupNotifications()

// 动态加载 notifications（native module 可能不可用）
let NotificationsModule: any = null
try {
  NotificationsModule = require('expo-notifications')
} catch {}

export default function RootLayout() {
  useEffect(() => {
    requestNotificationPermission()

    // 监听用户点击通知 → 跳转到对应聊天
    if (NotificationsModule) {
      try {
        const sub = NotificationsModule.addNotificationResponseReceivedListener((response: any) => {
          const roomId = response.notification.request.content.data?.roomId
          if (roomId) {
            router.push(`/chat/${encodeURIComponent(roomId as string)}`)
          }
        })
        return () => sub.remove()
      } catch {}
    }
    return () => {}
  }, [])

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </>
  )
}
