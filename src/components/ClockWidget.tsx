import { useState, useEffect } from 'react';
import { UserSettings } from '../types';

interface ClockWidgetProps {
  settings: UserSettings;
}

export function ClockWidget({ settings }: ClockWidgetProps) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    let ampm = '';

    if (settings.clockFormat === '12h') {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // convert 0 to 12
    }

    const hoursStr = hours.toString().padStart(settings.clockFormat === '24h' ? 2 : 1, '0');

    return { hoursStr, minutes, seconds, ampm };
  };

  const formatDate = () => {
    if (settings.dateFormat === 'compact') {
      return now.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
    if (settings.dateFormat === 'medium') {
      return now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
    // Full
    return now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const { hoursStr, minutes, seconds, ampm } = formatTime();

  return (
    <div className="flex flex-col select-none">
      {/* Family / Room Greeting Tag */}
      {settings.familyName && (
        <div className="flex items-center gap-2 mb-1.5 text-xs tracking-wider uppercase font-semibold text-slate-300/80 text-shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-glow)] inline-block animate-pulse" />
          <span>{settings.familyName}</span>
        </div>
      )}

      {/* Hero Time Display */}
      <div className="flex items-baseline text-white tracking-tight font-display text-shadow-tv leading-none">
        <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tighter">
          {hoursStr}:{minutes}
        </span>

        {settings.showSeconds && (
          <span className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-300/80 ml-2.5 sm:ml-4 font-mono">
            {seconds}
          </span>
        )}

        {settings.clockFormat === '12h' && (
          <span className="text-xl sm:text-2xl md:text-3xl font-medium text-[var(--accent-color)] ml-3 tracking-normal">
            {ampm}
          </span>
        )}
      </div>

      {/* Date Display */}
      <div className="mt-2 text-base sm:text-lg md:text-xl font-normal text-slate-200/90 text-shadow-tv flex items-center gap-3">
        <span>{formatDate()}</span>
        <span className="text-slate-400/60 font-light" aria-hidden="true">·</span>
        <span className="text-xs sm:text-sm font-medium px-2 py-0.5 rounded bg-black/30 backdrop-blur-md text-slate-300 border border-white/10">
          Android 9 TV
        </span>
      </div>
    </div>
  );
}
