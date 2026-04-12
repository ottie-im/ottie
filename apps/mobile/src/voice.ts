/**
 * 语音录制 + STT 转写
 * expo-av 需要 native module，动态加载
 */

let Audio: any = null
try {
  Audio = require('expo-av').Audio
} catch {}

let recording: any = null

export async function requestMicPermission(): Promise<boolean> {
  if (!Audio) return false
  try {
    const { granted } = await Audio.requestPermissionsAsync()
    return granted
  } catch {
    return false
  }
}

export async function startRecording(): Promise<boolean> {
  if (!Audio) return false
  try {
    const permission = await requestMicPermission()
    if (!permission) return false

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })

    const { recording: rec } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    )
    recording = rec
    return true
  } catch {
    return false
  }
}

export async function stopRecording(): Promise<string | null> {
  if (!recording) return null
  try {
    await recording.stopAndUnloadAsync()
    if (Audio) await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
    const uri = recording.getURI()
    recording = null
    return uri
  } catch {
    recording = null
    return null
  }
}

export function isRecording(): boolean {
  return recording !== null
}

export function isVoiceAvailable(): boolean {
  return Audio !== null
}

export async function transcribeAudio(
  audioUri: string,
  apiUrl = 'http://localhost:11434'
): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any)
    formData.append('model', 'whisper-1')

    const resp = await fetch(`${apiUrl}/v1/audio/transcriptions`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000),
    })

    if (resp.ok) {
      const data = await resp.json()
      return data.text?.trim() || null
    }
    return null
  } catch {
    return null
  }
}
