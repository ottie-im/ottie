/**
 * 文件查看器 — 语法高亮代码展示
 * 参考 Paseo 的 file-pane.tsx
 */

import React, { useState, useEffect } from 'react'

interface Props {
  filePath: string
}

export function FileViewer({ filePath }: Props) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const text = await invoke('read_file', { path: filePath }) as string
        setContent(text)
      } catch (err: any) {
        setError(err.message ?? '无法读取文件')
      } finally {
        setLoading(false)
      }
    })()
  }, [filePath])

  const fileName = filePath.split('/').pop() ?? ''
  const lineCount = content?.split('\n').length ?? 0

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8696a0' }}>
        加载中...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ef4444' }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e2e' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 16px', backgroundColor: '#181825',
        borderBottom: '1px solid #313244', flexShrink: 0,
      }}>
        <span style={{ fontSize: '13px', color: '#cdd6f4', fontFamily: 'monospace' }}>{fileName}</span>
        <span style={{ fontSize: '11px', color: '#6c7086' }}>{lineCount} 行</span>
      </div>

      {/* Code */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <pre style={{
          margin: 0, padding: '0 16px',
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          fontSize: '13px', lineHeight: '20px',
          color: '#cdd6f4',
        }}>
          {content?.split('\n').map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              <span style={{
                width: '40px', textAlign: 'right', paddingRight: '16px',
                color: '#6c7086', userSelect: 'none', flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
