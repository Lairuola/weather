// 温度格式化——数据层始终用摄氏度，展示层按单位转换
export function formatTemp(celsius: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    return `${Math.round(celsius * 9 / 5 + 32)}°F`
  }
  return `${celsius}°C`
}

// 风速格式化
export function formatWind(speedMs: number): string {
  return `${speedMs} m/s`
}
