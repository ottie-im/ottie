# Ottie — Agent-Native IM 项目架构文档

> 🦦 Ottie 是你的 AI 小水獭秘书（默认名字，用户可改）
> 
> "Ottie，帮我问他周五去不去吃饭。"

---

## 一、产品定位

Ottie 是一个 **Agent-Native 的即时通讯应用**。所有消息永远经过双方 Agent，不能关闭。用户通过输入框向自己的 Agent 下指令，Agent 组织好语言后对外输出。早期每条消息需要用户批准，后期逐步放权。

**核心理念：**

- 用户不是在跟对方聊天，而是在指挥自己的 AI 秘书
- Agent 不是第三个人，Agent 是升级版的"我"
- 每个人都过 Agent，所以没有人在意"对方有没有用 Agent"——就像微信不做已读
- 输入框是你跟你 Agent 的私密通道，聊天流是 Agent 对外输出的正式内容

---

## 二、五层架构

```
┌─────────────────────────────────────────────────┐
│  第五层：外部生态                                  │  云端/他人
│  餐馆 · SaaS · 朋友Agent · 企业B                  │
│  协议：A2A + A2UI + MCP                           │
├─────────────────────────────────────────────────┤
│  第四层：通信基础设施                               │  可自部署
│  Tuwunel (Matrix) · Caddy · 联邦互通              │
│  SSO/OIDC · Agent Card · 聊天记录同步              │
├─────────────────────────────────────────────────┤
│  第三层：设备 Agent（仅电脑）                       │  纯本地 × N台
│  OpenClaw · Screenpipe · GUI/CLI检测              │
│  MEMORY.md + SQLite · Enter/点击触发              │
├─────────────────────────────────────────────────┤
│  第二层：个人 Agent（总管）                         │  你的服务器
│  OpenClaw · 消息改写 · 审批 · 对外人格              │
│  MEMORY.md 集中管理 · autoDream 整理               │
├─────────────────────────────────────────────────┤
│  第一层：表现层 — 品牌 "Ottie"                      │  用户设备
│  桌面端 Tauri v2 · 移动端 React Native             │
│  A2UI 渲染 · Matrix JS SDK · 组件库               │
└─────────────────────────────────────────────────┘
                      ↕
                    用户
        Google · 邮箱 · 手机验证码(后期)
        用户名搜索 · 二维码 · 链接邀请
```

---

## 三、技术选型

### 第一层：表现层

| 组件 | 技术 | 理由 |
|------|------|------|
| 桌面端框架 | Tauri v2 + Rust | 轻量；内嵌 OpenClaw+Screenpipe；品牌安装包 |
| 移动端框架 | React Native + Expo | 一套代码 iOS+Android |
| UI 渲染 | A2UI 渲染器 | 外部 Agent JSON → 原生组件 |
| 组件库 | 自建 | 该限定的限定，该自由的自由 |
| Matrix 接入 | Matrix JS SDK | 官方 SDK；聊天记录自动同步 |
| 状态管理 | Zustand | 轻量；React 生态通用 |
| 桌面安装包 | .exe / .dmg / .deb | 双击安装；OpenClaw/Screenpipe 完全隐藏 |
| 移动端分发 | App Store / Google Play | 标准渠道 |
| 手机特有能力 | 日历·定位·通知 | 轻量上下文输入给个人 Agent |
| 手机核心角色 | 审批·遥控·通知接收 | 不跑 OpenClaw；不是设备 Agent |

### 第二层：个人 Agent（总管）

| 组件 | 技术 | 理由 |
|------|------|------|
| Agent 框架 | OpenClaw | 跟设备 Agent 同框架；多 Agent 单实例 |
| 消息改写 | 自定义 Skill | 意图 → 得体消息 |
| 审批流程 | 自定义 Skill | 推给用户确认后发出 |
| 对外人格 | SOUL.md | OpenClaw 内置人格文件 |
| 信任委托 | 自定义 Skill | 规则引擎；逐步放权 |
| 设备调度 | sessions_send | OpenClaw Agent 间通信 |
| 值班模式 | 轻量自动回复 | 全部设备离线时基本接消息 |
| OTA 推送 | 系统通知 Skill | 新模型 → 推送提醒 → 一键更新 |
| 记忆 | MEMORY.md（集中） | Claude Code 验证；不需多设备同步 |
| 记忆整理 | autoDream 式逻辑 | 空闲时合并设备上报；提炼画像 |
| 云端模型 | Claude Sonnet | 高质量改写 |
| 本地模型 | Gemma 4 via Ollama | 免费；隐私；OTA 可更新 |

