# Ottie × Claude Code 实操指南

## 核心机制

Claude Code 进入你的项目时，会自动读取：
1. `CLAUDE.md`（根目录）— 了解项目全貌
2. `.claude/settings.json` — 知道哪些文件不能改
3. 各模块的 `CLAUDE.md` — 了解具体任务

我们已经配置了 `.claude/settings.json`，**强制禁止修改**：
- `packages/ottie-contracts/**` — 接口合同
- `references/**` — 参考文档
- `docs/architecture.md` — 架构文档
- 根目录 `CLAUDE.md` — 全局指南

Claude Code 可以**读取**这些文件（了解接口和参考），但**不能编辑**。

---

## 实操方式：六种场景

### 场景 1：开发 ottie-matrix 模块

```bash
cd ottie
claude

# 进入后对 Claude Code 说：
> 请读一下 CLAUDE.md，然后读 packages/ottie-matrix/CLAUDE.md，
> 再看 packages/ottie-contracts/src/index.ts 了解接口，
> 最后看 references/matrix-js-sdk/README.md。
> 然后开始实现 OttieMatrix 类。
```

Claude Code 会：
- ✅ 读取所有 CLAUDE.md 和 contracts（只读参考）
- ✅ 在 `packages/ottie-matrix/src/` 里创建和编辑代码
- ❌ 无法修改 `ottie-contracts` 里的接口定义
- ❌ 无法修改 `references/` 里的参考文档

### 场景 2：开发 ottie-ui 组件库

```bash
cd ottie
claude

> 读 CLAUDE.md 和 packages/ottie-ui/CLAUDE.md。
> 然后实现 OttieBubble 和 OttieApproval 组件。
> 参考 ottie-contracts/src/index.ts 里的 OttieMessage 和 ApprovalRequest 类型。
> 用 Storybook 做独立预览。
```

### 场景 3：开发 ottie-skills（OpenClaw Skill）

```bash
cd ottie
claude

> 读 CLAUDE.md 和 packages/ottie-skills/CLAUDE.md。
> 然后看 references/openclaw/README.md 了解 Skill 编写格式。
> 先实现 skill-rewrite（消息改写 Skill）。
```

### 场景 4：开发 ottie-server（独立，不依赖其他模块）

```bash
cd ottie/infra/ottie-server
claude

> 读 CLAUDE.md，然后看 ../../references/tuwunel/README.md。
> 创建 docker-compose.yml、tuwunel.toml、Caddyfile 和 setup.sh。
```

### 场景 5：用 Plan 模式做大改动

```bash
claude --permission-mode plan

> 我要重构 ottie-matrix 的登录流程，支持 Google OIDC。
> 先给我一个完整的计划，我批准后你再执行。
```

Plan 模式下 Claude Code 会先列出所有要改的文件和改动内容，
你确认后它才动手。适合复杂改动。

### 场景 6：多个 Claude Code 实例并行开发

开三个终端窗口，各自进不同模块：

```bash
# 终端 1：Agent A 做通信层
cd ottie && claude
> 你负责 packages/ottie-matrix。读相关 CLAUDE.md 后开始。

# 终端 2：Agent B 做组件库
cd ottie && claude
> 你负责 packages/ottie-ui。读相关 CLAUDE.md 后开始。

# 终端 3：Agent C 做部署
cd ottie/infra/ottie-server && claude
> 你负责服务端部署。读 CLAUDE.md 后开始。
```

三个 Agent 同时工作，互不干扰：
- 它们都能读 `ottie-contracts`（了解接口）
- 它们都不能改 `ottie-contracts`（.claude/settings.json 禁止了）
- 它们各自只在自己的模块里写代码

---

## 权限配置说明

### 根目录 `.claude/settings.json`（已创建）

```json
{
  "permissions": {
    "deny": [
      "Edit(packages/ottie-contracts/**)",
      "Edit(references/**)",
      "Edit(docs/architecture.md)",
      "Edit(CLAUDE.md)"
    ],
    "allow": [
      "Read(**)",
      "Bash(npm test)",
      "Bash(npm run build)",
      "Bash(npm run lint)",
      "Bash(npx tsc --noEmit)"
    ]
  }
}
```

**deny 规则**：禁止修改合同、参考文档、架构文档、全局指南
**allow 规则**：允许读取所有文件、运行测试/构建/检查

### 如果需要更严格的控制

你可以给每个模块加子项目设置，限制 Agent 只能编辑自己的模块：

```bash
# 在 packages/ottie-matrix/ 下创建
mkdir -p packages/ottie-matrix/.claude
```

```json
// packages/ottie-matrix/.claude/settings.json
{
  "permissions": {
    "deny": [
      "Edit(../ottie-ui/**)",
      "Edit(../ottie-a2ui/**)",
      "Edit(../ottie-skills/**)",
      "Edit(../ottie-screen/**)",
      "Edit(../ottie-memory/**)"
    ]
  }
}
```

这样即使 Agent 试图"帮忙"修改其他模块的代码，也会被阻止。

---

## 推荐的工作流

### 第一步：让 Agent 先"观察"

```bash
claude --permission-mode plan

> 请读完以下文件，不要写任何代码，只告诉我你的理解：
> 1. CLAUDE.md
> 2. packages/ottie-matrix/CLAUDE.md
> 3. packages/ottie-contracts/src/index.ts
> 4. references/matrix-js-sdk/README.md
>
> 告诉我你打算怎么实现 OttieMatrix 类。
```

Plan 模式下它会输出一个详细计划。你确认后再让它执行。

### 第二步：一个模块一个模块来

不要一次让它做所有模块。按照开发优先级：

```
Phase 1（基础）：ottie-contracts → ottie-matrix → ottie-server
Phase 2（界面）：ottie-ui → ottie-mobile 或 ottie-desktop
Phase 3（感知）：ottie-screen → ottie-memory → ottie-skills
Phase 4（生态）：ottie-a2ui
```

### 第三步：每完成一个模块就跑测试

```bash
cd packages/ottie-matrix
npm test
npx tsc --noEmit  # 类型检查：确保跟 contracts 对得上
```

---

## 自定义命令（可选）

你可以在 `.claude/commands/` 里创建快捷命令：

```markdown
<!-- .claude/commands/dev-module.md -->
请先读取以下文件了解项目上下文：
1. /CLAUDE.md（项目全局指南）
2. /packages/ottie-contracts/src/index.ts（接口合同）
3. $ARGUMENTS 模块的 CLAUDE.md

然后按照 CLAUDE.md 里的指示开始开发。
每次修改后运行 npm test 和 npx tsc --noEmit 确认没有问题。
```

使用：
```bash
claude
> /dev-module packages/ottie-matrix
```
