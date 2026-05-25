import { useCallback } from 'react'
import { provider } from '../api/provider'
import { useWeatherStore } from '../store/weatherStore'

type GeoError = 'denied' | 'unavailable' | 'timeout' | 'unknown'

function geoErrorType(err: GeolocationPositionError): GeoError {
  switch (err.code) {
    case err.PERMISSION_DENIED: return 'denied'
    case err.POSITION_UNAVAILABLE: return 'unavailable'
    case err.TIMEOUT: return 'timeout'
    default: return 'unknown'
  }
}

const GEO_ERROR_MSG: Record<GeoError, string> = {
  denied: '无法获取位置，请手动搜索城市',
  unavailable: '定位失败，请检查设备 GPS 设置或手动搜索',
  timeout: '定位失败，请检查设备 GPS 设置或手动搜索',
  unknown: '定位失败，请手动搜索城市',
}

export function useGeolocation() {
  const geoDenied = useWeatherStore((s) => s.geoDenied)

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      const store = useWeatherStore.getState()
      store.setGeoDenied(true)
      store.setCurrentError('您的浏览器不支持定位功能')
      return
    }

    const store = useWeatherStore.getState()
    store.setCurrentLoading()
    store.setForecastLoading()
    store.setGeoDenied(false)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const [weather, forecast, hourly] = await Promise.all([
            provider.getCurrentWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            provider.getForecastByCoords(pos.coords.latitude, pos.coords.longitude),
            provider.getHourlyForecastByCoords(pos.coords.latitude, pos.coords.longitude).catch(() => []),
          ])
          const s = useWeatherStore.getState()
          s.setCurrentSuccess(weather)
          s.setForecastSuccess(forecast)
          s.setHourly(hourly)
          s.saveToCache(weather, forecast, hourly)
          s.addRecentSearch(weather.cityName)
        } catch (err) {
          const s2 = useWeatherStore.getState()
          const message = err instanceof Error ? err.message : '未知错误'
          s2.setCurrentError(message)
          s2.setForecastError(message)
        }
      },
      (err) => {
        const type = geoErrorType(err)
        const s = useWeatherStore.getState()
        s.setCurrentError(GEO_ERROR_MSG[type])
        s.setForecastError(GEO_ERROR_MSG[type])
        if (type === 'denied') s.setGeoDenied(true)
      },
      { timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  return { locate, geoDenied }
}
