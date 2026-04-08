import React from 'react'

interface OttieConnectionBarProps {
  status: 'connected' | 'reconnecting' | 'disconnected'
}

export function OttieConnectionBar({ status }: OttieConnectionBarProps) {
  if (status === 'connected') return null

  const isReconnecting = status === 'reconnecting'

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: isReconnecting ? 'var(--warning)' : 'var(--danger)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 500,
        textAlign: 'center',
        padding: '4px 0',
        fontFamily: 'var(--font-family)',
      }}
    >
      {isReconnecting ? '⏳ 正在重新连接...' : '❌ 连接已断开'}
    </div>
  )
}
