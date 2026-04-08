# A2UI — 参考指南

## 官方资源
- 官网：https://a2ui.org/
- GitHub：https://github.com/google/A2UI
- 规范版本：v0.8（Public Preview，走向 v1.0）

## 核心概念
A2UI 让 Agent 发送声明式 JSON 描述 UI，客户端用原生组件渲染。
Agent 不输出 HTML/JS，只输出组件描述。客户端维护"受信组件目录"。

## JSON 格式示例
```json
{
  "components": [
    { "id": "c1", "type": "card", "properties": { "title": "订座确认" } },
    { "id": "c2", "type": "text-field", "properties": { "label": "人数", "value": 2 } },
    { "id": "c3", "type": "date-picker", "properties": { "label": "日期" } },
    { "id": "c4", "type": "button", "properties": { "label": "确认订座" } }
  ]
}
```

## 渲染器集成
```typescript
// 注册组件目录
const catalog = {
  'card': OttieCard,           // 映射到你的组件
  'text-field': OttieTextField,
  'date-picker': OttieDatePicker,
  'button': OttieButton,
}

// 渲染
<A2UIRenderer payload={payload} catalog={catalog} onEvent={handleEvent} />
```

## 事件回传
用户操作（点击、输入、提交）生成 A2UIEvent，发回给 Agent。

## 安全
- Agent 只能请求目录里有的组件
- 未注册组件 → 拒绝渲染 → 显示 fallback
- A2UI 是数据格式，不是可执行代码

## 注意
- 不要复制 A2UI 源码
- 用官方 SDK 或直接解析 JSON
- 参考 google/A2UI 仓库的 samples/ 目录
