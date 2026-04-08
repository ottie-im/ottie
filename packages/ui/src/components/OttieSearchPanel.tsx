import React from 'react'
import { Search } from 'lucide-react'

interface SearchResult {
  id: string
  roomId: string
  roomName?: string
  body: string
  time: string
  senderId: string
}

interface OttieSearchPanelProps {
  query: string
  results: SearchResult[]
  onQueryChange: (query: string) => void
  onSearch: () => void
  onResultClick: (roomId: string, messageId: string) => void
}

export function OttieSearchPanel({ query, results, onQueryChange, onSearch, onResultClick }: OttieSearchPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-family)' }}>
      {/* Search input */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="搜索消息..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            style={{
              flex: 1, padding: '8px 12px', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: '14px', outline: 'none',
              fontFamily: 'var(--font-family)',
            }}
          />
          <button onClick={onSearch} style={{
            background: 'var(--ottie-green)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}>
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {results.length === 0 && query && (
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '40px', fontSize: '14px' }}>
            没有找到相关消息
          </div>
        )}
        {results.map(r => (
          <div
            key={r.id}
            onClick={() => onResultClick(r.roomId, r.id)}
            style={{
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              cursor: 'pointer', transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--snow-white)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {r.roomName ?? r.senderId}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{r.time}</span>
            </div>
            <div style={{
              fontSize: '13px', color: 'var(--text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {r.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
