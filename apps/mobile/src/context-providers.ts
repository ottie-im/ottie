/**
 * 移动端上下文提供者
 *
 * 轻量上下文（日历、定位）给个人 Agent 参考。
 * 架构文档：手机特有能力 = 日历·定位·通知
 */

// 日历权限 + 读取
export async function requestCalendarAccess(): Promise<boolean> {
  try {
    const { requestCalendarPermissionsAsync, getEventsAsync } = await import('expo-calendar')
    const { status } = await requestCalendarPermissionsAsync()
    return status === 'granted'
  } catch {
    return false
  }
}

export async function getTodayEvents(): Promise<{ title: string; startDate: string }[]> {
  try {
    const { getEventsAsync, getCalendarsAsync } = await import('expo-calendar')
    const calendars = await getCalendarsAsync()
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
    const events = await getEventsAsync(
      calendars.map((c: any) => c.id),
      start,
      end
    )
    return events.map((e: any) => ({ title: e.title, startDate: e.startDate }))
  } catch {
    return []
  }
}

// 定位权限 + 获取
export async function requestLocationAccess(): Promise<boolean> {
  try {
    const { requestForegroundPermissionsAsync } = await import('expo-location')
    const { status } = await requestForegroundPermissionsAsync()
    return status === 'granted'
  } catch {
    return false
  }
}

export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { getCurrentPositionAsync } = await import('expo-location')
    const loc = await getCurrentPositionAsync({})
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
  } catch {
    return null
  }
}

/**
 * 获取当前上下文摘要（给 Agent 参考）
 */
export async function getContextSummary(): Promise<string> {
  const parts: string[] = []

  const events = await getTodayEvents()
  if (events.length > 0) {
    parts.push(`今天有 ${events.length} 个日程：${events.slice(0, 3).map(e => e.title).join('、')}`)
  }

  const loc = await getCurrentLocation()
  if (loc) {
    parts.push(`当前位置：${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`)
  }

  return parts.join('。') || '无额外上下文'
}
