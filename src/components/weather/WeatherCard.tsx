import type { Weather } from '../../api/types'
import { WEATHER_CODE_MAP } from '../../api/types'
import { useWeatherStore } from '../../store/weatherStore'
import { formatTemp } from '../../utils/format'

interface WeatherCardProps {
  weather: Weather
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const unit = useWeatherStore((s) => s.unit)
  const meta = WEATHER_CODE_MAP[weather.iconCode]
  const gradient = meta?.gradient ?? 'from-gray-400 to-gray-500'
  const isFavorite = useWeatherStore((s) => s.favorites.includes(weather.cityName))
  const addFavorite = useWeatherStore((s) => s.addFavorite)
  const removeFavorite = useWeatherStore((s) => s.removeFavorite)

  return (
    <div className={`mx-4 mt-6 rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg shadow-black/10`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium">{weather.cityName}</h2>
          <p className="text-sm text-white/70">{weather.country}</p>
        </div>
        <button
          onClick={() => isFavorite ? removeFavorite(weather.cityName) : addFavorite(weather.cityName)}
          aria-label={isFavorite ? '取消收藏' : '收藏'}
          className="rounded-xl p-2 text-2xl transition-all hover:scale-110"
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      {/* Main temp */}
      <div className="mt-4 flex items-center gap-4">
        <span className="text-7xl font-light tracking-tighter">{meta?.emoji}</span>
        <div>
          <div className="text-6xl font-light tracking-tighter">{formatTemp(weather.temperature, unit)}</div>
          <div className="text-sm text-white/70">体感 {formatTemp(weather.feelsLike, unit)}</div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-lg">{weather.description}</p>

      {/* Details */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Detail label="湿度" value={weather.humidity > 0 ? `${weather.humidity}%` : 'N/A'} />
        <Detail label="风速" value={`${weather.windSpeed} m/s`} />
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
