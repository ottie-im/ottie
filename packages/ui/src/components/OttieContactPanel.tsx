import React, { useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { OttieAvatar } from './OttieAvatar'
import { OttieFriendRequest } from './OttieFriendRequest'
import type { Friend, FriendRequest } from '@ottie-im/contracts'

type Tab = 'friends' | 'requests' | 'search'

interface OttieContactPanelProps {
  friends: Friend[]
  friendRequests: FriendRequest[]
  onStartChat: (roomId: string) => void
  onAcceptRequest: (roomId: string) => void
  onRejectRequest: (roomId: string) => void
  onSearch: (query: string) => void
  searchResults?: { matrixId: string; displayName: string; avatarUrl?: string }[]
  onAddFriend: (userId: string) => void
}

export function OttieContactPanel({
  friends, friendRequests, onStartChat,
  onAcceptRequest, onRejectRequest,
  onSearch, searchResults, onAddFriend,
}: OttieContactPanelProps) {
  const [tab, setTab] = useState<Tab>('friends')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) onSearch(searchQuery.trim())
  }

  // Group friends
  const grouped = new Map<string, Friend[]>()
  for (const f of friends) {
    const g = f.group ?? '未分组'
    if (!grouped.has(g)) grouped.set(g, [])
    grouped.get(g)!.push(f)
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px', textAlign: 'center', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'var(--font-family)',
    color: active ? 'var(--ottie-green)' : 'var(--text-secondary)',
    borderBottom: active ? '2px solid var(--ottie-green)' : '2px solid transparent',
    background: 'none', border: 'none', borderBottomStyle: 'solid',
    transition: 'var(--transition)',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-family)' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        <button style={tabStyle(tab === 'friends')} onClick={() => setTab('friends')}>
          好友 ({friends.length})
        </button>
        <button style={tabStyle(tab === 'requests')} onClick={() => setTab('requests')}>
          请求 {friendRequests.length > 0 ? `(${friendRequests.length})` : ''}
        </button>
        <button style={tabStyle(tab === 'search')} onClick={() => setTab('search')}>
          <UserPlus size={16} style={{ verticalAlign: 'middle' }} /> 添加
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {/* Friends tab */}
        {tab === 'friends' && (
          friends.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '40px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
              还没有好友
            </div>
          ) : (
            Array.from(grouped.entries()).map(([group, members]) => (
              <div key={group}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', padding: '8px 0 4px', textTransform: 'uppercase' }}>
                  {group}
                </div>
                {members.map(f => (
                  <div
                    key={f.userId}
                    onClick={() => onStartChat(f.roomId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '8px',
                      borderRadius: '8px', cursor: 'pointer', transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--snow-white)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <OttieAvatar name={f.displayName} avatarUrl={f.avatarUrl} size={40} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{f.displayName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{f.userId}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )
        )}

        {/* Requests tab */}
        {tab === 'requests' && (
          friendRequests.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '40px' }}>
              没有待处理的好友请求
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {friendRequests.map(req => (
                <OttieFriendRequest
                  key={req.id}
                  name={req.from}
                  userId={req.from}
                  message={req.message}
                  onAccept={() => onAcceptRequest(req.id)}
                  onReject={() => onRejectRequest(req.id)}
                />
              ))}
            </div>
          )
        )}

        {/* Search tab */}
        {tab === 'search' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="输入用户名搜索"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                style={{
                  flex: 1, padding: '8px 12px', border: '1px solid var(--border)',
                  borderRadius: '8px', fontSize: '14px', outline: 'none',
                  fontFamily: 'var(--font-family)',
                }}
              />
              <button onClick={handleSearch} style={{
                background: 'var(--ottie-green)', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}>
                <Search size={16} />
              </button>
            </div>
            {searchResults && searchResults.map(u => (
              <div key={u.matrixId} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '8px',
                borderRadius: '8px',
              }}>
                <OttieAvatar name={u.displayName} avatarUrl={u.avatarUrl} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{u.displayName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{u.matrixId}</div>
                </div>
                <button onClick={() => onAddFriend(u.matrixId)} style={{
                  background: 'var(--ottie-green)', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'var(--font-family)',
                }}>
                  添加
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
