import {
  Youtube,
  Tv,
  Film,
  Sparkles,
  Music,
  Layers,
  Gamepad2,
  Plus,
  ExternalLink,
  Globe,
  Radio,
  PlaySquare,
} from 'lucide-react';
import { AppShortcut } from '../types';

interface AppShortcutsRowProps {
  shortcuts: AppShortcut[];
  focusedId: string;
  onSelectApp: (app: AppShortcut) => void;
  onOpenAddModal: () => void;
}

export function AppShortcutsRow({
  shortcuts,
  focusedId,
  onSelectApp,
  onOpenAddModal,
}: AppShortcutsRowProps) {
  const getIcon = (name: string) => {
    const props = { className: 'w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110' };
    switch (name.toLowerCase()) {
      case 'youtube':
        return <Youtube {...props} />;
      case 'tv':
      case 'netflix':
        return <Tv {...props} />;
      case 'film':
      case 'prime':
        return <Film {...props} />;
      case 'sparkles':
      case 'disney':
        return <Sparkles {...props} />;
      case 'music':
      case 'spotify':
        return <Music {...props} />;
      case 'layers':
      case 'plex':
        return <Layers {...props} />;
      case 'gamepad2':
      case 'twitch':
        return <Gamepad2 {...props} />;
      case 'radio':
        return <Radio {...props} />;
      case 'playsquare':
        return <PlaySquare {...props} />;
      default:
        return <Globe {...props} />;
    }
  };

  const enabledShortcuts = shortcuts.filter((s) => s.enabled);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            TV Apps & Services
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            (Web Apps & TV Portals)
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
          Use D-pad ◀ ▶ to browse · OK to launch
        </span>
      </div>

      {/* Horizontal App Scroll Row */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none no-scrollbar">
        {enabledShortcuts.map((app, index) => {
          const isFocused = focusedId === `app-${app.id}`;
          return (
            <button
              key={app.id}
              id={`app-${app.id}`}
              data-tv-nav="true"
              onClick={() => onSelectApp(app)}
              className={`group relative flex flex-col items-start justify-between p-4 sm:p-5 rounded-2xl w-36 sm:w-44 h-32 sm:h-36 shrink-0 text-left transition-all duration-200 cursor-pointer focus:outline-none ${
                isFocused
                  ? 'tv-focused ring-2 ring-[var(--accent-color)] shadow-[0_0_24px_var(--accent-glow)]'
                  : 'tv-glass-interactive hover:bg-slate-800/80 hover:-translate-y-1'
              }`}
              style={{
                boxShadow: isFocused ? '0 0 25px 2px var(--accent-glow)' : undefined,
              }}
            >
              {/* App Icon with subtle glowing container */}
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105"
                style={{ background: app.accentBg }}
              >
                {getIcon(app.iconName)}
              </div>

              {/* Title & Subtitle */}
              <div className="mt-auto w-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm sm:text-base text-white truncate group-hover:text-[var(--accent-color)] transition-colors">
                    {app.title}
                  </h3>
                  {app.hotkey && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 shrink-0 ml-1">
                      {app.hotkey}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300/80 truncate mt-0.5">
                  {app.subtitle}
                </p>
              </div>

              {/* Subtle External Web link indicator on hover/focus */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-60 transition-opacity">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>
          );
        })}

        {/* Add Custom App Tile */}
        <button
          id="app-add-custom"
          data-tv-nav="true"
          onClick={onOpenAddModal}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl w-28 sm:w-32 h-32 sm:h-36 shrink-0 text-center border-2 border-dashed border-white/15 tv-glass-subtle hover:border-[var(--accent-color)]/60 hover:bg-white/5 transition-all duration-200 cursor-pointer focus:outline-none ${
            focusedId === 'app-add-custom' ? 'tv-focused border-[var(--accent-color)]' : ''
          }`}
          title="Add a custom web app shortcut"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-300 mb-2 group-hover:text-white group-hover:bg-[var(--accent-color)]/20 transition-all">
            <Plus className="w-5 h-5 text-[var(--accent-color)]" />
          </div>
          <span className="text-xs font-medium text-slate-200">Add App</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Custom URL</span>
        </button>
      </div>
    </div>
  );
}
