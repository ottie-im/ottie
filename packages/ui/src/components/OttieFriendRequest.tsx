import React from 'react'
import { OttieAvatar } from './OttieAvatar'

interface OttieFriendRequestProps {
  name: string
  userId: string
  avatarUrl?: string
  message?: string
  onAccept: () => void
  onReject: () => void
}

export function OttieFriendRequest({ name, userId, avatarUrl, message, onAccept, onReject }: OttieFriendRequestProps) {
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: 'var(--shadow-subtle)',
        fontFamily: 'var(--font-family)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <OttieAvatar name={name} avatarUrl={avatarUrl} size={48} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{userId}</div>
        {message && (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{message}</div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onAccept} style={{
            background: 'var(--ottie-green)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '6px 16px', fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font-family)',
          }}>
            接受
          </button>
          <button onClick={onReject} style={{
            background: 'var(--cloud-gray)', color: 'var(--text-secondary)', border: 'none',
            borderRadius: '8px', padding: '6px 16px', fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font-family)',
          }}>
            拒绝
          </button>
        </div>
      </div>
    </div>
  )
}
