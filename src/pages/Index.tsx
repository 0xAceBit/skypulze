import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  getFavorites, saveFavorites,
  fetchCurrentWeather, fetchCurrentWeatherByCoords, fetchForecast, fetchAlerts,
  type CurrentWeather, type ForecastDay, type WeatherAlert,
} from '@/lib/weather';
import { useTheme } from '@/hooks/useTheme';
import SearchBar from '@/components/SearchBar';
import WeatherHero from '@/components/WeatherHero';
import ForecastList from '@/components/ForecastList';
import FavoritesCities from '@/components/FavoritesCities';
import WeatherAlerts from '@/components/WeatherAlerts';
import FloatingParticles from '@/components/FloatingParticles';
import { Loader2, CloudRain } from 'lucide-react';

export default function Index() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [favorites, setFavorites] = useState<string[]>(getFavorites());

  const loadWeather = useCallback(async (fetcher: () => Promise<CurrentWeather>) => {
    setLoading(true);
    try {
      const w = await fetcher();
      setWeather(w);
      const [fc, al] = await Promise.all([
        fetchForecast(w.lat, w.lon),
        fetchAlerts(),
      ]);
      setForecast(fc);
      setAlerts(al);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((city: string) => {
    loadWeather(() => fetchCurrentWeather(city));
  }, [loadWeather]);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => loadWeather(() => fetchCurrentWeatherByCoords(pos.coords.latitude, pos.coords.longitude)),
      () => { toast.error('Location access denied'); setLoading(false); }
    );
  }, [loadWeather]);

  const toggleFavorite = useCallback(() => {
    if (!weather) return;
    setFavorites(prev => {
      const exists = prev.includes(weather.city);
      const next = exists ? prev.filter(c => c !== weather.city) : [...prev, weather.city];
      saveFavorites(next);
      toast.success(exists ? `Removed ${weather.city}` : `Added ${weather.city} to favorites`);
      return next;
    });
  }, [weather]);

  const removeFavorite = useCallback((city: string) => {
    setFavorites(prev => {
      const next = prev.filter(c => c !== city);
      saveFavorites(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!weather) handleGeolocate();
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6 relative z-10">
        {/* Animated logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block mb-1"
          >
            <CloudRain className="w-8 h-8 text-primary mx-auto" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-display font-bold text-foreground"
          >
            Sky
            <motion.span
              className="text-primary inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Pulse
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-muted-foreground mt-1"
          >
            Weather that feels alive ⚡
          </motion.p>
        </motion.div>

        <SearchBar
          onSearch={handleSearch}
          onGeolocate={handleGeolocate}
          onToggleFavorite={toggleFavorite}
          isFavorite={!!weather && favorites.includes(weather.city)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          loading={loading}
        />

        <FavoritesCities
          favorites={favorites}
          onSelect={handleSearch}
          onRemove={removeFavorite}
        />

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-10 h-10 text-primary" />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm text-muted-foreground"
              >
                Fetching the skies...
              </motion.p>
            </motion.div>
          )}

          {!loading && weather && (
            <motion.div
              key={weather.city}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="space-y-4"
            >
              <WeatherHero weather={weather} />
              <WeatherAlerts alerts={alerts} />
              {forecast.length > 0 && <ForecastList forecast={forecast} />}
            </motion.div>
          )}

          {!loading && !weather && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.p
                className="text-6xl mb-4"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌤️
              </motion.p>
              <p className="text-sm text-muted-foreground">Search for a city or allow location access</p>
              <motion.div
                className="flex justify-center gap-2 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {['🌧️', '⛈️', '🌈', '❄️', '☀️'].map((e, i) => (
                  <motion.span
                    key={e}
                    className="text-2xl"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                  >
                    {e}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
