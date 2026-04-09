import React from 'react'
import { OttieBubble } from './OttieBubble'

export default { title: 'Chat/OttieBubble', component: OttieBubble }

export const Outgoing = () => (
  <OttieBubble type="outgoing" body="周五晚上有空一起吃个饭吗？" time="14:30" status="sent" />
)

export const OutgoingRead = () => (
  <OttieBubble type="outgoing" body="好的，周五见！" time="14:32" status="read" />
)

export const Incoming = () => (
  <OttieBubble type="incoming" body="那家新开的川菜馆怎么样？" time="14:35" />
)

export const Intent = () => (
  <OttieBubble type="intent" body="帮我问他周五去不去吃饭，语气随意一点" time="14:28" />
)

export const WithReply = () => (
  <OttieBubble
    type="outgoing"
    body="好的呀！几点见？"
    time="14:36"
    status="sent"
    replyTo={{ sender: '@bob:ottie.claws.company', body: '那家新开的川菜馆怎么样？' }}
  />
)
