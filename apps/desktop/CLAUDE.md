# CLAUDE.md — desktop

Ottie Desktop 桌面端。Tauri v2 + React。
内嵌 OpenClaw + Screenpipe（用户看不到）。
通过 OttieAgentAdapter 接口调 Agent，不直接调 OpenClaw。

依赖：@ottie-im/contracts、@ottie-im/ui、@ottie-im/matrix、@ottie-im/a2ui
Agent：来自 ottie-im/ottie-agent 仓库（npm install @ottie-im/ottie-agent）

不能做的事：
- ❌ 不直接 import OpenClaw 或 Screenpipe API（通过 OttieAgentAdapter）
- ❌ 不改 contracts
- ❌ 不在桌面端 UI 里显示 OpenClaw / Screenpipe 品牌
