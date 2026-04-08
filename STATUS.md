# Ottie 主仓库 — 项目状态

> 最后更新：2026-04-08 21:10

## 当前进度

| Phase | 状态 | 完成日期 |
|-------|------|---------|
| Phase -1: 建仓库 | ✅ 完成 | 2026-04-07 |
| Phase 0: 服务器 | ✅ 完成（在 server 仓库） | 2026-04-07 |
| Phase 1: 接口 + 通信层 | ✅ 完成 | 2026-04-08 |
| Phase 2: 默认 Agent | ✅ 完成（在 ottie-agent 仓库） | 2026-04-08 |
| Phase 3: 界面层 | ✅ 完成 | 2026-04-08 |
| 双向 Agent + LLM | ✅ 完成 | 2026-04-08 |
| 功能验证 + 修复 | 🔨 进行中 | |
| 打包 + 部署 | ⬜ 未开始 | |

## 已验证通过（真实运行）

| 功能 | 验证方式 | 结果 |
|------|---------|------|
| Tuwunel 服务器 | curl + docker | ✅ |
| 用户注册/登录 | UI + API | ✅ |
| 文字消息收发 | UI 发送 + API 确认 Bob 收到 | ✅ |
| Agent 规则改写 | "问他去不去" → 去前缀 | ✅ |
| Agent LLM 改写 | "延期两周，语气委婉" → Claude 生成商务措辞 | ✅ |
| 发送方审批（批准/拒绝） | UI 操作 | ✅ |
| 消息时间排序 | 17:34 → 19:13 正序 | ✅ |
| 侧边栏选中状态 | 绿色竖条 + 白色背景 | ✅ |
| Matrix 集成测试 | 9/9 通过 | ✅ |
| Agent 适配器测试 | 18/18 通过 | ✅ |

## 已写但未验证（需要逐个测试）

| 功能 | 风险 | 验证计划 |
|------|------|---------|
| 图片上传 | 🔴 高 | 在 UI 点 📎 选图片，确认缩略图显示 + 对方能下载 |
| 文件上传 | 🔴 高 | 在 UI 点 📎 选文件，确认文件名显示 + 对方能下载 |
| 接收方决策卡片 | 🟡 中 | Bob 发消息给 Alice，确认蓝色决策卡片弹出 |
| 联系人搜索 + 添加好友 | 🟡 中 | 注册新用户 → 搜索 → 发请求 → 接受 → 出现在好友列表 |
| 设置页改昵称 | 🟡 中 | 改名 → 刷新 → 确认生效 |
| 设置页改头像 | 🟡 中 | 上传图片 → 确认头像更新 |
| 消息搜索 | 🟡 中 | 搜索关键词 → 确认结果列表 |
| 已读蓝勾 | 🟢 低 | 发消息 → 对方打开 → 确认变蓝 |
| 正在输入提示 | 🟢 低 | 双窗口，一边打字一边看 |
| 在线状态绿点 | 🟢 低 | 登录/登出，确认绿点变化 |
| 消息撤回 | 🟢 低 | API 已验证，UI 入口未做 |
| 黑名单 | 🟢 低 | 设置页有列表，拉黑操作未验证 |

## 已完成的模块清单

### packages/contracts/ — 类型系统（258 行）
所有模块共享的接口定义。包含：OttieMessage, Friend, FriendRequest, FriendGroup, BlockedUser, MessageRecall, OttieAgentAdapter, AgentCard, OttieDevice, MemoryEntry, A2UIPayload, OttieScreenEvent 等。

### packages/matrix/ — Matrix 通信层（~600 行）
OttieMatrix 类，完整 API：登录/注册/登出、消息收发+撤回、好友管理（搜索/请求/接受/分组/黑名单）、typing/presence/receipt、图片+文件上传（mxc://）、个人资料、消息搜索。

### packages/ui/ — 共享组件库（11 个组件，~1200 行）
OttieAvatar, OttieBubble（含已读勾+媒体）, OttieApproval, OttieInput（含📎附件）, OttieSidebar（含💬/👤/⚙️切换）, OttieChatHeader（含typing提示）, OttieLogin, OttieFriendRequest, OttieContactPanel, OttieSettingsPage, OttieSearchPanel, OttieDecisionCard。

