import React from 'react'
import { Search } from 'lucide-react'
import { OttieAvatar } from './OttieAvatar'

export interface ConversationItem {
  id: string
  name: string
  avatarUrl?: string
  lastMessage?: string
  time?: string
  unread?: number
  online?: boolean
}

interface OttieSidebarProps {
  conversations: ConversationItem[]
  activeId?: string
  onSelect: (id: string) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function OttieSidebar({ conversations, activeId, onSelect, searchQuery, onSearchChange }: OttieSidebarProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--cloud-gray)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: '56px',
          background: 'var(--ottie-dark-green)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          fontSize: '20px',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        🦦 Ottie
      </div>

      {/* Search */}
      <div style={{ padding: '8px 12px', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--white)',
            borderRadius: '8px',
            padding: '6px 12px',
          }}
        >
          <Search size={16} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="搜索"
            value={searchQuery ?? ''}
            onChange={e => onSearchChange?.(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: '14px',
              color: 'var(--text-primary)',
              background: 'transparent',
              fontFamily: 'var(--font-family)',
            }}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              background: activeId === conv.id ? 'var(--border)' : 'transparent',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              if (activeId !== conv.id) e.currentTarget.style.background = 'var(--snow-white)'
            }}
            onMouseLeave={e => {
              if (activeId !== conv.id) e.currentTarget.style.background = 'transparent'
            }}
          >
            <OttieAvatar name={conv.name} avatarUrl={conv.avatarUrl} size={48} online={conv.online} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {conv.name}
                </span>
                {conv.time && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {conv.time}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {conv.lastMessage ?? ''}
                </span>
                {conv.unread && conv.unread > 0 ? (
                  <span
                    style={{
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--ottie-green)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginLeft: '8px',
                      padding: '0 4px',
                    }}
                  >
                    {conv.unread}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
