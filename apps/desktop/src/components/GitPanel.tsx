/**
 * Git 面板 — 分支/状态/提交
 * 参考 Paseo 的 git-actions-split-button.tsx 和 branch-switcher.tsx
 */

import React, { useState, useEffect } from 'react'

interface GitStatus {
  branch: string
  changed: { path: string; status: string }[]
  ahead: number
  behind: number
}

interface Props {
  cwd: string
}

export function GitPanel({ cwd }: Props) {
  const [status, setStatus] = useState<GitStatus | null>(null)
  const [branches, setBranches] = useState<string[]>([])
  const [commitMsg, setCommitMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [diffText, setDiffText] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const s = await invoke('git_status', { cwd }) as GitStatus
      setStatus(s)
      const b = await invoke('git_branches', { cwd }) as string[]
      setBranches(b)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [cwd])

  const handleSwitchBranch = async (branch: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('git_switch_branch', { cwd, branch })
      refresh()
    } catch {}
  }

  const handleCommit = async () => {
    if (!commitMsg.trim()) return
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('git_commit', { cwd, message: commitMsg })
      setCommitMsg('')
      refresh()
    } catch {}
  }

  const handleShowDiff = async (file?: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const diff = await invoke('git_diff', { cwd, file }) as string
      setDiffText(diff)
    } catch {}
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#8696a0', textAlign: 'center' }}>加载中...</div>
  }

  if (!status) {
    return <div style={{ padding: '20px', color: '#8696a0', textAlign: 'center' }}>不是 Git 仓库</div>
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', backgroundColor: 'var(--white, #fff)', fontFamily: 'var(--font-family)' }}>
      {/* Branch */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border, #e9edef)' }}>
        <div style={{ fontSize: '12px', color: '#8696a0', marginBottom: '4px' }}>分支</div>
        <select
          value={status.branch}
          onChange={e => handleSwitchBranch(e.target.value)}
          style={{
            width: '100%', padding: '6px 8px', borderRadius: '6px',
            border: '1px solid var(--border, #e9edef)', fontSize: '13px',
            fontFamily: 'monospace', backgroundColor: 'var(--white, #fff)',
          }}
        >
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Changed files */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border, #e9edef)' }}>
        <div style={{ fontSize: '12px', color: '#8696a0', marginBottom: '8px' }}>
          更改 ({status.changed.length})
        </div>
        {status.changed.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#8696a0' }}>无更改</div>
        ) : (
          status.changed.map((f, i) => (
            <div
              key={i}
              onClick={() => handleShowDiff(f.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 0', cursor: 'pointer', fontSize: '13px',
              }}
            >
              <span style={{
                fontSize: '11px', fontWeight: 600, width: '16px', textAlign: 'center',
                color: f.status === 'M' ? '#f59e0b' : f.status === 'A' ? '#22c55e' : '#ef4444',
              }}>
                {f.status}
              </span>
              <span style={{ color: 'var(--text-primary, #111b21)', fontFamily: 'monospace', fontSize: '12px' }}>
                {f.path}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Diff viewer */}
      {diffText && (
        <div style={{ padding: '8px', borderBottom: '1px solid var(--border, #e9edef)' }}>
          <pre style={{
            margin: 0, padding: '8px', backgroundColor: '#1e1e2e', borderRadius: '8px',
            fontSize: '11px', fontFamily: 'monospace', color: '#cdd6f4',
            maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap',
          }}>
            {diffText.split('\n').map((line, i) => (
              <div key={i} style={{
                color: line.startsWith('+') ? '#a6e3a1' : line.startsWith('-') ? '#f38ba8' : line.startsWith('@') ? '#89b4fa' : '#cdd6f4',
              }}>
                {line}
              </div>
            ))}
          </pre>
        </div>
      )}

      {/* Commit */}
      {status.changed.length > 0 && (
        <div style={{ padding: '12px 16px' }}>
          <input
            value={commitMsg}
            onChange={e => setCommitMsg(e.target.value)}
            placeholder="提交消息..."
            style={{
              width: '100%', padding: '8px', borderRadius: '6px',
              border: '1px solid var(--border, #e9edef)', fontSize: '13px',
              fontFamily: 'var(--font-family)', marginBottom: '8px',
              boxSizing: 'border-box',
            }}
            onKeyDown={e => e.key === 'Enter' && handleCommit()}
          />
          <button
            onClick={handleCommit}
            disabled={!commitMsg.trim()}
            style={{
              width: '100%', padding: '8px', borderRadius: '6px',
              backgroundColor: commitMsg.trim() ? 'var(--ottie-green, #25D366)' : '#e9edef',
              color: commitMsg.trim() ? '#fff' : '#8696a0',
              border: 'none', fontSize: '13px', fontWeight: 500,
              cursor: commitMsg.trim() ? 'pointer' : 'default',
              fontFamily: 'var(--font-family)',
            }}
          >
            提交
          </button>
        </div>
      )}
    </div>
  )
}
