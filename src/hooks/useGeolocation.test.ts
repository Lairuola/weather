import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGeolocation } from './useGeolocation'
import { useWeatherStore } from '../store/weatherStore'

vi.mock('../api/provider', () => ({
  provider: {
    getCurrentWeatherByCoords: vi.fn(),
    getForecastByCoords: vi.fn(),
    getHourlyForecastByCoords: vi.fn().mockResolvedValue([]),
    getAirQuality: vi.fn().mockResolvedValue(null),
  },
}))

import { provider } from '../api/provider'

const mockWeather = {
  cityName: '39.90, 116.40',
  country: '',
  temperature: 25,
  feelsLike: 24,
  description: '晴',
  iconCode: 0,
  humidity: 55,
  windSpeed: 3.2,
}

const mockForecast = [
  { date: '2026-05-25', tempHigh: 28, tempLow: 18, description: '晴', iconCode: 0, humidity: 0 },
]

describe('useGeolocation', () => {
  let mockGetCurrentPosition: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockGetCurrentPosition = vi.fn()
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    })

    useWeatherStore.setState({
      current: { status: 'idle', data: null, error: null },
      forecast: { status: 'idle', data: null, error: null },
      geoDenied: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockProvider = provider as unknown as {
    getCurrentWeatherByCoords: ReturnType<typeof vi.fn>
    getForecastByCoords: ReturnType<typeof vi.fn>
    getHourlyForecastByCoords: ReturnType<typeof vi.fn>
    getAirQuality: ReturnType<typeof vi.fn>
  }

  it('fetches weather on geolocation success', async () => {
    mockGetCurrentPosition.mockImplementationOnce((success: PositionCallback) => {
      success({ coords: { latitude: 39.9, longitude: 116.4 } } as GeolocationPosition)
    })
    mockProvider.getCurrentWeatherByCoords.mockResolvedValueOnce(mockWeather)
    mockProvider.getForecastByCoords.mockResolvedValueOnce(mockForecast)

    const { result } = renderHook(() => useGeolocation())

    act(() => { result.current.locate() })

    expect(mockGetCurrentPosition).toHaveBeenCalled()
    await vi.waitFor(() => {
      expect(useWeatherStore.getState().current.status).toBe('success')
    })
    expect(useWeatherStore.getState().geoDenied).toBe(false)
  })

  it('sets geoDenied on permission denied', () => {
    mockGetCurrentPosition.mockImplementationOnce(
      (_: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3, message: '' })
      },
    )

    const { result } = renderHook(() => useGeolocation())
    act(() => { result.current.locate() })

    expect(useWeatherStore.getState().geoDenied).toBe(true)
    expect(useWeatherStore.getState().current.status).toBe('error')
  })

  it('handles position unavailable', () => {
    mockGetCurrentPosition.mockImplementationOnce(
      (_: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 2, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3, message: '' })
      },
    )

    const { result } = renderHook(() => useGeolocation())
    act(() => { result.current.locate() })

    expect(useWeatherStore.getState().geoDenied).toBe(false)
    expect(useWeatherStore.getState().current.error).toContain('GPS')
  })

  it('handles timeout', () => {
    mockGetCurrentPosition.mockImplementationOnce(
      (_: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 3, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3, message: '' })
      },
    )

    const { result } = renderHook(() => useGeolocation())
    act(() => { result.current.locate() })

    expect(useWeatherStore.getState().current.error).toContain('GPS')
  })
})
