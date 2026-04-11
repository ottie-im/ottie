import React, { useEffect, useState } from 'react'
import { useAppStore } from './store'
import { OttieAvatar, OttieAgentSelector, OttieDevicePanel } from '@ottie-im/ui'
import type { AgentInfo, DeviceInfo } from '@ottie-im/ui'
import { getProfile, setDisplayName, setAvatar, unblockUser, getMatrix, getAgent, logout } from './services'

const PROVIDERS = [
  { id: 'aihubmix', name: 'AIHubMix (推荐)', baseUrl: 'https://aihubmix.com/v1', defaultModel: 'claude-sonnet-4-20250514' },
  { id: 'anthropic', name: 'Claude (Anthropic)', baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-sonnet-4-20250514' },
  { id: 'openai', name: 'OpenAI (GPT-4)', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  { id: 'custom', name: '自定义 (兼容 OpenAI)', baseUrl: '', defaultModel: '' },
]

export function SettingsView() {
  const { userId, setCurrentView, blockedUsers, setBlockedUsers, agentStatus } = useAppStore()
  const [displayName, setName] = useState(userId ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>()
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  // Agent config
  const [provider, setProvider] = useState('aihubmix')
  const [apiKey, setApiKey] = useState('')
  const [customBaseUrl, setCustomBaseUrl] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [configSaving, setConfigSaving] = useState(false)
  const [configMsg, setConfigMsg] = useState<string | null>(null)

  useEffect(() => {
    getProfile().then(p => { setName(p.displayName); setAvatarUrl(p.avatarUrl) }).catch(() => {})
    try { setBlockedUsers(getMatrix().getBlockedUsers()) } catch {}

    // Load saved agent config
    try {
      const saved = localStorage.getItem('ottie_agent_config')
      if (saved) {
        const config = JSON.parse(saved)
        setProvider(config.provider ?? 'anthropic')
        setApiKey(config.apiKey ?? '')
        setCustomBaseUrl(config.baseUrl ?? '')
        setCustomModel(config.model ?? '')
      }
    } catch {}
  }, [setBlockedUsers])

  const handleSaveName = async () => {
    if (nameInput.trim() && nameInput !== displayName) {
      await setDisplayName(nameInput.trim())
      setName(nameInput.trim())
    }
    setEditingName(false)
  }

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await setAvatar(file)
    const p = await getProfile()
    setAvatarUrl(p.avatarUrl)
  }

  const handleUnblock = async (uid: string) => {
    await unblockUser(uid)
    setBlockedUsers(getMatrix().getBlockedUsers())
  }

  const handleSaveApiConfig = async () => {
    const selected = PROVIDERS.find(p => p.id === provider)!
    const baseUrl = provider === 'custom' ? customBaseUrl : selected.baseUrl
    const model = provider === 'custom' ? customModel : selected.defaultModel

    if (provider !== 'none' && !apiKey.trim()) {
      setConfigMsg('请输入 API Key')
      return
    }

    setConfigSaving(true)
    setConfigMsg(null)

    try {
      localStorage.setItem('ottie_agent_config', JSON.stringify({ provider, apiKey, model, baseUrl }))

      if ((window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('configure_model', { provider, api_key: apiKey, model, base_url: baseUrl })
      }

      setConfigMsg('✅ 配置已保存')
      // Update agent status
      useAppStore.getState().setAgentStatus('online')
    } catch (err: any) {
      setConfigMsg(`❌ 配置失败: ${err}`)
    } finally {
      setConfigSaving(false)
    }
  }

  const handleRestartAgent = async () => {
    try {
      if ((window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('restart_gateway')
        setConfigMsg('✅ Agent 已重启')
        useAppStore.getState().setAgentStatus('online')
      }
    } catch (err: any) {
      setConfigMsg(`❌ 重启失败: ${err}`)
    }
  }

  // Agent info
  let agents: AgentInfo[] = []
  try {
    const a = getAgent()
    const agentCard = a.getAgentCard()
    agents = [{ id: a.id, name: agentCard.name, status: a.getStatus(), capabilities: agentCard.capabilities, persona: agentCard.persona, isDefault: true }]
  } catch {}

  // Devices
  let devices: DeviceInfo[] = [{ id: 'local', name: '当前设备', type: 'desktop', status: 'online', capabilities: ['消息', '改写', '审批'] }]
  try {
    const a = getAgent()
    const agentDevices = (a as any).getDevices?.()
    if (agentDevices?.then) {
      // async — skip for now, will be populated
    } else if (agentDevices?.length) {
      devices = agentDevices.map((d: any) => ({
        id: d.id, name: d.name, type: d.type, status: d.status,
        capabilities: d.capabilities ?? [],
      }))
    }
  } catch {}

  const statusConfig = {
    online: { label: '🟢 AI 引擎在线', color: '#16a34a', bg: '#f0fdf4' },
    degraded: { label: '🟡 基础模式（规则引擎）', color: '#ca8a04', bg: '#fefce8' },
    offline: { label: '🔴 AI 引擎离线', color: '#dc2626', bg: '#fef2f2' },
  }
  const currentStatus = statusConfig[agentStatus]

  const card = (children: React.ReactNode) => (
    <div style={{ background: 'var(--white)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-subtle)', marginBottom: '16px' }}>
      {children}
    </div>
  )

  return (
    <div style={{ height: '100vh', width: '100vw', background: 'var(--cloud-gray)', overflowY: 'auto', fontFamily: 'var(--font-family)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setCurrentView('chat')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-primary)' }}>←</button>
          <span style={{ fontSize: '20px', fontWeight: 600 }}>设置</span>
        </div>

        {/* Profile */}
        {card(
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <OttieAvatar name={displayName} avatarUrl={avatarUrl} size={64} />
              <label style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: 'var(--ottie-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer', border: '2px solid var(--white)' }}>
                📷<input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
              </label>
            </div>
            <div>
              {editingName ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                    style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '16px', fontFamily: 'var(--font-family)' }} autoFocus />
                  <button onClick={handleSaveName} style={{ background: 'var(--ottie-green)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontSize: '14px' }}>保存</button>
                </div>
              ) : (
                <div onClick={() => { setNameInput(displayName); setEditingName(true) }} style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>{displayName} ✏️</div>
                </div>
              )}
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{userId}</div>
            </div>
          </div>
        )}

        {/* Agent Status + API Config */}
        {card(
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Agent 配置</div>

            {/* Status badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
              background: currentStatus.bg, color: currentStatus.color, marginBottom: '16px',
            }}>
              {currentStatus.label}
            </div>

            {/* Provider selection */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>模型提供商</div>
              {PROVIDERS.map(p => (
                <label key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                  border: provider === p.id ? '2px solid var(--ottie-green)' : '1px solid var(--border)',
                  borderRadius: '8px', marginBottom: '4px', cursor: 'pointer', fontSize: '13px',
                  background: provider === p.id ? '#f0fdf4' : 'transparent',
                }}>
                  <input type="radio" name="provider" value={p.id} checked={provider === p.id}
                    onChange={() => setProvider(p.id)} style={{ accentColor: 'var(--ottie-green)' }} />
                  {p.name}
                </label>
              ))}
            </div>

            {/* API Key */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>API Key</div>
              <input
                type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%', padding: '8px 10px', border: '1px solid var(--border)',
                  borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-family)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Custom fields */}
            {provider === 'custom' && (
              <>
                <input type="text" value={customBaseUrl} onChange={e => setCustomBaseUrl(e.target.value)}
                  placeholder="Base URL" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box', fontFamily: 'var(--font-family)' }} />
                <input type="text" value={customModel} onChange={e => setCustomModel(e.target.value)}
                  placeholder="模型名称" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box', fontFamily: 'var(--font-family)' }} />
              </>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={handleSaveApiConfig} disabled={configSaving}
                style={{
                  flex: 1, padding: '10px', background: 'var(--ottie-green)', color: '#fff',
                  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                  cursor: configSaving ? 'wait' : 'pointer', fontFamily: 'var(--font-family)',
                  opacity: configSaving ? 0.7 : 1,
                }}>
                {configSaving ? '保存中...' : '保存配置'}
              </button>
              <button onClick={handleRestartAgent}
                style={{
                  padding: '10px 16px', background: 'var(--cloud-gray)', color: 'var(--text-secondary)',
                  border: 'none', borderRadius: '8px', fontSize: '14px',
                  cursor: 'pointer', fontFamily: 'var(--font-family)',
                }}>
                重启 Agent
              </button>
            </div>

            {/* Config message */}
            {configMsg && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: configMsg.startsWith('✅') ? '#16a34a' : '#dc2626' }}>
                {configMsg}
              </div>
            )}
          </div>
        )}

        {/* Agent Selector */}
        {card(<OttieAgentSelector agents={agents} onSetDefault={() => {}} />)}

        {/* Devices */}
        {card(<OttieDevicePanel devices={devices} onSendCommand={(id) => {
          const cmd = { targetDeviceId: id, command: 'exec', args: { intent: '测试指令' }, requireApproval: false }
          try {
            const a = getAgent();
            (a as any).sendCommand?.(cmd)
          } catch {}
        }} />)}

        {/* Blocked Users */}
        {card(
          <>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>黑名单 ({blockedUsers.length})</div>
            {blockedUsers.length === 0 ? (
              <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>没有被拉黑的用户</div>
            ) : (
              blockedUsers.map(u => (
                <div key={u.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{u.userId}</div>
                    {u.reason && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{u.reason}</div>}
                  </div>
                  <button onClick={() => handleUnblock(u.userId)} style={{ background: 'var(--cloud-gray)', color: 'var(--text-secondary)', border: 'none', borderRadius: '8px', padding: '4px 12px', fontSize: '13px', cursor: 'pointer' }}>解除</button>
                </div>
              ))
            )}
          </>
        )}

        {/* Logout */}
        {card(
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>账号</div>
            <button
              onClick={async () => {
                await logout()
                useAppStore.getState().setLoggedOut()
              }}
              style={{
                width: '100%', padding: '12px', background: 'none',
                border: '1px solid var(--danger, #e53e3e)', borderRadius: '8px',
                color: 'var(--danger, #e53e3e)', fontSize: '15px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-family)',
              }}
            >
              退出登录
            </button>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px', textAlign: 'center' }}>
              退出后可用其他账号重新登录
            </div>
          </div>
        )}

        <div style={{ height: '48px' }} />
      </div>
    </div>
  )
}
