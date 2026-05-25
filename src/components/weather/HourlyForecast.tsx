import { motion } from 'framer-motion'
import type { HourlyForecast } from '../../api/types'
import { WEATHER_CODE_MAP } from '../../api/types'
import { useWeatherStore } from '../../store/weatherStore'
import { formatTemp } from '../../utils/format'

interface HourlyForecastProps {
  hourly: HourlyForecast[]
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
}

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  const unit = useWeatherStore((s) => s.unit)

  if (hourly.length === 0) return null

  return (
    <div className="mt-4 px-4">
      <h3 className="mb-3 text-sm font-medium tracking-wide text-white/60 uppercase">逐小时预报</h3>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {hourly.map((h) => {
          const meta = WEATHER_CODE_MAP[h.iconCode]
          const timeStr = new Date(h.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          return (
            <motion.div
              key={h.time}
              variants={item}
              className="flex min-w-[64px] flex-col items-center rounded-xl bg-white/10 px-2.5 py-2"
            >
              <span className="text-xs text-white/50">{timeStr}</span>
              <span className="mt-1 text-lg">{meta?.emoji ?? '🌤️'}</span>
              <span className="mt-0.5 text-xs font-medium text-white">{formatTemp(h.temperature, unit)}</span>
              {h.precipitation > 0 && (
                <span className="mt-0.5 text-[10px] text-blue-300">{h.precipitation}mm</span>
              )}
              <span className="text-[10px] text-white/40">{h.humidity}%</span>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
