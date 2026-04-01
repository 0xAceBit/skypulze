import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  getApiKey, getFavorites, saveFavorites,
  fetchCurrentWeather, fetchCurrentWeatherByCoords, fetchForecast, fetchAlerts,
  type CurrentWeather, type ForecastDay, type WeatherAlert,
} from '@/lib/weather';
import { useTheme } from '@/hooks/useTheme';
import ApiKeyPrompt from '@/components/ApiKeyPrompt';
import SearchBar from '@/components/SearchBar';
import WeatherHero from '@/components/WeatherHero';
import ForecastList from '@/components/ForecastList';
import FavoritesCities from '@/components/FavoritesCities';
import WeatherAlerts from '@/components/WeatherAlerts';
import { Loader2 } from 'lucide-react';

export default function Index() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [hasKey, setHasKey] = useState(!!getApiKey());
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
        fetchAlerts(w.lat, w.lon),
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
    if (hasKey && !weather) handleGeolocate();
  }, [hasKey]);

  if (!hasKey) return <ApiKeyPrompt onSaved={() => setHasKey(true)} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-display font-bold text-foreground text-center"
        >
          Sky<span className="text-primary">Pulse</span>
        </motion.h1>

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

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {!loading && weather && (
          <motion.div
            key={weather.city}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <WeatherHero weather={weather} />
            <WeatherAlerts alerts={alerts} />
            {forecast.length > 0 && <ForecastList forecast={forecast} />}
          </motion.div>
        )}

        {!loading && !weather && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-4">🌤️</p>
            <p className="text-sm">Search for a city or allow location access</p>
          </div>
        )}
      </div>
    </div>
  );
}
