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
  const dateStr = now.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  const weekStr = now.toLocaleDateString('zh-CN', { weekday: 'short' })
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="relative min-h-svh bg-gradient-to-b from-sky-700 via-sky-500 to-sky-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 transition-colors">
      <header className="flex flex-col gap-1 px-4 pt-4 pb-1 sm:flex-row sm:items-center sm:gap-3">
        {/* Left: greeting + date + time */}
        <div className="flex items-baseline gap-2 min-w-0 flex-1">
          <h1 className="text-base font-medium text-white truncate sm:text-lg">{greeting}</h1>
          <span className="text-xs text-white/50 shrink-0 tabular-nums sm:text-sm">
            {dateStr} {weekStr} {timeStr}
          </span>
        </div>

        {/* Right: weather summary or brand + toggles */}
        <div className="flex items-center gap-2 shrink-0">
          {weather ? (
            <div className="flex items-center gap-1.5 text-white">
              <span className="text-lg">{WEATHER_CODE_MAP[weather.iconCode]?.emoji}</span>
              <span className="text-sm font-medium">{weather.cityName}</span>
              <span className="text-base font-light">{weather.temperature}°</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-white/50">天气查询</span>
          )}
          <div className="flex items-center gap-0.5 border-l border-white/15 pl-1.5 ml-0.5">
            <UnitToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md pb-8 md:max-w-2xl">
        {children}
      </main>
    </div>
  )
}
