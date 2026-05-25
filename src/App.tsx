import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from './components/layout/AppShell'
import { Loader } from './components/ui/Loader'
import { ErrorBanner } from './components/ui/ErrorBanner'
import { SearchBar } from './components/weather/SearchBar'
import { WeatherCard } from './components/weather/WeatherCard'
import { ForecastStrip } from './components/weather/ForecastStrip'
import { HourlyForecast } from './components/weather/HourlyForecast'
import { FavoritesList } from './components/weather/FavoritesList'
import { useWeather } from './hooks/useWeather'
import { useGeolocation } from './hooks/useGeolocation'
import { useWeatherStore } from './store/weatherStore'

export default function App() {
  const current = useWeatherStore((s) => s.current)
  const forecast = useWeatherStore((s) => s.forecast)
  const lastSearchedCity = useWeatherStore((s) => s.lastSearchedCity)
  const recentSearches = useWeatherStore((s) => s.recentSearches)
  const hourly = useWeatherStore((s) => s.hourly)

  const removeRecentSearch = useWeatherStore((s) => s.removeRecentSearch)
  const { fetchWeather, retry } = useWeather()
  const { locate } = useGeolocation()

  // 自动恢复：同小时内用缓存免请求，过期则重新拉取
  useEffect(() => {
    const restored = useWeatherStore.getState().restoreFromCache()
    if (!restored && lastSearchedCity) {
      fetchWeather(lastSearchedCity)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (city: string) => {
    fetchWeather(city)
  }

  const handleQuickSelect = (city: string) => {
    fetchWeather(city, true) // 即时，跳过 debounce
  }

  const handleClear = () => {
    useWeatherStore.getState().resetToIdle()
  }

  return (
    <AppShell weather={current.status === 'success' ? current.data : null}>
      <SearchBar onSearch={handleSearch} disabled={current.status === 'loading'} />

      {/* Toolbar: Locate + Recent searches + Clear */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <button
          onClick={locate}
          disabled={current.status === 'loading'}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/20 transition-all disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          定位
        </button>
        {recentSearches.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {recentSearches.map((city) => (
              <motion.span
                key={city}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group flex shrink-0 items-center gap-0.5 rounded-lg bg-white/10"
              >
                <button
                  onClick={() => handleQuickSelect(city)}
                  disabled={current.status === 'loading'}
                  className="px-2 py-1 text-xs text-white/60 hover:text-white transition-colors disabled:opacity-30"
                >
                  {city}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeRecentSearch(city) }}
                  className="pr-1.5 text-white/30 hover:text-red-400 transition-colors"
                  aria-label={`移除 ${city}`}
                >
                  ×
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {current.status === 'loading' && <Loader />}

      {/* Error */}
      {current.status === 'error' && current.error && (
        <div className="px-4 pt-4">
          <ErrorBanner message={current.error} onRetry={retry} />
        </div>
      )}

      {/* Success */}
      {current.status === 'success' && current.data && (
        <>
          <WeatherCard weather={current.data} onClose={handleClear} />
          {forecast.status === 'success' && forecast.data && (
            <ForecastStrip forecast={forecast.data} />
          )}
          {hourly.data && hourly.data.length > 0 && (
            <HourlyForecast hourly={hourly.data} />
          )}
          {forecast.status === 'error' && forecast.error && (
            <div className="px-4 pt-2">
              <ErrorBanner message={forecast.error} />
            </div>
          )}
        </>
      )}

      {/* Idle state */}
      {current.status === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <motion.button
            onClick={locate}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-6xl"
            aria-label="点击定位"
          >
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🌤️
            </motion.span>
          </motion.button>
          <p className="mt-4 text-sm text-white/40">输入城市名称或点击定位查看天气</p>
        </motion.div>
      )}

      {/* Favorites */}
      <FavoritesList onSelect={handleQuickSelect} />
    </AppShell>
  )
}
