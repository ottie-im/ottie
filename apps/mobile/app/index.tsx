import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraView, useCameraPermissions } from 'expo-camera'
import { useStore } from '../src/store'
import { login, register, restoreSession, getUserId, parseQRCode } from '../src/services'

export default function LoginScreen() {
  const { setLoggedIn } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState(true)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  // 尝试恢复上次 session
  useEffect(() => {
    restoreSession().then(restored => {
      if (restored) {
        const uid = getUserId()
        if (uid) {
          setLoggedIn(uid)
          router.replace('/(tabs)')
          return
        }
      }
      setRestoring(false)
    }).catch(() => setRestoring(false))
  }, [setLoggedIn])

  const handleSubmit = async () => {
    if (!username || !password) return
    setLoading(true)
    setError('')
    try {
      const userId = isRegister
        ? await register(username, password)
        : await login(username, password)
      setLoggedIn(userId)
      router.replace('/(tabs)')
    } catch (err: any) {
      setError(err.data?.error ?? err.message ?? '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        Alert.alert('需要相机权限', '请在设置中允许 Ottie 使用相机来扫描二维码')
        return
      }
    }
    setScanning(true)
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false)
    const qrData = parseQRCode(data)
    if (qrData) {
      // 从 QR 码填充服务器信息
      // QR 只告诉你服务器地址和用户名，密码还是要自己输
      if (qrData.userId) {
        // 提取用户名（去掉 @xxx:server 的格式）
        const name = qrData.userId.replace(/^@/, '').split(':')[0]
        setUsername(name)
      }
      Alert.alert(
        '扫码成功',
        `服务器：${qrData.serverUrl}\n请输入密码登录`,
        [{ text: '好的' }]
      )
    } else {
      Alert.alert('无法识别', '这不是 Ottie 的登录二维码')
    }
  }

  // Session 恢复中 → 显示 loading
  if (restoring) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🦦</Text>
        <ActivityIndicator size="large" color="#25D366" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.card}>
        <Text style={s.logo}>🦦</Text>
        <Text style={s.title}>Ottie</Text>
        <Text style={s.subtitle}>你的 AI 秘书</Text>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TextInput
          style={s.input}
          placeholder="用户名"
          placeholderTextColor="#8696a0"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={s.input}
          placeholder="密码"
          placeholderTextColor="#8696a0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={s.buttonText}>{loading ? '...' : isRegister ? '注册' : '登录'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={s.switchText}>
            {isRegister ? '已有账号？' : '没有账号？'}
            <Text style={s.switchLink}>{isRegister ? '登录' : '注册'}</Text>
          </Text>
        </TouchableOpacity>

        {/* 扫码登录 */}
        <View style={s.qrSection}>
          <TouchableOpacity style={s.scanButton} onPress={handleScan}>
            <Text style={s.scanIcon}>📷</Text>
            <Text style={s.scanText}>扫码登录</Text>
          </TouchableOpacity>
          <Text style={s.qrHintText}>在电脑上打开 Ottie → 设置 → 扫描二维码</Text>
        </View>
      </View>

      {/* 扫码 Modal */}
      <Modal visible={scanning} animationType="slide" presentationStyle="fullScreen">
        <View style={s.scannerContainer}>
          <CameraView
            style={s.scanner}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View style={s.scannerOverlay}>
            <View style={s.scannerFrame} />
          </View>
          <TouchableOpacity style={s.closeButton} onPress={() => setScanning(false)}>
            <Text style={s.closeText}>取消</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 32, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '600', textAlign: 'center', color: '#111b21' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#667781', marginBottom: 24 },
  error: { fontSize: 14, color: '#ef4444', backgroundColor: '#fef2f2', padding: 8, borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
  input: { height: 48, borderWidth: 1, borderColor: '#e9edef', borderRadius: 8, paddingHorizontal: 12, fontSize: 15, color: '#111b21', marginBottom: 16 },
  button: { height: 48, backgroundColor: '#25D366', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { backgroundColor: '#e9edef' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  switchText: { textAlign: 'center', fontSize: 14, color: '#667781' },
  switchLink: { color: '#25D366' },
  qrSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e9edef', alignItems: 'center' },
  scanButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingHorizontal: 24, backgroundColor: '#f0f2f5', borderRadius: 8, marginBottom: 8 },
  scanIcon: { fontSize: 20 },
  scanText: { fontSize: 15, fontWeight: '500', color: '#111b21' },
  qrHintText: { fontSize: 12, color: '#8696a0', textAlign: 'center' },
  // Scanner
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scanner: { flex: 1 },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#25D366', borderRadius: 12 },
  closeButton: { position: 'absolute', bottom: 60, alignSelf: 'center', padding: 16, paddingHorizontal: 32, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8 },
  closeText: { color: '#fff', fontSize: 16, fontWeight: '500' },
})
