import React from 'react'
import type { SuggestedAction } from '@ottie-im/contracts'

interface OttieDecisionCardProps {
  senderName: string
  originalMessage: string
  intentSummary: string
  intentType: string
  actions: SuggestedAction[]
  onAction: (action: SuggestedAction) => void
  onCustomReply: () => void
}

const intentEmoji: Record<string, string> = {
  invitation: '📩',
  question: '❓',
  request: '🙏',
  info: 'ℹ️',
  greeting: '👋',
  general: '💬',
}

export function OttieDecisionCard({
  senderName, originalMessage, intentSummary, intentType,
  actions, onAction, onCustomReply,
}: OttieDecisionCardProps) {
  return (
    <div
      style={{
        background: '#f0f7ff',
        border: '1px solid #c8ddf5',
        borderRadius: '12px',
        padding: '12px 16px',
        maxWidth: '75%',
        alignSelf: 'flex-start',
        boxShadow: 'var(--shadow-subtle)',
        fontFamily: 'var(--font-family)',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
        {intentEmoji[intentType] ?? '💬'} Ottie 分析了 {senderName} 的消息：
      </div>
      <div style={{ fontSize: '14.2px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '4px' }}>
        {intentSummary}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '12px' }}>
        原文：{originalMessage}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => onAction(action)}
            style={{
              background: i === 0 ? 'var(--ottie-green)' : 'var(--cloud-gray)',
              color: i === 0 ? '#fff' : 'var(--text-primary)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-family)',
              transition: 'var(--transition)',
            }}
          >
            {action.label}
          </button>
        ))}
        <button
          onClick={onCustomReply}
          style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
          }}
        >
          ✏️ 自己说
        </button>
      </div>
    </div>
  )
}
