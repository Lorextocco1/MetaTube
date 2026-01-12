import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek }) => {
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (Number(e.target.value) / 100) * duration;
    onSeek(newTime);
  };

  return (
    <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-mono">
      <span className="w-10 text-right">{formatTime(currentTime)}</span>
      <div className="relative flex-1 h-1 bg-gray-700 rounded-full group cursor-pointer">
        {/* Background Track */}
        <div 
            className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" 
            style={{ width: `${progress}%` }}
        />
        {/* Thumb (hidden by default, visible on hover group) */}
        <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress || 0} 
            onChange={handleChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
            className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
      <span className="w-10">{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar;