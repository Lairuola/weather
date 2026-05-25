import { useState, useEffect, useRef, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWeatherStore } from '../../store/weatherStore'

interface SearchBarProps {
  onSearch: (city: string) => void
  disabled: boolean
}

export function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const recentSearches = useWeatherStore((s) => s.recentSearches)
  const favorites = useWeatherStore((s) => s.favorites)

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

  // 点击外部关闭建议
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)
        && listRef.current && !listRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [])

  const query = value.trim()
  const suggestions = query
    ? [
        ...new Set([
          ...recentSearches.filter((c) => c.includes(query)),
          ...favorites.filter((c) => c.includes(query) && !recentSearches.includes(c)),
        ]),
      ].slice(0, 6)
    : []

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!query) return
    onSearch(query)
    setOpen(false)
  }

  const handleSelect = (city: string) => {
    setValue(city)
    onSearch(city)
    setOpen(false)
    inputRef.current?.blur()
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
          onChange={(e) => { setValue(e.target.value); setOpen(true) }}
          onFocus={() => query && setOpen(true)}
          placeholder="输入城市名称…  按 / 键快速搜索"
          disabled={disabled}
          aria-label="城市名称"
          autoComplete="off"
          className="w-full rounded-2xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 px-4 py-3 pr-12 text-lg text-white placeholder:text-white/50 outline-none transition-all focus:ring-2 focus:ring-white/40 disabled:opacity-50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="submit"
            disabled={disabled || !query}
            aria-label="搜索"
            className="rounded-xl p-2 text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.button>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {open && query && (
            <motion.ul
              ref={listRef}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-2xl border border-white/20 bg-white/15 dark:bg-slate-800/40 backdrop-blur-2xl"
            >
              {suggestions.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white/40">
                      {recentSearches.includes(city) ? '🕐' : '★'}
                    </span>
                    {city}
                  </button>
                </li>
              ))}
              <li className="border-t border-white/10">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/50 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/30">🔍</span>
                  搜索「{query}」
                </button>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  )
}
