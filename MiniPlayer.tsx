import React from 'react';
import { Song, PlayerState } from './types';
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from 'lucide-react';

interface MiniPlayerProps {
  song: Song;
  playerState: PlayerState;
  onPlayPause: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  onPrev: (e: React.MouseEvent) => void;
  onExpand: () => void;
  currentTime: number;
  duration: number;
  isExiting: boolean;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ 
  song, playerState, onPlayPause, onNext, onPrev, onExpand, currentTime, duration, isExiting 
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      onClick={onExpand}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-xl h-24 z-40 cursor-pointer group
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
      `}
    >
      {/* Glass Capsule - The naked container */}
      <div className="w-full h-full bg-[#050505]/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-glass flex items-center justify-between px-3 md:px-6 relative overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-glow hover:border-white/20">
        
        {/* Glowing Progress Background - Fixed Color Discrepancy */}
        <div 
          className="absolute bottom-0 left-0 h-[2px] bg-[var(--accent)] shadow-[0_0_15px_var(--accent)] transition-all duration-300 ease-linear z-20"
          style={{ width: `${progress}%` }}
        />

        {/* Content Container - Staggered Animation */}
        {/* We use a delay so the container slides in first, THEN contents appear */}
        
        {/* Art - Left most element */}
        <div className={`flex items-center gap-5 min-w-0 flex-1 pl-2 opacity-0 
            ${isExiting ? 'animate-stagger-exit' : 'animate-stagger-enter'}
            [animation-delay:300ms]
        `} style={{ animationFillMode: 'forwards' }}>
          <div className={`w-14 h-14 rounded-full overflow-hidden shadow-2xl border-2 border-white/10 shrink-0 ${playerState === PlayerState.PLAYING ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
            {song.coverUrl ? (
              <img src={song.coverUrl} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--accent)] opacity-20" />
            )}
          </div>
          
          {/* Info - Middle element */}
          <div className="min-w-0 flex flex-col">
            <p className="text-white font-black truncate text-base tracking-tight drop-shadow-md">{song.title}</p>
            {/* Fixed Artist Color Discrepancy */}
            <p className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest truncate opacity-90">{song.artist}</p>
          </div>
        </div>

        {/* Floating Controls - Right most element */}
        <div className={`flex items-center gap-4 pr-2 z-30 opacity-0
             ${isExiting ? 'animate-stagger-exit' : 'animate-stagger-enter'}
             [animation-delay:450ms]
        `} style={{ animationFillMode: 'forwards' }}>
          <button 
            onClick={onPrev}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_var(--accent-glow)]"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>

          <button 
            onClick={onPlayPause}
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 hover:-translate-y-1 hover:shadow-[0_0_30px_var(--accent-glow)] transition-all duration-300"
          >
            {playerState === PlayerState.PLAYING ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button 
            onClick={onNext}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_var(--accent-glow)]"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;