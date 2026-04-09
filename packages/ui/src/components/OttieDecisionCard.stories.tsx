import React from 'react'
import { OttieDecisionCard } from './OttieDecisionCard'

export default { title: 'Chat/OttieDecisionCard', component: OttieDecisionCard }

export const Invitation = () => (
  <OttieDecisionCard
    senderName="Bob"
    originalMessage="周五晚上一起去吃火锅吗？"
    intentSummary="Bob 邀请你周五吃火锅"
    intentType="invitation"
    actions={[
      { label: '好呀', response: '好的！' },
      { label: '改时间', response: '周五不太方便，换个时间？' },
      { label: '了解详情', response: '去哪里吃？' },
    ]}
    onAction={(a) => alert(a.response)}
    onCustomReply={() => alert('自己说')}
  />
)
