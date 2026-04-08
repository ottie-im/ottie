import React from 'react'

interface OttieAvatarProps {
  name: string
  avatarUrl?: string
  size?: number
  online?: boolean
}

export function OttieAvatar({ name, avatarUrl, size = 48, online }: OttieAvatarProps) {
  const initial = name.charAt(0).toUpperCase()

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--ottie-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: size * 0.4,
            fontWeight: 500,
            fontFamily: 'var(--font-family)',
          }}
        >
          {initial}
        </div>
      )}
      {online !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: '50%',
            background: online ? 'var(--success)' : 'var(--text-tertiary)',
            border: '2px solid var(--white)',
          }}
        />
      )}
    </div>
  )
}
