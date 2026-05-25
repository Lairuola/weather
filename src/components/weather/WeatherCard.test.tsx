import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherCard } from './WeatherCard'
import { useWeatherStore } from '../../store/weatherStore'
import type { Weather } from '../../api/types'

const mockWeather: Weather = {
  cityName: '北京',
  country: 'China',
  temperature: 25,
  feelsLike: 24,
  description: '晴',
  iconCode: 0,
  humidity: 55,
  windSpeed: 3.2,
}

describe('WeatherCard', () => {
  beforeEach(() => {
    useWeatherStore.setState({
      favorites: [],
      unit: 'celsius',
    })
  })

  it('renders city name and country', () => {
    render(<WeatherCard weather={mockWeather} />)
    expect(screen.getByText('北京')).toBeDefined()
    expect(screen.getByText('China')).toBeDefined()
  })

  it('renders temperature in Celsius', () => {
    render(<WeatherCard weather={mockWeather} />)
    expect(screen.getByText('25°C')).toBeDefined()
  })

  it('renders weather description and emoji', () => {
    render(<WeatherCard weather={mockWeather} />)
    expect(screen.getByText('晴')).toBeDefined()
  })

  it('shows N/A for zero humidity', () => {
    const noHumidity = { ...mockWeather, humidity: 0 }
    render(<WeatherCard weather={noHumidity} />)
    expect(screen.getByText('N/A')).toBeDefined()
  })

  it('shows filled star when city is favorite', () => {
    useWeatherStore.setState({ favorites: ['北京'] })
    render(<WeatherCard weather={mockWeather} />)
    expect(screen.getByLabelText('取消收藏')).toBeDefined()
  })

  it('shows empty star when city is not favorite', () => {
    render(<WeatherCard weather={mockWeather} />)
    expect(screen.getByLabelText('收藏')).toBeDefined()
  })
})
