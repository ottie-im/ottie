import React, { useState, useEffect } from 'react'
import { useAppStore } from './store'
import { OttieLogin, OttieToast, OttieConnectionBar } from '@ottie-im/ui'
import { MainLayout } from './MainLayout'
import { SettingsView } from './SettingsView'
import { SetupGuide } from './SetupGuide'
import { CommandPalette } from './components/CommandPalette'
import { applyTheme, getStoredTheme, initThemeListener } from './themes'
import { login, register, startSync, setPresence, tryAutoLogin, initAgent } from './services'

export function App() {
  const {
    loggedIn, setLoggedIn, currentView,
    connectionStatus, setConnectionStatus,
    globalError, setGlobalError,
    isSyncing, setIsSyncing,
    agentStatus, setAgentStatus,
    setupComplete, setSetupComplete,
  } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [autoLoginDone, setAutoLoginDone] = useState(false)

  // Cmd+K 命令面板（hooks 必须在所有 early return 之前）
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore()
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  // Init theme on startup
  useEffect(() => {
    const theme = getStoredTheme()
    applyTheme(theme)
    return initThemeListener(theme)
  }, [])

  // Try auto-login on startup (only after setup is complete)
  useEffect(() => {
    if (!setupComplete) return
    tryAutoLogin().then(async (userId) => {
      if (userId) {
        setIsSyncing(true)
        try {
          await startSync()
          initAgent()
          setPresence('online').catch(() => {})
          setConnectionStatus('connected')

          // Check if agent has API key configured
          const config = localStorage.getItem('ottie_agent_config')
          if (config) {
            const parsed = JSON.parse(config)
            setAgentStatus(parsed.apiKey ? 'online' : 'degraded')
          } else {
            setAgentStatus('degraded')
          }

          setLoggedIn(userId)
        } catch {}
        setIsSyncing(false)
      }
      setAutoLoginDone(true)
    })
  }, [setupComplete]) // eslint-disable-line

  const handleLogin = async (username: string, password: string) => {
    setLoading(true)
    setError(undefined)
    try {
      const userId = await login(username, password)
      setIsSyncing(true)
      await startSync()
      initAgent()
      setPresence('online').catch(() => {})
      setConnectionStatus('connected')
      setIsSyncing(false)
      setLoggedIn(userId)
    } catch (err: any) {
      const msg = err.data?.error ?? err.message ?? '登录失败'
      if (msg.includes('fetch failed') || msg.includes('Failed to fetch')) setError('无法连接到服务器，请检查网络')
      else if (msg.includes('Invalid username or password') || msg.includes('M_FORBIDDEN')) setError('用户名或密码错误')
      else setError(msg)
    } finally { setLoading(false) }
  }

  const handleRegister = async (username: string, password: string) => {
    setLoading(true)
    setError(undefined)
    try {
      const userId = await register(username, password)
      setIsSyncing(true)
      await startSync()
      initAgent()
      setPresence('online').catch(() => {})
      setConnectionStatus('connected')
      setIsSyncing(false)
      setLoggedIn(userId)
    } catch (err: any) {
      const msg = err.data?.error ?? err.message ?? '注册失败'
      if (msg.includes('M_USER_IN_USE')) setError('用户名已被占用')
      else if (msg.includes('fetch failed')) setError('无法连接到服务器，请检查网络')
      else setError(msg)
    } finally { setLoading(false) }
  }

  // Phase A: First-run setup
  if (!setupComplete) {
    return <SetupGuide onComplete={() => setSetupComplete(true)} />
  }

  // Phase B: Auto-login loading
  if (!autoLoginDone) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--cloud-gray)', fontFamily: 'var(--font-family)', flexDirection: 'column',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🦦</div>
        <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>正在连接...</div>
      </div>
    )
  }

  // Phase C+D: Login or Main app
  return (
    <>
      {loggedIn && <OttieConnectionBar status={connectionStatus} />}
      {globalError && <OttieToast message={globalError} type="error" onDismiss={() => setGlobalError(null)} />}
      {loggedIn && <CommandPalette />}
      {!loggedIn ? (
        <OttieLogin onLogin={handleLogin} onRegister={handleRegister} loading={loading} error={error} />
      ) : currentView === 'settings' ? (
        <SettingsView />
      ) : (
        <MainLayout />
      )}
    </>
  )
}
