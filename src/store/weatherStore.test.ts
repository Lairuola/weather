import { describe, expect, it, beforeEach } from 'vitest'
import { useWeatherStore } from './weatherStore'
import type { Weather } from '../api/types'

describe('weatherStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useWeatherStore.setState({
      current: { status: 'idle', data: null, error: null },
      forecast: { status: 'idle', data: null, error: null },
      favorites: [],
      recentSearches: [],
      lastSearchedCity: null,
      unit: 'celsius',
      theme: 'system',
      geoDenied: false,
    })
  })

  describe('current weather state', () => {
    it('setCurrentLoading transitions to loading', () => {
      useWeatherStore.getState().setCurrentLoading()
      expect(useWeatherStore.getState().current.status).toBe('loading')
    })

    it('setCurrentSuccess stores weather data', () => {
      const mockWeather: Weather = { cityName: '北京', country: 'CN', temperature: 25, feelsLike: 24, description: '晴', iconCode: 0 as Weather['iconCode'], humidity: 55, windSpeed: 3.2 }
      useWeatherStore.getState().setCurrentSuccess(mockWeather)
      const state = useWeatherStore.getState().current
      expect(state.status).toBe('success')
      expect(state.data?.cityName).toBe('北京')
      expect(state.error).toBeNull()
    })

    it('setCurrentError stores error message', () => {
      useWeatherStore.getState().setCurrentError('网络异常')
      const state = useWeatherStore.getState().current
      expect(state.status).toBe('error')
      expect(state.error).toBe('网络异常')
      expect(state.data).toBeNull()
    })
  })

  describe('favorites', () => {
    it('adds favorite city', () => {
      useWeatherStore.getState().addFavorite('北京')
      expect(useWeatherStore.getState().favorites).toContain('北京')
    })

    it('does not add duplicate', () => {
      useWeatherStore.getState().addFavorite('北京')
      useWeatherStore.getState().addFavorite('北京')
      expect(useWeatherStore.getState().favorites).toHaveLength(1)
    })

    it('removes favorite city', () => {
      useWeatherStore.getState().addFavorite('北京')
      useWeatherStore.getState().addFavorite('上海')
      useWeatherStore.getState().removeFavorite('北京')
      expect(useWeatherStore.getState().favorites).toEqual(['上海'])
    })
  })

  describe('recent searches', () => {
    it('adds recent search and sets lastSearchedCity', () => {
      useWeatherStore.getState().addRecentSearch('北京')
      expect(useWeatherStore.getState().recentSearches).toContain('北京')
      expect(useWeatherStore.getState().lastSearchedCity).toBe('北京')
    })

    it('deduplicates and keeps max 5', () => {
      for (const city of ['a', 'b', 'c', 'd', 'e', 'f']) {
        useWeatherStore.getState().addRecentSearch(city)
      }
      expect(useWeatherStore.getState().recentSearches).toHaveLength(5)
      expect(useWeatherStore.getState().recentSearches[0]).toBe('f')
    })
  })

  describe('resetToIdle', () => {
    it('resets both current and forecast to idle', () => {
      useWeatherStore.getState().setCurrentSuccess({
        cityName: '北京', country: 'CN', temperature: 25, feelsLike: 24,
        description: '晴', iconCode: 0 as Weather['iconCode'], humidity: 55, windSpeed: 3.2,
      })
      useWeatherStore.getState().resetToIdle()
      expect(useWeatherStore.getState().current.status).toBe('idle')
      expect(useWeatherStore.getState().forecast.status).toBe('idle')
      expect(useWeatherStore.getState().current.data).toBeNull()
    })
  })

  describe('preferences', () => {
    it('toggles unit', () => {
      useWeatherStore.getState().setUnit('fahrenheit')
      expect(useWeatherStore.getState().unit).toBe('fahrenheit')
    })

    it('cycles theme', () => {
      useWeatherStore.getState().setTheme('dark')
      expect(useWeatherStore.getState().theme).toBe('dark')
    })
  })
})
