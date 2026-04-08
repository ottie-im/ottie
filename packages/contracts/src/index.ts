// ============================================================
// Ottie Contracts — 所有模块的共享类型定义
// ⚠️ 不要修改此文件。如需变更，提交接口变更请求。
// ============================================================

// ---- 消息相关 ----

export interface OttieMessage {
  id: string
  roomId: string
  senderId: string              // Matrix User ID, e.g. @wendell:ottie.app
  timestamp: number
  type: 'text' | 'file' | 'a2ui' | 'approval' | 'notification'
  content: OttieMessageContent
}

export type OttieMessageContent =
  | { type: 'text'; body: string }
  | { type: 'file'; filename: string; url: string; mimeType: string }
  | { type: 'a2ui'; payload: A2UIPayload }
  | { type: 'approval'; draft: string; originalIntent: string; status: 'pending' | 'approved' | 'edited' | 'rejected' }
  | { type: 'notification'; source: string; event: OttieScreenEvent }

// ---- A2UI 相关 ----

export interface A2UIPayload {
  components: A2UIComponent[]
  data?: Record<string, unknown>
}

export interface A2UIComponent {
  id: string
  type: string                  // e.g. 'text-field', 'button', 'card'
  properties: Record<string, unknown>
  children?: string[]           // child component IDs
}

export interface A2UIEvent {
  componentId: string
  eventType: string             // e.g. 'click', 'submit', 'change'
  value?: unknown
}

// ---- 屏幕感知相关 ----

export interface OttieScreenEvent {
  type: 'gui-popup' | 'cli-prompt' | 'user-action' | 'screen-change'
  timestamp: number
  content: string               // 识别到的文本
  screenshot?: string           // base64 截图（可选）
  confidence: number            // 0-1 识别置信度
  actionRequired: boolean       // 是否需要用户操作
  sourceApp?: string            // 来源应用，e.g. 'Claude Code', 'Terminal'
}

export interface ScreenConfig {
  enableOCR: boolean
  enableAccessibilityTree: boolean
  triggerOnEnter: boolean
  triggerOnClick: boolean
  excludeApps?: string[]        // 不监控的应用
}

// ---- 记忆相关 ----

export interface MemoryEntry {
  id: string
  timestamp: number
  source: 'device' | 'personal' | 'conversation'
  deviceId?: string             // 哪台设备上报的
  content: string               // 记忆内容（~150字符，MEMORY.md 格式）
  raw?: string                  // 原始观察（存 SQLite）
  tags?: string[]
  confidence: number
  supersededBy?: string         // 被哪条新记忆替代
}

export interface MemoryIndex {
  entries: MemoryEntry[]
  lastDream: number             // 上次 autoDream 整理时间
  version: number
}

// ---- 设备相关 ----

export interface OttieDevice {
  id: string
  name: string                  // 用户给的名字，e.g. "电脑一"
  type: 'desktop' | 'mobile'
  agentId: string               // OpenClaw Agent ID
  status: 'online' | 'offline' | 'busy'
  lastSeen: number
  capabilities: DeviceCapability[]
}

export type DeviceCapability =
  | 'exec'          // 执行命令
  | 'read'          // 读文件
  | 'write'         // 写文件
  | 'browser'       // 浏览器控制
  | 'screen'        // 屏幕感知
  | 'calendar'      // 日历（手机）
  | 'location'      // 定位（手机）
  | 'notification'  // 接收通知（手机）

export interface DeviceCommand {
  targetDeviceId: string
  command: string
  args?: Record<string, unknown>
  requireApproval: boolean
}

// ---- 好友相关 ----

export interface FriendRequest {
  id: string
  from: string                    // Matrix User ID, e.g. @alice:localhost
  to: string
  timestamp: number
  message?: string                // 验证消息
  status: 'pending' | 'accepted' | 'rejected'
}

export interface Friend {
  userId: string
  displayName: string
  avatarUrl?: string
  roomId: string                  // 1v1 私聊房间
  addedAt: number
  group?: string                  // 好友分组名
}

export interface FriendGroup {
  name: string
  memberIds: string[]             // userId 列表
}

// ---- 黑名单相关 ----

export interface BlockedUser {
  userId: string
  blockedAt: number
  reason?: string
}

// ---- 消息撤回相关 ----

export interface MessageRecall {
  messageId: string
  roomId: string
  recalledBy: string
  timestamp: number
}

// ---- 用户 & Agent 相关 ----

