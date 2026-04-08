import React, { useState } from 'react'
import { OttieAvatar } from './OttieAvatar'
import type { BlockedUser } from '@ottie-im/contracts'

interface OttieSettingsPageProps {
  displayName: string
  avatarUrl?: string
  userId: string
  blockedUsers: BlockedUser[]
  onUpdateName: (name: string) => void
  onUpdateAvatar: (file: File) => void
  onUnblock: (userId: string) => void
  onBack: () => void
}

export function OttieSettingsPage({
  displayName, avatarUrl, userId, blockedUsers,
  onUpdateName, onUpdateAvatar, onUnblock, onBack,
}: OttieSettingsPageProps) {
  const [name, setName] = useState(displayName)
  const [editing, setEditing] = useState(false)

  const handleSaveName = () => {
    if (name.trim() && name !== displayName) {
      onUpdateName(name.trim())
    }
    setEditing(false)
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '24px 24px',
      background: 'var(--cloud-gray)', fontFamily: 'var(--font-family)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
    <div style={{ width: '100%', maxWidth: '600px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '20px', color: 'var(--text-primary)',
        }}>
          ←
        </button>
        <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>设置</span>
      </div>

      {/* Profile Card */}
      <div style={{
        background: 'var(--white)', borderRadius: '12px', padding: '24px',
        boxShadow: 'var(--shadow-subtle)', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <OttieAvatar name={displayName} avatarUrl={avatarUrl} size={64} />
            <label style={{
              position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px',
              borderRadius: '50%', background: 'var(--ottie-green)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', cursor: 'pointer', border: '2px solid var(--white)',
            }}>
              📷
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && onUpdateAvatar(e.target.files[0])} />
            </label>
          </div>
          <div>
            {editing ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={name} onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  style={{
                    padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px',
                    fontSize: '16px', fontFamily: 'var(--font-family)',
                  }} />
                <button onClick={handleSaveName} style={{
                  background: 'var(--ottie-green)', color: '#fff', border: 'none',
                  borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontSize: '14px',
                }}>保存</button>
              </div>
            ) : (
              <div onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {displayName} ✏️
                </div>
              </div>
            )}
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{userId}</div>
          </div>
        </div>
      </div>

      {/* Blocked Users */}
      <div style={{
        background: 'var(--white)', borderRadius: '12px', padding: '24px',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          黑名单 ({blockedUsers.length})
        </div>
        {blockedUsers.length === 0 ? (
          <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>没有被拉黑的用户</div>
        ) : (
          blockedUsers.map(u => (
            <div key={u.userId} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{u.userId}</div>
                {u.reason && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{u.reason}</div>}
              </div>
              <button onClick={() => onUnblock(u.userId)} style={{
                background: 'var(--cloud-gray)', color: 'var(--text-secondary)', border: 'none',
                borderRadius: '8px', padding: '4px 12px', fontSize: '13px', cursor: 'pointer',
                fontFamily: 'var(--font-family)',
              }}>
                解除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  )
}
