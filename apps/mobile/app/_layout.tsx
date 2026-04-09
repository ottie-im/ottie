import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { useStore } from '../src/store'

export default function RootLayout() {
  const { loggedIn } = useStore()
  const segments = useSegments()
  const router = useRouter()

  // Redirect based on auth state
  useEffect(() => {
    const inAuth = segments[0] === undefined || segments[0] === 'index'
    if (!loggedIn && !inAuth) {
      router.replace('/')
    } else if (loggedIn && inAuth) {
      router.replace('/(tabs)')
    }
  }, [loggedIn, segments])

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
