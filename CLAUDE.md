# CLAUDE.md — Ottie 主仓库

> 🦦 Ottie 是一个 Agent-Native IM。这是主仓库。

## 项目结构

Ottie 分 3 个仓库（都在 github.com/ottie-im 下）：

| 仓库 | 你现在在这里？ | 内容 |
|------|-------------|------|
| **ottie**（本仓库）| ✅ | IM 核心：contracts + matrix + ui + a2ui + 两端 App |
| **server** | | 服务端部署：Docker + Tuwunel + Caddy |
| **ottie-agent** | | 默认 Agent：OpenClaw 适配器 + skills + screen + memory |

## 本仓库的模块

| 模块 | 路径 | npm 包名 |
|------|------|---------|
| contracts | `packages/contracts/` | @ottie-im/contracts |
| matrix | `packages/matrix/` | @ottie-im/matrix |
| ui | `packages/ui/` | @ottie-im/ui |
| a2ui | `packages/a2ui/` | @ottie-im/a2ui |
| desktop | `apps/desktop/` | （不发 npm） |
| mobile | `apps/mobile/` | （不发 npm） |

## 核心规则

1. **packages/contracts/ 不可修改**（.claude/settings.json 强制）
2. **references/ 不可修改**（只读参考）
3. **不要直接调 OpenClaw API**——IM 层通过 OttieAgentAdapter 接口跟 Agent 通信
4. **开源依赖用 npm install，不要复制代码**
5. **UI 必须遵循 DESIGN.md**——所有颜色、间距、组件样式以 DESIGN.md 为准

## 开始之前必读

1. **STATUS.md** — 当前进度，看到哪一步了、下一步做什么
2. **DESIGN.md** — UI 设计规范（9 个 section），写任何 UI 之前必读
3. **CLAUDE.md**（本文件）— 项目结构和规则

## 开发方式

```bash
cd ~/Developer/ottie/ottie
claude
> 读 STATUS.md 和 CLAUDE.md，继续开发
```

## 本地环境

- Tuwunel 服务器：`cd ../server && docker compose up -d`（localhost:8008）
- 注册 token：`ottie-dev-token`
- Agent 仓库：`../ottie-agent/`（通过本地路径引用 contracts）

## 详细文档

- `STATUS.md` — 项目进度和下一步（最重要）
- `DESIGN.md` — UI 设计规范（写 UI 必读）
- `docs/architecture.md` — 完整架构
- `docs/development-plan.md` — 开发计划
- `docs/claude-code-guide.md` — Claude Code 操作指南
- `references/awesome-design-md/` — DESIGN.md 格式参考和各品牌设计系统
