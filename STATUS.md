# Ottie 主仓库 — 项目状态

> 最后更新：2026-04-08

## 当前进度

| Phase | 状态 | 完成日期 |
|-------|------|---------|
| Phase -1: 建仓库 | ✅ 完成 | 2026-04-07 |
| Phase 0: 服务器 | ✅ 完成（在 server 仓库） | 2026-04-07 |
| Phase 1: 接口 + 通信层 | ✅ 完成 | 2026-04-08 |
| Phase 2: 默认 Agent | ✅ 完成（在 ottie-agent 仓库） | 2026-04-08 |
| Phase 3: 界面层 | ⬜ 未开始 | |
| Phase 4: 设备感知 | ⬜ 未开始 | |
| Phase 5: 生态接入 | ⬜ 未开始 | |

## 已完成的事

### Phase 1 — packages/contracts/
- [x] 消息、设备、Agent 适配器等核心类型
- [x] 好友请求、好友分组、黑名单、消息撤回类型
- [x] OttieAgentAdapter 接口定义

### Phase 1 — packages/matrix/
- [x] OttieMatrix 类：登录/注册/登出
- [x] 消息收发 + 消息撤回
- [x] 好友管理：搜索、请求（需同意）、好友列表
- [x] 好友分组 + 黑名单
- [x] 9/9 集成测试通过（连接 localhost:8008 Tuwunel）

## 下一步：Phase 3 — 界面层

### 待确认
- [ ] 先做桌面端（Tauri v2 + React）还是移动端（React Native）？
- [ ] 导航栏 tab 设计？

### Step 3.1 — packages/ui/（组件库）
- [ ] OttieBubble — 聊天气泡
- [ ] OttieInput — 输入框
- [ ] OttieApproval — 审批卡片
- [ ] OttieFriendList — 好友列表
- [ ] OttieChat — 聊天页面
- [ ] OttieLogin — 登录页

### Step 3.2 — apps/desktop/ 或 apps/mobile/
- [ ] 搭建 App 框架
- [ ] 接入 OttieMatrix + OttieAgentAdapter
- [ ] 跑通完整链路：登录 → 加好友 → 输入意图 → 改写 → 审批 → 发送 → 对方收到

### Step 3.3 — Agent 切换页面
- [ ] 设置里加入口，UI 先到位

## 如何继续开发

```bash
cd ~/Developer/ottie/ottie
claude
> 读 STATUS.md 和 CLAUDE.md，继续 Phase 3
```

## 本地环境要求

- Node.js 22+, npm 11+
- Tuwunel 跑在 localhost:8008（启动：cd ../server && docker compose up -d）
- 注册 token: ottie-dev-token
