/**
 * Ottie 灵动岛 / Live Activities
 *
 * 场景：
 * 1. Agent 正在改写 — "🦦 Ottie 思考中..."
 * 2. 审批待处理 — "✉️ 1 条待审批"
 * 3. 新消息 — "📩 Bob: 吃火锅吗？"
 * 4. 设备通知 — "🖥️ 电脑请求权限"
 *
 * 使用 expo-widgets 的 Live Activity API。
 * 实际的 Widget UI 需要在 iOS Widget Extension 中用 SwiftUI 定义。
 *
 * 这个文件提供 React Native 侧的 API 封装。
 */

// Types for Live Activity states
export interface OttieLiveActivityState {
  type: 'thinking' | 'approval' | 'message' | 'device'
  title: string
  subtitle?: string
  icon: string
  // For message/device: quick action buttons
  actions?: { label: string; id: string }[]
}

/**
 * 启动一个 Live Activity（灵动岛）
 * 需要 expo-widgets 安装后才能使用
 */
export async function startLiveActivity(state: OttieLiveActivityState): Promise<string | null> {
  try {
    // expo-widgets API (需要安装 expo-widgets)
    // const { startActivity } = require('expo-widgets')
    // return await startActivity('OttieLiveActivity', state)

    // Placeholder — 等 expo-widgets 安装后替换
    return `activity_${Date.now()}`
  } catch {
    return null
  }
}

/**
 * 更新现有的 Live Activity
 */
export async function updateLiveActivity(activityId: string, state: OttieLiveActivityState): Promise<void> {
  try {
    // const { updateActivity } = require('expo-widgets')
    // await updateActivity(activityId, state)
  } catch {}
}

/**
 * 结束一个 Live Activity
 */
export async function endLiveActivity(activityId: string): Promise<void> {
  try {
    // const { endActivity } = require('expo-widgets')
    // await endActivity(activityId)
  } catch {}
}

// ---- 便捷方法 ----

export function showThinking(): Promise<string | null> {
  return startLiveActivity({
    type: 'thinking',
    title: 'Ottie 思考中...',
    icon: '🦦',
  })
}

export function showApprovalPending(draft: string): Promise<string | null> {
  return startLiveActivity({
    type: 'approval',
    title: '待审批',
    subtitle: draft.slice(0, 40),
    icon: '✉️',
    actions: [
      { label: '批准', id: 'approve' },
      { label: '拒绝', id: 'reject' },
    ],
  })
}

export function showNewMessage(sender: string, body: string): Promise<string | null> {
  return startLiveActivity({
    type: 'message',
    title: sender,
    subtitle: body.slice(0, 40),
    icon: '📩',
  })
}

export function showDeviceAlert(content: string): Promise<string | null> {
  return startLiveActivity({
    type: 'device',
    title: '设备通知',
    subtitle: content.slice(0, 40),
    icon: '🖥️',
    actions: [
      { label: '处理', id: 'handle' },
      { label: '忽略', id: 'dismiss' },
    ],
  })
}
