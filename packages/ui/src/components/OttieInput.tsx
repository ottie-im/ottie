import React, { useState, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'

interface OttieInputProps {
  onSend: (text: string) => void
  onAttach?: (file: File) => void
  placeholder?: string
  disabled?: boolean
}

export function OttieInput({ onSend, onAttach, placeholder = '跟 Ottie 说...', disabled }: OttieInputProps) {
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onAttach) {
      onAttach(file)
    }
    if (fileRef.current) fileRef.current.value = ''
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
      {onAttach && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <Paperclip size={20} />
          </button>
          <input
            ref={fileRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
          />
        </>
      )}
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
