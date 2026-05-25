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

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

interface ReverseGeoResult {
  name: string
  country: string
}

async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeoResult> {
  const url = `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json&accept-language=zh`
  const res = await fetch(url)
  if (!res.ok) return { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, country: '' }
  const data = await res.json()
  const addr = data.address ?? {}
  return {
    name: addr.city || addr.town || addr.village || addr.county || addr.state || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    country: addr.country ?? '',
  }
}

async function geocode(city: string): Promise<GeocodingResult> {
  // 先用 Open-Meteo Geocoding API
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=zh`
  const res = await fetch(url)
  if (res.ok) {
    const data = await res.json()
    if (data.results && data.results.length > 0) {
      return {
        name: data.results[0].name,
        country: data.results[0].country ?? '',
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
      }
    }
  }
  // 兜底：Nominatim（支持区/镇/村级地名）
  const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&accept-language=zh`
  const nomRes = await fetch(nomUrl)
  if (!nomRes.ok) throw new Error('天气服务不可用')
  const nomData = await nomRes.json()
  if (!nomData || nomData.length === 0) {
    throw new Error(`找不到「${city}」，请检查拼写`)
  }
  return {
    name: nomData[0].display_name?.split(',')[0] ?? nomData[0].name ?? city,
    country: '',
    latitude: Number.parseFloat(nomData[0].lat),
    longitude: Number.parseFloat(nomData[0].lon),
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
    windDirection: current.wind_direction_10m ?? undefined,
    pressure: current.surface_pressure
      ? Math.round(current.surface_pressure)
      : undefined,
  }
}

function normalizeForecast(daily: any): ForecastDay[] {
  return daily.time.map((date: string, i: number) => ({
    date,
    tempHigh: Math.round(daily.temperature_2m_max[i]),
    tempLow: Math.round(daily.temperature_2m_min[i]),
    description: wmoToDescription(daily.weather_code[i]),
    iconCode: wmoToWeatherCode(daily.weather_code[i]),
    humidity: 0,
    sunrise: daily.sunrise?.[i] ?? undefined,
    sunset: daily.sunset?.[i] ?? undefined,
  }))
}

function normalizeHourly(hourly: any) {
  return hourly.time.map((t: string, i: number) => ({
    time: t,
    temperature: Math.round(hourly.temperature_2m[i]),
    iconCode: wmoToWeatherCode(hourly.weather_code[i]),
    precipitation: hourly.precipitation[i] ?? 0,
    humidity: hourly.relative_humidity_2m[i] ?? 0,
  }))
}

const CURRENT_PARAMS = 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure'
const DAILY_PARAMS = 'temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset'
const HOURLY_PARAMS = 'temperature_2m,weather_code,precipitation,relative_humidity_2m'

export const openmeteoProvider: WeatherProvider = {
  name: 'Open-Meteo',

  async getCurrentWeather(city: string) {
    const geo = await geocode(city)
    const url = `${WEATHER_URL}?latitude=${geo.latitude}&longitude=${geo.longitude}&current=${CURRENT_PARAMS}&timezone=auto`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气服务不可用')
    const data = await res.json()
    return normalizeCurrent(geo, data.current)
  },

  async getCurrentWeatherByCoords(lat: number, lon: number) {
    const [geo, data] = await Promise.all([
      reverseGeocode(lat, lon),
      fetch(`${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=${CURRENT_PARAMS}&timezone=auto`).then((r) => {
        if (!r.ok) throw new Error('天气服务不可用')
        return r.json()
      }),
    ])
    return normalizeCurrent({ name: geo.name, country: geo.country, latitude: lat, longitude: lon }, data.current)
  },

  async getForecast(city: string) {
    const geo = await geocode(city)
    const url = `${WEATHER_URL}?latitude=${geo.latitude}&longitude=${geo.longitude}&daily=${DAILY_PARAMS}&timezone=auto&forecast_days=5`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气服务不可用')
    const data = await res.json()
    return normalizeForecast(data.daily)
  },

  async getForecastByCoords(lat: number, lon: number) {
    const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&daily=${DAILY_PARAMS}&timezone=auto&forecast_days=5`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气服务不可用')
    const data = await res.json()
    return normalizeForecast(data.daily)
  },

  async getHourlyForecast(city: string) {
    const geo = await geocode(city)
    const url = `${WEATHER_URL}?latitude=${geo.latitude}&longitude=${geo.longitude}&hourly=${HOURLY_PARAMS}&timezone=auto&forecast_hours=24`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气服务不可用')
    const data = await res.json()
    return normalizeHourly(data.hourly)
  },

  async getHourlyForecastByCoords(lat: number, lon: number) {
    const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&hourly=${HOURLY_PARAMS}&timezone=auto&forecast_hours=24`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气服务不可用')
    const data = await res.json()
    return normalizeHourly(data.hourly)
  },
}
