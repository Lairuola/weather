import { motion, AnimatePresence } from 'framer-motion'
import type { Weather } from '../../api/types'
import { WEATHER_CODE_MAP } from '../../api/types'
import { useWeatherStore } from '../../store/weatherStore'
import { formatTemp, formatWindDir } from '../../utils/format'

interface WeatherCardProps {
  weather: Weather
  onClose?: () => void
  onRefresh?: () => void
}

export function WeatherCard({ weather, onClose, onRefresh }: WeatherCardProps) {
  const unit = useWeatherStore((s) => s.unit)
  const meta = WEATHER_CODE_MAP[weather.iconCode]
  const gradient = meta?.gradient ?? 'from-gray-400 to-gray-500'
  const isFavorite = useWeatherStore((s) => s.favorites.includes(weather.cityName))
  const addFavorite = useWeatherStore((s) => s.addFavorite)
  const removeFavorite = useWeatherStore((s) => s.removeFavorite)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`mx-4 mt-6 rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg shadow-black/10`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-medium truncate">{weather.cityName}</h2>
          <p className="text-sm text-white/70">{weather.country}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.15 }}
            onClick={() => isFavorite ? removeFavorite(weather.cityName) : addFavorite(weather.cityName)}
            aria-label={isFavorite ? '取消收藏' : '收藏'}
            className="rounded-xl p-2 text-2xl"
          >
          <motion.span
            key={isFavorite ? 'filled' : 'empty'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            {isFavorite ? '★' : '☆'}
          </motion.span>
        </motion.button>
          {onRefresh && (
            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              onClick={onRefresh}
              aria-label="刷新"
              className="rounded-xl p-2 text-lg text-white/40 hover:text-white/80 transition-colors"
            >
              ↻
            </motion.button>
          )}
          {onClose && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              aria-label="关闭"
              className="rounded-xl p-2 text-lg text-white/40 hover:text-white/80 transition-colors"
            >
              ✕
            </motion.button>
          )}
        </div>
      </div>

      {/* Main temp */}
      <div className="mt-4 flex items-center gap-4">
        <motion.span
          className="text-7xl"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {meta?.emoji}
        </motion.span>
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${weather.temperature}-${unit}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-6xl font-light tracking-tighter"
            >
              {formatTemp(weather.temperature, unit)}
            </motion.div>
          </AnimatePresence>
          <div className="text-sm text-white/70">
            体感 {formatTemp(weather.feelsLike, unit)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-lg">{weather.description}</p>

      {/* Details */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Detail label="体感" value={formatTemp(weather.feelsLike, unit)} index={0} />
        <Detail label="湿度" value={weather.humidity > 0 ? `${weather.humidity}%` : 'N/A'} index={1} />
        <Detail
          label="风速"
          value={weather.windDirection != null
            ? `${weather.windSpeed} m/s ${formatWindDir(weather.windDirection)}`
            : `${weather.windSpeed} m/s`
          }
          index={2}
        />
        <Detail label="气压" value="N/A" index={3} />
      </div>
    </motion.div>
  )
}

function Detail({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
      className="rounded-xl bg-white/10 px-3 py-2"
    >
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </motion.div>
  )
}
