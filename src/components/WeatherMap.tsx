import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Thermometer, Droplets, Wind, MapPin, Loader2 } from 'lucide-react';
import { fetchCurrentWeatherByCoords, getWeatherEmoji, type CurrentWeather } from '@/lib/weather';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface ClickedLocation {
  lat: number;
  lng: number;
  weather: CurrentWeather | null;
  loading: boolean;
}

export default function WeatherMap() {
  const [expanded, setExpanded] = useState(false);
  const [clicked, setClicked] = useState<ClickedLocation | null>(null);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setClicked({ lat, lng, weather: null, loading: true });
    try {
      const weather = await fetchCurrentWeatherByCoords(lat, lng);
      setClicked({ lat, lng, weather, loading: false });
    } catch {
      setClicked({ lat, lng, weather: null, loading: false });
    }
  }, []);

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-md shadow-lg"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span>Explore Map</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="ml-auto text-muted-foreground text-xs"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 320, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="relative"
          >
            <MapContainer
              center={[20, 0]}
              zoom={2}
              className="h-[320px] w-full z-0"
              style={{ height: '320px' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {clicked && (
                <Marker position={[clicked.lat, clicked.lng]}>
                  <Popup>
                    {clicked.loading ? (
                      <div className="flex items-center gap-2 p-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : clicked.weather ? (
                      <div className="p-1 min-w-[160px]">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-lg">{getWeatherEmoji(clicked.weather.condition)}</span>
                          <span className="font-semibold text-sm">{clicked.weather.city}</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            <span>{clicked.weather.temp}°C (feels {clicked.weather.feels_like}°C)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="w-3 h-3" />
                            <span>{clicked.weather.humidity}% humidity</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Wind className="w-3 h-3" />
                            <span>{clicked.weather.wind_speed} km/h</span>
                          </div>
                          <div className="text-muted-foreground capitalize">{clicked.weather.description}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Failed to load weather</span>
                    )}
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            <button
              onClick={() => setExpanded(false)}
              className="absolute top-2 right-2 z-[1000] bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
