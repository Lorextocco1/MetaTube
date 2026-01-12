import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';
import { PlayerState } from './types';

interface PlayerControlsProps {
  state: PlayerState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ state, onPlayPause, onNext, onPrev }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-white transition-colors" title="Shuffle (Demo)">
          <Shuffle size={18} />
        </button>
        
        <button onClick={onPrev} className="text-gray-200 hover:text-white transition-colors hover:scale-110">
          <SkipBack size={24} fill="currentColor" />
        </button>

        <button 
            onClick={onPlayPause}
            className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20"
        >
          {state === PlayerState.PLAYING ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" className="ml-1" />
          )}
        </button>

        <button onClick={onNext} className="text-gray-200 hover:text-white transition-colors hover:scale-110">
            <SkipForward size={24} fill="currentColor" />
        </button>

        <button className="text-gray-400 hover:text-white transition-colors" title="Repeat (Demo)">
          <Repeat size={18} />
        </button>
      </div>
    </div>
  );
};

export default PlayerControls;