import React, { useState } from 'react'
import { Send } from 'lucide-react'

interface OttieInputProps {
  onSend: (text: string) => void
  placeholder?: string
  disabled?: boolean
}

export function OttieInput({ onSend, placeholder = '跟 Ottie 说...', disabled }: OttieInputProps) {
  const [text, setText] = useState('')

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasText = text.trim().length > 0

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'var(--cloud-gray)',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-family)',
      }}
    >
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '10px 12px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          lineHeight: '1.40',
          background: 'var(--white)',
          color: 'var(--text-primary)',
          outline: 'none',
          fontFamily: 'var(--font-family)',
        }}
      />
      <button
        onClick={handleSend}
        disabled={!hasText || disabled}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: hasText ? 'var(--ottie-green)' : 'var(--border)',
          color: hasText ? '#fff' : 'var(--text-tertiary)',
          cursor: hasText ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition)',
          flexShrink: 0,
        }}
      >
        <Send size={18} />
      </button>
    </div>
  )
}
