# Ottie 开发计划 v3

> Ottie 是 IM，不是 Agent 框架。
> Agent 是可插拔的——OpenClaw 是默认附赠的，用户可以换任何实现了 OttieAgentAdapter 接口的 Agent。

---

## GitHub 组织结构

组织名：**ottie-im**（github.com/ottie-im）

3 个仓库：

| 仓库 | 内容 | 谁用 |
|------|------|------|
| **ottie** | 主仓库 monorepo：contracts + matrix + ui + a2ui + desktop + mobile + docs | 所有开发者 |
| **server** | Docker Compose 部署包（Tuwunel + Caddy） | 企业自部署 |
| **ottie-agent** | 默认 Agent 适配器 + skills + screen + memory | OpenClaw 用户 / 想参考的开发者 |

### 主仓库结构（ottie-im/ottie）

```
ottie/
├── CLAUDE.md                     ← AI 全局指南
├── README.md
├── package.json                  ← Turborepo monorepo
├── turbo.json
├── .claude/
│   ├── settings.json             ← 禁止改 contracts
│   └── commands/
│       ├── dev-module.md
│       └── review-module.md
├── packages/
│   ├── contracts/                ← @ottie-im/contracts（接口合同）
│   │   └── src/index.ts
│   ├── matrix/                   ← @ottie-im/matrix（Matrix 通信）
│   ├── ui/                       ← @ottie-im/ui（共享组件库）
│   └── a2ui/                     ← @ottie-im/a2ui（A2UI 渲染器）
├── apps/
│   ├── desktop/                  ← Ottie Desktop（Tauri v2）
│   └── mobile/                   ← Ottie App（React Native）
├── references/                   ← 只读参考文档
│   ├── matrix-js-sdk/README.md
│   ├── a2ui/README.md
│   ├── tuwunel/README.md
│   └── a2a/README.md
└── docs/
    ├── architecture.md
    ├── development-plan.md       ← 本文档
    └── claude-code-guide.md
```

### 服务端仓库（ottie-im/server）

```
server/
├── CLAUDE.md
├── README.md
├── docker-compose.yml
├── tuwunel.toml
├── Caddyfile
└── setup.sh
```

### Agent 仓库（ottie-im/ottie-agent）

```
ottie-agent/
├── CLAUDE.md
├── README.md
├── package.json
├── packages/
│   ├── adapter/                  ← OttieAgentAdapter 的 OpenClaw 实现
│   ├── skills/                   ← OpenClaw Skill 包
│   │   ├── skill-rewrite/
│   │   ├── skill-approve/
│   │   ├── skill-persona/
│   │   ├── skill-delegate/
│   │   ├── skill-dispatch/
│   │   ├── skill-duty/
│   │   ├── skill-ota/
│   │   ├── skill-gui-detect/
│   │   └── skill-cli-watch/
│   ├── screen/                   ← Screenpipe 封装
│   └── memory/                   ← MEMORY.md 管理
└── references/
    ├── openclaw/README.md
    └── screenpipe/README.md
```

---

## 开始之前：建仓库（Phase -1）

### Step -1.1 — 创建 GitHub 组织
```
1. 打开 github.com/organizations/new
2. 组织名：ottie-im
3. 免费计划就够
```

### Step -1.2 — 创建 3 个仓库
```bash
# 如果装了 GitHub CLI：
gh repo create ottie-im/ottie --public --description "Agent-Native IM"
gh repo create ottie-im/server --public --description "Ottie server deployment"
gh repo create ottie-im/ottie-agent --public --description "Default Agent adapter for Ottie"

# 如果没装 CLI，在 github.com/ottie-im 页面点 New repository 建三个
```

### Step -1.3 — 把现有文件推上去

主仓库：
```bash
cd ~/Projects
git clone git@github.com:ottie-im/ottie.git
# 把我给你的文件按新结构放进去（packages 改名：ottie-matrix → matrix 等）
cd ottie
git add .
git commit -m "init: project scaffold with CLAUDE.md and contracts"
git push
```

server 仓库：
```bash
git clone git@github.com:ottie-im/server.git
# 把 infra/ottie-server/ 的内容放进去
cd server
git add .
git commit -m "init: Tuwunel deployment scaffold"
git push
```

ottie-agent 仓库：
```bash
git clone git@github.com:ottie-im/ottie-agent.git
# 把 agent 相关的内容放进去
cd ottie-agent
git add .
git commit -m "init: OpenClaw adapter scaffold"
git push
```

### Step -1.4 — 买域名
```
1. 买域名（如 ottie.app）
2. DNS 托管到 Cloudflare（免费）
3. 暂时不指向服务器
```

### Step -1.5 — 装开发工具
```bash
# 必须的
brew install docker          # 或者下载 Docker Desktop
brew install node            # Node.js 22+
npm install -g turbo         # Turborepo

# Claude Code（如果还没装）
npm install -g @anthropic-ai/claude-code

# 可选（后面才用到）
npm install -g openclaw      # Phase 2 才需要
# Screenpipe                 # Phase 4 才需要
```

### ✅ Phase -1 验收点
- [ ] ottie-im 组织创建好了
- [ ] 3 个仓库创建好了
- [ ] 文件推上去了
- [ ] 域名买了
- [ ] Docker + Node.js + Turbo 装好了

---

## Phase 0：服务器跑起来（1-2 天）

