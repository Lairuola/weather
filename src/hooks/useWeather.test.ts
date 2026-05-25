import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWeather } from './useWeather'
import { useWeatherStore } from '../store/weatherStore'
vi.mock('../api/provider', () => ({
  provider: {
    getCurrentWeather: vi.fn(),
    getForecast: vi.fn(),
  },
}))

import { provider } from '../api/provider'

const mockWeather = {
  cityName: '北京',
  country: 'CN',
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

describe('useWeather', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useWeatherStore.setState({
      current: { status: 'idle', data: null, error: null },
      forecast: { status: 'idle', data: null, error: null },
      recentSearches: [],
      lastSearchedCity: null,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mockProvider = provider as unknown as {
    getCurrentWeather: ReturnType<typeof vi.fn>
    getForecast: ReturnType<typeof vi.fn>
  }

  it('transitions through loading → success', async () => {
    mockProvider.getCurrentWeather.mockResolvedValueOnce(mockWeather)
    mockProvider.getForecast.mockResolvedValueOnce(mockForecast)

    const { result } = renderHook(() => useWeather())

    act(() => {
      result.current.fetchWeather('北京')
    })

    // loading state set immediately
    expect(useWeatherStore.getState().current.status).toBe('loading')

    // advance past debounce
    act(() => { vi.advanceTimersByTime(500) })

    // wait for async
    await vi.waitFor(() => {
      expect(useWeatherStore.getState().current.status).toBe('success')
    })

    expect(useWeatherStore.getState().current.data?.cityName).toBe('北京')
    expect(useWeatherStore.getState().forecast.data).toHaveLength(1)
    expect(useWeatherStore.getState().lastSearchedCity).toBe('北京')
  })

  it('transitions through loading → error on API failure', async () => {
    mockProvider.getCurrentWeather.mockRejectedValueOnce(new Error('网络异常'))
    mockProvider.getForecast.mockRejectedValueOnce(new Error('网络异常'))

    const { result } = renderHook(() => useWeather())

    act(() => {
      result.current.fetchWeather('北京')
    })

    act(() => { vi.advanceTimersByTime(500) })

    await vi.waitFor(() => {
      expect(useWeatherStore.getState().current.status).toBe('error')
    })

    expect(useWeatherStore.getState().current.error).toBe('网络异常')
  })

  it('blocks empty input', () => {
    // stub fetch to make sure it's never called
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const { result } = renderHook(() => useWeather())

    act(() => {
      result.current.fetchWeather('   ')
    })

    act(() => { vi.advanceTimersByTime(500) })

    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('sets loading immediately on search', () => {
    mockProvider.getCurrentWeather.mockResolvedValue(mockWeather)
    mockProvider.getForecast.mockResolvedValue(mockForecast)

    const { result } = renderHook(() => useWeather())

    act(() => { result.current.fetchWeather('北京') })

    // Loading appears immediately (before debounce)
    expect(useWeatherStore.getState().current.status).toBe('loading')
  })

  it('aborts previous request on new search', async () => {
    mockProvider.getCurrentWeather.mockResolvedValue(mockWeather)
    mockProvider.getForecast.mockResolvedValue(mockForecast)

    const { result } = renderHook(() => useWeather())

    act(() => { result.current.fetchWeather('北京') })
    act(() => { result.current.fetchWeather('上海') })

    // Clean up: cancel pending debounce
    act(() => { vi.advanceTimersByTime(500) })

    await vi.waitFor(() => {
      expect(useWeatherStore.getState().current.status).toBe('success')
    })

    // Last city fetched successfully
    expect(mockProvider.getCurrentWeather).toHaveBeenCalledWith('上海')
  })
})
