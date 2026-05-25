import { motion } from 'framer-motion'
import type { AirQuality } from '../../api/types'
import { aqiLabel } from '../../api/types'

interface AirQualityCardProps {
  aqi: AirQuality
}

export function AirQualityCard({ aqi }: AirQualityCardProps) {
  const { text, color } = aqiLabel(aqi.usAqi)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      className="mx-4 mt-4 rounded-2xl bg-white/10 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">空气质量</span>
        <span className={`text-sm font-medium ${color}`}>
          US AQI {aqi.usAqi} {text}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-medium text-white">{aqi.pm25}</div>
          <div className="text-[10px] text-white/40">PM2.5 μg/m³</div>
        </div>
        <div>
          <div className="text-lg font-medium text-white">{aqi.pm10}</div>
          <div className="text-[10px] text-white/40">PM10 μg/m³</div>
        </div>
        <div>
          <div className="text-lg font-medium text-white">{aqi.ozone}</div>
          <div className="text-[10px] text-white/40">O₃ μg/m³</div>
        </div>
      </div>
    </motion.div>
  )
}
