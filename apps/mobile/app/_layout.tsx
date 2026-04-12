import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as Notifications from 'expo-notifications'
import { setupNotifications, requestNotificationPermission } from '../src/services'

// 初始化通知处理器（必须在组件外调用）
setupNotifications()

export default function RootLayout() {
  useEffect(() => {
    // 请求通知权限
    requestNotificationPermission()

    // 监听用户点击通知 → 跳转到对应聊天
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const roomId = response.notification.request.content.data?.roomId
      if (roomId) {
        router.push(`/chat/${encodeURIComponent(roomId as string)}`)
      }
    })

    return () => sub.remove()
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
