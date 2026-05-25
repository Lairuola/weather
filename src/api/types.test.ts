import { describe, expect, it } from 'vitest'
import { WeatherCode, WEATHER_CODE_MAP } from './types'

describe('WeatherCode', () => {
  it('has all 9 weather codes', () => {
    const values = Object.values(WeatherCode).filter((v) => typeof v === 'number')
    expect(values).toHaveLength(9)
  })

  it('WEATHER_CODE_MAP has entry for every WeatherCode', () => {
    const codes = Object.values(WeatherCode).filter((v) => typeof v === 'number')
    for (const code of codes) {
      const entry = WEATHER_CODE_MAP[code as WeatherCode]
      expect(entry).toBeDefined()
      expect(entry.emoji).toBeTruthy()
      expect(entry.label).toBeTruthy()
      expect(entry.gradient).toBeTruthy()
    }
  })
})