### 第三层：设备 Agent（仅电脑）

| 组件 | 技术 | 理由 |
|------|------|------|
| Agent 框架 | OpenClaw | 跟个人 Agent 同一实例；独立 workspace |
| 打包方式 | 内嵌在 Tauri 安装包 | 用户只看到 "Ottie Desktop" |
| 屏幕感知 | Screenpipe | MIT；accessibility tree 优先；OCR fallback |
| GUI 弹窗检测 | 自定义 Skill | 识别权限框 → 推送到手机 |
| CLI 变动监听 | 自定义 Skill | 监听确认提示 → 推送到手机 |
| 行为过滤 | Enter/点击触发 | 只记录确认性动作 |
| 本地记忆 | MEMORY.md + SQLite | 索引+原始观察分开存 |
| 记忆上报 | sessions_send | 重要观察推给个人 Agent |
| 设备操控 | OpenClaw 内置工具 | exec·read·write·浏览器 |
| 默认模型 | Claude Haiku / Gemma 4 | 便宜快速；操控不需强模型 |

### 第四层：通信基础设施

| 组件 | 技术 | 理由 |
|------|------|------|
| Matrix 服务器 | Tuwunel | Rust；单二进制；瑞士政府验证 |
| 反向代理 | Caddy | 自动 TLS；官方推荐 |
| 数据库 | RocksDB 内嵌 | 零配置 |
| 联邦 | Matrix Federation API | 自部署服务器间自动互通 |
| Agent 发现 | A2A Agent Card | 能力描述+连接信息 |
| 聊天记录同步 | Matrix 内置 | 多设备自动同步；加密消息走密钥备份 |
| 登录 | Google OIDC + 邮箱 + 手机(后期) | Tuwunel SSO/OIDC 已支持 |
| 加好友 | 用户名搜索 + 二维码 + 链接邀请 | 三种方式并存 |

### 第五层：外部生态

| 组件 | 技术 | 理由 |
|------|------|------|
| Agent 通讯 | A2A 协议 | Google+IBM；Linux Foundation |
| UI 渲染 | A2UI v0.8+ | JSON → 原生组件；可自定义扩展 |
| 工具调用 | MCP 协议 | Anthropic+OpenAI；200+ 实现 |
| 小商户托管 | Ottie 平台 | 月费模式；零部署 |

### 四协议分工

| 职责 | 协议 | 背书 |
|------|------|------|
| 消息+联邦+同步 | Matrix Federation | 法/德/瑞政府；NATO |
| Agent 协作 | A2A | Google；IBM；Linux Foundation |
| Agent 生成 UI | A2UI | Google；CopilotKit；OpenClaw |
| Agent 调工具 | MCP | Anthropic；OpenAI；200+ 实现 |

---

## 四、模块拆分（独立开发·独立部署）

项目拆分为 **9 个独立模块**，每个模块可以由不同的 AI Agent 独立开发，也可以被社区单独拿出来使用。

### 代码仓库结构

```
ottie/
├── README.md
├── packages/
│   ├── ottie-ui/              ← 模块1：共享组件库
│   ├── ottie-matrix/          ← 模块2：Matrix 通信层
│   ├── ottie-a2ui/            ← 模块3：A2UI 渲染器
│   ├── ottie-skills/          ← 模块4：OpenClaw 自定义 Skill 包
│   ├── ottie-screen/          ← 模块5：屏幕感知模块
│   └── ottie-memory/          ← 模块6：记忆管理模块
├── apps/
│   ├── ottie-mobile/          ← 模块7：移动端 IM
│   └── ottie-desktop/         ← 模块8：桌面端 IM
├── infra/
│   └── ottie-server/          ← 模块9：服务端部署包
├── docs/
│   └── architecture.md        ← 本文档
├── turbo.json
└── package.json
```

