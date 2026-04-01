const API_KEY_STORAGE = 'openweather_api_key';
const FAVORITES_STORAGE = 'weather_favorites';

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE);
}

export function setApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

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

const BASE = 'https://api.openweathermap.org/data/2.5';

export async function fetchCurrentWeather(city: string): Promise<CurrentWeather> {
  const key = getApiKey();
  if (!key) throw new Error('API key not set');
  const res = await fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch weather (${res.status})`);
  }
  const d = await res.json();
  return {
    city: d.name,
    country: d.sys.country,
    temp: Math.round(d.main.temp),
    feels_like: Math.round(d.main.feels_like),
    humidity: d.main.humidity,
    wind_speed: d.wind.speed,
    condition: d.weather[0].main,
    icon: d.weather[0].icon,
    description: d.weather[0].description,
    lat: d.coord.lat,
    lon: d.coord.lon,
  };
}

export async function fetchCurrentWeatherByCoords(lat: number, lon: number): Promise<CurrentWeather> {
  const key = getApiKey();
  if (!key) throw new Error('API key not set');
  const res = await fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);
  if (!res.ok) throw new Error('Failed to fetch weather');
  const d = await res.json();
  return {
    city: d.name,
    country: d.sys.country,
    temp: Math.round(d.main.temp),
    feels_like: Math.round(d.main.feels_like),
    humidity: d.main.humidity,
    wind_speed: d.wind.speed,
    condition: d.weather[0].main,
    icon: d.weather[0].icon,
    description: d.weather[0].description,
    lat: d.coord.lat,
    lon: d.coord.lon,
  };
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  const key = getApiKey();
  if (!key) throw new Error('API key not set');
  const res = await fetch(`${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);
  if (!res.ok) throw new Error('Failed to fetch forecast');
  const d = await res.json();

  const days: Record<string, { temps: number[]; icons: string[]; conditions: string[]; humidities: number[] }> = {};
  for (const item of d.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) days[date] = { temps: [], icons: [], conditions: [], humidities: [] };
    days[date].temps.push(item.main.temp);
    days[date].icons.push(item.weather[0].icon);
    days[date].conditions.push(item.weather[0].main);
    days[date].humidities.push(item.main.humidity);
  }

  return Object.entries(days).slice(0, 5).map(([date, data]) => ({
    date,
    temp_min: Math.round(Math.min(...data.temps)),
    temp_max: Math.round(Math.max(...data.temps)),
    condition: data.conditions[Math.floor(data.conditions.length / 2)],
    icon: data.icons[Math.floor(data.icons.length / 2)],
    humidity: Math.round(data.humidities.reduce((a, b) => a + b, 0) / data.humidities.length),
  }));
}

export async function fetchAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  const key = getApiKey();
  if (!key) throw new Error('API key not set');
  try {
    const res = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${key}`);
    if (!res.ok) return [];
    const d = await res.json();
    return (d.alerts || []).map((a: any) => ({
      event: a.event,
      description: a.description,
      start: a.start,
      end: a.end,
    }));
  } catch {
    return [];
  }
}

export function getWeatherEmoji(condition: string): string {
  const map: Record<string, string> = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
    Haze: '🌫️', Smoke: '🌫️', Dust: '🌪️', Tornado: '🌪️',
  };
  return map[condition] || '🌤️';
}
