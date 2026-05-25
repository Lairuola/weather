import { motion } from 'framer-motion'
import { useWeatherStore } from '../../store/weatherStore'

export function UnitToggle() {
  const unit = useWeatherStore((s) => s.unit)
  const setUnit = useWeatherStore((s) => s.setUnit)

  const toggle = () => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      aria-label={`温度单位：${unit === 'celsius' ? '摄氏度' : '华氏度'}`}
      className="rounded-xl px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
    >
      <motion.span
        key={unit}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        °{unit === 'celsius' ? 'C' : 'F'}
      </motion.span>
    </motion.button>
  )
}
