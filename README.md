# 🦦 Ottie — Agent-Native IM

> "Ottie，帮我问他周五去不去吃饭。"

Ottie 是一个 Agent-Native 的即时通讯应用。所有消息永远经过双方 Agent，用户通过输入框向自己的 AI 秘书下指令，秘书组织好语言后对外输出。

## 特点

- **Agent 永远在线** — 每条消息都经过双方 Agent，不能关闭
- **一次安装全搞定** — 桌面端安装包内嵌 IM + 个人 Agent + 设备 Agent
- **联邦互通** — 基于 Matrix 协议，自部署服务器之间自动互通
- **屏幕感知** — 设备 Agent 通过 Screenpipe 感知屏幕变化，构建长期记忆
- **开放生态** — A2A + A2UI + MCP 协议，第三方 Agent 按标准接入

## 架构

详见 [docs/architecture.md](docs/architecture.md)

## 模块

| 包 | 说明 |
|---|---|
| `@ottie/contracts` | 共享类型定义（所有模块的"合同"） |
| `@ottie/ui` | 共享 UI 组件库 |
| `@ottie/matrix` | Matrix 通信封装 |
| `@ottie/a2ui` | A2UI 渲染器 |
| `@ottie/skills` | OpenClaw 自定义 Skill 包 |
| `@ottie/screen` | 屏幕感知模块 |
| `@ottie/memory` | 记忆管理模块 |
| `ottie-mobile` | 移动端 App（React Native） |
| `ottie-desktop` | 桌面端 App（Tauri v2） |
| `ottie-server` | 服务端部署包（Docker Compose） |

## 快速开始

```bash
git clone https://github.com/ottie-im/ottie
cd ottie
npm install
npm run dev
```

## AI 开发指南

如果你是 AI Agent 参与开发，请先读 [CLAUDE.md](CLAUDE.md)。

## 协议

MIT
