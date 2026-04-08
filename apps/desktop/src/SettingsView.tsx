import React, { useEffect, useState } from 'react'
import { useAppStore } from './store'
import { OttieAvatar, OttieAgentSelector, OttieDevicePanel } from '@ottie-im/ui'
import type { AgentInfo, DeviceInfo } from '@ottie-im/ui'
import { getProfile, setDisplayName, setAvatar, unblockUser, getMatrix, getAgent } from './services'

export function SettingsView() {
  const { userId, setCurrentView, blockedUsers, setBlockedUsers } = useAppStore()
  const [displayName, setName] = useState(userId ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>()
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    getProfile().then(p => { setName(p.displayName); setAvatarUrl(p.avatarUrl) }).catch(() => {})
    try { setBlockedUsers(getMatrix().getBlockedUsers()) } catch {}
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

  // Agent info
  let agents: AgentInfo[] = []
  try {
    const a = getAgent()
    const card = a.getAgentCard()
    agents = [{ id: a.id, name: card.name, status: a.getStatus(), capabilities: card.capabilities, persona: card.persona, isDefault: true }]
  } catch {}

  // Devices (Phase 4 will populate from real device Agent)
  const devices: DeviceInfo[] = [{ id: 'local', name: '当前设备', type: 'desktop', status: 'online', capabilities: ['消息', '改写', '审批'] }]

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

        {/* Agent */}
        {card(<OttieAgentSelector agents={agents} onSetDefault={() => {}} />)}

        {/* Devices */}
        {card(<OttieDevicePanel devices={devices} />)}

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

        <div style={{ height: '48px' }} />
      </div>
    </div>
  )
}
