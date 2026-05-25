// 统一天气代码——两个 API 适配器向此收敛
export const WeatherCode = {
  Clear: 0,
  FewClouds: 1,
  Cloudy: 2,
  Overcast: 3,
  Drizzle: 4,
  Rain: 5,
  Thunderstorm: 6,
  Snow: 7,
  Fog: 8,
} as const

export type WeatherCode = (typeof WeatherCode)[keyof typeof WeatherCode]

export const WEATHER_CODE_MAP: Record<WeatherCode, { emoji: string; label: string; gradient: string }> = {
  0: { emoji: '☀️', label: '晴',   gradient: 'from-amber-400 to-orange-300' },
  1: { emoji: '🌤️', label: '少云', gradient: 'from-blue-300 to-gray-300' },
  2: { emoji: '⛅', label: '多云', gradient: 'from-gray-300 to-gray-400' },
  3: { emoji: '☁️', label: '阴',   gradient: 'from-gray-400 to-gray-500' },
  4: { emoji: '🌦️', label: '小雨', gradient: 'from-blue-400 to-gray-400' },
  5: { emoji: '🌧️', label: '雨',   gradient: 'from-blue-600 to-gray-500' },
  6: { emoji: '⛈️', label: '雷暴', gradient: 'from-gray-600 to-purple-700' },
  7: { emoji: '🌨️', label: '雪',   gradient: 'from-blue-100 to-white' },
  8: { emoji: '🌫️', label: '雾',   gradient: 'from-gray-300 to-gray-200' },
}

// 标准化当前天气
export interface Weather {
  cityName: string
  country: string
  temperature: number       // 摄氏度，适配器统一
  feelsLike: number
  description: string       // "晴", "多云", "小雨" 等
  iconCode: WeatherCode
  humidity: number          // %
  windSpeed: number         // m/s
  windDirection?: number    // 风向角度 0-360
  sunrise?: string          // 日出时间 ISO
  sunset?: string           // 日落时间 ISO
}

// 单日预报
export interface ForecastDay {
  date: string              // ISO date
  tempHigh: number
  tempLow: number
  description: string
  iconCode: WeatherCode
  humidity: number
  sunrise?: string
  sunset?: string
}

// 逐小时预报
export interface HourlyForecast {
  time: string              // ISO datetime
  temperature: number
  iconCode: WeatherCode
  precipitation: number     // mm
  humidity: number
}

// API Provider 接口——两个适配器实现此接口
export interface WeatherProvider {
  readonly name: string
  getCurrentWeather(city: string): Promise<Weather>
  getCurrentWeatherByCoords(lat: number, lon: number): Promise<Weather>
  getForecast(city: string): Promise<ForecastDay[]>
  getForecastByCoords(lat: number, lon: number): Promise<ForecastDay[]>
  getHourlyForecast(city: string): Promise<HourlyForecast[]>
  getHourlyForecastByCoords(lat: number, lon: number): Promise<HourlyForecast[]>
}
