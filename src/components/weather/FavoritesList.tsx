import { AnimatePresence, motion } from 'framer-motion'
import { useWeatherStore } from '../../store/weatherStore'

interface FavoritesListProps {
  onSelect: (city: string) => void
}

export function FavoritesList({ onSelect }: FavoritesListProps) {
  const favorites = useWeatherStore((s) => s.favorites)
  const removeFavorite = useWeatherStore((s) => s.removeFavorite)

  return (
    <div className="px-4 py-4">
      <h3 className="mb-3 text-sm font-medium tracking-wide text-white/60 uppercase">收藏城市</h3>
      {favorites.length === 0 ? (
        <p className="text-sm text-white/40">搜索城市后点击 ☆ 即可收藏</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {favorites.map((city) => (
              <motion.button
                key={city}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(city)}
                className="group flex items-center gap-1 rounded-xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/30"
              >
                <span>{city}</span>
                <span
                  role="button"
                  aria-label={`删除 ${city}`}
                  onClick={(e) => { e.stopPropagation(); removeFavorite(city) }}
                  className="ml-1 text-white/40 hover:text-red-400 transition-colors"
                >
                  ×
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
