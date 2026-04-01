import { ForecastDay, getWeatherEmoji } from '@/lib/weather';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

interface Props {
  forecast: ForecastDay[];
}

export default function ForecastList({ forecast }: Props) {
  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) return 'Today';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="weather-card p-6"
    >
      <h3 className="font-display font-semibold text-foreground mb-4">5-Day Forecast</h3>
      <div className="space-y-1">
        {forecast.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 120 }}
            whileHover={{ scale: 1.02, x: 4, backgroundColor: 'hsl(var(--muted) / 0.5)' }}
            className="flex items-center justify-between py-3 px-3 rounded-xl border-b border-border/30 last:border-0 transition-colors cursor-default"
          >
            <span className="text-sm text-muted-foreground w-28">{formatDay(day.date)}</span>
            <motion.span
              className="text-xl"
              whileHover={{ scale: 1.3, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {getWeatherEmoji(day.condition)}
            </motion.span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Droplets className="w-3 h-3" />
              <span className="text-xs">{day.humidity}%</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="font-semibold text-foreground">{day.temp_max}°</span>
              <span className="text-muted-foreground">{day.temp_min}°</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
