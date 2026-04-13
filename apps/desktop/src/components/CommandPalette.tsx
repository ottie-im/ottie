/**
 * 命令面板 — Cmd+K 快速操作
 * 参考 Paseo 的 command-center.tsx
 */

import React, { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store'

interface Command {
  id: string
  label: string
  icon: string
  shortcut?: string
  handler: () => void
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, addTab, setCurrentView } = useAppStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = [
    { id: 'new-terminal', label: '新建终端', icon: '⬛', shortcut: '⌘T', handler: () => { addTab({ type: 'terminal', title: '终端' }); close() } },
    { id: 'new-agent', label: '新建 Agent 任务', icon: '🤖', handler: () => { addTab({ type: 'agent', title: 'Agent' }); close() } },
    { id: 'settings', label: '打开设置', icon: '⚙️', shortcut: '⌘,', handler: () => { setCurrentView('settings'); close() } },
    { id: 'chat', label: '返回聊天', icon: '💬', handler: () => { setCurrentView('chat'); close() } },
    { id: 'search', label: '搜索消息', icon: '🔍', shortcut: '⌘F', handler: () => { close() } },
    { id: 'files', label: '打开文件浏览器', icon: '📁', handler: () => { addTab({ type: 'files', title: '文件' }); close() } },
    { id: 'git', label: '打开 Git 面板', icon: '🔀', handler: () => { addTab({ type: 'agent', title: 'Git' }); close() } },
    { id: 'theme-light', label: '浅色主题', icon: '☀️', handler: () => { document.documentElement.setAttribute('data-theme', 'light'); close() } },
    { id: 'theme-dark', label: '深色主题', icon: '🌙', handler: () => { document.documentElement.setAttribute('data-theme', 'dark'); close() } },
  ]

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  const [selectedIndex, setSelectedIndex] = useState(0)

  const close = () => {
    setCommandPaletteOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); return }
    if (e.key === 'Enter' && filtered[selectedIndex]) { filtered[selectedIndex].handler(); return }
  }

  if (!commandPaletteOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', justifyContent: 'center', paddingTop: '20vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '480px', maxHeight: '400px',
          backgroundColor: 'var(--white, #fff)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          fontFamily: 'var(--font-family)',
        }}
      >
        {/* Search input */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border, #e9edef)' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入命令..."
            style={{
              width: '100%', border: 'none', outline: 'none',
              fontSize: '15px', color: 'var(--text-primary, #111b21)',
              fontFamily: 'var(--font-family)',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        {/* Command list */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '4px 0' }}>
          {filtered.map((cmd, i) => (
            <div
              key={cmd.id}
              onClick={cmd.handler}
              onMouseEnter={() => setSelectedIndex(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px',
                cursor: 'pointer',
                backgroundColor: i === selectedIndex ? 'var(--cloud-gray, #f0f2f5)' : 'transparent',
                transition: 'background 0.1s',
              }}
            >
              <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{cmd.icon}</span>
              <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-primary, #111b21)' }}>{cmd.label}</span>
              {cmd.shortcut && (
                <span style={{
                  fontSize: '11px', color: 'var(--text-tertiary, #8696a0)',
                  backgroundColor: 'var(--cloud-gray, #f0f2f5)',
                  padding: '2px 6px', borderRadius: '4px',
                  fontFamily: 'monospace',
                }}>
                  {cmd.shortcut}
                </span>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary, #8696a0)', fontSize: '14px' }}>
              没有匹配的命令
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
