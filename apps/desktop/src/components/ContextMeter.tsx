/**
 * 上下文窗口计量器 — 显示 token 使用量
 * 参考 Paseo 的 context-window-meter.tsx
 */

import React from 'react'

interface Props {
  used: number
  total: number
  costUsd?: number
}

export function ContextMeter({ used, total, costUsd }: Props) {
  const pct = Math.min((used / total) * 100, 100)
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#25D366'

  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
    return String(n)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '4px 12px', fontSize: '11px',
      color: 'var(--text-tertiary, #8696a0)',
      fontFamily: 'var(--font-family)',
    }}>
      {/* Progress bar */}
      <div style={{
        width: '60px', height: '4px', borderRadius: '2px',
        backgroundColor: 'var(--border, #e9edef)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          backgroundColor: color, borderRadius: '2px',
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Label */}
      <span>{formatTokens(used)} / {formatTokens(total)}</span>

      {/* Cost */}
      {costUsd !== undefined && costUsd > 0 && (
        <span style={{ color: '#f59e0b' }}>
          ${costUsd.toFixed(4)}
        </span>
      )}
    </div>
  )
}
