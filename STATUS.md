# Ottie 主仓库 — 项目状态

> 最后更新：2026-04-08

## 当前进度

| Phase | 状态 | 完成日期 |
|-------|------|---------|
| Phase -1: 建仓库 | ✅ 完成 | 2026-04-07 |
| Phase 0: 服务器 | ✅ 完成（在 server 仓库） | 2026-04-07 |
| Phase 1: 接口 + 通信层 | ✅ 完成 | 2026-04-08 |
| Phase 2: 默认 Agent | ✅ 完成（在 ottie-agent 仓库） | 2026-04-08 |
| Phase 3: 界面层 | ✅ 完成 | 2026-04-08 |
| Phase 4: 设备感知 | ⬜ 未开始 | |
| Phase 5: 生态接入 | ⬜ 未开始 | |

## Phase 3 已完成的所有内容

### packages/contracts/ — 类型系统 ✅
- 消息、设备、Agent 适配器等核心类型
- 好友请求、好友分组、黑名单、消息撤回类型
- OttieAgentAdapter 接口定义
- 258 行，所有模块共享

### packages/matrix/ — Matrix 通信层 ✅
- OttieMatrix 类，完整 API：
  - 登录/注册/登出
  - 消息收发 + 消息撤回
  - 好友管理（搜索/请求/接受/分组/黑名单）
  - 正在输入（sendTyping/onTyping）
  - 在线状态（setPresence/onPresenceChange/getPresence）
  - 已读回执（sendReadReceipt/onReadReceipt）
  - 图片+文件上传（uploadContent/sendImageMessage/sendFileMessage）
  - 个人资料（setDisplayName/setAvatar/getProfile）
  - 消息搜索（searchMessages）
- 9/9 集成测试通过（连接 localhost:8008 Tuwunel）

### packages/ui/ — 共享组件库 ✅
10 个组件，全部遵循 DESIGN.md（WhatsApp 风格、绿色调、明亮模式）：
- OttieAvatar — 头像（图片/首字母回退 + 在线绿点）
- OttieBubble — 聊天气泡（outgoing/incoming/intent + 已读勾 + 图片/文件）
- OttieApproval — 审批卡片（批准/编辑/拒绝）
- OttieInput — 输入框 + 发送按钮 + 📎 附件按钮
- OttieSidebar — 侧边栏（会话列表 + 搜索 + 💬/👤/⚙️ 视图切换）
- OttieChatHeader — 聊天头部（头像 + 名字 + 在线/正在输入）
- OttieLogin — 登录/注册页
- OttieFriendRequest — 好友请求卡片
- OttieContactPanel — 联系人面板（好友/请求/搜索添加 三栏）
- OttieSettingsPage — 设置页（头像上传 + 昵称 + 黑名单）
- OttieSearchPanel — 搜索面板

### apps/desktop/ — 桌面端 App ✅
- Vite + React 19 + Zustand 状态管理
- 真实连接 Tuwunel（localhost:8008），真实 Matrix 通信
- 登录页 → 主界面路由 → 设置页路由
- 完整聊天：消息从底部堆叠、时间正序、侧边栏绿色选中条
- Agent 改写 + 审批流程（意图 → 改写 → 批准/拒绝 → 真实发送）
- 7 个里程碑全部完成：typing/presence/receipt/media/contacts/settings/search

### 未实现的模块
- packages/a2ui/ — A2UI 渲染器（空壳，Phase 5）
- apps/mobile/ — 移动端 App（空壳，未开始）

## 技术栈和依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| matrix-js-sdk | ^34.13.0 | Matrix 协议通信 |
| react | ^19.0.0 | UI 框架 |
| react-dom | ^19.0.0 | DOM 渲染 |
| zustand | ^5.0.0 | 状态管理 |
| lucide-react | ^0.500.0 | 图标 |
| vite | ^6.0.0 | 打包 |
| turbo | ^2.0.0 | Monorepo |
| vitest | ^4.1.3 | 测试 |
| typescript | ^5.5.0 | 类型系统 |

## 下一步（按优先级排序）

### 工程化（上线必须）
- [ ] 安装 Rust + Tauri v2 壳 → 打 .dmg/.exe 安装包
- [ ] 域名 + VPS + Caddy TLS → 公网部署
- [ ] Google OIDC 登录
- [ ] 端到端加密（Matrix E2EE）
- [ ] 离线缓存 + 断网重连
- [ ] 系统推送通知
- [ ] 错误处理 + loading 状态完善

### 功能增强
- [ ] 群聊（Phase 3 确认暂不做，后续再加）
- [ ] QR 码加好友
- [ ] 消息引用回复
- [ ] 图片压缩/缩略图
- [ ] 消息转发

### Phase 4: 设备感知（在 ottie-agent 仓库）
- [ ] Screenpipe 集成
- [ ] GUI 弹窗检测 + CLI 变动监听
- [ ] 记忆上报个人 Agent

### Phase 5: 生态接入
- [ ] A2UI 渲染器
- [ ] A2A 协议
- [ ] MCP 工具调用
- [ ] 第三方 Agent 接入
- [ ] 托管平台

## 如何继续开发

```bash
# 1. 确保 Tuwunel 在跑
cd ~/Developer/ottie/server && docker compose up -d

# 2. 进入主仓库开发
cd ~/Developer/ottie/ottie
claude
> 读 STATUS.md、CLAUDE.md 和 DESIGN.md，继续开发

# 3. 启动桌面端预览
cd apps/desktop && npx vite --port 3000
```

## 跨仓库依赖

```
ottie/packages/contracts/    ← 类型定义（所有仓库引用）
ottie/packages/matrix/       ← Matrix 通信（依赖 contracts + matrix-js-sdk）
ottie/packages/ui/           ← UI 组件（依赖 contracts + lucide-react）
ottie/apps/desktop/          ← 桌面端（依赖 ui + matrix + zustand）
                               ↓
ottie-agent/packages/adapter/ ← Agent 适配器（依赖 contracts，本地路径引用）
ottie-agent/packages/skills/  ← Skills（依赖 contracts）
ottie-agent/packages/memory/  ← 记忆（依赖 contracts + fs）
                               ↓
server/                       ← Tuwunel（独立，localhost:8008，token: ottie-dev-token）
```

## 本地环境

- Node.js 25+, npm 11+
- Docker 29+（运行 Tuwunel）
- Tuwunel：localhost:8008，注册 token `ottie-dev-token`
- 已有测试用户：alice/alice123, bob/bob123
- Rust 未安装（Tauri 需要）

## 代码统计

- 总文件数：32 个 .ts/.tsx 源文件
- 总代码量：~3,900 行
- 测试：27/27 通过（Matrix 9 + Agent 18）
