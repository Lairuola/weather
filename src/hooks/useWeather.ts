import { useCallback, useEffect, useRef } from 'react'
import { provider } from '../api/provider'
import { useWeatherStore } from '../store/weatherStore'

export function useWeather() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // 组件卸载时取消未完成的请求
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (debounceRef.current != null) clearTimeout(debounceRef.current)
    }
  }, [])

  const fetchWeather = useCallback((city: string) => {
    const trimmed = city.trim()
    if (!trimmed) return

    // 立即显示 loading 状态——用户操作即时反馈
    const store = useWeatherStore.getState()
    store.setCurrentLoading()
    store.setForecastLoading()

    // 400ms debounce——只延迟 API 调用，不延迟 loading
    if (debounceRef.current != null) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      // 取消上一次请求
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

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
    }, 400)
  }, [])

  const retry = useCallback(() => {
    const city = useWeatherStore.getState().lastSearchedCity
    if (city) fetchWeather(city)
  }, [fetchWeather])

  return { fetchWeather, retry }
}
