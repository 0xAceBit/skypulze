const FAVORITES_STORAGE = 'weather_favorites';

export function getFavorites(): string[] {
  const stored = localStorage.getItem(FAVORITES_STORAGE);
  return stored ? JSON.parse(stored) : [];
}

export function saveFavorites(cities: string[]) {
  localStorage.setItem(FAVORITES_STORAGE, JSON.stringify(cities));
}

export interface CurrentWeather {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  icon: string;
  description: string;
  lat: number;
  lon: number;
}

export interface ForecastDay {
  date: string;
  temp_min: number;
  temp_max: number;
  condition: string;
  icon: string;
  humidity: number;
}

export interface WeatherAlert {
  event: string;
  description: string;
  start: number;
  end: number;
}

// WMO Weather Code mapping
function wmoToCondition(code: number): { condition: string; description: string; icon: string } {
  if (code === 0) return { condition: 'Clear', description: 'clear sky', icon: '01d' };
  if (code <= 3) return { condition: 'Clouds', description: 'partly cloudy', icon: '02d' };
  if (code <= 49) return { condition: 'Fog', description: 'fog', icon: '50d' };
  if (code <= 59) return { condition: 'Drizzle', description: 'drizzle', icon: '09d' };
  if (code <= 69) return { condition: 'Rain', description: 'rain', icon: '10d' };
  if (code <= 79) return { condition: 'Snow', description: 'snow', icon: '13d' };
  if (code <= 84) return { condition: 'Rain', description: 'rain showers', icon: '09d' };
  if (code <= 86) return { condition: 'Snow', description: 'snow showers', icon: '13d' };
  if (code <= 99) return { condition: 'Thunderstorm', description: 'thunderstorm', icon: '11d' };
  return { condition: 'Clouds', description: 'cloudy', icon: '03d' };
}

interface GeoResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

async function geocodeCity(city: string): Promise<GeoResult> {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`);
  if (!res.ok) throw new Error('Failed to geocode city');
  const d = await res.json();
  if (!d.results || d.results.length === 0) throw new Error(`City "${city}" not found`);
  const r = d.results[0];
  return { name: r.name, country: r.country_code || '', latitude: r.latitude, longitude: r.longitude };
}

async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string }> {
  // Open-Meteo doesn't have reverse geocoding, so we use a nearby city search
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&count=1&language=en`);
  // Fallback: use coordinates as name
  return { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, country: '' };
}

async function fetchWeatherData(lat: number, lon: number) {
  const params = [
    `latitude=${lat}`,
    `longitude=${lon}`,
    'current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    'daily=temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_max',
    'timezone=auto',
    'forecast_days=6',
  ].join('&');
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  return res.json();
}

export async function fetchCurrentWeather(city: string): Promise<CurrentWeather> {
  const geo = await geocodeCity(city);
  const data = await fetchWeatherData(geo.latitude, geo.longitude);
  const c = data.current;
  const wmo = wmoToCondition(c.weather_code);
  return {
    city: geo.name,
    country: geo.country,
    temp: Math.round(c.temperature_2m),
    feels_like: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    wind_speed: c.wind_speed_10m,
    condition: wmo.condition,
    icon: wmo.icon,
    description: wmo.description,
    lat: geo.latitude,
    lon: geo.longitude,
  };
}

export async function fetchCurrentWeatherByCoords(lat: number, lon: number): Promise<CurrentWeather> {
  // Try reverse geocoding via a small radius search
  let cityName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  let country = '';
  try {
    // Use BigDataCloud free reverse geocoding (no key needed)
    const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      cityName = geoData.city || geoData.locality || cityName;
      country = geoData.countryCode || '';
    }
  } catch { /* use fallback */ }

  const data = await fetchWeatherData(lat, lon);
  const c = data.current;
  const wmo = wmoToCondition(c.weather_code);
  return {
    city: cityName,
    country,
    temp: Math.round(c.temperature_2m),
    feels_like: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    wind_speed: c.wind_speed_10m,
    condition: wmo.condition,
    icon: wmo.icon,
    description: wmo.description,
    lat,
    lon,
  };
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  const data = await fetchWeatherData(lat, lon);
  const daily = data.daily;
  return daily.time.slice(1, 6).map((date: string, i: number) => {
    const idx = i + 1; // skip today
    const wmo = wmoToCondition(daily.weather_code[idx]);
    return {
      date,
      temp_min: Math.round(daily.temperature_2m_min[idx]),
      temp_max: Math.round(daily.temperature_2m_max[idx]),
      condition: wmo.condition,
      icon: wmo.icon,
      humidity: daily.relative_humidity_2m_max[idx],
    };
  });
}

export async function fetchAlerts(): Promise<WeatherAlert[]> {
  // Open-Meteo free tier doesn't support alerts
  return [];
}

export function getWeatherEmoji(condition: string): string {
  const map: Record<string, string> = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
    Haze: '🌫️', Smoke: '🌫️', Dust: '🌪️', Tornado: '🌪️',
  };
  return map[condition] || '🌤️';
}
