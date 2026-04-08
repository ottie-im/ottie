import React, { useState } from 'react'

interface OttieLoginProps {
  onLogin: (username: string, password: string) => void
  onRegister?: (username: string, password: string) => void
  loading?: boolean
  error?: string
}

export function OttieLogin({ onLogin, onRegister, loading, error }: OttieLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isRegister && onRegister) {
      onRegister(username, password)
    } else {
      onLogin(username, password)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--cloud-gray)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-family)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--white)',
          borderRadius: '12px',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🦦</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>Ottie</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>你的 AI 秘书</div>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              color: 'var(--danger)',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ ...inputStyle, marginTop: '16px' }}
        />

        <button
          type="submit"
          disabled={loading || !username || !password}
          style={{
            width: '100%',
            height: '48px',
            marginTop: '16px',
            border: 'none',
            borderRadius: '8px',
            background: loading ? 'var(--border)' : 'var(--ottie-green)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 500,
            cursor: loading ? 'default' : 'pointer',
            fontFamily: 'var(--font-family)',
            transition: 'var(--transition)',
          }}
        >
          {loading ? '...' : isRegister ? '注册' : '登录'}
        </button>

        <div
          style={{
            textAlign: 'center',
            marginTop: '16px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}
        >
          {isRegister ? '已有账号？' : '没有账号？'}
          <span
            onClick={() => setIsRegister(!isRegister)}
            style={{ color: 'var(--ottie-green)', cursor: 'pointer', marginLeft: '4px' }}
          >
            {isRegister ? '登录' : '注册'}
          </span>
        </div>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0 12px',
  fontSize: '15px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--font-family)',
  boxSizing: 'border-box',
}
