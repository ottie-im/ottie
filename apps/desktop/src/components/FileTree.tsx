/**
 * 文件树 — 递归目录浏览
 * 参考 Paseo 的 explorer-sidebar.tsx
 */

import React, { useState, useEffect } from 'react'

interface FileEntry {
  name: string
  path: string
  isDir: boolean
}

interface Props {
  rootPath: string
  onOpenFile: (path: string) => void
}

const FILE_ICONS: Record<string, string> = {
  ts: '📘', tsx: '📘', js: '📒', jsx: '📒', json: '📋',
  md: '📝', rs: '🦀', py: '🐍', html: '🌐', css: '🎨',
  toml: '⚙️', yaml: '⚙️', yml: '⚙️', sh: '⬛', lock: '🔒',
}

function getIcon(name: string, isDir: boolean): string {
  if (isDir) return '📁'
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return FILE_ICONS[ext] ?? '📄'
}

function DirNode({ path, name, depth, onOpenFile }: {
  path: string; name: string; depth: number; onOpenFile: (p: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [children, setChildren] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (expanded) { setExpanded(false); return }
    setLoading(true)
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const entries = await invoke('read_directory', { path }) as FileEntry[]
      setChildren(entries.sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
        return a.name.localeCompare(b.name)
      }))
    } catch {
      setChildren([])
    }
    setLoading(false)
    setExpanded(true)
  }

  return (
    <div>
      <div
        onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', paddingLeft: `${12 + depth * 16}px`,
          cursor: 'pointer', fontSize: '13px',
          color: 'var(--text-primary, #111b21)',
          fontFamily: 'var(--font-family)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--cloud-gray, #f0f2f5)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span style={{ fontSize: '10px', width: '12px', color: '#8696a0' }}>
          {loading ? '⏳' : expanded ? '▼' : '▶'}
        </span>
        <span>📁</span>
        <span>{name}</span>
      </div>
      {expanded && children.map(child => (
        child.isDir ? (
          <DirNode key={child.path} path={child.path} name={child.name} depth={depth + 1} onOpenFile={onOpenFile} />
        ) : (
          <div
            key={child.path}
            onClick={() => onOpenFile(child.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', paddingLeft: `${28 + depth * 16}px`,
              cursor: 'pointer', fontSize: '13px',
              color: 'var(--text-primary, #111b21)',
              fontFamily: 'var(--font-family)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--cloud-gray, #f0f2f5)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span>{getIcon(child.name, false)}</span>
            <span>{child.name}</span>
          </div>
        )
      ))}
    </div>
  )
}

export function FileTree({ rootPath, onOpenFile }: Props) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', backgroundColor: 'var(--white, #fff)' }}>
      <div style={{
        padding: '8px 12px', fontSize: '12px', fontWeight: 600,
        color: 'var(--text-tertiary, #8696a0)', textTransform: 'uppercase',
        fontFamily: 'var(--font-family)',
      }}>
        文件
      </div>
      <DirNode path={rootPath} name={rootPath.split('/').pop() ?? '/'} depth={0} onOpenFile={onOpenFile} />
    </div>
  )
}
