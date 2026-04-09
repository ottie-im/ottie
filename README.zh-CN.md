# Ottie — Agent-Native IM

[English](./README.md)

> “Ottie，帮我问他周五去不去吃饭。”

Ottie 不只是一个即时通讯应用。  
它试图成为一种新的通信界面。

一个新的世界正在出现：人不再独自沟通，而是越来越多地借助 AI、通过 AI、与 AI 一起沟通。消息不再只是“打字发出去”，而是会被理解、改写、委托、审批、执行。

Ottie 就是在为这个世界构建基础设施。

## 核心想法

在 Ottie 里，你不会直接把最终措辞发给别人。

你先对自己的 AI 秘书表达意图。  
你的 Agent 负责理解你的意思、组织语言、在需要时请求你审批，然后再代表你发出消息。

而在对面，另一个人也可能正在通过自己的 Agent 与你沟通。

这意味着 Ottie 从一开始就是为下面三种方向设计的：

- 人与人，通过 AI 中介沟通
- 人与 AI 沟通
- AI 与 AI 沟通

所以 Ottie 不是“聊天软件加一个 AI 按钮”。  
它是在重做聊天本身的默认模型。

## 为什么是 Ottie

传统消息系统默认的前提是：一个人直接写一条消息发给另一个人。

这个前提已经开始失效。

下一代通信系统需要支持：

- 先表达意图，再形成措辞
- 先委托，再发送
- 先过滤，再承受信息过载
- 先审批，再执行动作
- 跨设备持续记忆
- 不只是人与人之间通信，而是人、Agent、软件、工具之间共同通信

Ottie 正是在为这层新的通信结构而构建。

## 当前阶段

Ottie 目前已经处于一个可运行的 MVP 阶段。

今天已经真实可用的能力包括：

- Matrix 登录和注册
- 桌面端 1 对 1 消息收发
- 发送侧改写与审批流程
- 接收侧意图识别与建议回复
- 图片 / 文件上传
- 消息搜索
- 桌面端联系人、好友请求、资料编辑、黑名单
- 基于自部署 Tuwunel 的本地开发联调

仍在继续推进的部分包括：

- 移动端产品化补完
- 屏幕感知与设备工作流的默认打通
- A2UI 在真实产品链路中的更深集成
- 更完整的部署、OIDC、E2EE 与生态能力

详细进度与验证记录见 [STATUS.md](./STATUS.md)。

## Ottie 最终会变成什么

Ottie 正在走向一整套 Agent-Native 的通信栈：

- 每个用户都有持久存在的个人 Agent
- 桌面端不只是界面，而是智能通信表面
- 设备本身可以成为具备上下文感知的 Device Agent
- 记忆成为通信的一部分
- 不同自部署服务器通过 Matrix 联邦互通
- 第三方 Agent 通过 A2A / A2UI / MCP 接入
- 通信从“发消息”扩展为“协调与执行”

长期来看，Ottie 想成为一个世界里的默认通信入口：在这个世界里，人和 AI 越来越多地通过彼此来交流。

更完整的系统设计见 [docs/architecture.md](./docs/architecture.md)。

## 仓库结构

Ottie 不是单仓项目，而是一个由三个仓库组成的 GitHub 组织工程：

- `ottie`：主产品仓库，包含 desktop、mobile、shared packages 和 docs
- `ottie-agent`：默认 Agent adapter、skills、memory、screen 模块
- `server`：Matrix / Tuwunel 部署仓库

重要说明：当前这个仓库并不是一个真正意义上的“单仓独立可跑”结构。

桌面端目前会在开发环境中直接引用相邻目录里的 `ottie-agent` 本地包，所以推荐的开发方式是把三个仓库并排放在同一个工作区里。

## 推荐本地工作区

```bash
workspace/
├── ottie/
├── ottie-agent/
└── server/
```

## 环境要求

- Node.js 22+
- npm
- Docker

## 本地开发

先把三个仓库并排 clone 下来：

```bash
git clone https://github.com/ottie-im/server
git clone https://github.com/ottie-im/ottie-agent
git clone https://github.com/ottie-im/ottie
```

先启动本地 Matrix 服务：

```bash
cd server
./setup.sh localhost local
```

安装 agent 仓库依赖：

```bash
cd ../ottie-agent
npm install
```

安装主仓依赖：

```bash
cd ../ottie
npm install
```

启动桌面端开发环境：

```bash
cd apps/desktop
npm run dev
```

如果你想启动 Tauri 桌面壳：

```bash
npm run tauri:dev
```

## 主要模块

- `packages/contracts`：共享类型定义
- `packages/matrix`：Matrix 通信层
- `packages/ui`：共享 UI 组件
- `packages/a2ui`：A2UI 渲染基础
- `apps/desktop`：桌面端应用
- `apps/mobile`：移动端应用（进行中）

## 文档

- 架构设计：[docs/architecture.md](./docs/architecture.md)
- 开发计划：[docs/development-plan.md](./docs/development-plan.md)
- 当前状态：[STATUS.md](./STATUS.md)
- AI 开发指南：[CLAUDE.md](./CLAUDE.md)

## 参与贡献

人类开发者建议从上面的文档开始阅读。

如果你是参与开发的 AI Agent，请先读 [CLAUDE.md](./CLAUDE.md)。

## License

MIT
