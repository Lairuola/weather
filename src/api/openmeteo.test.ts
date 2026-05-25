import { describe, expect, it, vi } from 'vitest'
import { openmeteoProvider } from './openmeteo'
import { WeatherCode } from './types'

const mockGeocodingResponse = {
  results: [{ name: '北京', country: 'China', latitude: 39.9, longitude: 116.4 }],
}

const mockNominatimResponse = {
  address: { city: '北京', country: '中国' },
}

const mockWeatherResponse = {
  current: {
    temperature_2m: 25.3,
    apparent_temperature: 24.1,
    relative_humidity_2m: 55,
    weather_code: 0,
    wind_speed_10m: 3.2,
  },
  daily: {
    time: ['2026-05-25', '2026-05-26'],
    temperature_2m_max: [28, 26],
    temperature_2m_min: [18, 17],
    weather_code: [0, 3],
  },
}

describe('openmeteoProvider', () => {
  it('normalizes current weather from geocoding + weather API', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeocodingResponse) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockWeatherResponse) }),
    )

    const weather = await openmeteoProvider.getCurrentWeather('北京')

    expect(weather.cityName).toBe('北京')
    expect(weather.country).toBe('China')
    expect(weather.temperature).toBe(25)
    expect(weather.feelsLike).toBe(24)
    expect(weather.humidity).toBe(55)
    expect(weather.windSpeed).toBe(3.2)
    expect(weather.iconCode).toBe(WeatherCode.Clear)
    expect(weather.description).toBe('晴')
  })

  it('throws friendly error for unknown city (both APIs fail)', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }),
    )

    await expect(openmeteoProvider.getCurrentWeather('NotACity')).rejects.toThrow('找不到「NotACity」，请检查拼写')
  })

  it('normalizes forecast data', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeocodingResponse) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockWeatherResponse) }),
    )

    const forecast = await openmeteoProvider.getForecast('北京')

    expect(forecast).toHaveLength(2)
    expect(forecast[0].date).toBe('2026-05-25')
    expect(forecast[0].tempHigh).toBe(28)
    expect(forecast[0].tempLow).toBe(18)
    expect(forecast[0].iconCode).toBe(WeatherCode.Clear)
  })

  it('getCurrentWeatherByCoords works with reverse geocoding', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockNominatimResponse) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockWeatherResponse) }),
    )

    const weather = await openmeteoProvider.getCurrentWeatherByCoords(39.9, 116.4)
    expect(weather.temperature).toBe(25)
    expect(weather.cityName).toBe('北京')
    expect(weather.country).toBe('中国')
  })
})
