import type { ForecastDay, Weather, WeatherProvider } from './types'
import { WeatherCode } from './types'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

// WMO Weather Code → 统一 WeatherCode
function wmoToWeatherCode(code: number): WeatherCode {
  if (code === 0) return WeatherCode.Clear
  if (code <= 3) return WeatherCode.FewClouds
  if (code <= 48) return WeatherCode.Fog
  if (code <= 55) return WeatherCode.Drizzle
  if (code <= 65) return WeatherCode.Rain
  if (code <= 75) return WeatherCode.Snow
  if (code <= 82) return WeatherCode.Rain
  if (code >= 95) return WeatherCode.Thunderstorm
  return WeatherCode.Cloudy
}

// WMO code → 中文描述
function wmoToDescription(code: number): string {
  if (code === 0) return '晴'
  if (code <= 3) return '少云转多云'
  if (code <= 48) return '雾'
  if (code <= 55) return '小雨'
  if (code <= 65) return '雨'
  if (code <= 75) return '雪'
  if (code <= 82) return '阵雨'
  if (code >= 95) return '雷暴'
  return '多云'
}

interface GeocodingResult {
  name: string
  country: string
  latitude: number
  longitude: number
}

async function geocode(city: string): Promise<GeocodingResult> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=zh`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(res.status === 404 ? `找不到「${city}」，请检查拼写` : '天气服务不可用')
  }
  const data = await res.json()
  if (!data.results || data.results.length === 0) {
    throw new Error(`找不到「${city}」，请检查拼写`)
  }
  return {
    name: data.results[0].name,
    country: data.results[0].country ?? '',
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
  }
}

function normalizeCurrent(geo: GeocodingResult, current: any): Weather {
  return {
    cityName: geo.name,
    country: geo.country,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    description: wmoToDescription(current.weather_code),
    iconCode: wmoToWeatherCode(current.weather_code),
    humidity: current.relative_humidity_2m ?? 0,
    windSpeed: Math.round((current.wind_speed_10m ?? 0) * 10) / 10,
  }
}

function normalizeForecast(daily: any): ForecastDay[] {
  return daily.time.map((date: string, i: number) => ({
    date,
    tempHigh: Math.round(daily.temperature_2m_max[i]),
    tempLow: Math.round(daily.temperature_2m_min[i]),
    description: wmoToDescription(daily.weather_code[i]),
    iconCode: wmoToWeatherCode(daily.weather_code[i]),
    humidity: 0, // Open-Meteo daily 不返回湿度
  }))
}

export const openmeteoProvider: WeatherProvider = {
  name: 'Open-Meteo',

  async getCurrentWeather(city: string) {
    const geo = await geocode(city)
    const url = `${WEATHER_URL}?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气服务不可用')
    const data = await res.json()
    return normalizeCurrent(geo, data.current)
  },

  async getCurrentWeatherByCoords(lat: number, lon: number) {
    const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气服务不可用')
    const data = await res.json()
    return {
      cityName: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      country: '',
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      description: wmoToDescription(data.current.weather_code),
      iconCode: wmoToWeatherCode(data.current.weather_code),
      humidity: data.current.relative_humidity_2m ?? 0,
      windSpeed: Math.round((data.current.wind_speed_10m ?? 0) * 10) / 10,
    }
  },

  async getForecast(city: string) {
    const geo = await geocode(city)
    const url = `${WEATHER_URL}?latitude=${geo.latitude}&longitude=${geo.longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气服务不可用')
    const data = await res.json()
    return normalizeForecast(data.daily)
  },

  async getForecastByCoords(lat: number, lon: number) {
    const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气服务不可用')
    const data = await res.json()
    return normalizeForecast(data.daily)
  },
}
