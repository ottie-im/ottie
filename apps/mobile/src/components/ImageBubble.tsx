/**
 * 图片消息气泡
 * 显示缩略图，点击全屏查看
 */

import React, { useState } from 'react'
import { Image, TouchableOpacity, Modal, View, Text, StyleSheet, Dimensions } from 'react-native'

interface Props {
  uri: string
  isOutgoing: boolean
  time: string
}

const SCREEN = Dimensions.get('window')

export function ImageBubble({ uri, isOutgoing, time }: Props) {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <>
      <TouchableOpacity
        style={[s.bubble, isOutgoing ? s.outgoing : s.incoming]}
        onPress={() => setFullscreen(true)}
        activeOpacity={0.8}
      >
        <Image source={{ uri }} style={s.thumbnail} resizeMode="cover" />
        <Text style={s.time}>{time}</Text>
      </TouchableOpacity>

      <Modal visible={fullscreen} transparent animationType="fade">
        <TouchableOpacity style={s.fullscreenOverlay} onPress={() => setFullscreen(false)} activeOpacity={1}>
          <Image source={{ uri }} style={s.fullscreenImage} resizeMode="contain" />
          <TouchableOpacity style={s.closeBtn} onPress={() => setFullscreen(false)}>
            <Text style={s.closeText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const s = StyleSheet.create({
  bubble: { maxWidth: '70%', borderRadius: 8, overflow: 'hidden', marginBottom: 6 },
  outgoing: { alignSelf: 'flex-end' },
  incoming: { alignSelf: 'flex-start' },
  thumbnail: { width: 200, height: 150, borderRadius: 8 },
  time: { fontSize: 11, color: '#667781', textAlign: 'right', paddingRight: 6, paddingBottom: 4, paddingTop: 2 },
  fullscreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: SCREEN.width, height: SCREEN.height * 0.7 },
  closeBtn: { position: 'absolute', top: 60, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  closeText: { color: '#fff', fontSize: 20 },
})
