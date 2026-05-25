// LocalStorage 读写封装——带可用性检测和静默降级

function isAvailable(): boolean {
  try {
    const key = '__storage_test__'
    localStorage.setItem(key, key)
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function getItem<T>(key: string, fallback: T): T {
  if (!isAvailable()) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function setItem(key: string, value: unknown): void {
  if (!isAvailable()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 静默降级——存储满或不可用时不影响核心功能
  }
}

export function removeItem(key: string): void {
  if (!isAvailable()) return
  try {
    localStorage.removeItem(key)
  } catch {
    // 静默降级
  }
}
