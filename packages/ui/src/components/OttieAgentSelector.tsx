import React from 'react'

export interface AgentInfo {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error'
  capabilities: string[]
  persona?: string
  isDefault: boolean
}

interface OttieAgentSelectorProps {
  agents: AgentInfo[]
  onSetDefault: (agentId: string) => void
}

const statusLabel: Record<string, { text: string; color: string }> = {
  running: { text: '运行中', color: 'var(--success)' },
  stopped: { text: '已停止', color: 'var(--text-tertiary)' },
  error: { text: '错误', color: 'var(--danger)' },
}

export function OttieAgentSelector({ agents, onSetDefault }: OttieAgentSelectorProps) {
  return (
    <div style={{ fontFamily: 'var(--font-family)' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
        Agent 管理
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Ottie 的 Agent 是可插拔的。你可以切换到其他 Agent 实现（如 LangGraph、Google ADK），或使用社区提供的 Agent。
      </div>

      {agents.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '24px' }}>
          没有可用的 Agent
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {agents.map(agent => {
            const s = statusLabel[agent.status]
            return (
              <div
                key={agent.id}
                style={{
                  background: agent.isDefault ? '#f0fdf4' : 'var(--white)',
                  border: agent.isDefault ? '2px solid var(--ottie-green)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      🦦 {agent.name}
                    </span>
                    {agent.isDefault && (
                      <span style={{
                        fontSize: '11px', background: 'var(--ottie-green)', color: '#fff',
                        borderRadius: '4px', padding: '2px 6px', fontWeight: 600,
                      }}>
                        默认
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: s.color, fontWeight: 500 }}>
                    ● {s.text}
                  </span>
                </div>

                {agent.persona && (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    人格：{agent.persona}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {agent.capabilities.map((cap, i) => (
                    <span key={i} style={{
                      fontSize: '11px', background: 'var(--cloud-gray)', color: 'var(--text-secondary)',
                      borderRadius: '4px', padding: '2px 8px',
                    }}>
                      {cap}
                    </span>
                  ))}
                </div>

                {!agent.isDefault && (
                  <button
                    onClick={() => onSetDefault(agent.id)}
                    style={{
                      background: 'var(--cloud-gray)', color: 'var(--text-primary)', border: 'none',
                      borderRadius: '8px', padding: '6px 16px', fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'var(--font-family)',
                    }}
                  >
                    设为默认
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{
        marginTop: '16px', padding: '12px', background: 'var(--snow-white)',
        borderRadius: '8px', fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: '1.5',
      }}>
        💡 想用其他 Agent？任何实现了 OttieAgentAdapter 接口的 Agent 都可以接入 Ottie。
        查看文档了解如何开发自定义 Agent。
      </div>
    </div>
  )
}
