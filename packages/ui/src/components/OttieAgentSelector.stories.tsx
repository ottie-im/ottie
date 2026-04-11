import React from 'react'
import { OttieAgentSelector, AgentInfo } from './OttieAgentSelector'

export default { title: 'Settings/OttieAgentSelector', component: OttieAgentSelector }

const agents: AgentInfo[] = [
  {
    id: 'openclaw',
    name: 'OpenClaw Agent',
    status: 'running',
    capabilities: ['rewrite', 'approve', 'screen', 'memory'],
    persona: '专业、礼貌、简洁',
    isDefault: true,
  },
  {
    id: 'echo',
    name: 'Echo Agent (测试)',
    status: 'stopped',
    capabilities: ['rewrite'],
    isDefault: false,
  },
]

export const Default = () => (
  <OttieAgentSelector agents={agents} onSetDefault={(id) => console.log('Set default:', id)} />
)

export const Empty = () => (
  <OttieAgentSelector agents={[]} onSetDefault={() => {}} />
)
