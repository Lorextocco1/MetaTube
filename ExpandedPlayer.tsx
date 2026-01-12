import React, { useEffect, useState } from 'react';
import { Song, PlayerState } from './types';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Repeat, Shuffle } from 'lucide-react';

interface ExpandedPlayerProps {
  song: Song;
  playerState: PlayerState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onCollapse: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ExpandedPlayer: React.FC<ExpandedPlayerProps> = ({
  song, playerState, onPlayPause, onNext, onPrev, onCollapse, currentTime, duration, onSeek
}) => {
  const [finishTime, setFinishTime] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (duration && currentTime) {
      const remainingSeconds = duration - currentTime;
      const now = new Date();
      now.setSeconds(now.getSeconds() + remainingSeconds);
      setFinishTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [currentTime, duration]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to finish before calling parent onCollapse
    setTimeout(() => {
      onCollapse();
    }, 400); // Matches animation duration
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-400 ${isClosing ? 'opacity-0' : 'animate-[fadeIn_0.3s_ease-out]'}`}>
      
      {/* Immersive Background - Heavy Blur of Album Art (Full Screen) */}
      <div className="absolute inset-0 bg-black z-0" />
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-40 blur-[100px] scale-125 transition-all duration-1000 animate-pulse-slow"
        style={{ backgroundImage: song.coverUrl ? `url(${song.coverUrl})` : undefined }}
      />
      <div className="absolute inset-0 bg-black/40 z-0 backdrop-blur-md" />

      {/* Main Glass Card Container */}
      <div className={`relative z-10 w-full h-full md:w-[480px] md:h-[85vh] bg-black/30 md:bg-white/5 backdrop-blur-3xl md:border md:border-white/10 md:shadow-glass flex flex-col p-8 overflow-hidden origin-bottom
          ${isClosing ? 'animate-collapse-player' : 'animate-expand-player'}
      `}>
        
        {/* Card TINT Layer - Paints the card itself with the cover colors */}
        <div 
            className="absolute inset-0 z-[-1] opacity-30 transition-all duration-1000 pointer-events-none"
            style={{ 
                backgroundImage: song.coverUrl ? `url(${song.coverUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(50px) saturate(200%)',
            }}
        />

        {/* Collapse Button */}
        <div className="flex justify-between items-center mb-8">
            <button 
            onClick={handleClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all duration-300 backdrop-blur-md border border-white/5 hover:shadow-[0_0_15px_var(--accent-glow)] hover:-translate-y-0.5"
            >
            <ChevronDown size={24} />
            </button>
            <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] animate-fade-in [animation-delay:200ms] opacity-0" style={{ animationFillMode: 'forwards' }}>In Riproduzione</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Album Art - Floating Glass Block - Enters from Left */}
        <div className="relative w-full aspect-square mb-12 group perspective-1000 animate-slide-in-left [animation-delay:100ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
             {/* Glow behind art updated to accent */}
             <div className="absolute inset-0 bg-[var(--accent)] opacity-30 blur-[60px] rounded-full animate-pulse-slow" />
             <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-gray-900 group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                {song.coverUrl ? (
                    <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900" />
                )}
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
             </div>
        </div>

        {/* Info - Zoom In / Fade Up */}
        <div className="flex flex-col items-start mb-8 animate-zoom-in [animation-delay:300ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-md">{song.title}</h2>
            <p className="text-lg text-white/60 font-medium tracking-wide">{song.artist}</p>
        </div>

        {/* Progress - Slide from Right */}
        <div className="mb-10 group animate-slide-in-right [animation-delay:400ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="relative h-1.5 bg-white/10 rounded-full w-full overflow-hidden">
             <div 
               className="absolute top-0 left-0 h-full bg-[var(--accent)] shadow-[0_0_20px_var(--accent)] rounded-full"
               style={{ width: `${(currentTime / duration) * 100}%` }}
             />
          </div>
          {/* Seek Handle Container - easier to grab */}
          <div className="relative h-4 -mt-2.5 w-full">
            <input 
               type="range"
               min="0"
               max={duration || 0}
               value={currentTime}
               onChange={handleSeekChange}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
          </div>
          <div className="flex justify-between text-xs font-bold font-mono text-white/40 mt-2">
             <span>{formatTime(currentTime)}</span>
             <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls - Slide from Right (Staggered) */}
        <div className="flex items-center justify-between mt-auto mb-4 animate-slide-in-right [animation-delay:500ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
            <button className="text-white/40 hover:text-white transition-all duration-300 hover:shadow-[0_0_10px_var(--accent-glow)] rounded-full p-2 hover:-translate-y-0.5">
                <Shuffle size={20} />
            </button>

            <div className="flex items-center gap-6">
                <button onClick={onPrev} className="p-4 text-white/70 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_var(--accent-glow)] rounded-full">
                    <SkipBack size={28} fill="currentColor" />
                </button>
                
                <button 
                    onClick={onPlayPause}
                    className="w-20 h-20 bg-white text-black rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_60px_var(--accent-glow)] transition-all duration-300 border-4 border-white/10 bg-clip-padding backdrop-filter backdrop-blur-sm"
                >
                    {playerState === PlayerState.PLAYING ? (
                    <Pause size={32} fill="currentColor" />
                    ) : (
                    <Play size={32} fill="currentColor" className="ml-1" />
                    )}
                </button>

                <button onClick={onNext} className="p-4 text-white/70 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_var(--accent-glow)] rounded-full">
                    <SkipForward size={28} fill="currentColor" />
                </button>
            </div>

            <button className="text-white/40 hover:text-white transition-all duration-300 hover:shadow-[0_0_10px_var(--accent-glow)] rounded-full p-2 hover:-translate-y-0.5">
                <Repeat size={20} />
            </button>
        </div>
        
        <div className="w-full text-center mt-4 animate-fade-in [animation-delay:700ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
               Fine riproduzione: {finishTime}
             </p>
        </div>

      </div>
    </div>
  );
};

export default ExpandedPlayer;