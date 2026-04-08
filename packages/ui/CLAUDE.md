# CLAUDE.md — ui

Ottie 共享 UI 组件库。移动端和桌面端共享。npm 包名：@ottie-im/ui

依赖：@ottie-im/contracts（只读）

核心组件：OttieBubble、OttieInput、OttieApproval、OttieDevicePanel、
OttieFriendRequest、OttieAgentSelector

不能做的事：
- ❌ 不改 contracts
- ❌ 不引入 Matrix SDK 或通信逻辑
- ❌ 不处理 A2UI 解析
