import React from 'react'

type BubbleType = 'outgoing' | 'incoming' | 'intent'

interface OttieBubbleProps {
  type: BubbleType
  body: string
  time?: string
  senderName?: string
  intentPrefix?: string
  onExpand?: () => void
}

const styles: Record<BubbleType, React.CSSProperties> = {
  outgoing: {
    background: 'var(--green-wash)',
    color: 'var(--text-primary)',
    borderRadius: '8px 8px 0 8px',
    padding: '8px 12px',
    maxWidth: '65%',
    alignSelf: 'flex-end',
    fontSize: '14.2px',
    lineHeight: '1.45',
    fontFamily: 'var(--font-family)',
  },
  incoming: {
    background: 'var(--white)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: '8px 8px 8px 0',
    padding: '8px 12px',
    maxWidth: '65%',
    alignSelf: 'flex-start',
    fontSize: '14.2px',
    lineHeight: '1.45',
    fontFamily: 'var(--font-family)',
  },
  intent: {
    background: 'var(--snow-white)',
    color: 'var(--text-secondary)',
    borderRadius: '8px',
    padding: '6px 10px',
    maxWidth: '65%',
    alignSelf: 'flex-end',
    fontSize: '13px',
    fontStyle: 'italic',
    lineHeight: '1.35',
    opacity: 0.8,
    cursor: 'pointer',
    fontFamily: 'var(--font-family)',
  },
}

export function OttieBubble({ type, body, time, senderName, intentPrefix, onExpand }: OttieBubbleProps) {
  return (
    <div style={styles[type]} onClick={type === 'intent' ? onExpand : undefined}>
      {type === 'intent' && (
        <span style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontStyle: 'normal' }}>
          {intentPrefix ?? '🦦 你说：'}
        </span>
      )}
      {senderName && type === 'incoming' && (
        <div style={{ color: 'var(--ottie-teal)', fontSize: '12.5px', fontWeight: 500, marginBottom: '2px' }}>
          {senderName}
        </div>
      )}
      <div>{body}</div>
      {time && (
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right', marginTop: '2px' }}>
          {time}
        </div>
      )}
    </div>
  )
}
