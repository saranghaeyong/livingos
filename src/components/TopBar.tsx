import {
  Tv,
  Settings,
  HelpCircle,
  Eye,
  Sliders,
  Play,
  Pause,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopBarProps {
  focusedId: string;
  slideshowEnabled: boolean;
  onToggleSlideshow: () => void;
  onTriggerIdle: () => void;
  onOpenSettings: (tab?: 'wallpaper' | 'clock' | 'theme' | 'weather' | 'apps' | 'guide') => void;
  onToggleVirtualRemote: () => void;
  isVirtualRemoteOpen: boolean;
}

export function TopBar({
  focusedId,
  slideshowEnabled,
  onToggleSlideshow,
  onTriggerIdle,
  onOpenSettings,
  onToggleVirtualRemote,
  isVirtualRemoteOpen,
}: TopBarProps) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="w-full flex items-center justify-between py-2 select-none">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center shadow-lg">
            <Tv className="w-5 h-5 text-[var(--accent-color)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg font-display tracking-wide text-white">
                LivingOS <span className="text-[var(--accent-color)]">TV</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                10-Foot UI
              </span>
            </div>
          </div>
        </div>

        {/* Network indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-3 border-l border-white/10">
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-300">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] text-rose-300">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Quick TV Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Trigger Ambient / Screensaver button */}
        <button
          id="nav-screensaver"
          data-tv-nav="true"
          onClick={onTriggerIdle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none ${
            focusedId === 'nav-screensaver'
              ? 'tv-focused'
              : 'tv-glass-interactive text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Start Ambient Screensaver Mode"
        >
          <Eye className="w-3.5 h-3.5 text-[var(--accent-color)]" />
          <span className="hidden sm:inline">Ambient View</span>
        </button>

        {/* Toggle Slideshow */}
        <button
          id="nav-slideshow"
          data-tv-nav="true"
          onClick={onToggleSlideshow}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none ${
            focusedId === 'nav-slideshow'
              ? 'tv-focused'
              : 'tv-glass-interactive text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Wallpaper Slideshow"
        >
          {slideshowEnabled ? (
            <>
              <Pause className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              <span className="hidden sm:inline">Slide On</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Slide Off</span>
            </>
          )}
        </button>

        {/* Guide / Setup */}
        <button
          id="nav-guide"
          data-tv-nav="true"
          onClick={() => onOpenSettings('guide')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none ${
            focusedId === 'nav-guide'
              ? 'tv-focused'
              : 'tv-glass-interactive text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Android TV & Vercel Setup Guide"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">TV Guide</span>
        </button>

        {/* Virtual Remote Control Toggle */}
        <button
          id="nav-remote-toggle"
          data-tv-nav="true"
          onClick={onToggleVirtualRemote}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none ${
            focusedId === 'nav-remote-toggle'
              ? 'tv-focused'
              : isVirtualRemoteOpen
              ? 'bg-[var(--accent-color)] text-slate-950 font-semibold'
              : 'tv-glass-interactive text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Virtual TV Remote (for desktop testing)"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Test Remote</span>
        </button>

        {/* Settings Button */}
        <button
          id="nav-settings"
          data-tv-nav="true"
          onClick={() => onOpenSettings()}
          className={`p-2 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none ${
            focusedId === 'nav-settings'
              ? 'tv-focused'
              : 'tv-glass-interactive hover:bg-white/10'
          }`}
          title="Settings & Wallpaper Management (Key: M)"
        >
          <Settings className="w-4 h-4 text-[var(--accent-color)]" />
        </button>
      </div>
    </header>
  );
}
