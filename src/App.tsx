import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { Loader } from './components/ui/Loader'
import { ErrorBanner } from './components/ui/ErrorBanner'
import { SearchBar } from './components/weather/SearchBar'
import { WeatherCard } from './components/weather/WeatherCard'
import { ForecastStrip } from './components/weather/ForecastStrip'
import { FavoritesList } from './components/weather/FavoritesList'
import { useWeather } from './hooks/useWeather'
import { useGeolocation } from './hooks/useGeolocation'
import { useWeatherStore } from './store/weatherStore'

export default function App() {
  const current = useWeatherStore((s) => s.current)
  const forecast = useWeatherStore((s) => s.forecast)
  const lastSearchedCity = useWeatherStore((s) => s.lastSearchedCity)

  const { fetchWeather, retry } = useWeather()
  const { locate } = useGeolocation()

  // 自动恢复上次搜索
  useEffect(() => {
    if (lastSearchedCity) {
      fetchWeather(lastSearchedCity)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (city: string) => {
    fetchWeather(city)
  }

  const handleSelectFavorite = (city: string) => {
    fetchWeather(city)
  }

  return (
    <AppShell>
      <SearchBar onSearch={handleSearch} disabled={current.status === 'loading'} />

      {/* Geolocation button */}
      <div className="px-4 pt-3">
        <button
          onClick={locate}
          disabled={current.status === 'loading'}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/20 transition-all disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          定位
        </button>
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
          <WeatherCard weather={current.data} />
          {forecast.status === 'success' && forecast.data && (
            <ForecastStrip forecast={forecast.data} />
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
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <span className="text-6xl">🌤️</span>
          <p className="mt-4 text-sm">输入城市名称或点击定位查看天气</p>
        </div>
      )}

      {/* Favorites + Recent Searches */}
      <FavoritesList onSelect={handleSelectFavorite} />
    </AppShell>
  )
}
