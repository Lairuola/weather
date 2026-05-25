import { motion } from 'framer-motion'
import { useWeatherStore } from '../../store/weatherStore'

export function UnitToggle() {
  const unit = useWeatherStore((s) => s.unit)
  const windUnit = useWeatherStore((s) => s.windUnit)
  const setUnit = useWeatherStore((s) => s.setUnit)
  const setWindUnit = useWeatherStore((s) => s.setWindUnit)

  return (
    <div className="flex items-center gap-0.5">
      <motion.button
        onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
        whileTap={{ scale: 0.9 }}
        aria-label={`温度单位：${unit === 'celsius' ? '摄氏度' : '华氏度'}`}
        className="rounded-lg px-2 py-0.5 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      >
        <motion.span
          key={unit}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          °{unit === 'celsius' ? 'C' : 'F'}
        </motion.span>
      </motion.button>
      <motion.button
        onClick={() => setWindUnit(windUnit === 'ms' ? 'kmh' : 'ms')}
        whileTap={{ scale: 0.9 }}
        aria-label={`风速单位：${windUnit === 'ms' ? '米/秒' : '公里/时'}`}
        className="rounded-lg px-2 py-0.5 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      >
        <motion.span
          key={windUnit}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {windUnit === 'ms' ? 'm/s' : 'km/h'}
        </motion.span>
      </motion.button>
    </div>
  )
}
