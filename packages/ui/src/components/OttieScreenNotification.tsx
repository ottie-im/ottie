import React from 'react'

interface OttieScreenNotificationProps {
  type: 'gui-popup' | 'cli-prompt' | 'screen-change' | 'user-action'
  content: string
  sourceApp?: string
  actionRequired: boolean
  timestamp: string
  onDismiss: () => void
  onAction?: () => void
}

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  'gui-popup': { icon: '🪟', color: '#f59e0b', label: 'GUI 弹窗' },
  'cli-prompt': { icon: '⌨️', color: '#3b82f6', label: 'CLI 提示' },
  'screen-change': { icon: '🖥️', color: 'var(--text-tertiary)', label: '屏幕变化' },
  'user-action': { icon: '👆', color: 'var(--ottie-green)', label: '用户操作' },
}

export function OttieScreenNotification({
  type, content, sourceApp, actionRequired, timestamp, onDismiss, onAction,
}: OttieScreenNotificationProps) {
  const config = typeConfig[type] ?? typeConfig['screen-change']

  return (
    <div
      style={{
        background: 'var(--white)',
        border: `1px solid ${actionRequired ? config.color : 'var(--border)'}`,
        borderLeft: `4px solid ${config.color}`,
        borderRadius: '8px',
        padding: '12px 16px',
        maxWidth: '75%',
        alignSelf: 'flex-start',
        boxShadow: 'var(--shadow-subtle)',
        fontFamily: 'var(--font-family)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: config.color, fontWeight: 500 }}>
          {config.icon} {config.label}
          {sourceApp && <span style={{ color: 'var(--text-tertiary)' }}> · {sourceApp}</span>}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{timestamp}</span>
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: actionRequired ? '8px' : '0' }}>
        {content}
      </div>
      {actionRequired && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {onAction && (
            <button onClick={onAction} style={{
              background: config.color, color: '#fff', border: 'none',
              borderRadius: '6px', padding: '4px 12px', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-family)',
            }}>
              处理
            </button>
          )}
          <button onClick={onDismiss} style={{
            background: 'var(--cloud-gray)', color: 'var(--text-secondary)', border: 'none',
            borderRadius: '6px', padding: '4px 12px', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'var(--font-family)',
          }}>
            忽略
          </button>
        </div>
      )}
    </div>
  )
}
