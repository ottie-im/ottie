import React from 'react'
import { Check, CheckCheck } from 'lucide-react'

type BubbleType = 'outgoing' | 'incoming' | 'intent'

interface OttieBubbleProps {
  type: BubbleType
  body: string
  time?: string
  senderName?: string
  intentPrefix?: string
  status?: 'sent' | 'read'
  mediaType?: 'image' | 'file'
  mediaUrl?: string
  fileName?: string
  onExpand?: () => void
  onImageClick?: () => void
  onFileDownload?: () => void
}

const baseStyle: React.CSSProperties = {
  fontSize: '14.2px',
  lineHeight: '1.45',
  fontFamily: 'var(--font-family)',
  position: 'relative',
}

const styles: Record<BubbleType, React.CSSProperties> = {
  outgoing: {
    ...baseStyle,
    background: 'var(--green-wash)',
    color: 'var(--text-primary)',
    borderRadius: '8px 8px 0 8px',
    padding: '8px 12px',
    maxWidth: '65%',
    alignSelf: 'flex-end',
  },
  incoming: {
    ...baseStyle,
    background: 'var(--white)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: '8px 8px 8px 0',
    padding: '8px 12px',
    maxWidth: '65%',
    alignSelf: 'flex-start',
  },
  intent: {
    ...baseStyle,
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
  },
}

export function OttieBubble({
  type, body, time, senderName, intentPrefix, status,
  mediaType, mediaUrl, fileName,
  onExpand, onImageClick, onFileDownload,
}: OttieBubbleProps) {
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

      {/* Image */}
      {mediaType === 'image' && mediaUrl && (
        <img
          src={mediaUrl}
          alt={fileName ?? 'image'}
          onClick={onImageClick}
          style={{
            maxWidth: '100%',
            maxHeight: '300px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: body ? '4px' : '0',
            display: 'block',
          }}
        />
      )}

      {/* File */}
      {mediaType === 'file' && (
        <div
          onClick={onFileDownload}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            background: 'rgba(0,0,0,0.04)',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: body ? '4px' : '0',
          }}
        >
          <span style={{ fontSize: '24px' }}>📄</span>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, fontStyle: 'normal' }}>
            {fileName ?? 'file'}
          </span>
        </div>
      )}

      {/* Text body */}
      {body && !mediaType && <div>{body}</div>}

      {/* Footer: time + read status */}
      {time && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '4px',
          marginTop: '2px',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{time}</span>
          {type === 'outgoing' && status && (
            status === 'read'
              ? <CheckCheck size={14} color="var(--read-check)" />
              : <Check size={14} color="var(--text-secondary)" />
          )}
        </div>
      )}
    </div>
  )
}
