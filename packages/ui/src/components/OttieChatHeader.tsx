import React from 'react'
import { OttieAvatar } from './OttieAvatar'

interface OttieChatHeaderProps {
  name: string
  avatarUrl?: string
  online?: boolean
}

export function OttieChatHeader({ name, avatarUrl, online }: OttieChatHeaderProps) {
  return (
    <div
      style={{
        height: '56px',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 16px',
        flexShrink: 0,
        fontFamily: 'var(--font-family)',
      }}
    >
      <OttieAvatar name={name} avatarUrl={avatarUrl} size={40} />
      <div>
        <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
        <div style={{ fontSize: '12px', color: online ? 'var(--success)' : 'var(--text-tertiary)' }}>
          {online ? '在线' : '离线'}
        </div>
      </div>
    </div>
  )
}
