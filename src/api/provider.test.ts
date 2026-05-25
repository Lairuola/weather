import { describe, expect, it, afterEach } from 'vitest'
import { createProvider } from './provider'

describe('createProvider', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns Open-Meteo provider by default', () => {
    vi.stubEnv('VITE_WEATHER_PROVIDER', '')
    const p = createProvider()
    expect(p.name).toBe('Open-Meteo')
  })

  it('returns OpenWeatherMap provider when configured', () => {
    vi.stubEnv('VITE_WEATHER_PROVIDER', 'openweathermap')
    const p = createProvider()
    expect(p.name).toBe('OpenWeatherMap')
  })

  it('returns Open-Meteo for unknown value', () => {
    vi.stubEnv('VITE_WEATHER_PROVIDER', 'unknown')
    const p = createProvider()
    expect(p.name).toBe('Open-Meteo')
  })
})