### 模块详解

#### 模块1：ottie-ui（共享组件库）

**职责：** Ottie 品牌的 UI 组件，移动端和桌面端共享。

**独立价值：** 社区可以拿去做自己的 Agent IM 界面。

**技术栈：** React + TypeScript + Tailwind

**包含：**
- 聊天气泡组件（区分"Agent 正式输出"和"用户原始指令"）
- 输入框组件（永远是用户跟 Agent 的私密通道）
- 审批卡片组件（Agent 拟好的消息，用户点确认/修改/拒绝）
- 设备面板组件（显示在线设备列表、状态、名称）
- 通知卡片组件（设备 Agent 推送的 GUI 弹窗/CLI 变动）
- 好友列表/搜索/二维码组件
- 可定制导航栏组件

**对外接口：**
```typescript
// 聊天气泡
<OttieBubble
  type="agent-output" | "user-intent" | "incoming"
  content={string}
  expandable={boolean}  // 展开看原始指令
/>

// 审批卡片
<OttieApproval
  draft={string}        // Agent 拟好的消息
  onApprove={() => void}
  onEdit={(newText: string) => void}
  onReject={() => void}
/>

// 设备面板
<OttieDevicePanel
  devices={Device[]}
  onSendCommand={(deviceId: string, command: string) => void}
/>
```

---

#### 模块2：ottie-matrix（Matrix 通信层）

**职责：** 封装 Matrix JS SDK，提供 Ottie 专用的通信接口。

**独立价值：** 任何想基于 Matrix 做 Agent IM 的项目都可以用。

**技术栈：** TypeScript + Matrix JS SDK

**包含：**
- 登录/注册（Google OIDC、邮箱、手机验证码）
- 消息收发（文本、文件、A2UI JSON）
- 好友管理（搜索、邀请、二维码生成/解析）
- 聊天记录同步（包括端到端加密的密钥备份）
- 联邦状态查询
- Agent Card 发布/发现（A2A 协议集成）

**对外接口：**
```typescript
class OttieMatrix {
  login(provider: 'google' | 'email' | 'phone', credentials): Promise<Session>
  sendMessage(roomId: string, content: OttieMessage): Promise<void>
  onMessage(callback: (msg: OttieMessage) => void): void
  searchUsers(query: string): Promise<User[]>
  addFriend(userId: string): Promise<void>
  generateInviteQR(): Promise<string>
  publishAgentCard(card: AgentCard): Promise<void>
  discoverAgent(userId: string): Promise<AgentCard>
  syncHistory(roomId: string): Promise<Message[]>
}
```

---

#### 模块3：ottie-a2ui（A2UI 渲染器）

**职责：** 把外部 Agent 发来的 A2UI JSON 渲染成 Ottie 组件。

**独立价值：** 任何想在自己的 App 里渲染 A2UI 的项目都可以用。

**技术栈：** React + TypeScript + A2UI SDK

**包含：**
- A2UI JSON 解析器
- 组件映射注册（A2UI 标准组件 → ottie-ui 组件）
- 自定义组件注册（第三方扩展）
- 事件回传（用户操作 → A2UI 事件 → 发回给 Agent）
- 安全沙箱（只允许注册过的组件，防止 UI 注入）

**对外接口：**
```typescript
<OttieA2UIRenderer
  payload={A2UIPayload}
  componentCatalog={OttieComponentCatalog}
  onEvent={(event: A2UIEvent) => void}
/>
```

---

#### 模块4：ottie-skills（OpenClaw 自定义 Skill 包）

**职责：** Ottie 的核心 Agent 逻辑，以 OpenClaw Skill 形式存在。

**独立价值：** OpenClaw 用户可以单独安装这些 Skill，不需要完整的 Ottie。

**技术栈：** OpenClaw Skill 格式（Markdown + 配置）

