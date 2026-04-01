import { WeatherAlert } from '@/lib/weather';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  alerts: WeatherAlert[];
}

export default function WeatherAlerts({ alerts }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="weather-card border-destructive/30 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground text-sm">{alert.event}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(alert.start * 1000).toLocaleDateString()} – {new Date(alert.end * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
