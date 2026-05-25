import type { WeatherProvider } from './types'
import { openmeteoProvider } from './openmeteo'
import { openweathermapProvider } from './openweathermap'

export function createProvider(): WeatherProvider {
  const provider = import.meta.env.VITE_WEATHER_PROVIDER as string
  if (provider === 'openweathermap') return openweathermapProvider
  return openmeteoProvider // 默认 Open-Meteo（免费无需 Key）
}

export const provider = createProvider()