**包含：**
- `skill-rewrite/` — 消息改写 Skill（意图 → 得体消息）
- `skill-approve/` — 审批流程 Skill（拟稿 → 推送 → 确认 → 发送）
- `skill-persona/` — 对外人格 Skill（控制哪些信息该暴露）
- `skill-delegate/` — 信任委托 Skill（规则引擎，哪些事自动处理）
- `skill-dispatch/` — 设备调度 Skill（向设备 Agent 下发指令）
- `skill-duty/` — 值班 Skill（离线时自动回复）
- `skill-ota/` — OTA 更新 Skill（检测新模型，推送提醒）
- `skill-gui-detect/` — GUI 弹窗检测 Skill（识别权限框等）
- `skill-cli-watch/` — CLI 变动监听 Skill（监听确认提示）

**每个 Skill 的结构：**
```
skill-rewrite/
├── SKILL.md           ← Skill 描述和提示词
├── config.json        ← 默认配置
└── examples/          ← 输入输出示例
```

---

#### 模块5：ottie-screen（屏幕感知模块）

**职责：** 封装 Screenpipe，提供 Ottie 专用的屏幕感知能力。

**独立价值：** 任何想做屏幕感知 Agent 的项目都可以用。

**技术栈：** Rust/TypeScript + Screenpipe API

**包含：**
- Screenpipe 集成层（启动、配置、数据查询）
- 行为过滤器（Enter/点击触发，过滤浏览噪音）
- GUI 弹窗检测器（权限框、确认框、错误框识别）
- CLI 变动检测器（stdout 模式匹配：Y/n、Allow?等）
- 事件标准化（所有检测结果统一为 OttieScreenEvent 格式）

**对外接口：**
```typescript
class OttieScreen {
  start(config: ScreenConfig): void
  stop(): void
  onEvent(callback: (event: OttieScreenEvent) => void): void
  query(timeRange: TimeRange): Promise<ScreenEvent[]>
}

type OttieScreenEvent = {
  type: 'gui-popup' | 'cli-prompt' | 'user-action' | 'screen-change'
  timestamp: number
  content: string          // 识别到的文本
  screenshot?: string      // base64 截图（可选）
  confidence: number       // 识别置信度
  actionRequired: boolean  // 是否需要用户操作
}
```

---

#### 模块6：ottie-memory（记忆管理模块）

**职责：** MEMORY.md 的读写、同步、整理逻辑。

**独立价值：** 任何想用 MEMORY.md 方案做 Agent 记忆的项目都可以用。

**技术栈：** TypeScript

**包含：**
- MEMORY.md 读写器（解析、更新、合并）
- SQLite 原始观察存储
- 设备 → 个人 Agent 的记忆上报协议
- autoDream 整理逻辑（合并、去重、矛盾消除、提炼）
- 记忆查询接口（按时间、按主题、按关键词）

**对外接口：**
```typescript
class OttieMemory {
  // 个人 Agent 用
  load(): Promise<MemoryIndex>
  update(entries: MemoryEntry[]): Promise<void>
  dream(): Promise<void>  // autoDream 整理
  query(q: string): Promise<MemoryEntry[]>

  // 设备 Agent 用
  observe(event: OttieScreenEvent): Promise<void>  // 存入本地 SQLite
  report(agentId: string): Promise<void>           // 上报给个人 Agent
}
```

---

#### 模块7：ottie-mobile（移动端 IM）

**职责：** 用户在手机上看到的 Ottie App。

**独立价值：** 这是最终产品，不会被单独复用。

**技术栈：** React Native + Expo + TypeScript

**依赖：**
- `ottie-ui` — 组件库
- `ottie-matrix` — Matrix 通信
- `ottie-a2ui` — A2UI 渲染

**包含：**
- 登录/注册页
- 聊天列表页
- 聊天详情页（输入框 → 审批 → 正式消息流）
- 好友/搜索/二维码页
- 设备管理面板
- 通知中心（设备 Agent 推送的弹窗/CLI 变动）
- 设置页（Agent 人格、信任规则、模型选择）

---

#### 模块8：ottie-desktop（桌面端 IM）

**职责：** 用户在电脑上看到的 Ottie Desktop，内嵌 OpenClaw + Screenpipe。

**独立价值：** 这是最终产品，不会被单独复用。

**技术栈：** Tauri v2 + Rust + React + TypeScript

