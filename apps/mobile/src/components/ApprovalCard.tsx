/**
 * 审批卡片 — 发送侧
 * AI 改写了消息后，用户在这里审批（批准/编辑/拒绝）
 * 参考 Paseo 的 permission-request-card 和 Ottie 桌面端的 OttieApproval
 */

import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'

interface Props {
  draft: string
  originalIntent: string
  onApprove: (text: string) => void
  onReject: () => void
}

export function ApprovalCard({ draft, originalIntent, onApprove, onReject }: Props) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(draft)

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerIcon}>🦦</Text>
        <Text style={s.headerText}>Ottie 拟好了消息</Text>
      </View>

      {/* Original intent */}
      <View style={s.intentRow}>
        <Text style={s.intentLabel}>你说：</Text>
        <Text style={s.intentText}>{originalIntent}</Text>
      </View>

      {/* Draft / Edit */}
      {editing ? (
        <TextInput
          style={s.editInput}
          value={editText}
          onChangeText={setEditText}
          multiline
          autoFocus
        />
      ) : (
        <View style={s.draftBox}>
          <Text style={s.draftText}>{draft}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={s.rejectBtn} onPress={onReject}>
          <Text style={s.rejectText}>✕ 拒绝</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.editBtn}
          onPress={() => {
            if (editing) {
              setEditing(false)
            } else {
              setEditText(draft)
              setEditing(true)
            }
          }}
        >
          <Text style={s.editBtnText}>{editing ? '取消编辑' : '✏️ 编辑'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.approveBtn}
          onPress={() => onApprove(editing ? editText : draft)}
        >
          <Text style={s.approveText}>✓ 发送</Text>
        </TouchableOpacity>
      </View>
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
    borderLeftColor: '#25D366',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  headerIcon: { fontSize: 16 },
  headerText: { fontSize: 13, fontWeight: '600', color: '#128C7E' },
  intentRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  intentLabel: { fontSize: 12, color: '#8696a0' },
  intentText: { fontSize: 12, color: '#667781', flex: 1 },
  draftBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  draftText: { fontSize: 14, color: '#111b21', lineHeight: 20 },
  editInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#111b21',
    borderWidth: 1,
    borderColor: '#25D366',
    minHeight: 60,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  rejectText: { fontSize: 13, color: '#ef4444', fontWeight: '500' },
  editBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
  },
  editBtnText: { fontSize: 13, color: '#667781', fontWeight: '500' },
  approveBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#25D366',
    alignItems: 'center',
  },
  approveText: { fontSize: 13, color: '#fff', fontWeight: '600' },
})
