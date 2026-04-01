import { CurrentWeather, getWeatherEmoji } from '@/lib/weather';
import { motion } from 'framer-motion';
import { Droplets, Wind, Thermometer, Eye } from 'lucide-react';

interface Props {
  weather: CurrentWeather;
}

export default function WeatherHero({ weather }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="weather-hero p-8 md:p-10 text-primary-foreground relative overflow-hidden"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/10 blur-3xl"
          animate={{ scale: [1, 1.3, 1], x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-foreground/5 blur-2xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-primary-foreground/5 blur-2xl"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-primary-foreground/70 font-medium text-sm uppercase tracking-wider mb-1"
        >
          {weather.city}, {weather.country}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-primary-foreground/60 text-sm capitalize mb-6"
        >
          {weather.description}
        </motion.p>

        <div className="flex items-start justify-between">
          <div>
            <motion.span
              className="weather-temp text-7xl md:text-8xl leading-none inline-block"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 10 }}
            >
              {weather.temp}°
            </motion.span>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-primary-foreground/60 text-sm mt-2"
            >
              Feels like {weather.feels_like}°C
            </motion.p>
          </div>
          <motion.span
            className="text-6xl md:text-7xl"
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {getWeatherEmoji(weather.condition)}
          </motion.span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-primary-foreground/15"
        >
          {[
            { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
            { icon: Wind, label: 'Wind', value: `${weather.wind_speed} m/s` },
            { icon: Thermometer, label: 'Condition', value: weather.condition },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-primary-foreground/5 backdrop-blur-sm cursor-default"
            >
              <item.icon className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-xs text-primary-foreground/50">{item.label}</span>
              <span className="text-sm font-semibold text-primary-foreground/90">{item.value}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
