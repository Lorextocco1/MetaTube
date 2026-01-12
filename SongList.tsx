import React from 'react';
import { Song } from './types';
import { Play, Disc, BarChart2 } from 'lucide-react';

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  onSongSelect: (song: Song) => void;
  isPlaying: boolean;
}

const formatTime = (seconds: number) => {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SongList: React.FC<SongListProps> = ({ songs, currentSong, onSongSelect, isPlaying }) => {
  return (
    <div className="w-full pb-32 space-y-3">
      {songs.map((song, index) => {
        const isCurrent = currentSong?.id === song.id;
        
        return (
          <div 
            key={song.id}
            onClick={() => onSongSelect(song)}
            className={`group relative overflow-hidden flex items-center gap-6 p-4 rounded-2xl cursor-pointer transition-all duration-500 border ease-out
              ${isCurrent 
                ? 'bg-[var(--accent)] bg-opacity-20 border-[var(--accent)] border-opacity-40 shadow-glow scale-[1.02] translate-x-2 backdrop-blur-2xl' 
                : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] hover:-translate-y-1 hover:translate-x-2 hover:shadow-[0_0_25px_var(--accent-glow)] backdrop-blur-sm'
              }`}
          >
            {/* Index Number (Subtle) */}
            <span className={`w-8 text-center font-mono text-xs font-bold transition-colors ${isCurrent ? 'text-[var(--accent)]' : 'text-gray-500 group-hover:text-[var(--accent)]'}`}>
              {(index + 1).toString().padStart(2, '0')}
            </span>

            {/* Cover / Play Icon */}
            <div className={`relative w-14 h-14 shrink-0 rounded-xl overflow-hidden shadow-lg transition-transform duration-500 ${isCurrent ? 'rotate-0 scale-105' : 'group-hover:rotate-3 group-hover:scale-105'}`}>
              {song.coverUrl ? (
                <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                  <Disc size={20} className="text-gray-600" />
                </div>
              )}
              
              {/* Active/Hover Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300
                ${isCurrent ? 'bg-black/40 opacity-100' : 'bg-black/50 opacity-0 group-hover:opacity-100'}`}>
                {isCurrent && isPlaying ? (
                  <BarChart2 size={24} className="text-[var(--accent)] animate-pulse" />
                ) : (
                   <Play size={20} fill="currentColor" className="text-white drop-shadow-md" />
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex-1 min-w-0 flex flex-col justify-center z-10 transition-transform duration-300 group-hover:translate-x-1">
              <h3 className={`text-base font-bold truncate tracking-tight transition-colors ${isCurrent ? 'dark:text-white text-black' : 'dark:text-gray-200 text-gray-800 group-hover:dark:text-white group-hover:text-black'}`}>
                {song.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-semibold uppercase tracking-wider group-hover:text-[var(--accent)] transition-colors">{song.artist}</p>
            </div>

            {/* Duration */}
            <div className="text-xs font-mono text-gray-400 font-bold opacity-60 px-4 group-hover:opacity-100 transition-opacity">
              {formatTime(song.duration)}
            </div>

            {/* Glossy Reflection Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
};

export default SongList;