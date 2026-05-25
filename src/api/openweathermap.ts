import type { ForecastDay, Weather, WeatherProvider } from './types'
import { WeatherCode } from './types'

const BASE_URL = 'https://api.openweathermap.org/data/2.5'

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY
  if (!key || key === 'your_api_key_here') {
    throw new Error('API Key 无效，请检查 .env.local 配置')
  }
  return key
}

// OWM icon code → 统一 WeatherCode
function owmToWeatherCode(icon: string): WeatherCode {
  const code = icon.replace(/[dn]$/, '')
  switch (code) {
    case '01': return WeatherCode.Clear
    case '02': return WeatherCode.FewClouds
    case '03': return WeatherCode.Cloudy
    case '04': return WeatherCode.Overcast
    case '09': return WeatherCode.Drizzle
    case '10': return WeatherCode.Rain
    case '11': return WeatherCode.Thunderstorm
    case '13': return WeatherCode.Snow
    case '50': return WeatherCode.Fog
    default: return WeatherCode.Cloudy
  }
}

function normalizeCurrent(data: any): Weather {
  return {
    cityName: data.name,
    country: data.sys?.country ?? '',
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: data.weather?.[0]?.description ?? '未知',
    iconCode: owmToWeatherCode(data.weather?.[0]?.icon ?? '03d'),
    humidity: data.main.humidity,
    windSpeed: data.wind?.speed ?? 0,
  }
}

// 3小时间隔 → 每日聚合
function normalizeForecast(list: any[]): ForecastDay[] {
  const days = new Map<string, { highs: number[]; lows: number[]; icons: string[]; descriptions: string[] }>()
  for (const item of list) {
    const date = item.dt_txt.split(' ')[0]
    if (!days.has(date)) {
      days.set(date, { highs: [], lows: [], icons: [], descriptions: [] })
    }
    const day = days.get(date)!
    day.highs.push(item.main.temp_max)
    day.lows.push(item.main.temp_min)
    day.icons.push(item.weather?.[0]?.icon ?? '03d')
    day.descriptions.push(item.weather?.[0]?.description ?? '多云')
  }
  return Array.from(days.entries()).slice(0, 5).map(([date, d]) => ({
    date,
    tempHigh: Math.round(Math.max(...d.highs)),
    tempLow: Math.round(Math.min(...d.lows)),
    description: d.descriptions[Math.floor(d.descriptions.length / 2)],
    iconCode: owmToWeatherCode(d.icons[Math.floor(d.icons.length / 2)]),
    humidity: 0, // 3h forecast 不含湿度
  }))
}

async function handleResponse(res: Response, city: string) {
  if (!res.ok) {
    if (res.status === 401) throw new Error('API Key 无效，请检查 .env.local 配置')
    if (res.status === 404) throw new Error(`找不到「${city}」，请检查拼写`)
    if (res.status === 429) throw new Error('请求太频繁，请稍后再试')
    throw new Error('天气服务不可用')
  }
  return res.json()
}

export const openweathermapProvider: WeatherProvider = {
  name: 'OpenWeatherMap',

  async getCurrentWeather(city: string) {
    const key = getApiKey()
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric&lang=zh_cn`
    const data = await handleResponse(await fetch(url), city)
    return normalizeCurrent(data)
  },

  async getCurrentWeatherByCoords(lat: number, lon: number) {
    const key = getApiKey()
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=zh_cn`
    const data = await handleResponse(await fetch(url), `${lat},${lon}`)
    return normalizeCurrent(data)
  },

  async getForecast(city: string) {
    const key = getApiKey()
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${key}&units=metric&lang=zh_cn`
    const data = await handleResponse(await fetch(url), city)
    return normalizeForecast(data.list)
  },

  async getForecastByCoords(lat: number, lon: number) {
    const key = getApiKey()
    const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=zh_cn`
    const data = await handleResponse(await fetch(url), `${lat},${lon}`)
    return normalizeForecast(data.list)
  },
}
