import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ForecastStrip } from './ForecastStrip'
import { useWeatherStore } from '../../store/weatherStore'
import type { ForecastDay } from '../../api/types'

const mockForecast: ForecastDay[] = [
  { date: '2026-05-25', tempHigh: 28, tempLow: 18, description: '晴', iconCode: 0, humidity: 0 },
  { date: '2026-05-26', tempHigh: 26, tempLow: 17, description: '少云', iconCode: 1, humidity: 0 },
  { date: '2026-05-27', tempHigh: 22, tempLow: 15, description: '小雨', iconCode: 4, humidity: 0 },
]

describe('ForecastStrip', () => {
  beforeEach(() => {
    useWeatherStore.setState({ unit: 'celsius' })
  })

  it('renders 3 forecast day cards', () => {
    render(<ForecastStrip forecast={mockForecast} />)
    expect(screen.getByText('5 天预报')).toBeDefined()
    expect(screen.getByText('28°C')).toBeDefined()
    expect(screen.getByText('18°C')).toBeDefined()
  })

  it('shows empty state for empty forecast array', () => {
    render(<ForecastStrip forecast={[]} />)
    expect(screen.getByText('暂无预报数据')).toBeDefined()
  })

  it('renders weekday labels', () => {
    render(<ForecastStrip forecast={mockForecast} />)
    // Should have at least one weekday string
    const firstDate = new Date('2026-05-25')
    const weekday = firstDate.toLocaleDateString('zh-CN', { weekday: 'short' })
    expect(screen.getByText(weekday)).toBeDefined()
  })
})
