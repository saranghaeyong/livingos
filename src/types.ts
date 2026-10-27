export type AccentColor = 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet' | 'blue';

export interface AccentTheme {
  id: AccentColor;
  name: string;
  hex: string;
  rgb: string;
  glow: string;
  textClass: string;
  borderClass: string;
  bgClass: string;
}

export interface Wallpaper {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  thumbnailUrl?: string;
  isCustom: boolean;
  dateAdded?: number;
}

export interface AppShortcut {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  iconName: string;
  accentBg: string;
  textColor: string;
  enabled: boolean;
  isCustom: boolean;
  hotkey?: string;
}

export interface UserSettings {
  accentColor: AccentColor;
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  dateFormat: 'full' | 'medium' | 'compact';
  familyName: string;
  idleTimeoutSeconds: number; // 0 = off, 30, 60, 120, 300
  slideshowEnabled: boolean;
  slideshowIntervalSeconds: number; // 5, 10, 15, 30, 60
  activeWallpaperId: string;
  soundFeedback: boolean;
  weatherUnit: 'celsius' | 'fahrenheit';
  weatherCity: string;
  weatherMode: 'live' | 'placeholder';
  wallpaperDim: number; // 0 to 60 percentage
  kenBurnsEffect: boolean;
}

export interface WeatherData {
  city: string;
  temperature: number;
  apparentTemperature: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  isPlaceholder: boolean;
  updatedAt: string;
}

export type ActiveNavZone = 'top-bar' | 'apps' | 'photo-controls' | 'modal' | 'idle';