export interface OttieUser {
  matrixId: string              // @wendell:ottie.app
  displayName: string
  avatarUrl?: string
  agentCard?: AgentCard
  devices: OttieDevice[]
  friends?: Friend[]
  friendGroups?: FriendGroup[]
  blockedUsers?: BlockedUser[]
}

export interface AgentCard {
  name: string                  // Agent 名字（默认 "Ottie"，可改）
  capabilities: string[]        // e.g. ['中文', '英文', '接受约饭']
  workingHours?: string         // e.g. '9:00-18:00'
  persona?: string              // 对外人格描述
}

// ---- Skill 相关 ----

export interface SkillInput {
  intent: string                // 用户原始意图
  context: {
    memory: MemoryIndex         // 当前记忆
    conversation: OttieMessage[] // 最近的对话
    devices: OttieDevice[]      // 在线设备列表
  }
}

export interface SkillOutput {
  action: 'rewrite' | 'approve' | 'dispatch' | 'notify' | 'auto-reply'
  content?: string              // 改写后的消息 / 通知内容
  targetDevice?: string         // 目标设备 ID
  command?: DeviceCommand       // 设备指令
  requireApproval: boolean      // 是否需要用户确认
}

// ---- 审批相关 ----

export interface ApprovalRequest {
  id: string
  timestamp: number
  draft: string                 // Agent 拟好的消息
  originalIntent: string        // 用户原始指令
  targetRoom: string            // 要发送到的 Matrix 房间
  source: 'rewrite' | 'device' | 'auto-reply'
}

export type ApprovalDecision =
  | { action: 'approve' }
  | { action: 'edit'; newContent: string }
  | { action: 'reject' }

// ---- 接收方意图识别 ----

export interface DetectedIntent {
  type: 'invitation' | 'question' | 'request' | 'info' | 'greeting' | 'general'
  summary: string
  suggestedActions: SuggestedAction[]
}

export interface SuggestedAction {
  label: string
  response: string
}

export interface DecisionRequest {
  messageId: string
  roomId: string
  senderName: string
  originalMessage: string
  intent: DetectedIntent
}

// ---- Agent 适配接口 ----
// 任何 Agent 只要实现这个接口，就能接入 Ottie
// OpenClaw 是默认实现，但用户可以换成 LangGraph、Google ADK、或自己写的

export interface OttieAgentAdapter {
  // 基本信息
  id: string
  name: string
  getAgentCard(): AgentCard

  // IM → Agent：用户输入（发送方改写 → 审批）
  onMessage(msg: OttieMessage): Promise<void>

  // IM → Agent：收到对方消息（接收方意图识别 → 决策）
  onIncomingMessage?(msg: OttieMessage, senderName: string): Promise<void>

  // Agent → IM：拟好消息推给用户审批（发送方）
  onDraft: (callback: (draft: ApprovalRequest) => void) => Unsubscribe

  // Agent → IM：识别到意图推给用户决策（接收方）
  onDecision?: (callback: (decision: DecisionRequest) => void) => Unsubscribe

  // IM → Agent：用户审批结果
  onApproval(requestId: string, decision: ApprovalDecision): Promise<OttieMessage | null>

  // IM → Agent：用户选择了一个决策动作（接收方）
  onDecisionAction?(originalMessage: string, chosenAction: SuggestedAction): Promise<string>

  // Agent → IM：通知推送（设备弹窗、CLI变动等）
  onNotification: (callback: (event: OttieScreenEvent) => void) => Unsubscribe

  // 设备相关（可选）
  getDevices?(): Promise<OttieDevice[]>
  sendCommand?(cmd: DeviceCommand): Promise<void>

  // 记忆相关（可选）
  getMemory?(): Promise<MemoryIndex>
  queryMemory?(query: string): Promise<MemoryEntry[]>

  // LLM 配置（可选）
  configureLLM?(config: { baseUrl: string; apiKey: string; model: string }): void

  // 生命周期
  start(): Promise<void>
  stop(): Promise<void>
  getStatus(): 'running' | 'stopped' | 'error'
}

// Agent 注册表：管理多个 Agent 适配器
export interface OttieAgentRegistry {
  register(adapter: OttieAgentAdapter): void
  unregister(agentId: string): void
  get(agentId: string): OttieAgentAdapter | null
  list(): OttieAgentAdapter[]
  getDefault(): OttieAgentAdapter
  setDefault(agentId: string): void
}

// 取消订阅函数类型
export type Unsubscribe = () => void
