# Ottie 主仓库 — 项目状态

> 最后更新：2026-04-08 13:52 PDT

## 当前进度

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase -1: 建仓库 | ✅ 完成 | 3 仓结构已建立：`ottie` / `ottie-agent` / `server` |
| Phase 0: 服务器 | ✅ 完成（在 `server` 仓库） | 本地开发用 Tuwunel 可跑 |
| Phase 1: 接口 + 通信层 | ✅ 完成 | `packages/contracts` + `packages/matrix` 已可支撑桌面主链路 |
| Phase 2: 默认 Agent | ✅ 完成（在 `ottie-agent` 仓库） | 改写 / 审批 / 接收侧意图识别可用 |
| Phase 3: 界面层 + 核心桌面链路 | ✅ 完成 | 桌面端登录、聊天、审批、决策卡片、联系人/设置主界面可用 |
| 双向 Agent + LLM | ✅ 完成 | 桌面端支持规则引擎降级与 OpenAI 兼容端点 |
| 产品加固 P0-P2 | ✅ 完成 | 错误处理、缓存、重连、loading、空状态已补 |
| Phase 3 收尾（Agent 切换 + 设备面板） | 🟡 部分完成 | 相关 UI 组件已存在，但真实 Agent 切换 / 动态设备状态仍未接通 |
| Tauri v2 打包 | ✅ 已做过历史打包 | 仓库内保留 Tauri 工程；状态文件不再假设当前产物一定最新 |
| Phase 4: 设备感知 | 🟡 基础代码完成 | `ottie-agent` 中已有 screen / memory / 通知基础，但桌面默认未启用 `enableScreen` |
| Phase 5: 生态接入（A2UI + Skills） | 🟡 基础完成 | A2UI renderer 与 skills 模块存在，但产品主流程尚未真正消费 A2UI payload |
| 移动端 App（React Native） | 🟡 脚手架 + 基础聊天完成 | 已有 login、tabs、会话列表、聊天详情；联系人/设置仍是占位页 |
| 消息引用回复 | 🟡 底层完成一半 | Matrix `replyTo` 支持、UI 引用气泡与输入预览已写；桌面发送流尚未接线 |
| 文档入口 | ✅ 已同步 | README 已升级为中英双语，并补了组织级 profile README |

## 给后续 AI 的短结论

- **最稳定的主链路**：桌面端 1v1 IM + 发送侧改写审批 + 接收侧意图识别/建议回复
- **移动端现状**：已经不是空壳，但仍是“框架 + 基础聊天”，不是完整产品
- **Phase 4 / 5 现状**：代码基础比产品接线走得更快，不能把“包已存在”理解成“功能已打通”
- **测试现状**：包级测试能跑，但根目录 `npm test` 目前会被 Turborepo 配置问题拦住

## 已验证能力（桌面主链路）

| # | 功能 | 当前判断 | 备注 |
|---|------|---------|------|
| 1 | 用户注册 / 登录 | ✅ | 桌面端真实 Matrix 登录链路存在 |
| 2 | 文字消息收发 | ✅ | 主聊天链路已接通 |
| 3 | 发送方改写（规则） | ✅ | 默认规则引擎可用 |
| 4 | 发送方改写（LLM） | ✅ | 支持 OpenAI 兼容端点 |
| 5 | 发送方审批 | ✅ | Agent 拟稿 → 审批卡片 → 发出 |
| 6 | 接收方意图识别 | ✅ | 接收侧会触发决策卡片 |
| 7 | 接收方决策卡片 | ✅ | 建议动作按钮已接入桌面主流程 |
| 8 | 接收方回复生成 | ✅ | 选动作后可生成待审批回复 |
| 9 | 图片 / 文件上传 | ✅ | 已接入 Matrix upload |
| 10 | 消息搜索 | ✅ | 已接入 Matrix search |
| 11 | 添加好友链路 | ✅ | 发送邀请 / 接受邀请的 API 存在且测试覆盖 |
| 12 | 设置改名 / 头像 / 黑名单 | ✅ | 桌面设置页可用 |
| 13 | 历史消息排序 | ✅ | 聊天页已正序显示 |
| 14 | 侧边栏 / 会话切换 | ✅ | 已有缓存 + 轮询刷新 |
| 15 | 联系人面板（好友列表 + 搜索添加） | ✅ | 好友列表和搜索添加已接通 |
| 16 | 好友请求列表接线 | 🟡 | 组件已存在，但 `MainLayout` 当前传入 `friendRequests={[]}` |
| 17 | 自动测试入口 | 🟡 | 包级测试可跑；根目录 `npm test` 当前不可直接运行 |

## 当前测试状态（2026-04-08 审核）

- `ottie/packages/matrix`：`npm test` 通过，**9/9 tests passed**
- `ottie-agent/packages/adapter`：`npm test` 通过，**18/18 tests passed**
- `ottie` 仓库根目录 `npm test`：**失败**，Turbo 报 `Missing packageManager field in package.json`
- `ottie-agent` 仓库根目录 `npm test`：**失败**，同样被 Turbo 的 `packageManager` 校验拦住
- `packages/ui`：当前 **没有测试文件**，直接 `npm test` 会以 `No test files found` 退出
- `packages/a2ui`：当前 **没有测试文件**，直接 `npm test` 会以 `No test files found` 退出

## 当前未接通 / 占位的部分（很重要）

- 桌面端 `MainLayout` 目前没有订阅 `matrix.onFriendRequest()`，因此联系人面板的“请求”标签页还没有真实数据源
- 消息引用回复只完成了：
  - Matrix `replyTo` 事件关系支持
  - UI 引用气泡
  - 输入区 reply preview
  但 `MainLayout` 还没把 `replyingTo` / `onReply` 接进实际发送流
