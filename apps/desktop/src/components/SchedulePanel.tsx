/**
 * Agent 调度面板 — 定时任务管理
 * 参考 Paseo 的 schedule CLI 命令
 */

import React, { useState, useEffect } from 'react'

interface Schedule {
  id: string
  cron: string
  provider: string
  prompt: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
}

export function SchedulePanel() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [cron, setCron] = useState('0 9 * * *')
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState('claude')

  const refresh = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const list = await invoke('list_schedules') as Schedule[]
      setSchedules(list)
    } catch {
      // Tauri command not yet implemented
    }
  }

  useEffect(() => { refresh() }, [])

  const handleCreate = async () => {
    if (!prompt.trim()) return
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('create_schedule', { cron, provider, prompt, cwd: '~' })
      setShowCreate(false)
      setPrompt('')
      refresh()
    } catch {}
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('toggle_schedule', { id, enabled })
      refresh()
    } catch {}
  }

  const handleDelete = async (id: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('delete_schedule', { id })
      refresh()
    } catch {}
  }

  // Cron 可读化
  const cronToHuman = (c: string): string => {
    const parts = c.split(' ')
    if (parts.length !== 5) return c
    const [min, hour, , , dow] = parts
    if (dow === '1-5') return `工作日 ${hour}:${min.padStart(2, '0')}`
    if (dow === '*' && hour !== '*') return `每天 ${hour}:${min.padStart(2, '0')}`
    if (hour === '*') return `每小时`
    return c
  }

  return (
    <div style={{ padding: '16px', fontFamily: 'var(--font-family)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>定时任务</div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            padding: '6px 14px', borderRadius: '8px', border: 'none',
            backgroundColor: 'var(--ottie-green, #25D366)', color: '#fff',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            fontFamily: 'var(--font-family)',
          }}
        >
          + 新建
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{
          padding: '12px', backgroundColor: 'var(--cloud-gray, #f0f2f5)',
          borderRadius: '8px', marginBottom: '12px',
        }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Cron 表达式</div>
            <input
              value={cron} onChange={e => setCron(e.target.value)}
              placeholder="0 9 * * *"
              style={{
                width: '100%', padding: '6px 8px', borderRadius: '6px',
                border: '1px solid var(--border)', fontSize: '13px',
                fontFamily: 'monospace', boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {cronToHuman(cron)}
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Agent 指令</div>
            <textarea
              value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="每天检查邮件并总结..."
              rows={3}
              style={{
                width: '100%', padding: '6px 8px', borderRadius: '6px',
                border: '1px solid var(--border)', fontSize: '13px',
                fontFamily: 'var(--font-family)', boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={provider} onChange={e => setProvider(e.target.value)}
              style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px' }}
            >
              <option value="claude">Claude</option>
              <option value="codex">Codex</option>
            </select>
            <button onClick={handleCreate} style={{
              flex: 1, padding: '6px', borderRadius: '6px', border: 'none',
              backgroundColor: 'var(--ottie-green)', color: '#fff',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}>创建</button>
          </div>
        </div>
      )}

      {/* Schedule list */}
      {schedules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>
          没有定时任务
        </div>
      ) : (
        schedules.map(s => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px', borderRadius: '8px',
            backgroundColor: 'var(--white, #fff)', marginBottom: '6px',
            border: '1px solid var(--border, #e9edef)',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '4px',
              backgroundColor: s.enabled ? '#22c55e' : '#8696a0',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{s.prompt.slice(0, 50)}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                {cronToHuman(s.cron)} · {s.provider}
              </div>
            </div>
            <button
              onClick={() => handleToggle(s.id, !s.enabled)}
              style={{
                padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)',
                backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              {s.enabled ? '暂停' : '启用'}
            </button>
            <button
              onClick={() => handleDelete(s.id)}
              style={{
                padding: '4px 10px', borderRadius: '6px', border: 'none',
                backgroundColor: '#fef2f2', fontSize: '12px', cursor: 'pointer',
                color: '#ef4444',
              }}
            >
              删除
            </button>
          </div>
        ))
      )}
    </div>
  )
}
