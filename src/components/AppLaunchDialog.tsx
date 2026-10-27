import { ExternalLink, X, ArrowRight, Tv, AlertCircle } from 'lucide-react';
import { AppShortcut } from '../types';

interface AppLaunchDialogProps {
  app: AppShortcut | null;
  onClose: () => void;
  onConfirmLaunch: (app: AppShortcut) => void;
}

export function AppLaunchDialog({
  app,
  onClose,
  onConfirmLaunch,
}: AppLaunchDialogProps) {
  if (!app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-950 border border-white/20 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Cancel (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl"
            style={{ background: app.accentBg }}
          >
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display">{app.title}</h3>
            <p className="text-xs text-slate-400">{app.subtitle}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 mb-5 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Target Web Portal:</span>
          </div>
          <p className="font-mono text-[11px] text-slate-300 truncate bg-black/40 p-1.5 rounded">
            {app.url}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Note: Opens in TV browser view. On Android TV, if your browser has native app links enabled, this will hand off to the TV app.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-medium text-xs sm:text-sm transition-all"
          >
            Cancel
          </button>
          <button
            autoFocus
            onClick={() => onConfirmLaunch(app)}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent-color)] text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>Launch Web App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
