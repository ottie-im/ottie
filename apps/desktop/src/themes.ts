/**
 * 主题系统 — 浅色/深色/跟随系统
 * 参考 Paseo 的 theme definitions
 */

export type ThemeId = 'light' | 'dark' | 'system'

const lightTheme: Record<string, string> = {
  '--white': '#ffffff',
  '--cloud-gray': '#f0f2f5',
  '--border': '#e9edef',
  '--text-primary': '#111b21',
  '--text-secondary': '#667781',
  '--text-tertiary': '#8696a0',
  '--ottie-green': '#25D366',
  '--ottie-dark': '#128C7E',
  '--danger': '#e53e3e',
  '--shadow-subtle': '0 1px 3px rgba(0,0,0,0.06)',
  '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const darkTheme: Record<string, string> = {
  '--white': '#1e1e2e',
  '--cloud-gray': '#181825',
  '--border': '#313244',
  '--text-primary': '#cdd6f4',
  '--text-secondary': '#a6adc8',
  '--text-tertiary': '#6c7086',
  '--ottie-green': '#a6e3a1',
  '--ottie-dark': '#94e2d5',
  '--danger': '#f38ba8',
  '--shadow-subtle': '0 1px 3px rgba(0,0,0,0.3)',
  '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

export function applyTheme(id: ThemeId) {
  const resolvedId = id === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : id

  const theme = resolvedId === 'dark' ? darkTheme : lightTheme
  const root = document.documentElement

  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(key, value)
  }

  root.setAttribute('data-theme', resolvedId)
  localStorage.setItem('ottie_theme', id)
}

export function getStoredTheme(): ThemeId {
  return (localStorage.getItem('ottie_theme') as ThemeId) ?? 'light'
}

export function initThemeListener(themeId: ThemeId) {
  if (themeId !== 'system') return () => {}

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => applyTheme('system')
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}
