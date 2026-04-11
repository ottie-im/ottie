import React from 'react'
import { OttieDevicePanel, DeviceInfo } from './OttieDevicePanel'

export default { title: 'Settings/OttieDevicePanel', component: OttieDevicePanel }

const devices: DeviceInfo[] = [
  { id: '1', name: 'MacBook Pro', type: 'desktop', status: 'online', capabilities: ['screen', 'cli-watch'] },
  { id: '2', name: 'iPhone 16', type: 'mobile', status: 'online', capabilities: ['notification'] },
  { id: '3', name: '办公室 iMac', type: 'desktop', status: 'offline', lastSeen: '2小时前', capabilities: ['screen'] },
]

export const WithDevices = () => (
  <OttieDevicePanel
    devices={devices}
    onSendCommand={(id) => console.log('Command to:', id)}
    onRenameDevice={(id, name) => console.log('Rename:', id, name)}
  />
)

export const Empty = () => <OttieDevicePanel devices={[]} />
