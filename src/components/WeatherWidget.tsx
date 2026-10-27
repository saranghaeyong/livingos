import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudLightning, Snowflake, CloudFog, CloudDrizzle, RefreshCw, Wind, Droplets } from 'lucide-react';
import { WeatherData, UserSettings } from '../types';
import { fetchLiveWeather, PLACEHOLDER_WEATHER } from '../utils/weather';

interface WeatherWidgetProps {
  settings: UserSettings;
  isFocused?: boolean;
  onOpenSettingsToWeather?: () => void;
}

export function WeatherWidget({
  settings,
  isFocused,
  onOpenSettingsToWeather,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData>(PLACEHOLDER_WEATHER);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      if (settings.weatherMode === 'placeholder') {
        setWeather({
          ...PLACEHOLDER_WEATHER,
          city: settings.weatherCity || 'Living Room',
          temperature: settings.weatherUnit === 'fahrenheit' ? 72 : 22,
          apparentTemperature: settings.weatherUnit === 'fahrenheit' ? 72 : 22,
          high: settings.weatherUnit === 'fahrenheit' ? 76 : 24,
          low: settings.weatherUnit === 'fahrenheit' ? 62 : 17,
        });
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchLiveWeather(settings.weatherCity, settings.weatherUnit);
        if (!isCancelled) {
          setWeather(data);
        }
      } catch {
        if (!isCancelled) {
          setWeather(PLACEHOLDER_WEATHER);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    // Auto-refresh every 30 minutes if live
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [settings.weatherCity, settings.weatherUnit, settings.weatherMode]);

  const renderWeatherIcon = (iconName: string) => {
    const props = { className: 'w-10 h-10 text-[var(--accent-color)] drop-shadow-md' };
    switch (iconName) {
      case 'Sun':
        return <Sun {...props} />;
      case 'Cloud':
        return <Cloud {...props} />;
      case 'CloudRain':
        return <CloudRain {...props} />;
      case 'CloudLightning':
        return <CloudLightning {...props} />;
      case 'Snowflake':
        return <Snowflake {...props} />;
      case 'CloudFog':
        return <CloudFog {...props} />;
      case 'CloudDrizzle':
        return <CloudDrizzle {...props} />;
      case 'CloudSun':
      default:
        return <CloudSun {...props} />;
    }
  };

  const tempSymbol = settings.weatherUnit === 'fahrenheit' ? '°F' : '°C';

  return (
    <button
      id="widget-weather"
      data-tv-nav="true"
      onClick={onOpenSettingsToWeather}
      className={`text-left tv-glass rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer group focus:outline-none max-w-sm ${
        isFocused ? 'tv-focused' : 'hover:bg-slate-900/60'
      }`}
      title="Click or press OK to configure city & weather"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <span>{weather.city}</span>
            {weather.isPlaceholder ? (
              <span className="text-[10px] text-amber-300/90 font-mono tracking-tight bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/20">
                Sample
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono tracking-tight bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/20">
                Live
              </span>
            )}
            {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-cyan-400 ml-1" />}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-bold font-display text-white text-shadow-tv">
              {weather.temperature}
              <span className="text-xl font-medium text-slate-300">{tempSymbol}</span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-300">
              {weather.condition}
            </span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
          {renderWeatherIcon(weather.icon)}
        </div>
      </div>

      {/* Sub-metrics */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/80">
        <div className="flex items-center gap-3">
          <span>
            H: {weather.high}° · L: {weather.low}°
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            {weather.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-cyan-400" />
            {weather.windSpeed} {settings.weatherUnit === 'fahrenheit' ? 'mph' : 'km/h'}
          </span>
        </div>
      </div>
    </button>
  );
}
