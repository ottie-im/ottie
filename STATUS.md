# Ottie 主仓库 — 项目状态

> 最后更新：2026-04-08 23:30

## 当前进度

| Phase | 状态 | 完成日期 |
|-------|------|---------|
| Phase -1: 建仓库 | ✅ 完成 | 2026-04-07 |
| Phase 0: 服务器 | ✅ 完成（在 server 仓库） | 2026-04-07 |
| Phase 1: 接口 + 通信层 | ✅ 完成 | 2026-04-08 |
| Phase 2: 默认 Agent | ✅ 完成（在 ottie-agent 仓库） | 2026-04-08 |
| Phase 3: 界面层 + 7 里程碑 | ✅ 完成 | 2026-04-08 |
| 双向 Agent + LLM | ✅ 完成 + 验证 | 2026-04-08 |
| 功能验证 | ✅ 17/17 通过 | 2026-04-08 |
| 产品加固 P0-P2 | ✅ 完成 | 2026-04-08 |
| 架构修正 + 审查 | ✅ 全部合规 | 2026-04-08 |
| Phase 3 收尾（Agent切换+设备面板） | ✅ 完成 | 2026-04-08 |
| Tauri v2 打包 | ✅ .dmg 5.8MB | 2026-04-08 |
| Phase 4: 设备感知 | ✅ 完成 | 2026-04-08 |
| Phase 5: 生态接入（A2UI + Skills） | ✅ 基础完成 | 2026-04-08 |
| 移动端 App（React Native + 灵动岛） | ✅ 框架完成 | 2026-04-09 |

## 功能验证结果（全部通过）

| # | 功能 | 验证方式 | 结果 |
|---|------|---------|------|
| 1 | 用户注册/登录 | UI 真实登录 Tuwunel | ✅ |
| 2 | 文字消息收发 | UI 发送 + API 确认对方收到 | ✅ |
| 3 | 发送方改写（规则） | "问他去不去" → 去前缀 | ✅ |
| 4 | 发送方改写（LLM） | "延期两周语气委婉" → Claude 商务措辞 | ✅ |
| 5 | 发送方审批 | 批准/拒绝 UI 操作 | ✅ |
| 6 | 接收方意图识别 | Bob 邀请吃火锅 → Claude 识别为 invitation | ✅ |
| 7 | 接收方决策卡片 | [好呀][改时间][了解详情][自己说] 按钮 | ✅ |
| 8 | 接收方回复生成 | 点"好呀" → "听起来很棒！几点在哪里见面呢？" | ✅ |
| 9 | 图片上传 | API upload → m.image → 对方收到 | ✅ |
| 10 | 消息搜索 | API search（修了 filter 兼容 bug） | ✅ |
| 11 | 添加好友 | 注册 charlie → 邀请 → 接受 → 互发消息 | ✅ |
| 12 | 设置改名 | profile API | ✅ |
| 13 | 消息时间排序 | 历史消息正序显示 | ✅ |
| 14 | 侧边栏选中 | 绿色竖条 + 白色背景 | ✅ |
| 15 | 联系人面板 | 好友列表 + 请求 + 搜索添加 三栏 | ✅ |
| 16 | 设置页 | 头像 + 昵称编辑 + 黑名单 | ✅ |
| 17 | 自动测试 | Matrix 9/9 + Agent 18/18 = 27/27 | ✅ |

## 已修复的 Bug

| Bug | 修复 |
|-----|------|
| matrix-js-sdk 无 default export | 改为 `import * as sdk` |
| Tuwunel 要求 registration_token | 添加 token 配置 |
| Tuwunel 不读默认配置路径 | docker-compose 添加 `-c` 参数 |
| 消息时间倒序 | getMessages 结果 reverse() |
| 搜索 API 需要 filter 字段 | 添加 `filter: {}` |

## 已完成的模块

### packages/contracts/ — 类型系统（258 行）
所有模块共享的接口定义。

### packages/matrix/ — Matrix 通信层（~600 行）
OttieMatrix 类：登录/注册/登出、消息收发+撤回、好友管理、typing/presence/receipt、图片+文件上传、个人资料、消息搜索。

### packages/ui/ — 共享组件库（12 个组件，~1400 行）
OttieAvatar, OttieBubble, OttieApproval, OttieInput, OttieSidebar, OttieChatHeader, OttieLogin, OttieFriendRequest, OttieContactPanel, OttieSettingsPage, OttieSearchPanel, OttieDecisionCard。

### apps/desktop/ — 桌面端 App（~1000 行）
Vite + React 19 + Zustand + OpenAI SDK。真实 Matrix 通信 + LLM 双向 Agent。

## LLM 配置

`apps/desktop/.env`（已 gitignore）：
```
VITE_LLM_BASE_URL=https://aihubmix.com/v1
VITE_LLM_API_KEY=<key>
VITE_LLM_MODEL=claude-sonnet-4-20250514
```
支持：OpenAI、AIHubMix 中转、Ollama 本地、任何 OpenAI 兼容端点。
不配置 = 规则引擎降级。

## 已完成的额外工作

- [x] P0: 服务器地址可配置（VITE_MATRIX_URL 环境变量）
- [x] P0: SOUL.md 人格文件
- [x] P0-P2: 产品加固（错误处理/重连/缓存/loading/空状态）
- [x] 架构修正（Agent 逻辑从 IM 层移回 adapter）
- [x] Tauri v2 打包（.dmg 5.8MB）

## 下一步

### 待用户操作（跳过，等准备好再做）
- [ ] 买域名（如 ottie.app）
- [ ] 租 VPS（2C4G，推荐 Hetzner/Vultr/DigitalOcean）
- [ ] 部署 Tuwunel 到公网（改 VITE_MATRIX_URL 即可连接）
- [ ] 配置 Caddy TLS（server 仓库的 Caddyfile 已准备好）

### 可以继续做的
- [ ] Google OIDC 登录
- [ ] 端到端加密（Matrix E2EE）
- [ ] 移动端 App（React Native）
- [ ] 群聊
- [ ] QR 码 + 链接邀请加好友
- [ ] 消息引用回复
- [ ] A2A 协议接入（@a2a-js/sdk）
- [ ] MCP 工具调用
- [ ] Windows/Linux 打包
- [ ] 图片压缩/缩略图

### 长期
- [ ] Screenpipe 设备感知（Phase 4）
- [ ] A2UI + A2A + MCP（Phase 5）
- [ ] 更多 Agent Skills
- [ ] 托管平台

## 如何继续开发

```bash
cd ~/Developer/ottie/server && docker compose up -d  # 确保 Tuwunel 在跑
cd ~/Developer/ottie/ottie
claude
> 读 STATUS.md、CLAUDE.md 和 DESIGN.md，继续开发
```

## 代码统计

- 源文件：38 个 .ts/.tsx
- 代码量：~5,500 行
- 测试：27/27 通过
- UI 组件：12 个
- 已验证功能：17/17
