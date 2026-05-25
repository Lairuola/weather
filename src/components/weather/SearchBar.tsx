import { useState, type FormEvent } from 'react'

interface SearchBarProps {
  onSearch: (city: string) => void
  disabled: boolean
}

export function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSearch(value.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-6">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入城市名称..."
          disabled={disabled}
          aria-label="城市名称"
          className="w-full rounded-2xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 px-4 py-3 pr-12 text-lg text-white placeholder:text-white/50 outline-none transition-all focus:ring-2 focus:ring-white/40 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="搜索"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  )
}
