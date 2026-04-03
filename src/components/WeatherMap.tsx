import { useState, useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { X, Thermometer, Droplets, Wind, MapPin, Loader2 } from 'lucide-react';
import { fetchCurrentWeatherByCoords, getWeatherEmoji, type CurrentWeather } from '@/lib/weather';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ClickedWeather {
  lat: number;
  lng: number;
  weather: CurrentWeather | null;
  loading: boolean;
}

export default function WeatherMap() {
  const [expanded, setExpanded] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [clicked, setClicked] = useState<ClickedWeather | null>(null);

  useEffect(() => {
    if (!expanded || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      markerRef.current.bindPopup('<div class="text-sm">Loading weather...</div>').openPopup();

      try {
        const weather = await fetchCurrentWeatherByCoords(lat, lng);
        const emoji = getWeatherEmoji(weather.condition);
        const html = `
          <div style="min-width:160px;font-family:sans-serif;">
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">
              <span style="font-size:1.2em;">${emoji}</span>
              <strong style="font-size:0.9em;">${weather.city}</strong>
            </div>
            <div style="font-size:0.8em;line-height:1.6;">
              🌡️ ${weather.temp}°C (feels ${weather.feels_like}°C)<br/>
              💧 ${weather.humidity}% humidity<br/>
              💨 ${weather.wind_speed} km/h<br/>
              <span style="color:#666;text-transform:capitalize;">${weather.description}</span>
            </div>
          </div>
        `;
        if (markerRef.current) {
          markerRef.current.setPopupContent(html).openPopup();
        }
        setClicked({ lat, lng, weather, loading: false });
      } catch {
        if (markerRef.current) {
          markerRef.current.setPopupContent('<span style="color:red;font-size:0.85em;">Failed to load weather</span>').openPopup();
        }
        setClicked({ lat, lng, weather: null, loading: false });
      }
    });

    mapRef.current = map;

    // Ensure tiles render correctly
    setTimeout(() => map.invalidateSize(), 300);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [expanded]);

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-md shadow-lg">
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

      {expanded && (
        <div className="relative">
          <div
            ref={containerRef}
            className="w-full z-0"
            style={{ height: '320px' }}
          />
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-2 right-2 z-[1000] bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
