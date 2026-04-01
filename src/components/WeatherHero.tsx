import { CurrentWeather, getWeatherEmoji } from '@/lib/weather';
import { motion } from 'framer-motion';
import { Droplets, Wind, Thermometer } from 'lucide-react';

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
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-foreground/5 blur-2xl" />
      </div>

      <div className="relative z-10">
        <p className="text-primary-foreground/70 font-medium text-sm uppercase tracking-wider mb-1">
          {weather.city}, {weather.country}
        </p>
        <p className="text-primary-foreground/60 text-sm capitalize mb-6">{weather.description}</p>

        <div className="flex items-start justify-between">
          <div>
            <span className="weather-temp text-7xl md:text-8xl leading-none">{weather.temp}°</span>
            <p className="text-primary-foreground/60 text-sm mt-2">Feels like {weather.feels_like}°C</p>
          </div>
          <span className="text-6xl md:text-7xl">{getWeatherEmoji(weather.condition)}</span>
        </div>

        <div className="flex gap-6 mt-8 pt-6 border-t border-primary-foreground/15">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Droplets className="w-4 h-4" />
            <span className="text-sm font-medium">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Wind className="w-4 h-4" />
            <span className="text-sm font-medium">{weather.wind_speed} m/s</span>
          </div>
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Thermometer className="w-4 h-4" />
            <span className="text-sm font-medium">{weather.condition}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
