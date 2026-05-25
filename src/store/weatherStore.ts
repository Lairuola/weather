import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ForecastDay, HourlyForecast, Weather } from '../api/types'

interface WeatherCache {
  fetchedAt: number
  current: Weather
  forecast: ForecastDay[]
  hourly: HourlyForecast[]
}

function isSameHour(ts: number): boolean {
  const then = new Date(ts)
  const now = new Date()
  return then.getFullYear() === now.getFullYear()
    && then.getMonth() === now.getMonth()
    && then.getDate() === now.getDate()
    && then.getHours() === now.getHours()
}

interface WeatherStatus {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: Weather | null
  error: string | null
}

interface ForecastStatus {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: ForecastDay[] | null
  error: string | null
}

interface AppStore {
  current: WeatherStatus
  forecast: ForecastStatus
  hourly: { data: HourlyForecast[] | null }
  weatherCache: WeatherCache | null
  favorites: string[]
  recentSearches: string[]
  lastSearchedCity: string | null
  unit: 'celsius' | 'fahrenheit'
  windUnit: 'ms' | 'kmh'
  theme: 'light' | 'dark' | 'system'
  geoDenied: boolean

  setCurrentLoading: () => void
  setCurrentSuccess: (data: Weather) => void
  setCurrentError: (error: string) => void
  setForecastLoading: () => void
  setForecastSuccess: (data: ForecastDay[]) => void
  setForecastError: (error: string) => void
  setHourly: (data: HourlyForecast[]) => void
  saveToCache: (current: Weather, forecast: ForecastDay[], hourly: HourlyForecast[]) => void
  restoreFromCache: () => boolean
  resetToIdle: () => void
  setGeoDenied: (denied: boolean) => void
  addFavorite: (city: string) => void
  removeFavorite: (city: string) => void
  addRecentSearch: (city: string) => void
  removeRecentSearch: (city: string) => void
  setUnit: (unit: 'celsius' | 'fahrenheit') => void
  setWindUnit: (unit: 'ms' | 'kmh') => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useWeatherStore = create<AppStore>()(
  persist(
    (set) => ({
      current: { status: 'idle', data: null, error: null },
      forecast: { status: 'idle', data: null, error: null },
      hourly: { data: null },
      weatherCache: null,
      favorites: [],
      recentSearches: [],
      lastSearchedCity: null,
      unit: 'celsius',
      windUnit: 'ms' as const,
      theme: 'system',
      geoDenied: false,

      setCurrentLoading: () => set({ current: { status: 'loading', data: null, error: null } }),
      setCurrentSuccess: (data) => set({ current: { status: 'success', data, error: null } }),
      setCurrentError: (error) => set({ current: { status: 'error', data: null, error } }),
      setForecastLoading: () => set({ forecast: { status: 'loading', data: null, error: null } }),
      setForecastSuccess: (data) => set({ forecast: { status: 'success', data, error: null } }),
      setForecastError: (error) => set({ forecast: { status: 'error', data: null, error } }),
      setHourly: (data) => set({ hourly: { data } }),
      saveToCache: (current, forecast, hourly) => set({
        weatherCache: { fetchedAt: Date.now(), current, forecast, hourly },
      }),
      restoreFromCache: () => {
        const cache = useWeatherStore.getState().weatherCache
        if (!cache || !isSameHour(cache.fetchedAt)) return false
        set({
          current: { status: 'success' as const, data: cache.current, error: null },
          forecast: { status: 'success' as const, data: cache.forecast, error: null },
          hourly: { data: cache.hourly },
        })
        return true
      },
      resetToIdle: () => set({
        current: { status: 'idle' as const, data: null, error: null },
        forecast: { status: 'idle' as const, data: null, error: null },
        hourly: { data: null },
      }),
      setGeoDenied: (denied) => set({ geoDenied: denied }),

      addFavorite: (city) => set((s) => ({
        favorites: s.favorites.includes(city) ? s.favorites : [...s.favorites, city],
      })),
      removeFavorite: (city) => set((s) => ({
        favorites: s.favorites.filter((c) => c !== city),
      })),
      addRecentSearch: (city) => set((s) => ({
        recentSearches: [city, ...s.recentSearches.filter((c) => c !== city)].slice(0, 5),
        lastSearchedCity: city,
      })),
      removeRecentSearch: (city) => set((s) => ({
        recentSearches: s.recentSearches.filter((c) => c !== city),
      })),

      setUnit: (unit) => set({ unit }),
      setWindUnit: (windUnit) => set({ windUnit }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'weather-store',
      partialize: (state) => ({
        favorites: state.favorites,
        recentSearches: state.recentSearches,
        lastSearchedCity: state.lastSearchedCity,
        weatherCache: state.weatherCache,
        unit: state.unit,
        windUnit: state.windUnit,
        theme: state.theme,
      }),
    },
  ),
)
