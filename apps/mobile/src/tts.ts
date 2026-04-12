/**
 * TTS — 文字转语音
 * expo-speech 动态加载（native module 可能不可用）
 */

let Speech: any = null
try {
  Speech = require('expo-speech')
} catch {}

let speaking = false

export async function speakText(text: string, language = 'zh-CN'): Promise<void> {
  if (!Speech) return
  if (speaking) await stopSpeaking()
  speaking = true
  return new Promise((resolve) => {
    Speech.speak(text, {
      language,
      rate: 1.0,
      pitch: 1.0,
      onDone: () => { speaking = false; resolve() },
      onStopped: () => { speaking = false; resolve() },
      onError: () => { speaking = false; resolve() },
    })
  })
}

export async function stopSpeaking(): Promise<void> {
  if (!Speech) return
  speaking = false
  await Speech.stop()
}

export function isSpeaking(): boolean {
  return speaking
}

export function isTTSAvailable(): boolean {
  return Speech !== null
}
