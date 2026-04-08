import React from 'react'

interface OttieApprovalProps {
  draft: string
  originalIntent: string
  onApprove: () => void
  onEdit: () => void
  onReject: () => void
}

export function OttieApproval({ draft, originalIntent, onApprove, onEdit, onReject }: OttieApprovalProps) {
  return (
    <div
      style={{
        background: 'var(--cream)',
        border: '1px solid var(--border-approval)',
        borderRadius: '12px',
        padding: '12px 16px',
        maxWidth: '65%',
        alignSelf: 'flex-end',
        boxShadow: 'var(--shadow-subtle)',
        fontFamily: 'var(--font-family)',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
        Ottie 拟好了消息：
      </div>
      <div style={{ fontSize: '14.2px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '4px' }}>
        {draft}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '12px' }}>
        原始指令：{originalIntent}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onApprove} style={btnGreen}>✅ 批准</button>
        <button onClick={onEdit} style={btnGray}>✏️ 编辑</button>
        <button onClick={onReject} style={btnDanger}>❌ 拒绝</button>
      </div>
    </div>
  )
}

const btnBase: React.CSSProperties = {
  border: 'none',
  borderRadius: '8px',
  padding: '6px 12px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'var(--font-family)',
  transition: 'var(--transition)',
}

const btnGreen: React.CSSProperties = {
  ...btnBase,
  background: 'var(--ottie-green)',
  color: '#fff',
}

const btnGray: React.CSSProperties = {
  ...btnBase,
  background: 'var(--cloud-gray)',
  color: 'var(--text-primary)',
}

const btnDanger: React.CSSProperties = {
  ...btnBase,
  background: 'var(--white)',
  color: 'var(--danger)',
  border: '1px solid var(--danger)',
}
