import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Sun, CloudSun, Cloud, CloudRain, Snowflake } from 'lucide-react';
import { UserSettings, Wallpaper, WeatherData } from '../types';

interface IdleScreenProps {
  wallpaper: Wallpaper;
  settings: UserSettings;
  weather: WeatherData;
  onExit: () => void;
}

export function IdleScreen({
  wallpaper,
  settings,
  weather,
  onExit,
}: IdleScreenProps) {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatIdleTime = () => {
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    let ampm = '';

    if (settings.clockFormat === '12h') {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
    }
    return {
      timeStr: `${hours}:${minutes}`,
      ampm,
    };
  };

  const { timeStr, ampm } = formatIdleTime();

  const renderWeatherMini = () => {
    return (
      <div className="flex items-center gap-2 text-slate-200">
        {weather.condition.toLowerCase().includes('clear') || weather.condition.toLowerCase().includes('sun') ? (
          <Sun className="w-5 h-5 text-amber-300" />
        ) : weather.condition.toLowerCase().includes('rain') ? (
          <CloudRain className="w-5 h-5 text-cyan-300" />
        ) : weather.condition.toLowerCase().includes('snow') ? (
          <Snowflake className="w-5 h-5 text-blue-200" />
        ) : (
          <CloudSun className="w-5 h-5 text-slate-300" />
        )}
        <span className="font-semibold text-lg font-display">
          {weather.temperature}°{settings.weatherUnit === 'fahrenheit' ? 'F' : 'C'}
        </span>
        <span className="text-xs text-slate-300 hidden sm:inline">
          {weather.city.split(',')[0]}
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={onExit}
      className="fixed inset-0 z-50 overflow-hidden cursor-pointer select-none bg-black transition-opacity duration-700 animate-fadeIn"
      title="Click or press any remote key to return to Dashboard"
    >
      {/* Background with Ambient Ken Burns slow pan/zoom */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
          settings.kenBurnsEffect ? 'animate-ken-burns' : ''
        }`}
        style={{
          backgroundImage: `url(${wallpaper.url})`,
        }}
      />

      {/* Gentle dark gradient overlay for deep contrast and TV screen protection */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60 pointer-events-none" />

      {/* Top Bar: Family Greeting & Clock */}
      <div className="absolute top-8 left-8 right-8 flex items-start justify-between pointer-events-none">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-300/80 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
            <span>{settings.familyName || 'LivingOS TV'} · Ambient Mode</span>
          </div>
          <p className="text-sm font-medium text-slate-300 text-shadow-subtle">
            {time.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Floating Ambient Weather */}
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          {renderWeatherMini()}
        </div>
      </div>

      {/* Bottom Center: Photo Details & Wake button */}
      <div className="absolute bottom-10 left-8 right-8 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pointer-events-none">
        {/* Photo Title & Metadata */}
        <div className="max-w-md">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white font-display text-shadow-tv">
            {wallpaper.title}
          </h2>
          {wallpaper.subtitle && (
            <p className="text-sm text-slate-300 mt-1 text-shadow-subtle">
              {wallpaper.subtitle}
            </p>
          )}
        </div>

        {/* Bottom Right Giant Clock */}
        <div className="flex items-baseline text-white font-display text-shadow-tv">
          <span className="text-6xl sm:text-7xl font-bold tracking-tight">
            {timeStr}
          </span>
          {ampm && (
            <span className="text-xl sm:text-2xl font-medium text-[var(--accent-color)] ml-2">
              {ampm}
            </span>
          )}
        </div>
      </div>

      {/* Visible Exit Return Banner (Interactive & highly visible) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
          className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-slate-900/85 hover:bg-slate-900 backdrop-blur-xl border border-[var(--accent-color)] text-white shadow-[0_0_30px_var(--accent-glow)] hover:scale-105 transition-all duration-200 cursor-pointer focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--accent-color)]" />
          <span className="font-medium text-sm sm:text-base">
            Return to Dashboard
          </span>
          <span className="text-xs text-slate-400 font-mono bg-white/10 px-2 py-0.5 rounded">
            Press Any Key or Click
          </span>
        </button>
      </div>
    </div>
  );
}