### 在 server 仓库工作
```bash
cd ~/Projects/server
claude
> /dev-module .
# 或者直接说：
> 读 CLAUDE.md，然后帮我创建 docker-compose.yml、tuwunel.toml、Caddyfile 和 setup.sh。
> 配置 Tuwunel 的 server_name 为 ottie.app（或你的域名）。
> 先用 localhost 模式跑。
```

### 启动并验证
```bash
docker compose up -d
curl http://localhost:8008/_matrix/client/versions
# 创建测试用户，用 Element Web 测试互发消息
```

### ✅ 验收点
- [ ] Tuwunel 跑着
- [ ] 两个用户能互发消息
- [ ] 重启后数据不丢

---

## Phase 1：接口 + 通信层（3-5 天）

### 📋 需求检查点
- [ ] 加好友要对方同意？
- [ ] 先做 1v1 还是也做群聊？
- [ ] 消息撤回？黑名单？好友分组？
- [ ] 其他：_______________

### 在主仓库工作
```bash
cd ~/Projects/ottie
claude
```

#### Step 1.1 — 完善 contracts
```
> /review-module packages/contracts
> 我需要加 FriendRequest、好友审批等类型。
> 确认 OttieAgentAdapter 够通用。
> 给我方案，确认后你改。
```

#### Step 1.2 — 实现 matrix 通信层
```
> /dev-module packages/matrix
```
- 第一轮：登录 + 消息收发
- 第二轮：好友搜索/请求/审批/列表/二维码
- 第三轮：Google OIDC

#### Step 1.3 — 验证
```bash
cd packages/matrix && npm test && npx tsc --noEmit
```

### ✅ 验收点
- [ ] 连接 Tuwunel + 登录 + 互发消息 + 好友全流程

---

## Phase 2：默认 Agent（5-7 天）

### 在 ottie-agent 仓库工作
```bash
cd ~/Projects/ottie-agent
claude
```

#### Step 2.1 — Agent 适配器
```
> 读 CLAUDE.md。
> 实现 OttieAgentAdapter 接口（从 @ottie-im/contracts 导入）。
> 内部调 OpenClaw。先做最简版：onMessage + onDraft + onApproval。
```

#### Step 2.2 — Skills
```
> 实现 skill-rewrite 和 skill-approve
```

#### Step 2.3 — 记忆
```
> 实现 MEMORY.md 读写 + autoDream
```

#### Step 2.4 — 连接测试
```bash
# 回到主仓库，把 ottie-agent 作为依赖引入
cd ~/Projects/ottie
claude
> 把 ottie-agent 的适配器接入 packages/matrix，
> 跑通完整链路：说话→改写→审批→发送→对方收到
>
> 关键验证：把适配器换成 mock，主仓库代码零修改能跑
```

### ✅ 验收点
- [ ] 改写 + 审批跑通 + 适配器模式验证 = 核心原型完成

---

## Phase 3：界面层（7-10 天）

### 📋 需求检查点
- [ ] 先桌面还是移动？
- [ ] 导航栏 tab？Agent 切换入口？
- [ ] 其他：_______________

### 在主仓库工作
```bash
cd ~/Projects/ottie
claude
```

#### Step 3.1 — 组件库
```
> /dev-module packages/ui
```

#### Step 3.2 — 桌面端 / 移动端
```
> /dev-module apps/desktop
# 或
> /dev-module apps/mobile
```

#### Step 3.3 — Agent 切换页面
设置里加入口，UI 先到位，第三方接入 Phase 5 做。

### ✅ 验收点
- [ ] 登录 + 聊天 + 好友 + 设备面板 = 可以演示

---

## Phase 4：设备感知（5-7 天）

### 在 ottie-agent 仓库工作
```bash
cd ~/Projects/ottie-agent
claude
```

#### Step 4.1 — 屏幕感知
```
> 实现 packages/screen，接入 Screenpipe
```

#### Step 4.2 — GUI/CLI 检测 Skills
```
> 实现 skill-gui-detect + skill-cli-watch
```

#### Step 4.3 — 桌面端集成
```bash
# 回到主仓库
cd ~/Projects/ottie
claude
> 把 Screenpipe 内嵌到 Tauri 安装包
```

### ✅ 验收点
- [ ] 屏幕感知 + 推送 + 审批 + 记忆端到端跑通

---

## Phase 5：生态（持续）

- 主仓库：实现 packages/a2ui
- 社区可以创建 agent-langgraph、agent-a2a 等仓库
- 商户托管平台

---

## 时间线

| 阶段 | 时间 | 在哪个仓库 | 产出 |
|------|------|-----------|------|
| Phase -1 | 半天 | GitHub 网页 | 组织+仓库+域名 |
| Phase 0 | 1-2 天 | server | 跑着的 Tuwunel |
| Phase 1 | 3-5 天 | ottie (主仓库) | 代码能收发消息 |
| Phase 2 | 5-7 天 | ottie-agent | 改写+审批跑通 |
| Phase 3 | 7-10 天 | ottie (主仓库) | 可演示的 App |
| Phase 4 | 5-7 天 | ottie-agent + ottie | 屏幕感知 |
| Phase 5 | 持续 | 各仓库 | 生态接入 |

**Phase -1 到 Phase 2（约 2-3 周）= 核心原型**
**Phase -1 到 Phase 3（约 4-5 周）= 可演示产品**

---

## 有新想法？

小改动 → 直接跟 Claude Code 说
大改动 → docs/ 里写需求 → /review-module 分析 → 确认后动手
每个 Phase 结束 → docs/changelog.md 记录