- 移动端已完成 login、tabs、会话列表、聊天详情页；`contacts` / `settings` 仍是“开发中”占位
- `apps/mobile/src/live-activity.ts` 仍是 scaffold，`expo-widgets` 调用被注释，尚未接到真实 UI / 系统能力
- 移动端服务地址目前硬编码为 `http://localhost:8008`，尚未环境化
- 桌面端初始化默认没有传 `enableScreen: true`，所以 device awareness 默认不会工作
- 设置页里的 AgentSelector / DevicePanel 当前仍偏展示性质：只有单个 agent，设备信息也是静态示例数据
- `packages/a2ui` 的 renderer 已完成，但主应用消息流目前并未真正渲染 A2UI payload

## 已修复的 Bug（仍然有效）

| Bug | 修复 |
|-----|------|
| `matrix-js-sdk` 无 default export | 改为 `import * as sdk` |
| Tuwunel 要求 `registration_token` | 添加 token 配置 |
| Tuwunel 不读默认配置路径 | `docker-compose` 添加 `-c` 参数 |
| 消息时间倒序 | `getMessages()` 结果 `reverse()` |
| 搜索 API 需要 `filter` 字段 | 添加 `filter: {}` |

## 已完成的模块

### packages/contracts/
共享类型系统，定义消息、设备、记忆、审批、A2UI、Agent adapter 等核心合同。

### packages/matrix/
Matrix 通信层，已包含登录/注册、消息收发与撤回、好友管理、typing/presence/read receipt、上传、个人资料、消息搜索、`replyTo` 底层支持。

### packages/ui/
共享 UI 组件库，目前共有 **17 个组件**：

`OttieAgentSelector`, `OttieApproval`, `OttieAvatar`, `OttieBubble`, `OttieChatHeader`, `OttieConnectionBar`, `OttieContactPanel`, `OttieDecisionCard`, `OttieDevicePanel`, `OttieFriendRequest`, `OttieInput`, `OttieLogin`, `OttieScreenNotification`, `OttieSearchPanel`, `OttieSettingsPage`, `OttieSidebar`, `OttieToast`

### packages/a2ui/
A2UI renderer 与 catalog 已完成，属于生态基础设施，尚未接入主产品消息流。

### apps/desktop/
Vite + React 19 + Zustand + Tauri v2。当前是全项目最完整、最可继续开发的主链路。

### apps/mobile/
Expo Router 架构已建立，完成了 login、tabs、会话列表、聊天详情基础页面；联系人 / 设置 / Live Activities 仍未完成。

## LLM 配置

`apps/desktop/.env`（已 gitignore）：

```bash
VITE_LLM_BASE_URL=https://aihubmix.com/v1
VITE_LLM_API_KEY=<key>
VITE_LLM_MODEL=claude-sonnet-4-20250514
```

支持：OpenAI、AIHubMix 中转、Ollama 本地、任何 OpenAI 兼容端点。  
不配置时会自动降级到规则引擎。

## 已完成的额外工作

- [x] 服务器地址可配置（`VITE_MATRIX_URL`）
- [x] `SOUL.md` 默认人格文件（在 `ottie-agent` 仓库）
- [x] 产品加固（错误处理 / 重连 / 缓存 / loading / 空状态）
- [x] 架构修正（Agent 逻辑从 IM 层移回 adapter）
- [x] 中英双语 README + 组织 profile README

## 下一步

### 待用户操作

- [ ] 买域名（如 `ottie.app`）
- [ ] 租 VPS（2C4G，推荐 Hetzner / Vultr / DigitalOcean）
- [ ] 把 Tuwunel 部署到公网
- [ ] 配置 Caddy TLS

### 可以继续做的（按优先级）

- [ ] 修复根目录 `npm test`（为 root `package.json` 补 Turbo 所需的 `packageManager` 等字段）
- [ ] 移动端：联系人页与设置页落地
- [ ] 移动端：把审批 / 决策流接入真实消息链路
- [ ] 移动端：Live Activities 从 scaffold 变成真实集成
- [ ] 桌面端：把消息引用回复真正接进 `MainLayout`
- [ ] 桌面端：把好友请求列表接上 `onFriendRequest`
- [ ] 桌面端：默认启用并打通 Screenpipe 设备感知主链路
- [ ] Google OIDC 登录
- [ ] 端到端加密（Matrix E2EE）
- [ ] 群聊
- [ ] QR 码 / 链接邀请加好友
- [ ] A2A 协议接入（`@a2a-js/sdk`）
- [ ] MCP 工具调用
- [ ] Windows / Linux 打包
- [ ] 图片压缩 / 缩略图

### 长期

- [ ] A2UI 在真实消息流中的产品化落地
- [ ] 更多 Agent Skills 的实际工作流接入
- [ ] 托管平台

## 如何继续开发

```bash
cd ~/Developer/ottie/server && ./setup.sh localhost local
cd ~/Developer/ottie/ottie
claude
> 先读 STATUS.md、CLAUDE.md、DESIGN.md
> 如果做移动端，再读 docs/mobile-plan.md
```

## 代码统计（当前仓库）

- 源文件：**44** 个 `.ts/.tsx`
- 代码量：约 **4,904** 行（不含 `node_modules`）
- UI 组件：**17** 个
- 已通过的包级测试：**matrix 9/9 + adapter 18/18**
- 当前不可直接使用的测试入口：根目录 `npm test`
