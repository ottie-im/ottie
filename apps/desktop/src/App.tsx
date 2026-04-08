import React, { useState } from 'react'
import { useAppStore } from './store'
import { OttieLogin } from '@ottie-im/ui'
import { MainLayout } from './MainLayout'
import { SettingsView } from './SettingsView'
import { login, register, startSync, setPresence } from './services'

export function App() {
  const { loggedIn, setLoggedIn, currentView } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const handleLogin = async (username: string, password: string) => {
    setLoading(true)
    setError(undefined)
    try {
      const userId = await login(username, password)
      await startSync()
      setPresence('online').catch(() => {})
      setLoggedIn(userId)
    } catch (err: any) {
      setError(err.data?.error ?? err.message ?? '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (username: string, password: string) => {
    setLoading(true)
    setError(undefined)
    try {
      const userId = await register(username, password)
      await startSync()
      setPresence('online').catch(() => {})
      setLoggedIn(userId)
    } catch (err: any) {
      setError(err.data?.error ?? err.message ?? '注册失败')
    } finally {
      setLoading(false)
    }
  }

  if (!loggedIn) {
    return <OttieLogin onLogin={handleLogin} onRegister={handleRegister} loading={loading} error={error} />
  }

  if (currentView === 'settings') {
    return <SettingsView />
  }

  return <MainLayout />
}