**依赖：**
- `ottie-ui` — 组件库
- `ottie-matrix` — Matrix 通信
- `ottie-a2ui` — A2UI 渲染
- `ottie-skills` — OpenClaw Skill 包
- `ottie-screen` — 屏幕感知
- `ottie-memory` — 记忆管理

**包含：**
- Tauri 壳（品牌安装包，隐藏所有底层引擎）
- 内嵌 OpenClaw 运行时（后台进程）
- 内嵌 Screenpipe（后台进程）
- 内嵌 Ollama + Gemma 4（可选，首次启动询问）
- 预配置 openclaw.json（双 Agent：个人 + 设备）
- IM 界面（与移动端共享 ottie-ui 组件）
- 系统托盘（后台常驻）

**安装包内容：**
```
Ottie-Desktop-Setup.exe
├── Ottie.exe                    ← Tauri 壳（用户看到的）
├── runtime/
│   ├── openclaw/                ← OpenClaw 运行时（隐藏）
│   ├── screenpipe/              ← Screenpipe（隐藏）
│   └── ollama/                  ← Ollama（可选）
├── config/
│   ├── openclaw.json            ← 预配置双 Agent
│   ├── personal/SOUL.md         ← 个人 Agent 人格
│   ├── personal/MEMORY.md       ← 个人 Agent 记忆
│   ├── device/SOUL.md           ← 设备 Agent 人格
│   └── device/MEMORY.md         ← 设备 Agent 记忆
└── skills/
    ├── skill-rewrite/
    ├── skill-approve/
    └── ...
```

---

#### 模块9：ottie-server（服务端部署包）

**职责：** 一键部署 Tuwunel + Caddy + 个人 Agent（可选）。

**独立价值：** 企业可以拿去自部署自己的 Matrix 联邦节点。

**技术栈：** Docker Compose + Shell

**包含：**
- `docker-compose.yml` — 编排 Tuwunel + Caddy
- `tuwunel.toml` — Matrix 服务器配置模板
- `Caddyfile` — 反向代理配置模板
- `setup.sh` — 一键部署脚本（域名、TLS、管理员账号）
- `openclaw-server.json` — 云端个人 Agent 配置（可选）

**部署命令：**
```bash
git clone https://github.com/ottie-im/ottie-server
cd ottie-server
./setup.sh --domain ottie.example.com --admin admin@example.com
# 自动拉取 Tuwunel 镜像、配置 Caddy TLS、创建管理员账号
```

---

## 五、模块依赖关系

```
ottie-mobile ──┬── ottie-ui
               ├── ottie-matrix
               └── ottie-a2ui

ottie-desktop ─┬── ottie-ui
               ├── ottie-matrix
               ├── ottie-a2ui
               ├── ottie-skills
               ├── ottie-screen
               └── ottie-memory

ottie-server ──── 独立（Docker Compose）

ottie-skills ──── 独立（OpenClaw Skill 格式）

ottie-screen ──── ottie-memory（观察存入记忆）

ottie-memory ──── 独立
```

**关键原则：**
- `ottie-ui`、`ottie-matrix`、`ottie-a2ui`、`ottie-memory`、`ottie-screen` 是**纯库**，没有 UI，可以被任何项目引用
- `ottie-skills` 是 **OpenClaw 插件**，可以脱离 Ottie 独立安装到任何 OpenClaw 实例
- `ottie-mobile` 和 `ottie-desktop` 是**最终应用**，组装以上模块
- `ottie-server` 是**部署工具**，独立运行

---

## 六、开发优先级

### Phase 1：跑通最小链路（8月前）

1. `ottie-skills` — 先写 skill-rewrite 和 skill-approve，在 OpenClaw 里验证"意图→改写→审批→发送"的核心流程
2. `ottie-matrix` — 接通 Tuwunel，实现两个用户之间通过 Agent 互发消息
3. `ottie-server` — Docker Compose 打包 Tuwunel + Caddy，一键部署

### Phase 2：基础可用（8-10月）

4. `ottie-ui` — 聊天气泡、输入框、审批卡片等核心组件
5. `ottie-mobile` — 最小可用的移动端 IM
6. `ottie-desktop` — Tauri 壳 + 内嵌 OpenClaw

