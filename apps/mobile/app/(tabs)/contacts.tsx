import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function ContactsTab() {
  return (
    <View style={s.container}>
      <Text style={s.icon}>👤</Text>
      <Text style={s.text}>联系人功能开发中</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  icon: { fontSize: 48, marginBottom: 12 },
  text: { fontSize: 16, color: '#667781' },
})
