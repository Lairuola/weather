import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-sky-700 via-sky-500 to-sky-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-xl font-medium text-white">天气查询</h1>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md pb-8 md:max-w-2xl">
        {children}
      </main>
    </div>
  )
}
