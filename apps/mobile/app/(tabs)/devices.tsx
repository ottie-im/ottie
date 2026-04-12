import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import { isAIAvailable, getAIModels, setAIConfig } from '../../src/services'
import { streamOllamaChat } from '../../src/streaming'

// ============================================================
// Agent 类型
// ============================================================

interface AgentTask {
  id: string
  prompt: string
  status: 'running' | 'completed' | 'error'
  output: string
  model: string
  createdAt: number
}

// ============================================================
// Agent 管理屏幕
// ============================================================

export default function DevicesTab() {
  const [aiOnline, setAiOnline] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('gemma4:latest')
  const [prompt, setPrompt] = useState('')
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [running, setRunning] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // 检查 AI 状态
  const checkAI = useCallback(async () => {
    const online = await isAIAvailable()
    setAiOnline(online)
    if (online) {
      const m = await getAIModels()
      setModels(m)
      if (m.length > 0 && !m.includes(selectedModel)) {
        setSelectedModel(m[0])
      }
    }
  }, [selectedModel])

  useEffect(() => { checkAI() }, [checkAI])

  const onRefresh = async () => {
    setRefreshing(true)
    await checkAI()
    setRefreshing(false)
  }

  // 当前运行的 abort controller
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // 执行 Agent 任务（流式输出）
  const handleRun = async () => {
    if (!prompt.trim() || running) return
    const taskPrompt = prompt.trim()
    setPrompt('')
    setRunning(true)

    const taskId = `task_${Date.now()}`
    const task: AgentTask = {
      id: taskId,
      prompt: taskPrompt,
      status: 'running',
      output: '',
      model: selectedModel,
      createdAt: Date.now(),
    }
    setTasks(prev => [task, ...prev])

    const controller = new AbortController()
    setAbortController(controller)

    const AI_URL = 'http://localhost:11434' // TODO: from config

    await streamOllamaChat({
      url: AI_URL,
      model: selectedModel,
      messages: [
        { role: 'system', content: '你是一个有帮助的AI助手。简洁回答用户的问题。' },
        { role: 'user', content: taskPrompt },
      ],
      signal: controller.signal,
      onChunk: (chunk) => {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, output: t.output + chunk } : t
        ))
      },
      onDone: (fullText) => {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'completed', output: fullText || '无输出' } : t
        ))
        setRunning(false)
        setAbortController(null)
      },
      onError: (error) => {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'error', output: error } : t
        ))
        setRunning(false)
        setAbortController(null)
      },
    })
  }

  // 取消任务
  const handleCancel = (taskId: string) => {
    abortController?.abort()
    setAbortController(null)
    setTasks(prev => prev.map(t =>
      t.id === taskId && t.status === 'running'
        ? { ...t, status: 'error', output: t.output ? t.output + '\n\n[已取消]' : '已取消' }
        : t
    ))
    setRunning(false)
  }

  // 清除历史
  const handleClear = () => {
    Alert.alert('清除历史', '确定要清除所有任务记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '清除', style: 'destructive', onPress: () => setTasks([]) },
    ])
  }

  const renderTask = ({ item }: { item: AgentTask }) => (
    <View style={s.taskCard}>
      <View style={s.taskHeader}>
        <View style={[s.statusDot, {
          backgroundColor: item.status === 'running' ? '#f59e0b'
            : item.status === 'completed' ? '#22c55e' : '#ef4444'
        }]} />
        <Text style={s.taskModel}>{item.model}</Text>
        <Text style={s.taskTime}>
          {new Date(item.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.status === 'running' && (
          <TouchableOpacity onPress={() => handleCancel(item.id)}>
            <Text style={s.cancelBtn}>取消</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={s.taskPrompt} numberOfLines={2}>📝 {item.prompt}</Text>
      {item.status === 'running' ? (
        <View style={s.outputBox}>
          {item.output ? (
            <Text style={s.outputText} selectable>{item.output}{'▌'}</Text>
          ) : (
            <View style={s.runningRow}>
              <ActivityIndicator size="small" color="#25D366" />
              <Text style={s.runningText}>思考中...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[s.outputBox, item.status === 'error' && s.outputError]}>
          <Text style={s.outputText} selectable>{item.output}</Text>
        </View>
      )}
    </View>
  )

  return (
    <View style={s.container}>
      {/* AI 状态 */}
      <View style={s.statusBar}>
        <View style={[s.statusIndicator, { backgroundColor: aiOnline ? '#22c55e' : '#ef4444' }]} />
        <Text style={s.statusText}>
          {aiOnline ? `AI 在线 · ${models.length} 个模型` : 'AI 离线'}
        </Text>
        {tasks.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={s.clearBtn}>清除</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 模型选择 */}
      {aiOnline && models.length > 1 && (
        <View style={s.modelRow}>
          {models.slice(0, 4).map(m => (
            <TouchableOpacity
              key={m}
              style={[s.modelChip, selectedModel === m && s.modelChipActive]}
              onPress={() => setSelectedModel(m)}
            >
              <Text style={[s.modelChipText, selectedModel === m && s.modelChipTextActive]}>
                {m.replace(':latest', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 任务列表 */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={i => i.id}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#25D366" />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🤖</Text>
            <Text style={s.emptyTitle}>AI Agent</Text>
            <Text style={s.emptySubtitle}>
              {aiOnline
                ? '输入指令让 AI 帮你执行任务'
                : '请先在 Mac 上启动 Ollama：ollama serve'}
            </Text>
          </View>
        }
      />

      {/* 输入框 */}
      {aiOnline && (
        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="输入指令..."
            placeholderTextColor="#8696a0"
            returnKeyType="send"
            onSubmitEditing={handleRun}
            editable={!running}
            multiline
          />
          <TouchableOpacity
            style={[s.sendBtn, (!prompt.trim() || running) && s.sendBtnDisabled]}
            onPress={handleRun}
            disabled={!prompt.trim() || running}
          >
            {running ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  // Status
  statusBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e9edef' },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { flex: 1, fontSize: 13, color: '#667781' },
  clearBtn: { fontSize: 13, color: '#ef4444' },
  // Model selector
  modelRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e9edef' },
  modelChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: '#f0f2f5' },
  modelChipActive: { backgroundColor: '#25D366' },
  modelChipText: { fontSize: 12, color: '#667781' },
  modelChipTextActive: { color: '#fff', fontWeight: '500' },
  // List
  listContent: { padding: 12, flexGrow: 1 },
  // Task card
  taskCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  taskModel: { fontSize: 11, color: '#8696a0', flex: 1 },
  taskTime: { fontSize: 11, color: '#8696a0' },
  cancelBtn: { fontSize: 12, color: '#ef4444', fontWeight: '500' },
  taskPrompt: { fontSize: 13, color: '#111b21', marginBottom: 8 },
  runningRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  runningText: { fontSize: 13, color: '#25D366' },
  outputBox: { backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10, borderLeftWidth: 3, borderLeftColor: '#25D366' },
  outputError: { backgroundColor: '#fef2f2', borderLeftColor: '#ef4444' },
  outputText: { fontSize: 13, color: '#111b21', lineHeight: 20 },
  // Empty
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111b21', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#667781', textAlign: 'center', paddingHorizontal: 40 },
  // Input
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, paddingHorizontal: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e9edef' },
  input: { flex: 1, maxHeight: 100, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 15, color: '#111b21' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: '#e9edef' },
  sendIcon: { color: '#fff', fontSize: 18 },
})