### apps/desktop/ — 桌面端 App（~800 行）
Vite + React 19 + Zustand。真实连接 Tuwunel。LLM 改写（Claude via AIHubMix）。双向 Agent：发送方改写+审批，接收方意图识别+决策卡片。

### 未实现的模块
- packages/a2ui/ — A2UI 渲染器（空壳，Phase 5）
- apps/mobile/ — 移动端 App（空壳）

## 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| matrix-js-sdk | ^34.13.0 | Matrix 协议通信 |
| openai | ^6.33.0 | LLM 调用（多模型统一接口） |
| react | ^19.0.0 | UI 框架 |
| zustand | ^5.0.0 | 状态管理 |
| lucide-react | ^0.500.0 | 图标 |
| vite | ^6.0.0 | 打包 |
| turbo | ^2.0.0 | Monorepo |
| vitest | ^4.1.3 | 测试 |
| typescript | ^5.5.0 | 类型系统 |

## LLM 配置

通过环境变量 `apps/desktop/.env`（已 gitignore）：
```
VITE_LLM_BASE_URL=https://aihubmix.com/v1
VITE_LLM_API_KEY=<your-key>
VITE_LLM_MODEL=claude-sonnet-4-20250514
```
支持：OpenAI 直连、AIHubMix 中转、Ollama 本地、任何 OpenAI 兼容端点。
不配置 = 自动降级到规则引擎（免费，离线可用）。

## 长期路线图

### 近期（功能验证 + 修复）
- [ ] 逐个验证上表"已写但未验证"的 12 项功能
- [ ] 修复发现的 bug
- [ ] 更新 STATUS.md 记录验证结果

### 中期（可演示产品）
- [ ] 安装 Rust + Tauri v2 壳 → .dmg/.exe 安装包
- [ ] 域名 + VPS → 公网部署
- [ ] Google OIDC 登录
- [ ] 端到端加密（Matrix E2EE）
- [ ] 离线缓存 + 断网重连
- [ ] 推送通知
- [ ] 错误处理完善

### 长期（完整产品）
- [ ] 移动端 App（React Native）
- [ ] 群聊
- [ ] Screenpipe 设备感知（Phase 4）
- [ ] A2UI 渲染器 + A2A 协议（Phase 5）
- [ ] 更多 Agent Skills（人格/信任/值班/OTA）
- [ ] 托管平台

## 如何继续开发

```bash
# 1. 确保 Tuwunel 在跑
cd ~/Developer/ottie/server && docker compose up -d

# 2. 进入主仓库
cd ~/Developer/ottie/ottie
claude
> 读 STATUS.md、CLAUDE.md 和 DESIGN.md，继续开发

# 3. 启动桌面端
cd apps/desktop && npx vite --port 3000
```

## 跨仓库依赖

```
ottie/packages/contracts/     ← 类型定义（所有仓库引用）
ottie/packages/matrix/        ← Matrix 通信（contracts + matrix-js-sdk）
ottie/packages/ui/            ← UI 组件（contracts + lucide-react）
ottie/apps/desktop/           ← 桌面端（ui + matrix + zustand + openai）
                                ↓
ottie-agent/packages/llm/     ← LLM 抽象层（openai SDK）
ottie-agent/packages/adapter/ ← Agent 适配器（contracts + skills + memory）
ottie-agent/packages/skills/  ← Skills（contracts）
ottie-agent/packages/memory/  ← 记忆（contracts + fs）
                                ↓
server/                        ← Tuwunel（Docker，localhost:8008，token: ottie-dev-token）
```

## 本地环境

- Node.js 25+, npm 11+, Docker 29+
- Tuwunel：localhost:8008，token `ottie-dev-token`
- 已有用户：alice/alice123, bob/bob123
- Rust 未安装（Tauri 需要）
- LLM：配置在 apps/desktop/.env

## 代码统计

- 源文件：35+ 个 .ts/.tsx
- 代码量：~5,200 行
- 测试：27/27 通过（Matrix 9 + Agent 18）
- UI 组件：11 个
