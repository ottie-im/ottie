# Ottie 主仓库 — 项目状态

> 最后更新：2026-04-08

## 当前进度

| Phase | 状态 | 完成日期 |
|-------|------|---------|
| Phase -1: 建仓库 | ✅ 完成 | 2026-04-07 |
| Phase 0: 服务器 | ✅ 完成（在 server 仓库） | 2026-04-07 |
| Phase 1: 接口 + 通信层 | ✅ 完成 | 2026-04-08 |
| Phase 2: 默认 Agent | ✅ 完成（在 ottie-agent 仓库） | 2026-04-08 |
| Phase 3: 界面层 | 🔨 进行中 | |
| Phase 4: 设备感知 | ⬜ 未开始 | |
| Phase 5: 生态接入 | ⬜ 未开始 | |

## 已完成的事

### Phase 1 — packages/contracts/
- [x] 消息、设备、Agent 适配器等核心类型
- [x] 好友请求、好友分组、黑名单、消息撤回类型
- [x] OttieAgentAdapter 接口定义

### Phase 1 — packages/matrix/
- [x] OttieMatrix 类：登录/注册/登出
- [x] 消息收发 + 消息撤回
- [x] 好友管理：搜索、请求（需同意）、好友列表
- [x] 好友分组 + 黑名单
- [x] 9/9 集成测试通过（连接 localhost:8008 Tuwunel）

### 设计规范
- [x] DESIGN.md — 完整 9 section 设计规范（WhatsApp 风格、明亮、绿色调）
- [x] references/awesome-design-md/ — DESIGN.md 格式参考

## Phase 3 — 界面层（当前）

### 已确认的需求
- 先做桌面端（Tauri v2 + React）✅
- 明亮模式，WhatsApp 风格，绿色调 ✅
- 不用紫色，不用暗色模式 ✅
- 所有 UI 遵循 DESIGN.md ✅
- 基础功能优先，UI 后续迭代 ✅

### Step 3.1 — packages/ui/（共享组件库）
技术栈：React + TypeScript + CSS Modules（或 Tailwind）

- [ ] OttieBubble — 聊天气泡（outgoing/incoming/intent 三种）
- [ ] OttieApproval — 审批卡片（批准/编辑/拒绝）
- [ ] OttieInput — 输入框 + 发送按钮
- [ ] OttieSidebar — 侧边栏（会话列表 + 搜索）
- [ ] OttieChatHeader — 聊天头部（头像 + 名字 + 状态）
- [ ] OttieAvatar — 头像组件（图片/首字母回退）
- [ ] OttieFriendRequest — 好友请求卡片
- [ ] OttieLogin — 登录页面

### Step 3.2 — apps/desktop/（桌面端 App）
技术栈：Tauri v2 + React + Vite

- [ ] 初始化 Tauri v2 项目
- [ ] 搭建 React + Vite 前端
- [ ] 集成 packages/ui 组件
- [ ] 接入 OttieMatrix（登录、消息收发、好友）
- [ ] 接入 OttieAgentAdapter（改写、审批）
- [ ] 状态管理（Zustand）
- [ ] 路由：登录页 → 主界面（侧边栏 + 聊天）

### Step 3.3 — 端到端验证
- [ ] 登录 → 搜索用户 → 发好友请求 → 对方接受
- [ ] 输入意图 → Agent 改写 → 审批卡片 → 批准/编辑/拒绝 → 发送
- [ ] 对方收到消息 → 显示在聊天流中
- [ ] 消息撤回、拉黑

## 如何继续开发

```bash
# 1. 确保 Tuwunel 在跑
cd ~/Developer/ottie/server && docker compose up -d

# 2. 进入主仓库开发
cd ~/Developer/ottie/ottie
claude
> 读 STATUS.md、CLAUDE.md 和 DESIGN.md，继续 Phase 3
```

## 跨仓库依赖

```
ottie/packages/contracts/    ← 类型定义（所有仓库引用）
ottie/packages/matrix/       ← Matrix 通信（依赖 contracts）
ottie/packages/ui/           ← UI 组件（依赖 contracts）
ottie/apps/desktop/          ← 桌面端（依赖 ui + matrix + contracts）
                               ↓
ottie-agent/packages/adapter/ ← Agent 适配器（依赖 contracts，本地路径引用）
                               ↓
server/                       ← Tuwunel 服务器（独立，localhost:8008）
```

## 本地环境要求

- Node.js 22+, npm 11+
- Docker（运行 Tuwunel）
- Rust 工具链（Tauri v2 需要，`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`）
- Tuwunel 跑在 localhost:8008（注册 token: `ottie-dev-token`）
