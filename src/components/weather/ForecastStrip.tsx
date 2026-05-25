import { motion } from 'framer-motion'
import type { ForecastDay } from '../../api/types'
import { WEATHER_CODE_MAP } from '../../api/types'
import { useWeatherStore } from '../../store/weatherStore'
import { formatTemp, formatTime } from '../../utils/format'

interface ForecastStripProps {
  forecast: ForecastDay[]
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

export function ForecastStrip({ forecast }: ForecastStripProps) {
  const unit = useWeatherStore((s) => s.unit)

  if (forecast.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-white/50">暂无预报数据</p>
  }

  return (
    <div className="mt-6 px-4">
      <h3 className="mb-3 text-sm font-medium tracking-wide text-white/60 uppercase">5 天预报</h3>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex gap-3 overflow-x-auto pb-2"
      >
        {forecast.map((day) => {
          const meta = WEATHER_CODE_MAP[day.iconCode]
          const dayName = new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })
          return (
            <motion.div
              key={day.date}
              variants={item}
              whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
              className="flex min-w-[90px] flex-col items-center rounded-2xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 px-3 py-3"
            >
              <span className="text-xs text-white/60">{dayName}</span>
              <span className="mt-1 text-2xl">{meta?.emoji ?? '🌤️'}</span>
              <span className="mt-1 text-sm font-medium text-white">{formatTemp(day.tempHigh, unit)}</span>
              <span className="text-xs text-white/50">{formatTemp(day.tempLow, unit)}</span>
              {day.sunrise && day.sunset && (
                <div className="mt-1 flex gap-1 text-[10px] text-white/35">
                  <span>↑{formatTime(day.sunrise)}</span>
                  <span>↓{formatTime(day.sunset)}</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
