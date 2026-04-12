/**
 * Markdown 消息气泡 — 富文本渲染
 * 支持加粗、斜体、代码块、列表、链接
 */

import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

interface Props {
  text: string
  isOutgoing: boolean
}

// 简易 markdown 渲染（不依赖 native module）
export function MarkdownBubble({ text, isOutgoing }: Props) {
  const lines = text.split('\n')

  return (
    <View>
      {lines.map((line, i) => {
        // 代码块
        if (line.startsWith('```')) {
          return <View key={i} style={s.codeLine}><Text style={s.codeText}>{line.replace(/```\w*/, '')}</Text></View>
        }
        // 标题
        if (line.startsWith('### ')) return <Text key={i} style={s.h3}>{line.slice(4)}</Text>
        if (line.startsWith('## ')) return <Text key={i} style={s.h2}>{line.slice(3)}</Text>
        if (line.startsWith('# ')) return <Text key={i} style={s.h1}>{line.slice(2)}</Text>
        // 列表
        if (line.match(/^[\-\*] /)) return <Text key={i} style={s.listItem}>  • {line.slice(2)}</Text>
        if (line.match(/^\d+\. /)) return <Text key={i} style={s.listItem}>  {line}</Text>
        // 行内代码
        const parts = line.split(/(`[^`]+`)/)
        if (parts.length > 1) {
          return (
            <Text key={i} style={s.text}>
              {parts.map((part, j) =>
                part.startsWith('`') && part.endsWith('`')
                  ? <Text key={j} style={s.inlineCode}>{part.slice(1, -1)}</Text>
                  : renderInline(part, j)
              )}
            </Text>
          )
        }
        // 普通文本（处理加粗和斜体）
        return <Text key={i} style={s.text}>{renderInline(line, i)}</Text>
      })}
    </View>
  )
}

function renderInline(text: string, key: number): React.ReactNode {
  // 加粗
  const boldParts = text.split(/(\*\*[^*]+\*\*)/)
  if (boldParts.length > 1) {
    return (
      <Text key={key}>
        {boldParts.map((p, i) =>
          p.startsWith('**') && p.endsWith('**')
            ? <Text key={i} style={{ fontWeight: '700' }}>{p.slice(2, -2)}</Text>
            : <Text key={i}>{p}</Text>
        )}
      </Text>
    )
  }
  return <Text key={key}>{text}</Text>
}

const s = StyleSheet.create({
  text: { fontSize: 14.2, lineHeight: 22, color: '#111b21' },
  h1: { fontSize: 18, fontWeight: '700', color: '#111b21', marginBottom: 4 },
  h2: { fontSize: 16, fontWeight: '600', color: '#111b21', marginBottom: 3 },
  h3: { fontSize: 14.5, fontWeight: '600', color: '#111b21', marginBottom: 2 },
  listItem: { fontSize: 14, lineHeight: 22, color: '#111b21' },
  codeLine: { backgroundColor: '#1e1e2e', borderRadius: 4, padding: 6, marginVertical: 2 },
  codeText: { fontSize: 12, fontFamily: 'Menlo', color: '#cdd6f4' },
  inlineCode: { backgroundColor: '#f0f2f5', borderRadius: 3, paddingHorizontal: 4, fontSize: 13, fontFamily: 'Menlo', color: '#e11d48' },
})
