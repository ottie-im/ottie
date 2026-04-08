# CLAUDE.md — matrix

封装 Matrix JS SDK，提供 Ottie 专用的通信接口。npm 包名：@ottie-im/matrix

依赖：@ottie-im/contracts（只读）、matrix-js-sdk（npm install）
参考：references/matrix-js-sdk/README.md

不能做的事：
- ❌ 不改 contracts
- ❌ 不写 UI
- ❌ 不碰 Agent 逻辑
