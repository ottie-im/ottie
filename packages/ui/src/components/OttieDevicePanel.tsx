import React, { useState } from 'react'

export interface DeviceInfo {
  id: string
  name: string
  type: 'desktop' | 'mobile'
  status: 'online' | 'offline' | 'busy'
  lastSeen?: string
  capabilities: string[]
}

interface OttieDevicePanelProps {
  devices: DeviceInfo[]
  onSendCommand?: (deviceId: string) => void
  onRenameDevice?: (deviceId: string, newName: string) => void
}

const statusStyle: Record<string, { color: string; text: string }> = {
  online: { color: 'var(--success)', text: '在线' },
  offline: { color: 'var(--text-tertiary)', text: '离线' },
  busy: { color: 'var(--warning)', text: '忙碌' },
}

const typeIcon: Record<string, string> = {
  desktop: '💻',
  mobile: '📱',
}

export function OttieDevicePanel({ devices, onSendCommand, onRenameDevice }: OttieDevicePanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleRename = (deviceId: string) => {
    if (editName.trim() && onRenameDevice) {
      onRenameDevice(deviceId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div style={{ fontFamily: 'var(--font-family)' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
        我的设备
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        已连接到 Ottie 的设备。桌面设备运行设备 Agent，可以感知屏幕变化并推送通知到手机。
      </div>

      {devices.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '24px', padding: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💻</div>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>当前设备是唯一连接的设备</div>
          <div style={{ fontSize: '12px' }}>安装 Ottie Desktop 到其他电脑，或在手机上安装 Ottie App</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {devices.map(device => {
            const s = statusStyle[device.status]
            return (
              <div
                key={device.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '28px' }}>{typeIcon[device.type] ?? '💻'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {editingId === device.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleRename(device.id)}
                          autoFocus
                          style={{ fontSize: '14px', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '4px', width: '120px' }}
                        />
                        <button onClick={() => handleRename(device.id)} style={{ fontSize: '12px', background: 'var(--ottie-green)', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>✓</button>
                      </div>
                    ) : (
                      <span
                        style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', cursor: onRenameDevice ? 'pointer' : 'default' }}
                        onClick={() => { if (onRenameDevice) { setEditingId(device.id); setEditName(device.name) } }}
                      >
                        {device.name} {onRenameDevice ? '✏️' : ''}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: s.color }}>● {s.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {device.capabilities.map((cap, i) => (
                      <span key={i} style={{
                        fontSize: '10px', background: 'var(--cloud-gray)', color: 'var(--text-tertiary)',
                        borderRadius: '4px', padding: '1px 6px',
                      }}>
                        {cap}
                      </span>
                    ))}
                  </div>
                  {device.lastSeen && device.status === 'offline' && (
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      最后在线：{device.lastSeen}
                    </div>
                  )}
                </div>
                {onSendCommand && device.status === 'online' && (
                  <button
                    onClick={() => onSendCommand(device.id)}
                    style={{
                      background: 'var(--cloud-gray)', color: 'var(--text-secondary)', border: 'none',
                      borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
                      cursor: 'pointer', fontFamily: 'var(--font-family)',
                    }}
                  >
                    发送指令
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
