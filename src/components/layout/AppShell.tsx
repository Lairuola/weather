import { useState, useEffect, type ReactNode } from 'react'
import type { Weather } from '../../api/types'
import { WEATHER_CODE_MAP } from '../../api/types'
import { ThemeToggle } from './ThemeToggle'
import { UnitToggle } from './UnitToggle'

interface AppShellProps {
  children: ReactNode
  weather?: Weather | null
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return now
}

export function AppShell({ children, weather }: AppShellProps) {
  const now = useClock()
  const greeting = getGreeting()
  const dateStr = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  const weekStr = now.toLocaleDateString('zh-CN', { weekday: 'short' })
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="relative min-h-svh bg-gradient-to-b from-sky-700 via-sky-500 to-sky-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 transition-colors">
      <header className="px-4 pt-4">
        <div className="flex items-start justify-between">
          {/* Left: greeting + date */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-medium text-white/90">
              {greeting}
              <span className="ml-1.5 text-white/50 font-normal">{dateStr} {weekStr}</span>
            </h1>
            <p className="mt-0.5 text-sm text-white/50 tabular-nums">{timeStr}</p>
          </div>

          {/* Right: weather summary or brand */}
          <div className="flex items-center gap-2 ml-3 shrink-0">
            {weather ? (
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-xl">{WEATHER_CODE_MAP[weather.iconCode]?.emoji}</span>
                <span className="text-sm font-medium">{weather.cityName}</span>
                <span className="text-lg font-light">{weather.temperature}°</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-white/60">天气查询</span>
            )}
          </div>
        </div>

        {/* Toggles row */}
        <div className="mt-2 flex items-center gap-1">
          <UnitToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-md pb-8 md:max-w-2xl">
        {children}
      </main>
    </div>
  )
}
