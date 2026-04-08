# Ottie 移动端开发计划

> 在 ottie/apps/mobile/ 下工作，React Native + Expo

## 定位

移动端**不是桌面端的复刻**。它是：
- IM 客户端（聊天收发）
- 审批面板（Agent 拟稿的审批）
- 设备遥控器（给桌面端发指令）
- 通知接收器（设备 Agent 的屏幕感知推送）
- 灵动岛实时状态

**不做：**
- 不跑 Agent/OpenClaw
- 不跑 Screenpipe
- 不做 LLM 推理（Agent 跑在桌面端/服务器上）

## 灵动岛（Dynamic Island / Live Activities）

Ottie 的灵动岛场景：

| 场景 | 灵动岛显示 | 触发时机 |
|------|----------|---------|
| Agent 正在改写 | 🦦 "Ottie 思考中..." | 用户发送消息后 |
| 审批待处理 | ✉️ "1 条待审批" | Agent 拟好消息 |
| 新消息（含决策） | 📩 "Bob: 吃饭吗？" + [好的][拒绝] | 对方发消息 + 意图识别 |
| 设备通知 | 🖥️ "电脑请求权限" + [允许][拒绝] | 设备 Agent 推送 |

技术：[expo-widgets](https://docs.expo.dev/versions/latest/sdk/widgets/) + Live Activities API

## 技术栈

| 技术 | 用途 |
|------|------|
| React Native | 框架 |
| Expo SDK 52+ | 开发工具、构建、OTA |
| expo-widgets | 灵动岛 / Live Activities |
| Zustand | 状态管理（同桌面端） |
| matrix-js-sdk | Matrix 通信 |
| @ottie-im/contracts | 共享类型 |
| expo-notifications | 推送通知 |

注意：`packages/ui` 的 web 组件**不能直接用**，需要用 React Native 原语（View, Text, TouchableOpacity）重写。

## 页面结构

```
App
├── LoginScreen          — 登录/注册
├── MainTabs
│   ├── ChatsTab         — 会话列表
│   │   └── ChatScreen   — 聊天详情（气泡 + 审批 + 决策）
│   ├── ContactsTab      — 好友/请求/搜索
│   └── SettingsTab      — 个人/Agent/设备/黑名单
└── NotificationCenter   — 设备通知列表
```

## 实施步骤

### Step M1 — 项目初始化 (Small)
- [ ] 初始化 Expo 项目（apps/mobile/）
- [ ] 配置 TypeScript + 导航（expo-router 或 react-navigation）
- [ ] 连接 @ottie-im/contracts 类型
- [ ] 验证 matrix-js-sdk 在 React Native 环境可用

### Step M2 — 核心 UI 组件 (Medium)
React Native 版的 Ottie 组件（遵循 DESIGN.md 设计规范）：
- [ ] OttieBubbleNative — 聊天气泡（outgoing/incoming/intent）
- [ ] OttieApprovalNative — 审批卡片
- [ ] OttieDecisionNative — 决策卡片
- [ ] OttieInputNative — 输入框 + 发送按钮
- [ ] OttieAvatarNative — 头像

### Step M3 — 登录 + 聊天 (Medium)
- [ ] LoginScreen: 用户名密码登录（连 Tuwunel）
- [ ] ChatsTab: 会话列表（从 Matrix rooms 加载）
- [ ] ChatScreen: 消息收发（通过 OttieMatrix）
- [ ] 审批流程：Agent 拟稿 → 审批卡片 → 批准/拒绝
- [ ] 决策流程：收到消息 → 意图识别 → 决策卡片

### Step M4 — 灵动岛 (Medium)
- [ ] 安装 expo-widgets
- [ ] Live Activity: Agent 改写进行中
- [ ] Live Activity: 审批待处理
- [ ] Live Activity: 新消息快捷回复
- [ ] Compact / Minimal / Expanded 三种尺寸适配

### Step M5 — 设备遥控 + 通知 (Medium)
- [ ] 设备面板：显示在线桌面设备
- [ ] 发送指令：给桌面设备发命令
- [ ] 接收通知：设备 Agent 的屏幕感知推送
- [ ] expo-notifications: 本地推送 + 后台推送

### Step M6 — 联系人 + 设置 (Small)
- [ ] ContactsTab: 好友列表、请求、搜索
- [ ] SettingsTab: 个人信息、Agent 信息、设备列表、黑名单

## 验收点

- [ ] 手机登录同一个账号，能看到桌面端的所有聊天记录
- [ ] 手机发消息 → Agent 改写 → 审批 → 桌面端看到
- [ ] 桌面端发消息 → 手机收到 + 决策卡片
- [ ] 灵动岛显示审批状态
- [ ] 手机给桌面发"把文件发给他"指令

## 注意事项

1. **Agent 不在手机上跑** — 手机通过 Matrix 消息跟桌面端的 Agent 通信
2. **matrix-js-sdk 兼容性** — 可能需要 polyfill（crypto、fetch、storage）
3. **局域网测试** — 手机和电脑在同一 WiFi，用电脑 IP 连 Tuwunel
4. **DESIGN.md 一样遵守** — 颜色、字体、间距跟桌面端保持一致
