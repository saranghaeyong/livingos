import { Play, Pause, ChevronLeft, ChevronRight, Image as ImageIcon, Upload } from 'lucide-react';
import { Wallpaper } from '../types';

interface PhotoStripProps {
  wallpapers: Wallpaper[];
  activeWallpaperId: string;
  slideshowEnabled: boolean;
  slideshowIntervalSeconds: number;
  focusedId: string;
  onSelectWallpaper: (id: string) => void;
  onToggleSlideshow: () => void;
  onNextWallpaper: () => void;
  onPrevWallpaper: () => void;
  onUploadClick: () => void;
  onOpenSettingsToGallery: () => void;
}

export function PhotoStrip({
  wallpapers,
  activeWallpaperId,
  slideshowEnabled,
  slideshowIntervalSeconds,
  focusedId,
  onSelectWallpaper,
  onToggleSlideshow,
  onNextWallpaper,
  onPrevWallpaper,
  onUploadClick,
  onOpenSettingsToGallery,
}: PhotoStripProps) {
  const activeWallpaper = wallpapers.find((w) => w.id === activeWallpaperId) || wallpapers[0];

  return (
    <div className="w-full tv-glass rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Current Wallpaper Info & Controls */}
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          <button
            id="photo-prev"
            data-tv-nav="true"
            onClick={onPrevWallpaper}
            className={`p-2 rounded-xl tv-glass-interactive text-slate-300 hover:text-white hover:bg-white/10 transition-all focus:outline-none ${
              focusedId === 'photo-prev' ? 'tv-focused' : ''
            }`}
            title="Previous wallpaper (Left arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            id="photo-play-toggle"
            data-tv-nav="true"
            onClick={onToggleSlideshow}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all focus:outline-none ${
              slideshowEnabled
                ? 'bg-[var(--accent-color)] text-slate-950 font-semibold shadow-[0_0_15px_var(--accent-glow)]'
                : 'tv-glass-interactive text-slate-200 hover:bg-white/10'
            } ${focusedId === 'photo-play-toggle' ? 'tv-focused' : ''}`}
            title="Toggle automatic slideshow"
          >
            {slideshowEnabled ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Slideshow ({slideshowIntervalSeconds}s)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-[var(--accent-color)]" />
                <span>Play Slideshow</span>
              </>
            )}
          </button>

          <button
            id="photo-next"
            data-tv-nav="true"
            onClick={onNextWallpaper}
            className={`p-2 rounded-xl tv-glass-interactive text-slate-300 hover:text-white hover:bg-white/10 transition-all focus:outline-none ${
              focusedId === 'photo-next' ? 'tv-focused' : ''
            }`}
            title="Next wallpaper (Right arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Current Photo Title */}
        <div className="text-right md:text-left pl-2 hidden sm:block">
          <p className="text-xs font-semibold text-white truncate max-w-[160px] sm:max-w-[200px]">
            {activeWallpaper?.title || 'Family Photo'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {activeWallpaper?.isCustom ? 'Uploaded Family Photo' : 'Curated Wallpaper'}
          </p>
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1 scrollbar-none justify-start md:justify-end">
        {wallpapers.slice(0, 7).map((wp, idx) => {
          const isCurrent = wp.id === activeWallpaperId;
          const isFocused = focusedId === `photo-thumb-${wp.id}`;

          return (
            <button
              key={wp.id}
              id={`photo-thumb-${wp.id}`}
              data-tv-nav="true"
              onClick={() => onSelectWallpaper(wp.id)}
              className={`relative w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all duration-200 focus:outline-none ${
                isFocused
                  ? 'tv-focused scale-110 z-10'
                  : isCurrent
                  ? 'border-[var(--accent-color)] shadow-[0_0_12px_var(--accent-glow)]'
                  : 'border-white/15 opacity-60 hover:opacity-100 hover:border-white/40'
              }`}
              title={wp.title}
            >
              <img
                src={wp.thumbnailUrl || wp.url}
                alt={wp.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {wp.isCustom && (
                <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}

        {/* Upload Custom Photo Quick Button */}
        <button
          id="photo-upload-btn"
          data-tv-nav="true"
          onClick={onUploadClick}
          className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg tv-glass-interactive text-slate-300 hover:text-white hover:bg-white/15 transition-all shrink-0 focus:outline-none ${
            focusedId === 'photo-upload-btn' ? 'tv-focused' : ''
          }`}
          title="Upload new family photo"
        >
          <Upload className="w-4 h-4 text-[var(--accent-color)]" />
        </button>

        {/* View All / Manage Gallery Button */}
        <button
          id="photo-manage-btn"
          data-tv-nav="true"
          onClick={onOpenSettingsToGallery}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg tv-glass-interactive text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 shrink-0 transition-all focus:outline-none ${
            focusedId === 'photo-manage-btn' ? 'tv-focused' : ''
          }`}
          title="Manage family wallpaper library"
        >
          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Gallery</span>
        </button>
      </div>
    </div>
  );
}
