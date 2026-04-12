/**
 * 语音按钮 — 长按录音，松开转写
 * 参考 Paseo 的 voice-button.tsx：idle/recording/processing 三态
 */

import React, { useState, useRef } from 'react'
import { TouchableOpacity, Text, StyleSheet, Animated, Alert } from 'react-native'
import { startRecording, stopRecording, transcribeAudio, requestMicPermission } from '../voice'

interface Props {
  onTranscript: (text: string) => void
  aiUrl?: string
  size?: number
}

export function VoiceButton({ onTranscript, aiUrl = 'http://localhost:11434', size = 40 }: Props) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing'>('idle')
  const pulseAnim = useRef(new Animated.Value(1)).current
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)
  const [duration, setDuration] = useState(0)

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start()
  }

  const stopPulse = () => {
    pulseAnim.stopAnimation()
    pulseAnim.setValue(1)
  }

  const handlePressIn = async () => {
    const ok = await requestMicPermission()
    if (!ok) {
      Alert.alert('需要麦克风权限', '请在设置中允许 Ottie 使用麦克风')
      return
    }

    const started = await startRecording()
    if (!started) return

    setState('recording')
    setDuration(0)
    startPulse()

    timerRef.current = setInterval(() => {
      setDuration(d => d + 1)
    }, 1000)
  }

  const handlePressOut = async () => {
    if (state !== 'recording') return

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    stopPulse()

    // 太短的录音忽略
    if (duration < 1) {
      const uri = await stopRecording()
      setState('idle')
      setDuration(0)
      return
    }

    setState('processing')
    const uri = await stopRecording()

    if (uri) {
      const text = await transcribeAudio(uri, aiUrl)
      if (text) {
        onTranscript(text)
      } else {
        // STT 不可用时提示
        Alert.alert('语音转写', '暂时无法转写语音。请确保 Ollama 已安装 whisper 模型。')
      }
    }

    setState('idle')
    setDuration(0)
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[
          s.button,
          { width: size, height: size, borderRadius: size / 2 },
          state === 'recording' && s.recording,
          state === 'processing' && s.processing,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        {state === 'idle' && <Text style={s.icon}>🎤</Text>}
        {state === 'recording' && (
          <Text style={s.durationText}>{formatDuration(duration)}</Text>
        )}
        {state === 'processing' && <Text style={s.icon}>⏳</Text>}
      </TouchableOpacity>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  button: {
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    backgroundColor: '#ef4444',
  },
  processing: {
    backgroundColor: '#f59e0b',
  },
  icon: { fontSize: 18 },
  durationText: { fontSize: 11, color: '#fff', fontWeight: '600' },
})