### Phase 3：设备感知（10-12月）

7. `ottie-screen` — Screenpipe 集成 + GUI/CLI 检测
8. `ottie-memory` — MEMORY.md 读写 + 设备记忆上报 + autoDream
9. `ottie-skills` — 补充 skill-gui-detect、skill-cli-watch、skill-dispatch

### Phase 4：生态接入（2027 Q1）

10. `ottie-a2ui` — A2UI 渲染器，接入第三方 Agent 的 UI
11. `ottie-skills` — 补充 skill-persona、skill-delegate、skill-ota
12. 托管平台 — 小商户的 A2A Agent 托管服务

---

## 七、商业模式

| 用户类型 | 部署方式 | 收入来源 |
|----------|----------|----------|
| 个人用户 | 注册 ottie.app，零配置 | API 调用费 / 本地模型免费 |
| 进阶用户 | ottie.app + 桌面端 Ottie | API 费 / 高级 Skill 订阅 |
| 小商户 | 托管版 A2A Agent | 月费 |
| 企业 | 自部署 Tuwunel + OpenClaw | 部署支持 / 定制开发 |

---

## 八、用户部署模式

### 个人用户（零配置）
```
手机装 Ottie App → 注册账号 → 开始用
账号：@xiaoming:ottie.app
```

### 进阶用户（桌面端）
```
电脑装 Ottie Desktop（双击安装）→ 登录同一账号
自动拥有：IM 界面 + 个人 Agent + 设备 Agent
可选：下载 Gemma 4 本地模型
```

### 企业（自部署）
```
服务器跑 ottie-server（一键部署）→ 员工注册
账号：@alice:bigcorp.com
通过 Matrix 联邦与 ottie.app 上的用户自动互通
```

---

## 九、核心数据流

### 场景1：发消息

```
用户打字 "问他去不去吃饭"
  → 第一层 输入框接收
  → 第二层 个人 Agent 改写："周五晚上有空一起吃个饭吗？"
  → 第一层 推送审批卡片给用户
  → 用户点 ✅ 确认
  → 第二层 个人 Agent 通过 sessions_send 提交
  → 第四层 Matrix 转发到对方服务器
  → 对方 第二层 个人 Agent 接收
  → 对方 第一层 显示："XXX 问你周五有没有空一起吃饭？"
```

### 场景2：设备操控

```
用户在手机 IM 里说 "把电脑上的方案发给他"
  → 第一层 输入框接收
  → 第二层 个人 Agent 理解意图
  → 第二层 通过 sessions_send 下发给电脑一的设备 Agent
  → 第三层 设备 Agent（OpenClaw）执行 read + 找到文件
  → 第三层 通过 sessions_send 返回文件给个人 Agent
  → 第二层 个人 Agent 通过 Matrix 发送文件
```

### 场景3：屏幕感知推送

```
电脑上 Claude Code 弹出 "Allow exec? [Y/n]"
  → 第三层 Screenpipe 检测到 GUI 变动
  → 第三层 skill-gui-detect 识别为权限请求
  → 第三层 通过 sessions_send 上报个人 Agent
  → 第二层 个人 Agent 推送通知到手机
  → 第一层 手机显示通知卡片："电脑一请求执行权限"
  → 用户点 ✅ 允许
  → 反向传递回设备 Agent → 自动按下 Y
```

### 场景4：记忆流

```
设备 Agent 观察到用户搜了"川菜"
  → ottie-screen 检测到搜索行为（Enter 触发）
  → ottie-memory 存入本地 SQLite
  → 定期通过 sessions_send 上报给个人 Agent
  → 个人 Agent 的 autoDream 整理：
    "主人最近对川菜有兴趣" → 写入 MEMORY.md
  → 下次朋友 Agent 问 "吃什么"
  → 个人 Agent 查 MEMORY.md → 建议川菜
```

---

*文档版本：v1.0*
*项目名称：Ottie*
*吉祥物：🦦 小水獭（默认名 Ottie，用户可改）*
*最后更新：2026年4月7日*
