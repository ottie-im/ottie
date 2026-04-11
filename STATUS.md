# Ottie 主仓库 — 项目状态

> 最后更新：2026-04-10

## 当前进度

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase -1: 建仓库 | ✅ 完成 | 3 仓结构已建立：`ottie` / `ottie-agent` / `server` |
| Phase 0: 服务器 | ✅ 完成 | 公网 production 部署通过（ottie.claws.company + Caddy TLS） |
| Phase 1: 接口 + 通信层 | ✅ 完成 | `packages/contracts` + `packages/matrix` 全面可用 |
| Phase 2: 默认 Agent | ✅ 完成 | OpenClaw gateway 真正接入，改写/审批/设备调度全链路通过 |
| Phase 3: 界面层 + 核心桌面链路 | ✅ 完成 | 桌面端登录→聊天→审批→设备指令→退出登录全链路可用 |
| Phase 4: 设备感知 | ✅ 核心通过 | OpenClaw 设备 Agent 真正执行 exec/browser/web_search，返回真实结果 |
| Phase 5: 生态接入 | 🟡 基础完成 | A2UI renderer + A2A adapter 代码存在，尚未产品化 |
| 移动端 App | ✅ 构建通过 | Expo export 成功，login/聊天可用 |
| Tauri 打包 | ✅ 通过 | Ottie_0.1.0_aarch64.dmg (5.8MB) 构建并运行验证通过 |
| 公网部署 | ✅ 通过 | 双用户公网端到端聊天 + 审批全链路验证通过 |

## 给后续 AI 的短结论

- **最稳定的主链路**：桌面端 1v1 IM + 发送侧改写审批 + 接收侧意图识别/建议回复 + 设备指令调度
- **OpenClaw 已真正接入**：adapter 通过 `openclaw agent` CLI 与 gateway 通信，设备 Agent 使用 OpenClaw 内置工具（exec/browser/web_search）真正执行操作
- **Tauri sidecar**：Rust 后端自动 spawn/kill OpenClaw gateway + Screenpipe，前端通过 Tauri IPC 桥接
- **公网验证通过**：ottie.claws.company 上双用户聊天 + 审批 + 设备指令全链路跑通
- **测试全通过**：ottie 9/9 tasks, ottie-agent 12/12 tasks + 36 adapter tests
- **安全修复**：OAuth secret 从 git 移除，改用 .env 注入

## 已验证能力

| # | 功能 | 状态 | 验证方式 |
|---|------|------|---------|
| 1 | 用户注册 / 登录 | ✅ | 公网 + 本地 |
| 2 | 登录状态保存（重启不丢） | ✅ | localStorage 持久化 |
| 3 | 退出登录 + 换账号 | ✅ | 设置页"退出登录"按钮 |
| 4 | 文字消息收发 | ✅ | 公网双用户验证 |
| 5 | 发送方改写（规则引擎） | ✅ | gateway 不可用时自动降级 |
| 6 | 发送方改写（OpenClaw LLM） | ✅ | 通过 OpenClaw gateway 真正调用 |
| 7 | 发送方审批 | ✅ | 审批卡片：批准/编辑/拒绝 |
| 8 | 接收方意图识别 | ✅ | 决策卡片 + 建议回复 |
| 9 | 设备指令调度 | ✅ | "帮我在电脑上搜..."→ dispatch → device agent |
| 10 | 设备 Agent 真正执行（exec） | ✅ | `ls ~/Desktop` 返回真实文件列表 |
| 11 | 设备 Agent 真正执行（web_search） | ✅ | 搜索爬山路线返回真实网页链接 |
| 12 | 图片 / 文件上传 | ✅ | Matrix upload |
| 13 | 消息搜索 | ✅ | Matrix search |
| 14 | 添加好友链路 | ✅ | API 存在且测试覆盖 |
| 15 | 设置改名 / 头像 / 黑名单 | ✅ | 桌面设置页 |
| 16 | 消息引用回复 | ✅ | Matrix replyTo + UI 引用气泡 |
| 17 | 聊天记录持久化 | ✅ | Docker 重启后数据不丢 |
| 18 | 聊天记录跨设备同步 | ✅ | 同一账号 Desktop + API 验证 |
| 19 | Storybook 组件预览 | ✅ | 8 个组件 stories 全部可渲染 |
| 20 | Tauri .dmg 安装包 | ✅ | 5.8MB, 原生启动验证通过 |
| 21 | Mobile Expo 构建 | ✅ | `expo export` 成功 |
| 22 | `npx tsc --noEmit` | ✅ | 两个仓库所有 package 零错误 |
| 23 | `npm test` | ✅ | ottie 9/9 tasks, ottie-agent 12/12 tasks |

## 当前测试状态

- `ottie` 仓库 `npx turbo test`：**9/9 tasks 通过**（matrix + ui + a2ui + contracts + desktop + mobile）
- `ottie-agent` 仓库 `npx turbo test`：**12/12 tasks 通过**（adapter 36 tests + 其他 packages）
- TypeScript 编译：**全部通过**（两个仓库 10+ packages 零错误）

## OpenClaw 接入状态

