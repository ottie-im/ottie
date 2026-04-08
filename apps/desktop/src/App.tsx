import React, { useState, useEffect } from 'react'
import { useAppStore } from './store'
import { OttieLogin, OttieToast, OttieConnectionBar } from '@ottie-im/ui'
import { MainLayout } from './MainLayout'
import { SettingsView } from './SettingsView'
import { login, register, startSync, setPresence, configureLLM, tryAutoLogin } from './services'

// Auto-configure LLM from environment variables
const llmBaseUrl = import.meta.env.VITE_LLM_BASE_URL
const llmApiKey = import.meta.env.VITE_LLM_API_KEY
const llmModel = import.meta.env.VITE_LLM_MODEL
if (llmBaseUrl && llmApiKey && llmModel) {
  configureLLM({ baseUrl: llmBaseUrl, apiKey: llmApiKey, model: llmModel })
  console.log(`🦦 Ottie LLM: ${llmModel} via ${llmBaseUrl}`)
}

export function App() {
  const {
    loggedIn, setLoggedIn, currentView,
    connectionStatus, setConnectionStatus,
    globalError, setGlobalError,
    isSyncing, setIsSyncing,
  } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [autoLoginDone, setAutoLoginDone] = useState(false)

  // Try auto-login on startup
  useEffect(() => {
    tryAutoLogin().then(async (userId) => {
      if (userId) {
        setIsSyncing(true)
        try {
          await startSync()
          setPresence('online').catch(() => {})
          setConnectionStatus('connected')
          setLoggedIn(userId)
        } catch {
          // Auto-login failed silently
        }
        setIsSyncing(false)
      }
      setAutoLoginDone(true)
    })
  }, []) // eslint-disable-line

  const handleLogin = async (username: string, password: string) => {
    setLoading(true)
    setError(undefined)
    try {
      const userId = await login(username, password)
      setIsSyncing(true)
      await startSync()
      setPresence('online').catch(() => {})
      setConnectionStatus('connected')
      setIsSyncing(false)
      setLoggedIn(userId)
    } catch (err: any) {
      const msg = err.data?.error ?? err.message ?? '登录失败'
      if (msg.includes('fetch failed') || msg.includes('Failed to fetch')) {
        setError('无法连接到服务器，请检查网络')
      } else if (msg.includes('Invalid username or password') || msg.includes('M_FORBIDDEN')) {
        setError('用户名或密码错误')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (username: string, password: string) => {
    setLoading(true)
    setError(undefined)
    try {
      const userId = await register(username, password)
      setIsSyncing(true)
      await startSync()
      setPresence('online').catch(() => {})
      setConnectionStatus('connected')
      setIsSyncing(false)
      setLoggedIn(userId)
    } catch (err: any) {
      const msg = err.data?.error ?? err.message ?? '注册失败'
      if (msg.includes('M_USER_IN_USE')) {
        setError('用户名已被占用')
      } else if (msg.includes('fetch failed')) {
        setError('无法连接到服务器，请检查网络')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading during auto-login
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

  return (
    <>
      {/* Global connection status bar */}
      <OttieConnectionBar status={connectionStatus} />

      {/* Global error toast */}
      {globalError && (
        <OttieToast message={globalError} type="error" onDismiss={() => setGlobalError(null)} />
      )}

      {/* Main content */}
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
