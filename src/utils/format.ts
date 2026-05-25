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

// 风向角度 → 罗盘方向
export function formatWindDir(deg: number): string {
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  return dirs[Math.round(deg / 45) % 8]
}

// 日出日落时间格式化
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
