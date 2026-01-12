import React, { useState, useMemo } from 'react';
import { ThemeMode, ThemePalette } from './types';
import { X, Users, Disc, Mic2, Search } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  artists: string[];
  selectedArtist: string | null;
  onSelectArtist: (artist: string | null) => void;
  themeMode: ThemeMode;
  currentPalette: ThemePalette;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  artists,
  selectedArtist,
  onSelectArtist,
  themeMode,
  currentPalette
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter artists based on search term
  const filteredArtists = useMemo(() => {
    if (!searchTerm) return artists;
    return artists.filter(artist => 
      artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [artists, searchTerm]);

  return (
    <>
      {/* Backdrop (Darken background when open) */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-500
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Sidebar Panel - Floating Glass Brick */}
      <div 
        className={`fixed top-4 bottom-4 left-4 w-[90%] md:w-96 z-[70] transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) flex flex-col border shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden
          ${isOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-[120%] opacity-0 scale-95'}
          ${themeMode === 'dark' ? 'bg-black/60 border-white/10' : 'bg-white/60 border-white/40'}
        `}
        style={{ backdropFilter: 'blur(40px) saturate(150%)' }}
      >
        {/* Header with Search */}
        <div className="p-6 flex flex-col gap-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-black tracking-tighter ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Artisti
            </h2>
            <button 
                onClick={onClose}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_var(--accent-glow)]
                    ${themeMode === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}
                `}
            >
                <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
             ${themeMode === 'dark' ? 'bg-white/5 border-white/5 focus-within:bg-white/10 focus-within:border-white/20' : 'bg-black/5 border-black/5 focus-within:bg-black/10 focus-within:border-black/20'}
          `}>
             <Search size={16} className="opacity-50" />
             <input 
                type="text" 
                placeholder="Cerca artista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-bold placeholder:font-medium placeholder:opacity-40"
             />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          
          {/* "All Songs" Option */}
          <button
            onClick={() => {
              onSelectArtist(null);
              onClose();
            }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_0_20px_var(--accent-glow)]
              ${selectedArtist === null 
                ? 'bg-[var(--accent)] text-white shadow-glow' 
                : themeMode === 'dark' ? 'hover:bg-white/10 text-gray-400 hover:text-white border border-transparent hover:border-white/10' : 'hover:bg-black/5 text-gray-500 hover:text-black border border-transparent hover:border-black/5'}
            `}
          >
            <div className={`p-2 rounded-lg transition-colors ${selectedArtist === null ? 'bg-white/20' : 'bg-white/5 group-hover:bg-[var(--accent)]/20'}`}>
               <Disc size={18} />
            </div>
            <span className="font-bold text-sm tracking-wide uppercase">Tutti i brani</span>
          </button>

          <div className={`h-[1px] my-4 mx-2 ${themeMode === 'dark' ? 'bg-white/10' : 'bg-black/5'}`} />

          {/* Artists List */}
          {filteredArtists.length > 0 ? (
            filteredArtists.map((artist) => (
              <button
                key={artist}
                onClick={() => {
                  onSelectArtist(artist);
                  onClose();
                }}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 text-left hover:scale-[1.02] hover:-translate-y-0.5
                  ${selectedArtist === artist 
                    ? 'bg-white/10 border border-[var(--accent)] text-[var(--accent)] font-bold shadow-[0_0_15px_var(--accent-glow)]' 
                    : themeMode === 'dark' ? 'text-gray-300 hover:bg-white/5 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'text-gray-700 hover:bg-black/5 hover:text-black'}
                `}
              >
                <div className={`p-2 rounded-full shrink-0 transition-colors ${selectedArtist === artist ? 'text-[var(--accent)]' : 'opacity-50 group-hover:text-[var(--accent)]'}`}>
                   <Mic2 size={16} />
                </div>
                <span className="truncate text-sm font-medium">{artist}</span>
              </button>
            ))
          ) : (
            <div className="p-8 text-center opacity-40 text-xs uppercase tracking-widest">
              Nessun artista trovato
            </div>
          )}
        </div>
        
        {/* Footer decoration */}
        <div className="p-6 border-t border-white/5">
           <div className="flex items-center justify-center gap-2 opacity-30">
              <Users size={12} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Indice Libreria</span>
           </div>
        </div>

      </div>
    </>
  );
};

export default Sidebar;