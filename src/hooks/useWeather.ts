import { useCallback, useEffect, useRef } from 'react'
import { provider } from '../api/provider'
import { useWeatherStore } from '../store/weatherStore'

export function useWeather() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (debounceRef.current != null) clearTimeout(debounceRef.current)
    }
  }, [])

  const doFetch = useCallback(async (trimmed: string, controller: AbortController) => {
    try {
      const signal = controller.signal
      const [weather, forecast] = await Promise.all([
        provider.getCurrentWeather(trimmed),
        provider.getForecast(trimmed),
      ])
      if (signal.aborted) return
      const s = useWeatherStore.getState()
      s.setCurrentSuccess(weather)
      s.setForecastSuccess(forecast)
      s.addRecentSearch(trimmed)
    } catch (err) {
      if (controller.signal.aborted) return
      const message = err instanceof Error ? err.message : '未知错误'
      const s2 = useWeatherStore.getState()
      s2.setCurrentError(message)
      s2.setForecastError(message)
    }
  }, [])

  const fetchWeather = useCallback((city: string, immediate = false) => {
    const trimmed = city.trim()
    if (!trimmed) return

    const store = useWeatherStore.getState()
    store.setCurrentLoading()
    store.setForecastLoading()

    // Cancel previous
    abortRef.current?.abort()
    if (debounceRef.current != null) clearTimeout(debounceRef.current)

    if (immediate) {
      const controller = new AbortController()
      abortRef.current = controller
      doFetch(trimmed, controller)
    } else {
      debounceRef.current = setTimeout(() => {
        const controller = new AbortController()
        abortRef.current = controller
        doFetch(trimmed, controller)
      }, 400)
    }
  }, [doFetch])

  const retry = useCallback(() => {
    const city = useWeatherStore.getState().lastSearchedCity
    if (city) fetchWeather(city, true)
  }, [fetchWeather])

  return { fetchWeather, retry }
}
