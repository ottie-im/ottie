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

## 开发方式

```bash
cd ~/Projects/ottie
claude
> /dev-module packages/matrix     # 开发某个模块
> /review-module packages/contracts  # 只读审查
```

## 详细文档

- `docs/architecture.md` — 完整架构
- `docs/development-plan.md` — 开发计划（先读这个）
- `docs/claude-code-guide.md` — Claude Code 操作指南
