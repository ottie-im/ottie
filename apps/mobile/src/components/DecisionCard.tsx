/**
 * 决策卡片 — 接收侧
 * 收到消息后 AI 识别意图，显示建议回复按钮
 * 参考 Paseo 的 question-form-card 和 Ottie 桌面端的 OttieDecisionCard
 */

import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import type { SuggestedAction } from '../store'

interface Props {
  senderName: string
  originalMessage: string
  intentSummary: string
  suggestedActions: SuggestedAction[]
  onSelectAction: (action: SuggestedAction) => void
  onCustomReply: (text: string) => void
  onDismiss: () => void
}

export function DecisionCard({
  senderName, originalMessage, intentSummary,
  suggestedActions, onSelectAction, onCustomReply, onDismiss,
}: Props) {
  const [showCustom, setShowCustom] = useState(false)
  const [customText, setCustomText] = useState('')

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerIcon}>🦦</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.headerText}>
            Ottie 分析了 <Text style={s.senderName}>{senderName}</Text> 的消息
          </Text>
          <Text style={s.intentSummary}>{intentSummary}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={s.dismissBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Original message */}
      <View style={s.originalBox}>
        <Text style={s.originalLabel}>原文：</Text>
        <Text style={s.originalText} numberOfLines={3}>{originalMessage}</Text>
      </View>

      {/* Suggested actions */}
      <View style={s.actionsRow}>
        {suggestedActions.map((action, i) => (
          <TouchableOpacity
            key={i}
            style={[s.actionBtn, i === 0 && s.actionBtnPrimary]}
            onPress={() => onSelectAction(action)}
          >
            <Text style={[s.actionText, i === 0 && s.actionTextPrimary]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => setShowCustom(!showCustom)}
        >
          <Text style={s.actionText}>✏️ 自己说</Text>
        </TouchableOpacity>
      </View>

      {/* Custom reply input */}
      {showCustom && (
        <View style={s.customRow}>
          <TextInput
            style={s.customInput}
            value={customText}
            onChangeText={setCustomText}
            placeholder="输入自定义回复..."
            placeholderTextColor="#8696a0"
            autoFocus
          />
          <TouchableOpacity
            style={[s.customSend, !customText.trim() && s.customSendDisabled]}
            onPress={() => customText.trim() && onCustomReply(customText.trim())}
            disabled={!customText.trim()}
          >
            <Text style={s.customSendText}>➤</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  headerIcon: { fontSize: 16, marginTop: 2 },
  headerText: { fontSize: 13, color: '#667781' },
  senderName: { fontWeight: '600', color: '#111b21' },
  intentSummary: { fontSize: 14, fontWeight: '600', color: '#111b21', marginTop: 2 },
  dismissBtn: { fontSize: 16, color: '#8696a0', padding: 4 },
  originalBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
  },
  originalLabel: { fontSize: 12, color: '#8696a0' },
  originalText: { fontSize: 13, color: '#667781', flex: 1 },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#f0f2f5',
  },
  actionBtnPrimary: {
    backgroundColor: '#25D366',
  },
  actionText: { fontSize: 13, color: '#111b21', fontWeight: '500' },
  actionTextPrimary: { color: '#fff' },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111b21',
  },
  customSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customSendDisabled: { backgroundColor: '#e9edef' },
  customSendText: { color: '#fff', fontSize: 16 },
})
