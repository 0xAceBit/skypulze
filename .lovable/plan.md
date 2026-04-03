

## Plan: Switch to Open-Meteo (Free, No API Key)

Replace the OpenWeather API with [Open-Meteo](https://open-meteo.com), a fully free weather API that requires no API key, no signup, and no rate limiting for reasonable usage.

---

### What Changes

**1. Rewrite `src/lib/weather.ts`**
- Replace all OpenWeather endpoints with Open-Meteo equivalents:
  - **Current weather**: `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
  - **5-day forecast**: Same endpoint with `&daily=temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_max`
  - **Geocoding** (city name to coords): `https://geocoding-api.open-meteo.com/v1/search?name=...`
- Remove `getApiKey`, `setApiKey`, API key storage, and rate limiter (Open-Meteo has generous limits)
- Add a `weatherCodeToCondition()` mapper (Open-Meteo uses WMO weather codes instead of text conditions)
- Keep the same `CurrentWeather`, `ForecastDay` interfaces so other components need minimal changes

**2. Remove `src/components/ApiKeyPrompt.tsx`**
- No longer needed since there's no API key

**3. Update `src/pages/Index.tsx`**
- Remove `hasKey` state and the API key prompt gate
- Remove the "Change API Key" button from SearchBar props
- Load weather immediately on mount (via geolocation or default city)

**4. Update `src/components/SearchBar.tsx`**
- Remove the API key button and `onChangeApiKey` prop

**5. Remove weather alerts**
- Open-Meteo's free tier doesn't include alerts, so remove `WeatherAlerts` usage (or keep the component dormant)

---

### What Stays the Same
- All UI components (WeatherHero, ForecastList, FavoritesCities, FloatingParticles)
- Favorites system (localStorage)
- Dark/light mode
- Geolocation detection
- All animations

