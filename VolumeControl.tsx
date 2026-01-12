import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, onVolumeChange }) => {
  const isMuted = volume === 0;

  return (
    <div className="flex items-center gap-2 group">
      <button 
        onClick={() => onVolumeChange(isMuted ? 0.5 : 0)}
        className="text-gray-400 hover:text-white transition-colors"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <div className="relative w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
            className="absolute top-0 left-0 h-full bg-indigo-500" 
            style={{ width: `${volume * 100}%` }}
        />
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default VolumeControl;