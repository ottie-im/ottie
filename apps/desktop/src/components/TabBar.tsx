/**
 * 工作区标签栏 — 多标签切换
 * 参考 Paseo 的 workspace-desktop-tabs-row.tsx
 */

import React from 'react'
import { useAppStore } from '../store'

const TAB_ICONS: Record<string, string> = {
  chat: '💬',
  terminal: '⬛',
  files: '📁',
  agent: '🤖',
}

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } = useAppStore()

  if (tabs.length <= 1) return null // 只有一个 tab 时不显示

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'var(--cloud-gray, #f0f2f5)',
      borderBottom: '1px solid var(--border, #e9edef)',
      height: '36px',
      paddingLeft: '8px',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 12px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '13px',
            color: tab.id === activeTabId ? 'var(--text-primary, #111b21)' : 'var(--text-tertiary, #8696a0)',
            backgroundColor: tab.id === activeTabId ? 'var(--white, #fff)' : 'transparent',
            borderBottom: tab.id === activeTabId ? '2px solid var(--ottie-green, #25D366)' : '2px solid transparent',
            fontFamily: 'var(--font-family)',
            fontWeight: tab.id === activeTabId ? 500 : 400,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: '14px' }}>{TAB_ICONS[tab.type] ?? '📄'}</span>
          <span>{tab.title}</span>
          {tabs.length > 1 && (
            <span
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
              style={{
                fontSize: '14px',
                color: 'var(--text-tertiary, #8696a0)',
                cursor: 'pointer',
                marginLeft: '4px',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--text-primary, #111b21)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--text-tertiary, #8696a0)'}
            >
              ×
            </span>
          )}
        </div>
      ))}

      {/* Add tab button */}
      <div
        onClick={() => addTab({ type: 'terminal', title: '终端' })}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          cursor: 'pointer',
          fontSize: '16px',
          color: 'var(--text-tertiary, #8696a0)',
          marginLeft: '4px',
          borderRadius: '4px',
        }}
        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.05)'}
        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
      >
        +
      </div>
    </div>
  )
}
