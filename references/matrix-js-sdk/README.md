# Matrix JS SDK — 参考指南

## 官方资源
- 文档：https://matrix-org.github.io/matrix-js-sdk/
- GitHub：https://github.com/matrix-org/matrix-js-sdk
- npm：`matrix-js-sdk`

## 安装
```bash
npm install matrix-js-sdk
```

## 关键 API

### 创建客户端
```typescript
import sdk from 'matrix-js-sdk'

const client = sdk.createClient({
  baseUrl: 'https://ottie.app',
  accessToken: 'your_access_token',
  userId: '@wendell:ottie.app',
})
```

### 登录
```typescript
const response = await client.login('m.login.password', {
  user: 'wendell',
  password: 'xxx',
})
// SSO/OIDC 登录走 client.loginWithSso()
```

### 发消息
```typescript
await client.sendEvent(roomId, 'm.room.message', {
  msgtype: 'm.text',
  body: '周五晚上有空一起吃个饭吗？',
})
```

### 监听消息
```typescript
client.on('Room.timeline', (event, room) => {
  if (event.getType() === 'm.room.message') {
    console.log(event.getContent().body)
  }
})
await client.startClient()
```

### 搜索用户
```typescript
const results = await client.searchUserDirectory({ term: 'zhang' })
```

### 同步历史
```typescript
const messages = await client.createMessagesRequest(roomId, token, 50, 'b')
```

## 自定义事件类型
Ottie 使用自定义事件类型 `m.ottie.message` 存储完整消息结构。
同时发一条标准 `m.room.message` 作为 fallback。

## 端到端加密
```typescript
const client = sdk.createClient({
  baseUrl: 'https://ottie.app',
  accessToken: token,
  userId: userId,
  deviceId: deviceId,
})
await client.initCrypto()
await client.startClient()
```

## 注意
- 不要复制 matrix-js-sdk 源码到项目里
- 通过 npm install 安装，通过 import 使用
- 有问题查官方文档，不要猜 API
