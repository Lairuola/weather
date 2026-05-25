import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ForecastDay, Weather } from '../api/types'

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
  favorites: string[]
  recentSearches: string[]
  lastSearchedCity: string | null
  unit: 'celsius' | 'fahrenheit'
  theme: 'light' | 'dark' | 'system'
  geoDenied: boolean

  setCurrentLoading: () => void
  setCurrentSuccess: (data: Weather) => void
  setCurrentError: (error: string) => void
  setForecastLoading: () => void
  setForecastSuccess: (data: ForecastDay[]) => void
  setForecastError: (error: string) => void
  setGeoDenied: (denied: boolean) => void
  addFavorite: (city: string) => void
  removeFavorite: (city: string) => void
  addRecentSearch: (city: string) => void
  setUnit: (unit: 'celsius' | 'fahrenheit') => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useWeatherStore = create<AppStore>()(
  persist(
    (set) => ({
      current: { status: 'idle', data: null, error: null },
      forecast: { status: 'idle', data: null, error: null },
      favorites: [],
      recentSearches: [],
      lastSearchedCity: null,
      unit: 'celsius',
      theme: 'system',
      geoDenied: false,

      setCurrentLoading: () => set({ current: { status: 'loading', data: null, error: null } }),
      setCurrentSuccess: (data) => set({ current: { status: 'success', data, error: null } }),
      setCurrentError: (error) => set({ current: { status: 'error', data: null, error } }),
      setForecastLoading: () => set({ forecast: { status: 'loading', data: null, error: null } }),
      setForecastSuccess: (data) => set({ forecast: { status: 'success', data, error: null } }),
      setForecastError: (error) => set({ forecast: { status: 'error', data: null, error } }),
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

      setUnit: (unit) => set({ unit }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'weather-store',
      partialize: (state) => ({
        favorites: state.favorites,
        recentSearches: state.recentSearches,
        lastSearchedCity: state.lastSearchedCity,
        unit: state.unit,
        theme: state.theme,
      }),
    },
  ),
)
