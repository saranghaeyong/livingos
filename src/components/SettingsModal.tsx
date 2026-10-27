import { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Clock,
  Palette,
  CloudSun,
  Grid,
  Tv,
  Upload,
  Trash2,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ACCENT_THEMES } from '../constants';
import { AccentColor, AppShortcut, UserSettings, Wallpaper } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  wallpapers: Wallpaper[];
  onUploadWallpaper: (file: File, title?: string) => Promise<void>;
  onDeleteCustomWallpaper: (id: string) => Promise<void>;
  onSelectWallpaper: (id: string) => void;
  shortcuts: AppShortcut[];
  onUpdateShortcuts: (shortcuts: AppShortcut[]) => void;
  initialTab?: 'wallpaper' | 'clock' | 'theme' | 'weather' | 'apps' | 'guide';
}

type TabType = 'wallpaper' | 'clock' | 'theme' | 'weather' | 'apps' | 'guide';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  wallpapers,
  onUploadWallpaper,
  onDeleteCustomWallpaper,
  onSelectWallpaper,
  shortcuts,
  onUpdateShortcuts,
  initialTab = 'wallpaper',
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppSubtitle, setNewAppSubtitle] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await onUploadWallpaper(file);
    } catch (err) {
      console.error('Failed to upload file', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppTitle.trim() || !newAppUrl.trim()) return;

    let validUrl = newAppUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const newApp: AppShortcut = {
      id: 'custom-' + Date.now(),
      title: newAppTitle.trim(),
      subtitle: newAppSubtitle.trim() || 'Custom Shortcut',
      url: validUrl,
      iconName: 'Globe',
      accentBg: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
      textColor: '#ffffff',
      enabled: true,
      isCustom: true,
    };

    onUpdateShortcuts([...shortcuts, newApp]);
    setNewAppTitle('');
    setNewAppUrl('');
    setNewAppSubtitle('');
  };

  const toggleAppEnabled = (id: string) => {
    const updated = shortcuts.map((app) =>
      app.id === id ? { ...app, enabled: !app.enabled } : app
    );
    onUpdateShortcuts(updated);
  };

  const removeCustomApp = (id: string) => {
    const updated = shortcuts.filter((app) => app.id !== id);
    onUpdateShortcuts(updated);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'wallpaper', label: 'Wallpapers', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'clock', label: 'Clock & Greeting', icon: <Clock className="w-4 h-4" /> },
    { id: 'theme', label: 'Theme & Accent', icon: <Palette className="w-4 h-4" /> },
    { id: 'weather', label: 'Weather', icon: <CloudSun className="w-4 h-4" /> },
    { id: 'apps', label: 'App Tiles', icon: <Grid className="w-4 h-4" /> },
    { id: 'guide', label: 'Android TV & Vercel', icon: <Tv className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950/95 border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/40 flex items-center justify-center">
              <Tv className="w-5 h-5 text-[var(--accent-color)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">LivingOS TV Settings</h2>
              <p className="text-xs text-slate-400">Configure display, family photos & TV features</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Settings (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-white/10 bg-slate-900/40 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-color)] text-slate-950 font-semibold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB: WALLPAPERS */}
          {activeTab === 'wallpaper' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-semibold text-white">Family Photo Wallpaper</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a built-in family scene or upload your own photos saved directly in your browser.
                  </p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-color)] text-slate-950 font-semibold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Family Photo'}</span>
                  </button>
                </div>
              </div>

              {/* Photo Slideshow Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white block">Automatic Slideshow</label>
                    <span className="text-xs text-slate-400">Cycles photos in background & idle mode</span>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ slideshowEnabled: !settings.slideshowEnabled })}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      settings.slideshowEnabled ? 'bg-[var(--accent-color)]' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.slideshowEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-white block mb-1.5">
                    Slideshow Interval ({settings.slideshowIntervalSeconds} seconds)
                  </label>
                  <div className="flex items-center gap-2">
                    {[5, 10, 15, 30, 60, 300].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => onUpdateSettings({ slideshowIntervalSeconds: sec })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                          settings.slideshowIntervalSeconds === sec
                            ? 'bg-[var(--accent-color)] text-slate-950 font-bold'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-medium text-white block">Wallpaper Overlay Dimming</span>
                    <span className="text-xs text-slate-400">
                      Enhances clock legibility against bright photos ({settings.wallpaperDim}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={settings.wallpaperDim}
                    onChange={(e) => onUpdateSettings({ wallpaperDim: Number(e.target.value) })}
                    className="w-48 accent-[var(--accent-color)]"
                  />
                </div>
              </div>

              {/* Wallpaper Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {wallpapers.map((wp) => {
                  const isSelected = wp.id === settings.activeWallpaperId;
                  return (
                    <div
                      key={wp.id}
                      className={`group relative rounded-2xl overflow-hidden border-2 aspect-video transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent-color)] shadow-[0_0_20px_var(--accent-glow)] scale-[1.02]'
                          : 'border-white/10 hover:border-white/40'
                      }`}
                      onClick={() => onSelectWallpaper(wp.id)}
                    >
                      <img
                        src={wp.thumbnailUrl || wp.url}
                        alt={wp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 sm:p-2.5">
                        <span className="text-xs font-semibold text-white truncate">{wp.title}</span>
                        <span className="text-[10px] text-slate-300 truncate">
                          {wp.isCustom ? 'Custom Upload' : 'Preset Scene'}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--accent-color)] text-slate-950 flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {wp.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomWallpaper(wp.id);
                          }}
                          className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: CLOCK & GREETING */}
          {activeTab === 'clock' && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-white block mb-1">
                  Living Room / Family Greeting
                </label>
                <input
                  type="text"
                  value={settings.familyName}
                  onChange={(e) => onUpdateSettings({ familyName: e.target.value })}
                  placeholder="e.g. The Davis Family or Living Room TV"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-color)] transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <span className="text-sm font-medium text-white block">Time Format</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateSettings({ clockFormat: '12h' })}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                        settings.clockFormat === '12h'
                          ? 'bg-[var(--accent-color)] text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      12-Hour (10:25 PM)
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ clockFormat: '24h' })}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                        settings.clockFormat === '24h'
                          ? 'bg-[var(--accent-color)] text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      24-Hour (22:25)
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white block">Display Seconds</span>
                    <span className="text-xs text-slate-400">Shows live seconds next to clock</span>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ showSeconds: !settings.showSeconds })}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      settings.showSeconds ? 'bg-[var(--accent-color)]' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.showSeconds ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white block mb-2">Date Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['full', 'medium', 'compact'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onUpdateSettings({ dateFormat: style })}
                      className={`p-3 rounded-xl text-xs font-medium border capitalize transition-all ${
                        settings.dateFormat === style
                          ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-white font-bold'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-sm font-medium text-white block mb-1">
                  Ambient Idle Timeout ({settings.idleTimeoutSeconds}s)
                </span>
                <span className="text-xs text-slate-400 block mb-3">
                  Automatically transitions to full-screen ambient family photo after inactivity.
                </span>
                <div className="flex items-center gap-2">
                  {[0, 30, 60, 120, 300].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => onUpdateSettings({ idleTimeoutSeconds: sec })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                        settings.idleTimeoutSeconds === sec
                          ? 'bg-[var(--accent-color)] text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {sec === 0 ? 'Disabled' : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: THEME & ACCENT */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">LivingOS Accent Color</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Select your preferred TV glow and focus accent. Soft cyan is the signature Android TV palette.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(Object.keys(ACCENT_THEMES) as AccentColor[]).map((key) => {
                    const theme = ACCENT_THEMES[key];
                    const isSelected = settings.accentColor === key;
                    return (
                      <button
                        key={key}
                        onClick={() => onUpdateSettings({ accentColor: key })}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-white bg-white/10 shadow-lg'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shadow-md shrink-0"
                          style={{
                            backgroundColor: theme.hex,
                            boxShadow: `0 0 10px ${theme.glow}`,
                          }}
                        />
                        <span className="text-xs sm:text-sm font-medium text-white">{theme.name}</span>
                        {isSelected && <Check className="w-4 h-4 ml-auto text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white block">TV Remote Sound Feedback</span>
                  <span className="text-xs text-slate-400">
                    Plays subtle synthesized navigation blips when pressing D-pad or Enter
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ soundFeedback: !settings.soundFeedback })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    settings.soundFeedback
                      ? 'bg-[var(--accent-color)] text-slate-950'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {settings.soundFeedback ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Sound On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Muted</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white block">Ken Burns Ambient Motion</span>
                  <span className="text-xs text-slate-400">
                    Gentle slow pan and zoom on wallpapers for burn-in protection & organic feel
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ kenBurnsEffect: !settings.kenBurnsEffect })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    settings.kenBurnsEffect ? 'bg-[var(--accent-color)]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.kenBurnsEffect ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB: WEATHER */}
          {activeTab === 'weather' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div>
                  <label className="text-sm font-medium text-white block mb-1">Weather Mode</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateSettings({ weatherMode: 'live' })}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                        settings.weatherMode === 'live'
                          ? 'bg-[var(--accent-color)] text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      Live Weather (Free Open-Meteo · No API key needed)
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ weatherMode: 'placeholder' })}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                        settings.weatherMode === 'placeholder'
                          ? 'bg-[var(--accent-color)] text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      Sample Placeholder Mode
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white block mb-1">City Location</label>
                  <input
                    type="text"
                    value={settings.weatherCity}
                    onChange={(e) => onUpdateSettings({ weatherCity: e.target.value })}
                    placeholder="e.g. San Francisco, New York, London, Chicago..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-color)] text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter any world city. Geocoding and real-time forecast update automatically.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-white block mb-1">Temperature Unit</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateSettings({ weatherUnit: 'fahrenheit' })}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        settings.weatherUnit === 'fahrenheit'
                          ? 'bg-[var(--accent-color)] text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ weatherUnit: 'celsius' })}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        settings.weatherUnit === 'celsius'
                          ? 'bg-[var(--accent-color)] text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      Celsius (°C)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APP TILES */}
          {activeTab === 'apps' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Installed TV Web App Tiles</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Toggle apps to show on the TV dashboard or launch their web view.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {shortcuts.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow"
                          style={{ background: app.accentBg }}
                        >
                          <Tv className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-xs sm:text-sm font-semibold text-white block truncate">
                            {app.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">{app.url}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.isCustom && (
                          <button
                            onClick={() => removeCustomApp(app.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete custom app"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleAppEnabled(app.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            app.enabled
                              ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)] border border-[var(--accent-color)]/40'
                              : 'bg-white/5 text-slate-500 border border-white/5'
                          }`}
                        >
                          {app.enabled ? 'Active' : 'Hidden'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom App Form */}
              <form
                onSubmit={handleAddCustomApp}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
              >
                <h4 className="text-sm font-semibold text-white">Add Custom Web App / URL</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newAppTitle}
                    onChange={(e) => setNewAppTitle(e.target.value)}
                    placeholder="App Name (e.g. Hulu, HBO Max)"
                    className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[var(--accent-color)]"
                    required
                  />
                  <input
                    type="text"
                    value={newAppUrl}
                    onChange={(e) => setNewAppUrl(e.target.value)}
                    placeholder="URL (e.g. https://www.hulu.com)"
                    className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[var(--accent-color)]"
                    required
                  />
                  <input
                    type="text"
                    value={newAppSubtitle}
                    onChange={(e) => setNewAppSubtitle(e.target.value)}
                    placeholder="Subtitle (e.g. Stream TV)"
                    className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[var(--accent-color)]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--accent-color)] text-slate-950 font-semibold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Add Shortcut
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: GUIDE & VERCEL */}
          {activeTab === 'guide' && (
            <div className="space-y-6 text-sm text-slate-300">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-1">
                  <Info className="w-4 h-4" />
                  <span>Android 9 TV & Remote Navigation Architecture</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  LivingOS TV is built specifically for 10-foot television viewports and standard Android TV D-Pad remotes. All cards and controls respond to standard arrow keys, Enter (OK), and Escape/Backspace (Back).
                </p>
              </div>

              {/* Remote Key Reference */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="font-semibold text-white text-sm">Android TV Remote Key Mappings</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="font-mono text-cyan-400 block font-semibold mb-0.5">D-Pad ◀ ▶ ▲ ▼</span>
                    <span className="text-slate-400">Navigate cards & widgets</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="font-mono text-cyan-400 block font-semibold mb-0.5">Enter / OK</span>
                    <span className="text-slate-400">Launch app or select</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="font-mono text-cyan-400 block font-semibold mb-0.5">Back / Esc</span>
                    <span className="text-slate-400">Exit modal / wake from idle</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="font-mono text-cyan-400 block font-semibold mb-0.5">Key [M] / [S]</span>
                    <span className="text-slate-400">[M]enu · [S]lideshow</span>
                  </div>
                </div>
              </div>

              {/* Vercel Deployment Instructions */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-sm">Deploying to Vercel (Production)</h4>
                  <span className="text-xs text-emerald-400 font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                    vercel.json Included
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  This application includes a ready-to-deploy <code className="text-cyan-400 bg-white/10 px-1 py-0.5 rounded">vercel.json</code>. You can deploy it in 2 simple steps:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Push this repository to GitHub / GitLab.</li>
                  <li>Import the project into Vercel and click <strong>Deploy</strong> (Framework: Vite).</li>
                  <li>On your Android TV, open the web browser (e.g. TV Bro, Puffin TV, or Chrome) and navigate to your deployed URL.</li>
                </ol>
              </div>

              {/* App Tile Note */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-200 block">TV App Shortcuts Note</span>
                <p>
                  Because this is a secure web application, app tiles open the corresponding TV web portal or URL in your browser. It does not tamper with native Android system settings or non-web internal APKs without a custom TV bridge.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
            <span>Settings saved automatically to browser storage</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
