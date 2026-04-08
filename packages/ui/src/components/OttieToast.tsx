import React, { useEffect } from 'react'

interface OttieToastProps {
  message: string
  type?: 'error' | 'info' | 'success'
  onDismiss: () => void
  duration?: number
}

const bgColors = {
  error: '#fef2f2',
  info: '#eff6ff',
  success: '#f0fdf4',
}

const borderColors = {
  error: '#fecaca',
  info: '#bfdbfe',
  success: '#bbf7d0',
}

const textColors = {
  error: 'var(--danger)',
  info: 'var(--info)',
  success: 'var(--success)',
}

export function OttieToast({ message, type = 'error', onDismiss, duration = 5000 }: OttieToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [onDismiss, duration])

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999,
        background: bgColors[type],
        border: `1px solid ${borderColors[type]}`,
        borderRadius: '8px',
        padding: '12px 16px',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-card)',
        fontFamily: 'var(--font-family)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'ottie-toast-in 200ms ease-out',
      }}
    >
      <span style={{ fontSize: '14px', color: textColors[type], flex: 1 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-tertiary)', fontSize: '16px', padding: '0 4px',
        }}
      >
        ✕
      </button>
    </div>
  )
}
