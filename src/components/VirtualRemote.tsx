import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CornerDownLeft,
  Settings,
  Volume2,
  VolumeX,
  Play,
  X,
  Tv,
} from 'lucide-react';

interface VirtualRemoteProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavigate: (direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => void;
  onSelect: () => void;
  onBack: () => void;
  onMenu: () => void;
  onToggleSlideshow: () => void;
}

export function VirtualRemote({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  onNavigate,
  onSelect,
  onBack,
  onMenu,
  onToggleSlideshow,
}: VirtualRemoteProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-60 select-none animate-fadeIn">
      {/* Remote Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Tv className="w-4 h-4 text-[var(--accent-color)]" />
          <span>TV Remote Test</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Close Virtual Remote"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Top Utility Buttons */}
      <div className="flex items-center justify-between w-full px-2 mb-4">
        <button
          onClick={onMenu}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all text-xs flex flex-col items-center gap-0.5"
          title="Settings / Menu"
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px]">Menu</span>
        </button>

        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all text-xs flex flex-col items-center gap-0.5"
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <span className="text-[9px]">Sound</span>
        </button>

        <button
          onClick={onToggleSlideshow}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all text-xs flex flex-col items-center gap-0.5"
          title="Toggle Slideshow"
        >
          <Play className="w-4 h-4 text-[var(--accent-color)]" />
          <span className="text-[9px]">Slide</span>
        </button>
      </div>

      {/* D-Pad Circular Controller */}
      <div className="relative w-44 h-44 rounded-full bg-slate-900 border border-white/15 flex items-center justify-center shadow-inner my-2">
        {/* Up Arrow */}
        <button
          onClick={() => onNavigate('ArrowUp')}
          className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-10 flex items-center justify-center text-slate-300 hover:text-[var(--accent-color)] hover:bg-white/10 active:scale-95 rounded-t-full transition-all"
          title="Up Arrow"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* Down Arrow */}
        <button
          onClick={() => onNavigate('ArrowDown')}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-10 flex items-center justify-center text-slate-300 hover:text-[var(--accent-color)] hover:bg-white/10 active:scale-95 rounded-b-full transition-all"
          title="Down Arrow"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Left Arrow */}
        <button
          onClick={() => onNavigate('ArrowLeft')}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-14 w-10 flex items-center justify-center text-slate-300 hover:text-[var(--accent-color)] hover:bg-white/10 active:scale-95 rounded-l-full transition-all"
          title="Left Arrow"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => onNavigate('ArrowRight')}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-14 w-10 flex items-center justify-center text-slate-300 hover:text-[var(--accent-color)] hover:bg-white/10 active:scale-95 rounded-r-full transition-all"
          title="Right Arrow"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Center OK / Select Button */}
        <button
          onClick={onSelect}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border border-white/20 flex flex-col items-center justify-center text-white hover:border-[var(--accent-color)] active:scale-90 shadow-lg transition-all"
          title="Enter / OK / Select"
        >
          <span className="font-bold text-xs tracking-wider text-[var(--accent-color)]">
            OK
          </span>
        </button>
      </div>

      {/* Bottom Nav Action: Back */}
      <div className="w-full mt-3 flex justify-center">
        <button
          onClick={onBack}
          className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-all border border-white/10"
          title="Back / Escape"
        >
          <CornerDownLeft className="w-4 h-4 text-rose-400" />
          <span>Back / Exit</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-2 text-center">
        Also supports physical keyboard arrows & Enter
      </p>
    </div>
  );
}
