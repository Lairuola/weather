import { describe, expect, it } from 'vitest'
import { formatTemp, formatWind, formatWindDir, formatTime } from './format'

describe('formatTemp', () => {
  it('formats Celsius', () => {
    expect(formatTemp(25, 'celsius')).toBe('25°C')
  })

  it('formats Fahrenheit', () => {
    expect(formatTemp(25, 'fahrenheit')).toBe('77°F')
  })

  it('handles zero', () => {
    expect(formatTemp(0, 'celsius')).toBe('0°C')
  })

  it('handles negatives', () => {
    expect(formatTemp(-10, 'celsius')).toBe('-10°C')
  })
})

describe('formatWind', () => {
  it('formats m/s by default', () => {
    expect(formatWind(5.5)).toBe('5.5 m/s')
  })

  it('formats km/h', () => {
    expect(formatWind(5, 'kmh')).toBe('18 km/h')
  })

  it('converts correctly: 1 m/s = 3.6 km/h', () => {
    expect(formatWind(1, 'kmh')).toBe('4 km/h')
    expect(formatWind(10, 'kmh')).toBe('36 km/h')
  })
})

describe('formatWindDir', () => {
  it('maps 0° to 北', () => expect(formatWindDir(0)).toBe('北'))
  it('maps 90° to 东', () => expect(formatWindDir(90)).toBe('东'))
  it('maps 180° to 南', () => expect(formatWindDir(180)).toBe('南'))
  it('maps 270° to 西', () => expect(formatWindDir(270)).toBe('西'))
  it('maps 45° to 东北', () => expect(formatWindDir(45)).toBe('东北'))
  it('maps 225° to 西南', () => expect(formatWindDir(225)).toBe('西南'))
  it('wraps around at 360°', () => expect(formatWindDir(360)).toBe('北'))
})

describe('formatTime', () => {
  it('formats ISO time string', () => {
    const result = formatTime('2026-05-25T05:40')
    expect(result).toMatch(/^\d{2}:\d{2}$/)
  })
})
