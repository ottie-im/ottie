import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'

interface DeviceItem {
  id: string
  name: string
  type: 'desktop' | 'mobile'
  status: 'online' | 'offline'
  capabilities: string[]
}

// 目前是静态数据，Phase 4 完成后从 Agent 获取真实设备列表
const DEVICES: DeviceItem[] = [
  { id: 'desktop-1', name: '我的电脑', type: 'desktop', status: 'online', capabilities: ['文件', '屏幕', '执行'] },
]

export default function DevicesTab() {
  const handleCommand = (deviceId: string) => {
    Alert.prompt?.(
      '发送指令',
      '输入要在桌面端执行的指令',
      (text) => {
        if (text?.trim()) {
          Alert.alert('已发送', `指令 "${text}" 已发送到设备`)
          // TODO: 通过 Matrix 消息发送指令到桌面端 Agent
        }
      },
    ) ?? Alert.alert('发送指令', '此功能需要在桌面端的 Agent 连接后使用')
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>我的设备</Text>
        <Text style={s.subtitle}>桌面设备运行 Agent，可以远程操控</Text>
      </View>

      {DEVICES.map(device => (
        <View key={device.id} style={s.deviceCard}>
          <View style={s.deviceRow}>
            <Text style={s.deviceIcon}>{device.type === 'desktop' ? '💻' : '📱'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.deviceName}>{device.name}</Text>
              <Text style={[s.deviceStatus, device.status === 'online' && s.online]}>
                ● {device.status === 'online' ? '在线' : '离线'}
              </Text>
            </View>
            {device.status === 'online' && (
              <TouchableOpacity style={s.cmdBtn} onPress={() => handleCommand(device.id)}>
                <Text style={s.cmdBtnText}>发送指令</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={s.capsRow}>
            {device.capabilities.map((cap, i) => (
              <View key={i} style={s.capBadge}>
                <Text style={s.capText}>{cap}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={s.infoBox}>
        <Text style={s.infoText}>
          💡 在电脑上安装 Ottie Desktop，登录同一个账号即可远程控制。{'\n'}
          你可以在手机上说"把电脑上的文件发给他"，桌面端 Agent 会自动执行。
        </Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '600', color: '#111b21', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#667781' },
  deviceCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  deviceIcon: { fontSize: 28 },
  deviceName: { fontSize: 14, fontWeight: '500', color: '#111b21' },
  deviceStatus: { fontSize: 12, color: '#8696a0' },
  online: { color: '#25D366' },
  cmdBtn: { backgroundColor: '#f0f2f5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  cmdBtnText: { fontSize: 12, color: '#667781', fontWeight: '500' },
  capsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  capBadge: { backgroundColor: '#f0f2f5', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  capText: { fontSize: 10, color: '#8696a0' },
  infoBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8 },
  infoText: { fontSize: 13, color: '#667781', lineHeight: 20 },
})
