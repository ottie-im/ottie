import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { useStore } from '../src/store'
import { login, register } from '../src/services'

export default function LoginScreen() {
  const { setLoggedIn } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      </View>
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
})
