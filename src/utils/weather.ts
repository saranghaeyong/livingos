import { WeatherData } from '../types';

export const PLACEHOLDER_WEATHER: WeatherData = {
  city: 'Living Room',
  temperature: 72,
  apparentTemperature: 72,
  condition: 'Partly Cloudy',
  high: 76,
  low: 62,
  humidity: 48,
  windSpeed: 8,
  icon: 'CloudSun',
  isPlaceholder: true,
  updatedAt: 'Live forecast',
};

// Map WMO Weather Interpretation Codes to friendly titles & Lucide icon names
function interpretWmoCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear Sky', icon: 'Sun' };
  if (code === 1) return { condition: 'Mainly Clear', icon: 'Sun' };
  if (code === 2) return { condition: 'Partly Cloudy', icon: 'CloudSun' };
  if (code === 3) return { condition: 'Overcast', icon: 'Cloud' };
  if (code === 45 || code === 48) return { condition: 'Foggy', icon: 'CloudFog' };
  if (code >= 51 && code <= 57) return { condition: 'Light Drizzle', icon: 'CloudDrizzle' };
  if (code >= 61 && code <= 67) return { condition: 'Rain', icon: 'CloudRain' };
  if (code >= 71 && code <= 77) return { condition: 'Snowfall', icon: 'Snowflake' };
  if (code >= 80 && code <= 82) return { condition: 'Showers', icon: 'CloudRain' };
  if (code >= 85 && code <= 86) return { condition: 'Snow Showers', icon: 'Snowflake' };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', icon: 'CloudLightning' };
  return { condition: 'Fair', icon: 'CloudSun' };
}

export async function fetchLiveWeather(
  cityName: string = 'San Francisco',
  unit: 'celsius' | 'fahrenheit' = 'fahrenheit'
): Promise<WeatherData> {
  try {
    // 1. Geocode city name using free Open-Meteo Geocoding API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName
    )}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error('Geocoding service unavailable');
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City "${cityName}" not found`);
    }

    const first = geoData.results[0];
    const { latitude, longitude, name, admin1, country } = first;
    const resolvedName = admin1 ? `${name}, ${admin1}` : `${name}, ${country || ''}`;

    // 2. Fetch current weather and daily min/max
    const tempUnitParam = unit === 'fahrenheit' ? 'temperature_unit=fahrenheit' : 'temperature_unit=celsius';
    const windUnitParam = unit === 'fahrenheit' ? 'wind_speed_unit=mph' : 'wind_speed_unit=kmh';

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&${tempUnitParam}&${windUnitParam}`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error('Forecast service unavailable');
    const weatherData = await weatherRes.json();

    const current = weatherData.current;
    const daily = weatherData.daily;
    const weatherInfo = interpretWmoCode(current.weather_code);

    return {
      city: resolvedName,
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature),
      condition: weatherInfo.condition,
      high: Math.round(daily.temperature_2m_max[0]),
      low: Math.round(daily.temperature_2m_min[0]),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      icon: weatherInfo.icon,
      isPlaceholder: false,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    console.warn('Weather fetch error, using graceful fallback', err);
    return {
      ...PLACEHOLDER_WEATHER,
      city: cityName || 'Living Room',
      temperature: unit === 'fahrenheit' ? 72 : 22,
      apparentTemperature: unit === 'fahrenheit' ? 72 : 22,
      high: unit === 'fahrenheit' ? 76 : 24,
      low: unit === 'fahrenheit' ? 62 : 17,
      isPlaceholder: true,
      updatedAt: 'Offline preview',
    };
  }
}
