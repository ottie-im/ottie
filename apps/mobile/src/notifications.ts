/**
 * 移动端推送通知
 *
 * 用于：新消息通知、设备 Agent 推送、审批提醒
 * 使用 expo-notifications（需要安装：npx expo install expo-notifications）
 */

export interface OttieNotification {
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const Notifications = await import('expo-notifications')
    const { status: existing } = await Notifications.getPermissionsAsync()
    if (existing === 'granted') return true
    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
  } catch {
    return false
  }
}

/**
 * 发送本地通知（不需要推送服务）
 */
export async function sendLocalNotification(notification: OttieNotification): Promise<void> {
  try {
    const Notifications = await import('expo-notifications')
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: 'default',
      },
      trigger: null, // 立即发送
    })
  } catch {}
}

/**
 * 新消息通知
 */
export function notifyNewMessage(sender: string, body: string, roomId: string): void {
  sendLocalNotification({
    title: `🦦 ${sender}`,
    body: body.length > 50 ? body.slice(0, 50) + '...' : body,
    data: { type: 'message', roomId },
  })
}

/**
 * 审批待处理通知
 */
export function notifyApprovalPending(draft: string): void {
  sendLocalNotification({
    title: '🦦 Ottie 拟好了消息',
    body: draft.length > 50 ? draft.slice(0, 50) + '...' : draft,
    data: { type: 'approval' },
  })
}

/**
 * 设备 Agent 通知
 */
export function notifyDeviceAlert(content: string, sourceApp?: string): void {
  sendLocalNotification({
    title: `🖥️ ${sourceApp ?? '设备通知'}`,
    body: content,
    data: { type: 'device' },
  })
}

/**
 * 配置通知处理器（应用启动时调用）
 */
export async function setupNotificationHandler(): Promise<void> {
  try {
    const Notifications = await import('expo-notifications')
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    })
  } catch {}
}
