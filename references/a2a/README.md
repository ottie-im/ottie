# A2A (Agent-to-Agent) 协议 — 参考指南

## 官方资源
- GitHub：https://github.com/a2aproject/A2A
- 规范：https://a2aproject.github.io/A2A/
- 由 Google 创建，Linux Foundation 托管

## 核心概念
A2A 让不同框架、不同服务器的 Agent 互相通讯和协作。
通过 HTTPS + JSON-RPC 2.0 通信。

## Agent Card（能力发现）
每个 Agent 发布一个 Agent Card，描述自己的能力：
```json
{
  "name": "Ottie",
  "description": "AI 秘书",
  "url": "https://ottie.app/.well-known/agent.json",
  "capabilities": ["chat", "scheduling", "file-management"],
  "authentication": { "scheme": "bearer" }
}
```

## 任务流程
1. Client Agent 发送任务给 Remote Agent
2. Remote Agent 处理（可能询问更多信息）
3. Remote Agent 返回结果 + artifacts

## 在 Ottie 中的使用
- 第五层外部 Agent（餐馆、SaaS）通过 A2A 接入
- 个人 Agent 通过 A2A 发现和调用外部服务
- Agent Card 发布在用户的 Matrix profile 或 .well-known 路径

## 与其他协议的关系
- A2A = Agent 之间的通讯（谁跟谁说话）
- A2UI = Agent 生成的 UI（说话时展示什么界面）
- MCP = Agent 调用工具（Agent 用什么工具完成任务）
- Matrix = 消息管道（消息怎么送达）

这四个协议各管一件事，互不冲突。
