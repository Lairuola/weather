import { useState, useEffect, useRef, type FormEvent } from 'react'
import { motion } from 'framer-motion'

interface SearchBarProps {
  onSearch: (city: string) => void
  disabled: boolean
}

export function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // `/` 键聚焦搜索
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !disabled && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [disabled])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSearch(value.trim())
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit}
      className="px-4 pt-6"
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入城市名称..."
          disabled={disabled}
          aria-label="城市名称"
          className="w-full rounded-2xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 px-4 py-3 pr-20 text-lg text-white placeholder:text-white/50 outline-none transition-all focus:ring-2 focus:ring-white/40 disabled:opacity-50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* `/` shortcut hint */}
          {!value && (
            <kbd className="hidden sm:inline-flex items-center rounded-md border border-white/20 px-1.5 py-0.5 text-xs text-white/30">
              /
            </kbd>
          )}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="submit"
            disabled={disabled || !value.trim()}
            aria-label="搜索"
            className="rounded-xl p-2 text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.form>
  )
}
