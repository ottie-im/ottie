import React from 'react'
import { OttieApproval } from './OttieApproval'

export default { title: 'Chat/OttieApproval', component: OttieApproval }

export const Default = () => (
  <OttieApproval
    draft="周五晚上有空一起吃个饭吗？"
    originalIntent="帮我问他去不去吃饭"
    onApprove={() => alert('批准')}
    onEdit={() => alert('编辑')}
    onReject={() => alert('拒绝')}
  />
)
