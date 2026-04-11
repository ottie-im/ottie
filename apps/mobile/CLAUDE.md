# CLAUDE.md — mobile

Ottie App 移动端。React Native + Expo。
手机不是设备 Agent，是 IM 客户端 + 审批面板 + 设备遥控器。
不跑 OpenClaw 或 Screenpipe。

依赖：@ottie-im/contracts、matrix-js-sdk、zustand、expo-router
注意：移动端不使用 @ottie-im/ui（那是 web 组件），用 React Native 原生组件重写。
不依赖 @ottie-im/a2ui（移动端暂不渲染 A2UI）。

不能做的事：
- ❌ 不使用 @ottie-im/ui（那是 web 组件）
- ❌ 不引入 OpenClaw 或 Screenpipe
- ❌ 不改 contracts
