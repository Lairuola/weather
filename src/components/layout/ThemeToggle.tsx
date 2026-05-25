import { useEffect } from 'react'
import { useWeatherStore } from '../../store/weatherStore'

const themes = ['light', 'dark', 'system'] as const
const icons: Record<string, string> = { light: '☀️', dark: '🌙', system: '💻' }

function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system: 跟随 OS
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    root.classList.toggle('dark', mq.matches)
  }
}

export function ThemeToggle() {
  const theme = useWeatherStore((s) => s.theme)
  const setTheme = useWeatherStore((s) => s.setTheme)

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const cycle = () => {
    const idx = themes.indexOf(theme)
    setTheme(themes[(idx + 1) % themes.length])
  }

  return (
    <button
      onClick={cycle}
      aria-label={`主题：${theme}`}
      className="rounded-xl px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
    >
      {icons[theme]} {theme === 'system' ? '自动' : theme === 'dark' ? '深色' : '浅色'}
    </button>
  )
}
