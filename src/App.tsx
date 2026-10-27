/**
 * LivingOS TV
 * Premium Minimalist Ambient Dashboard for Android 9 TV
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ACCENT_THEMES, DEFAULT_SETTINGS, PRESET_WALLPAPERS } from './constants';
import { useRemoteNav } from './hooks/useRemoteNav';
import { AppShortcut, UserSettings, Wallpaper, WeatherData } from './types';
import {
  deleteCustomWallpaper,
  getAllWallpapers,
  loadSettings,
  loadShortcuts,
  saveCustomWallpaper,
  saveSettings,
  saveShortcuts,
} from './utils/storage';
import { fetchLiveWeather, PLACEHOLDER_WEATHER } from './utils/weather';
import { playTvSound } from './utils/sound';

import { TopBar } from './components/TopBar';
import { ClockWidget } from './components/ClockWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { AppShortcutsRow } from './components/AppShortcutsRow';
import { PhotoStrip } from './components/PhotoStrip';
import { IdleScreen } from './components/IdleScreen';
import { SettingsModal } from './components/SettingsModal';
import { VirtualRemote } from './components/VirtualRemote';
import { AppLaunchDialog } from './components/AppLaunchDialog';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(PRESET_WALLPAPERS);
  const [shortcuts, setShortcuts] = useState<AppShortcut[]>(() => loadShortcuts());
  const [weather, setWeather] = useState<WeatherData>(PLACEHOLDER_WEATHER);

  // Modals & Screen States
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<
    'wallpaper' | 'clock' | 'theme' | 'weather' | 'apps' | 'guide'
  >('wallpaper');
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [isVirtualRemoteOpen, setIsVirtualRemoteOpen] = useState<boolean>(false);
  const [launchingApp, setLaunchingApp] = useState<AppShortcut | null>(null);

  // Load wallpapers from IndexedDB & presets
  useEffect(() => {
    let mounted = true;
    getAllWallpapers().then((all) => {
      if (mounted) {
        setWallpapers(all);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Update dynamic CSS custom variables when accent color changes
  useEffect(() => {
    const theme = ACCENT_THEMES[settings.accentColor] || ACCENT_THEMES.cyan;
    document.documentElement.style.setProperty('--accent-color', theme.hex);
    document.documentElement.style.setProperty('--accent-glow', theme.glow);
    document.documentElement.style.setProperty('--accent-rgb', theme.rgb);
  }, [settings.accentColor]);

  // Save settings when changed
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Save shortcuts when changed
  const updateShortcuts = useCallback((newShortcuts: AppShortcut[]) => {
    setShortcuts(newShortcuts);
    saveShortcuts(newShortcuts);
  }, []);

  // Active Wallpaper lookup
  const activeWallpaper = useMemo(() => {
    return (
      wallpapers.find((w) => w.id === settings.activeWallpaperId) ||
      wallpapers[0] ||
      PRESET_WALLPAPERS[0]
    );
  }, [wallpapers, settings.activeWallpaperId]);

  // Slideshow advance function
  const handleNextWallpaper = useCallback(() => {
    if (wallpapers.length <= 1) return;
    const currentIndex = wallpapers.findIndex((w) => w.id === settings.activeWallpaperId);
    const nextIndex = (currentIndex + 1) % wallpapers.length;
    updateSettings({ activeWallpaperId: wallpapers[nextIndex].id });
  }, [wallpapers, settings.activeWallpaperId, updateSettings]);

  const handlePrevWallpaper = useCallback(() => {
    if (wallpapers.length <= 1) return;
    const currentIndex = wallpapers.findIndex((w) => w.id === settings.activeWallpaperId);
    const prevIndex = (currentIndex - 1 + wallpapers.length) % wallpapers.length;
    updateSettings({ activeWallpaperId: wallpapers[prevIndex].id });
  }, [wallpapers, settings.activeWallpaperId, updateSettings]);

  // Slideshow automatic timer
  useEffect(() => {
    if (!settings.slideshowEnabled) return;
    const intervalMs = Math.max(3, settings.slideshowIntervalSeconds) * 1000;
    const timer = setInterval(() => {
      handleNextWallpaper();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.slideshowEnabled, settings.slideshowIntervalSeconds, handleNextWallpaper]);

  // Remote Navigation Hook
  const { focusedId, setFocusedId, lastInteractionTime, resetIdleTimer } = useRemoteNav({
    soundEnabled: settings.soundFeedback,
    isModalOpen: isSettingsOpen || Boolean(launchingApp),
    isIdle,
    onWakeFromIdle: () => setIsIdle(false),
    onCloseModal: () => {
      setIsSettingsOpen(false);
      setLaunchingApp(null);
    },
    onOpenSettings: () => {
      setSettingsInitialTab('wallpaper');
      setIsSettingsOpen(true);
    },
    onOpenSlideshow: () => {
      updateSettings({ slideshowEnabled: !settings.slideshowEnabled });
    },
  });

  // Idle timeout detector (e.g. 60 seconds of inactivity)
  useEffect(() => {
    if (settings.idleTimeoutSeconds <= 0 || isIdle) return;

    const interval = setInterval(() => {
      const inactiveDuration = Date.now() - lastInteractionTime;
      if (inactiveDuration >= settings.idleTimeoutSeconds * 1000) {
        setIsIdle(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.idleTimeoutSeconds, isIdle, lastInteractionTime]);

  // Weather pre-fetch
  useEffect(() => {
    let mounted = true;
    if (settings.weatherMode === 'placeholder') {
      setWeather({
        ...PLACEHOLDER_WEATHER,
        city: settings.weatherCity || 'Living Room',
      });
      return;
    }

    fetchLiveWeather(settings.weatherCity, settings.weatherUnit)
      .then((data) => {
        if (mounted) setWeather(data);
      })
      .catch(() => {
        if (mounted) setWeather(PLACEHOLDER_WEATHER);
      });

    return () => {
      mounted = false;
    };
  }, [settings.weatherCity, settings.weatherUnit, settings.weatherMode]);

  // Wallpaper Upload Handler
  const handleUploadWallpaper = async (file: File) => {
    try {
      const saved = await saveCustomWallpaper(file);
      setWallpapers((prev) => [...prev, saved]);
      updateSettings({ activeWallpaperId: saved.id });
      playTvSound('select', settings.soundFeedback);
    } catch (err) {
      console.error('Failed to save wallpaper', err);
    }
  };

  // Wallpaper Delete Handler
  const handleDeleteCustomWallpaper = async (id: string) => {
    try {
      await deleteCustomWallpaper(id);
      const remaining = wallpapers.filter((w) => w.id !== id);
      setWallpapers(remaining);
      if (settings.activeWallpaperId === id) {
        updateSettings({ activeWallpaperId: remaining[0]?.id || PRESET_WALLPAPERS[0].id });
      }
    } catch (err) {
      console.error('Failed to delete custom wallpaper', err);
    }
  };

  // App Selection & Launching
  const handleSelectApp = (app: AppShortcut) => {
    playTvSound('select', settings.soundFeedback);
    setLaunchingApp(app);
  };

  const handleConfirmLaunch = (app: AppShortcut) => {
    playTvSound('select', settings.soundFeedback);
    setLaunchingApp(null);
    // Open application in new tab / browser window
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  // Virtual Remote Simulation Handlers
  const handleVirtualNavigate = (key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  };

  const handleVirtualSelect = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  };

  const handleVirtualBack = () => {
    if (isIdle) {
      setIsIdle(false);
    } else if (isSettingsOpen || launchingApp) {
      setIsSettingsOpen(false);
      setLaunchingApp(null);
    } else {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#08090c] text-slate-100 flex flex-col justify-between select-none">
      {/* Dynamic Background Wallpaper with optional Ken Burns effect */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
          settings.kenBurnsEffect ? 'animate-ken-burns' : ''
        }`}
        style={{
          backgroundImage: `url(${activeWallpaper.url})`,
        }}
      />

      {/* Dimming & Charcoal-Black Glassmorphic Backing */}
      <div
        className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundColor: `rgba(6, 8, 12, ${(settings.wallpaperDim + 25) / 100})`,
        }}
      />

      {/* Radial soft gradient overlay for 10-foot depth & television edge protection */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090c]/90 via-transparent to-[#08090c]/70 pointer-events-none" />

      {/* Main 16:9 TV Safe Area Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-5 sm:py-8 overflow-hidden">
        {/* Top TV Bar */}
        <TopBar
          focusedId={focusedId}
          slideshowEnabled={settings.slideshowEnabled}
          onToggleSlideshow={() =>
            updateSettings({ slideshowEnabled: !settings.slideshowEnabled })
          }
          onTriggerIdle={() => setIsIdle(true)}
          onOpenSettings={(tab) => {
            if (tab) setSettingsInitialTab(tab);
            setIsSettingsOpen(true);
          }}
          onToggleVirtualRemote={() => setIsVirtualRemoteOpen((prev) => !prev)}
          isVirtualRemoteOpen={isVirtualRemoteOpen}
        />

        {/* Central Stage: Clock + Weather Glance */}
        <main className="my-auto py-2 sm:py-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <ClockWidget settings={settings} />
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end">
            <WeatherWidget
              settings={settings}
              isFocused={focusedId === 'widget-weather'}
              onOpenSettingsToWeather={() => {
                setSettingsInitialTab('weather');
                setIsSettingsOpen(true);
              }}
            />
          </div>
        </main>

        {/* Bottom Stage: App Tiles Row & Photo Controls Strip */}
        <footer className="space-y-4">
          <AppShortcutsRow
            shortcuts={shortcuts}
            focusedId={focusedId}
            onSelectApp={handleSelectApp}
            onOpenAddModal={() => {
              setSettingsInitialTab('apps');
              setIsSettingsOpen(true);
            }}
          />

          <PhotoStrip
            wallpapers={wallpapers}
            activeWallpaperId={settings.activeWallpaperId}
            slideshowEnabled={settings.slideshowEnabled}
            slideshowIntervalSeconds={settings.slideshowIntervalSeconds}
            focusedId={focusedId}
            onSelectWallpaper={(id) => updateSettings({ activeWallpaperId: id })}
            onToggleSlideshow={() =>
              updateSettings({ slideshowEnabled: !settings.slideshowEnabled })
            }
            onNextWallpaper={handleNextWallpaper}
            onPrevWallpaper={handlePrevWallpaper}
            onUploadClick={() => {
              setSettingsInitialTab('wallpaper');
              setIsSettingsOpen(true);
            }}
            onOpenSettingsToGallery={() => {
              setSettingsInitialTab('wallpaper');
              setIsSettingsOpen(true);
            }}
          />
        </footer>
      </div>

      {/* Idle Screen / Ambient Screensaver Overlay */}
      {isIdle && (
        <IdleScreen
          wallpaper={activeWallpaper}
          settings={settings}
          weather={weather}
          onExit={() => {
            setIsIdle(false);
            resetIdleTimer();
          }}
        />
      )}

      {/* App Launch Dialog */}
      <AppLaunchDialog
        app={launchingApp}
        onClose={() => setLaunchingApp(null)}
        onConfirmLaunch={handleConfirmLaunch}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        wallpapers={wallpapers}
        onUploadWallpaper={handleUploadWallpaper}
        onDeleteCustomWallpaper={handleDeleteCustomWallpaper}
        onSelectWallpaper={(id) => updateSettings({ activeWallpaperId: id })}
        shortcuts={shortcuts}
        onUpdateShortcuts={updateShortcuts}
        initialTab={settingsInitialTab}
      />

      {/* On-Screen Virtual Remote Control (toggleable for PC / desktop testing) */}
      <VirtualRemote
        isOpen={isVirtualRemoteOpen}
        onClose={() => setIsVirtualRemoteOpen(false)}
        soundEnabled={settings.soundFeedback}
        onToggleSound={() => updateSettings({ soundFeedback: !settings.soundFeedback })}
        onNavigate={handleVirtualNavigate}
        onSelect={handleVirtualSelect}
        onBack={handleVirtualBack}
        onMenu={() => {
          setSettingsInitialTab('wallpaper');
          setIsSettingsOpen(true);
        }}
        onToggleSlideshow={() =>
          updateSettings({ slideshowEnabled: !settings.slideshowEnabled })
        }
      />
    </div>
  );
}