| 组件 | 状态 |
|------|------|
| `openclaw` CLI 安装 | ✅ v2026.4.9 |
| OpenClaw gateway 启动 | ✅ 端口 18789 |
| `config/openclaw.json` 双 Agent 配置 | ✅ personal + device |
| `config/personal/SOUL.md` 个人 Agent 人格 | ✅ 改写/审批/调度规则 |
| `config/device/SOUL.md` 设备 Agent 人格 | ✅ 执行/报告规则 |
| Tauri Rust sidecar 进程管理 | ✅ spawn/kill + gateway-ready 事件 |
| Tauri IPC `openclaw_agent` 命令 | ✅ Rust 桥接 CLI 调用 |
| `OpenClawAdapter` 重写 | ✅ 从模拟变为真正 gateway 客户端 |
| 设备 Agent exec 工具 | ✅ 真正执行 shell 命令 |
| 设备 Agent web_search 工具 | ✅ 真正搜索网页 |
| 设备 Agent browser 工具 | ✅ 可用（通过 gateway） |
| 规则引擎降级 | ✅ gateway 不可用时自动降级 |

## 本轮修复的问题（2026-04-09 ~ 04-10）

| # | 修复 | 仓库 |
|---|------|------|
| 1 | Turborepo 全局安装 v2.9.5 | 环境 |
| 2 | Google OAuth secret 从 git 移除，改用 .env 注入 | server |
| 3 | OttieBubble type 重命名 (agent-output / user-intent) | ottie |
| 4 | Desktop/Mobile 代码同步更新新 type 名 | ottie |
| 5 | ottie-agent 添加 turbo.json + packageManager | ottie-agent |
| 6 | Mobile build 脚本 eas→expo export + 排除 web 平台 | ottie |
| 7 | A2UI catalog 添加 text-field 组件 | ottie |
| 8 | 3 个 CLAUDE.md 补全"不能做的事" | ottie |
| 9 | 新增 4 个 Storybook stories | ottie |
| 10 | 移除 6 处 console.log 残留 | ottie + ottie-agent |
| 11 | vitest 添加 --run / --passWithNoTests | ottie + ottie-agent |
| 12 | 退出登录 + 换账号功能 | ottie |
| 13 | OpenClaw 真正接入（config + sidecar + adapter 重写） | ottie + ottie-agent |
| 14 | Tuwunel setup.sh 模板化 + 域名/OAuth 环境变量注入 | server |

## 已完成的模块

### packages/contracts/
共享类型系统，30+ 接口/类型。

### packages/matrix/
Matrix 通信层，已含登录/注册、消息收发与撤回、好友管理、typing/presence/read receipt、上传、个人资料、搜索、replyTo。

### packages/ui/
共享 UI 组件库，**17 个组件** + **8 个 Storybook stories**：
`OttieAgentSelector`, `OttieApproval`, `OttieAvatar`, `OttieBubble`, `OttieChatHeader`, `OttieConnectionBar`, `OttieContactPanel`, `OttieDecisionCard`, `OttieDevicePanel`, `OttieFriendRequest`, `OttieInput`, `OttieLogin`, `OttieScreenNotification`, `OttieSearchPanel`, `OttieSettingsPage`, `OttieSidebar`, `OttieToast`

### packages/a2ui/
A2UI renderer + catalog（含 text-field），属于生态基础设施。

### apps/desktop/
Vite + React 19 + Zustand + Tauri v2。内嵌 OpenClaw gateway（sidecar）。全项目最完整的链路。

### apps/mobile/
Expo Router，login + 聊天列表 + 聊天详情完成。`expo export` 构建通过。

## Agent 配置

Desktop 应用通过 Tauri sidecar 启动 OpenClaw gateway，adapter 通过 Tauri IPC 调用 `openclaw agent` CLI：

```
apps/desktop/config/
├── openclaw.json          ← 双 Agent 配置（personal + device）
├── personal/SOUL.md       ← 个人 Agent 人格
└── device/SOUL.md         ← 设备 Agent 人格
```

gateway 不可用时自动降级到规则引擎。

## 下一步

### 已完成 ✅

- [x] 修复根目录 `npm test`
- [x] Tauri .dmg 打包
- [x] 公网部署 + 端到端验证
- [x] 退出登录 / 换账号
- [x] OpenClaw 设备 Agent 接入
- [x] 安全修复（OAuth secret 迁移）

### 可以继续做的（按优先级）

- [ ] 桌面端：Screenpipe 内嵌到 Tauri 安装包
- [ ] 桌面端：把好友请求列表接上 `onFriendRequest`
- [ ] 移动端：联系人页与设置页落地
- [ ] 移动端：审批/决策流接入真实消息链路
- [ ] Google OIDC 登录（移动端）
- [ ] 端到端加密（Matrix E2EE）
- [ ] 群聊
- [ ] QR 码 / 链接邀请加好友
- [ ] A2A 协议接入
- [ ] MCP 工具调用
- [ ] Windows / Linux 打包

### 长期

- [ ] A2UI 在真实消息流中的产品化落地
- [ ] 更多 Agent Skills 的实际工作流接入
- [ ] 托管平台

## 如何继续开发

```bash
# 启动服务器
cd ~/Developer/ottie/server && ./setup.sh localhost local

# 启动 OpenClaw gateway（开发模式手动启动）
openclaw gateway run --port 18789 --auth none

# 桌面端开发
cd ~/Developer/ottie/ottie/apps/desktop && npm run dev

# 或者用 Claude Code
cd ~/Developer/ottie/ottie
claude
> 先读 STATUS.md、CLAUDE.md
```

## 代码统计

- 源文件：**50+** 个 `.ts/.tsx`
- UI 组件：**17** 个
- Storybook stories：**8** 个
- 测试：**ottie 9/9 tasks + ottie-agent 12/12 tasks (36 adapter tests)**
- OpenClaw Skills：**9** 个
