import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, Playlist, PlayerState, ThemeMode, ThemePalette } from './types';
import { selectDirectoryAndParse, loadSavedPlaylists, deletePlaylistFromDB, syncPlaylist } from './musicService';
import SongList from './SongList';
import MiniPlayer from './MiniPlayer';
import ExpandedPlayer from './ExpandedPlayer';
import ThemeSelector, { THEME_PALETTES } from './ThemeSelector';
import Sidebar from './Sidebar';
import { Plus, Disc, Music2, Palette, ChevronDown, MoreVertical, RefreshCw, Trash2, Folder, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  // State Initialization with Persistence
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.STOPPED);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Theme State with LocalStorage Persistence
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('themeMode') as ThemeMode) || 'dark';
  });
  
  const [currentPalette, setCurrentPalette] = useState<ThemePalette>(() => {
    const savedName = localStorage.getItem('paletteName');
    return THEME_PALETTES.find(p => p.name === savedName) || THEME_PALETTES[0];
  });

  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Sidebar & Filter State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; playlistId: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // MiniPlayer Animation State
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [isExitingMiniPlayer, setIsExitingMiniPlayer] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Persistence Effects ---

  // Load playlists on mount
  useEffect(() => {
    const init = async () => {
      const restored = await loadSavedPlaylists();
      setPlaylists(restored);
    };
    init();
  }, []);

  // Save theme changes
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('paletteName', currentPalette.name);

    const root = document.documentElement;
    const body = document.body;
    
    if (themeMode === 'dark') {
      root.classList.add('dark');
      body.style.setProperty('--bg-color', '#000000');
      body.style.setProperty('--text-color', '#ffffff');
    } else {
      root.classList.remove('dark');
      body.style.setProperty('--bg-color', '#e5e7eb');
      body.style.setProperty('--text-color', '#111827');
    }

    root.style.setProperty('--accent', currentPalette.primary);
    root.style.setProperty('--accent-glow', currentPalette.glow);
  }, [themeMode, currentPalette]);

  // Handle MiniPlayer Visibility Logic (Delayed Unmount for Animation)
  useEffect(() => {
    // Should show if there is a song and NOT expanded
    const shouldShow = !!currentSong && !isExpanded;

    if (shouldShow) {
        setShowMiniPlayer(true);
        setIsExitingMiniPlayer(false);
    } else {
        // If it was showing, trigger exit animation first
        if (showMiniPlayer) {
            setIsExitingMiniPlayer(true);
            const timer = setTimeout(() => {
                setShowMiniPlayer(false);
                setIsExitingMiniPlayer(false);
            }, 600); // Matches CSS animation duration + buffer
            return () => clearTimeout(timer);
        }
    }
  }, [currentSong, isExpanded]);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Reset artist filter when changing playlist
  useEffect(() => {
    setSelectedArtist(null);
  }, [activePlaylist]);


  // --- Computed Data ---

  const artists = useMemo(() => {
    if (!activePlaylist) return [];
    // Extract unique artists
    const allArtists = activePlaylist.songs.map(song => song.artist).filter(Boolean);
    const unique = Array.from(new Set(allArtists));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [activePlaylist]);

  const displayedSongs = useMemo(() => {
    if (!activePlaylist) return [];
    if (!selectedArtist) return activePlaylist.songs;
    return activePlaylist.songs.filter(song => song.artist === selectedArtist);
  }, [activePlaylist, selectedArtist]);


  // --- Audio Handling ---

  const playSong = useCallback(async (song: Song) => {
    if (!audioRef.current) return;
    
    try {
        const file = await song.fileHandle.getFile();
        const url = URL.createObjectURL(file);
        
        audioRef.current.src = url;
        setCurrentSong(song);
        setPlayerState(PlayerState.PLAYING);
        await audioRef.current.play();
    } catch (e) {
        console.error("Playback failed", e);
        // If playback fails, it might be permission issue. 
        // In a real app we'd prompt user to resync/grant permission.
        alert("Impossibile riprodurre. Prova ad aggiornare la playlist col tasto destro.");
    }
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (playerState === PlayerState.PLAYING) {
      audioRef.current.pause();
      setPlayerState(PlayerState.PAUSED);
    } else {
      audioRef.current.play();
      setPlayerState(PlayerState.PLAYING);
    }
  };

  const playNext = () => {
    if (!currentSong || !activePlaylist) return;
    // Use displayedSongs to navigate within the current filter context (optional)
    // Or use activePlaylist.songs to always navigate the full list. 
    // Standard player behavior usually respects the current view (displayedSongs).
    const currentList = displayedSongs.length > 0 ? displayedSongs : activePlaylist.songs;
    
    const idx = currentList.findIndex(s => s.id === currentSong.id);
    if (idx !== -1 && idx < currentList.length - 1) {
      playSong(currentList[idx + 1]);
    }
  };

  const playPrev = () => {
    if (!currentSong || !activePlaylist) return;
    const currentList = displayedSongs.length > 0 ? displayedSongs : activePlaylist.songs;

    const idx = currentList.findIndex(s => s.id === currentSong.id);
    if (idx > 0) {
      playSong(currentList[idx - 1]);
    }
  };

  const onSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  // --- Playlist Logic ---

  const handleAddPlaylist = async () => {
    const newPlaylist = await selectDirectoryAndParse();
    if (newPlaylist) {
      // Check if already exists to avoid duplicates
      const exists = playlists.find(p => p.path === newPlaylist.path);
      if (!exists) {
          setPlaylists(prev => [...prev, newPlaylist]);
      }
      setActivePlaylist(newPlaylist);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, playlistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, playlistId });
  };

  const handleSyncPlaylist = async (playlistId: string) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;

    setIsSyncing(true);
    const updated = await syncPlaylist(pl);
    setIsSyncing(false);

    if (updated) {
        setPlaylists(prev => prev.map(p => p.id === playlistId ? updated : p));
        if (activePlaylist?.id === playlistId) {
            setActivePlaylist(updated);
        }
    } else {
        alert("Impossibile sincronizzare. Assicurati che la cartella esista e dai i permessi.");
    }
  };

  const handleRemovePlaylist = async (playlistId: string) => {
    await deletePlaylistFromDB(playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (activePlaylist?.id === playlistId) {
        setActivePlaylist(null);
        setPlayerState(PlayerState.STOPPED);
        setCurrentSong(null);
    }
  };

  const handleSelectPlaylist = async (playlist: Playlist) => {
      // If songs are empty (maybe permission lost on reload), try strict sync immediately
      if (playlist.songs.length === 0) {
          const synced = await syncPlaylist(playlist);
          if (synced) {
              setPlaylists(prev => prev.map(p => p.id === playlist.id ? synced : p));
              setActivePlaylist(synced);
              return;
          }
      }
      setActivePlaylist(playlist);
  };

  // --- Render ---

  return (
    <div className={`relative w-full h-screen overflow-hidden font-sans selection:bg-[var(--accent)] selection:text-white
       ${themeMode === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}
    `}>
      
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] opacity-40 z-0 pointer-events-none transition-all duration-1000"
        style={{ 
           backgroundImage: `radial-gradient(circle at center, ${currentPalette.glow} 0%, transparent 70%)` 
        }}
      />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent)] opacity-20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent)] opacity-20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        artists={artists}
        selectedArtist={selectedArtist}
        onSelectArtist={setSelectedArtist}
        themeMode={themeMode}
        currentPalette={currentPalette}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-32 flex flex-col items-center justify-center z-20 pointer-events-none pt-6 px-8 gap-2">
         
         {/* Left: Menu Button (Visible only when playlist is active) */}
         {activePlaylist && (
            <div className="absolute left-8 top-1/2 -translate-y-1/2 pointer-events-auto">
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className={`p-3 rounded-full backdrop-blur-md border shadow-glass transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-[0_0_15px_var(--accent-glow)]
                    ${themeMode === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white/40 border-black/5 hover:bg-white/60 text-black shadow-glass-light'}
                 `}
               >
                 <Menu size={20} />
               </button>
            </div>
         )}

         {/* Center: Logo */}
         <div 
            onClick={() => { setActivePlaylist(null); setSelectedArtist(null); }} // Go Home & Reset
            className={`pointer-events-auto cursor-pointer flex items-center gap-4 px-8 py-3 rounded-full backdrop-blur-md border shadow-glass transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_30px_var(--accent-glow)]
            ${themeMode === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-black/5 hover:bg-white/60 shadow-glass-light'}
         `}>
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${playerState === PlayerState.PLAYING ? 'animate-spin-slow' : ''}`}
                 style={{ background: `linear-gradient(to top right, ${currentPalette.primary}, #000)` }}>
               <Disc className="text-white" size={24} />
               <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r"
                style={{ backgroundImage: `linear-gradient(to right, ${themeMode === 'dark' ? '#fff' : '#000'}, ${currentPalette.primary})` }}>
              MetaTube
            </h1>
         </div>

         {/* Center Bottom: Theme Toggle */}
         <div className="relative pointer-events-auto z-50 flex flex-col items-center">
             <button 
               onClick={() => setIsThemeOpen(!isThemeOpen)}
               className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_15px_var(--accent-glow)]
                 ${themeMode === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/50 hover:text-black'}
               `}
             >
               <Palette size={12} />
               <span>Tema</span>
               <ChevronDown size={12} className={`transition-transform duration-300 ${isThemeOpen ? 'rotate-180' : ''}`} />
             </button>

             <ThemeSelector 
                isOpen={isThemeOpen}
                currentPalette={currentPalette}
                currentMode={themeMode}
                onPaletteChange={setCurrentPalette}
                onModeChange={setThemeMode}
             />
         </div>
      </header>

      {/* Main View - Wrapped for Animation */}
      <main className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar pt-40 px-4 md:px-20 pb-40">
        
        {/* We use a key to trigger re-animation on view switch */}
        <div 
            key={activePlaylist ? `playlist-${activePlaylist.id}` : 'home-library'} 
            className="animate-pop-in origin-center"
        >
            {activePlaylist ? (
            /* SINGLE PLAYLIST VIEW */
            <div className="max-w-5xl mx-auto">
                <div className={`mb-12 p-10 rounded-[3rem] backdrop-blur-xl border shadow-glass flex flex-col md:flex-row items-end gap-8 relative overflow-hidden transition-colors duration-500
                    ${themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40 shadow-xl'}
                `}
                onContextMenu={(e) => handleContextMenu(e, activePlaylist.id)}
                >
                <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-30" style={{ backgroundColor: currentPalette.primary }} />
                
                <div className={`w-40 h-40 rounded-[2rem] shadow-2xl flex items-center justify-center shrink-0 border border-white/20 bg-gradient-to-br ${currentPalette.gradient}`}>
                    <Music2 size={64} className="text-white drop-shadow-lg" />
                </div>
                
                <div className="flex-1 z-10">
                    <h2 className={`text-5xl md:text-7xl font-black tracking-tighter mb-4 drop-shadow-sm ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {activePlaylist.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className={`px-4 py-1 rounded-full border text-xs font-bold uppercase tracking-widest backdrop-blur-sm
                            ${themeMode === 'dark' ? 'bg-black/40 border-white/10 text-white/70' : 'bg-white/50 border-black/5 text-black/70'}
                        `}>
                        Locale
                        </span>
                        <span className="text-xs font-black uppercase tracking-[0.4em] opacity-50">
                        {activePlaylist.songs.length} Tracce
                        </span>
                        
                        {/* Filter Indicator */}
                        {selectedArtist && (
                            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[var(--accent)] text-white shadow-glow">
                                <span className="text-xs font-bold uppercase tracking-widest">Filtro: {selectedArtist}</span>
                                <button onClick={() => setSelectedArtist(null)} className="hover:bg-white/20 rounded-full p-0.5"><X size={12} /></button>
                            </div>
                        )}
                    </div>
                </div>
                </div>

                <SongList 
                songs={displayedSongs}
                currentSong={currentSong}
                onSongSelect={playSong}
                isPlaying={playerState === PlayerState.PLAYING}
                />
                
                {displayedSongs.length === 0 && (
                    <div className="text-center py-20 opacity-40 uppercase tracking-widest font-bold">
                        Nessun brano trovato per questo artista
                    </div>
                )}
            </div>
            ) : (
            /* LIBRARY / COLLECTION VIEW */
            <div className="max-w-7xl mx-auto">
                
                {/* Header Title */}
                <div className="flex items-end justify-between mb-12 px-4">
                    <div>
                        <h2 className={`text-6xl font-black tracking-tighter mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            La tua Libreria
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-40">
                            {playlists.length} Raccolte salvate nel database
                        </p>
                    </div>
                    <button 
                        onClick={handleAddPlaylist}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-glass duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_30px_var(--accent-glow)] backdrop-blur-2xl border
                        ${themeMode === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30' : 'bg-white/40 border-black/5 text-black hover:bg-white/60'}`}
                    >
                        <Plus size={16} /> Aggiungi
                    </button>
                </div>

                {/* Grid */}
                {playlists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {playlists.map((playlist) => (
                            <div 
                                key={playlist.id}
                                onClick={() => handleSelectPlaylist(playlist)}
                                onContextMenu={(e) => handleContextMenu(e, playlist.id)}
                                className={`group relative p-8 rounded-[2.5rem] border backdrop-blur-md cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_0_30px_var(--accent-glow)] flex flex-col justify-between h-64
                                    ${themeMode === 'dark' 
                                        ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20' 
                                        : 'bg-white/60 border-white/40 hover:bg-white/80 shadow-lg'}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${currentPalette.gradient}`}>
                                        <Folder size={28} className="text-white" />
                                    </div>
                                    <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical size={20} className="opacity-50" />
                                    </button>
                                </div>
                                
                                <div>
                                    <h3 className={`text-2xl font-bold truncate mb-1 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {playlist.name}
                                    </h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                        {playlist.songs.length} Canzoni
                                    </p>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 rounded-[2.5rem] ring-2 ring-transparent group-hover:ring-[var(--accent)]/30 transition-all pointer-events-none" />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center mt-10">
                        <div className="relative mb-8 group cursor-pointer" onClick={handleAddPlaylist}>
                            <div className="absolute inset-0 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{ backgroundColor: currentPalette.primary }} />
                            <div className={`w-32 h-32 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-glass group-hover:scale-110 hover:shadow-[0_0_40px_var(--accent-glow)] transition-all duration-500
                                ${themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'}
                            `}>
                            <Plus size={64} className={`transition-colors ${themeMode === 'dark' ? 'text-white/50 group-hover:text-white' : 'text-black/50 group-hover:text-black'}`} />
                            </div>
                        </div>
                        <h2 className={`text-4xl font-black tracking-tight mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Nessuna Playlist
                        </h2>
                        <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-40">
                        Il vuoto cosmico attende la tua musica
                        </p>
                    </div>
                )}
            </div>
            )}
        </div>
      </main>

      {/* Custom Context Menu */}
      {contextMenu && (
        <div 
            className={`absolute z-[100] w-48 rounded-2xl border backdrop-blur-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.1s_ease-out]
                ${themeMode === 'dark' ? 'bg-black/90 border-white/10' : 'bg-white/90 border-black/5'}
            `}
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <div className="p-1">
                <button 
                    onClick={() => handleSyncPlaylist(contextMenu.playlistId)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_10px_var(--accent-glow)]
                        ${themeMode === 'dark' ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}
                    `}
                >
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /> Aggiorna
                </button>
                <div className={`h-[1px] my-1 mx-2 ${themeMode === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />
                <button 
                    onClick={() => handleRemovePlaylist(contextMenu.playlistId)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-red-500 hover:bg-red-500/10 hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(239,68,68,0.4)] transition-all duration-200"
                >
                    <Trash2 size={16} /> Rimuovi
                </button>
            </div>
        </div>
      )}

      {/* Mini Player */}
      {showMiniPlayer && currentSong && (
        <MiniPlayer 
          song={currentSong}
          playerState={playerState}
          onPlayPause={(e) => { e.stopPropagation(); togglePlayPause(); }}
          onNext={(e) => { e.stopPropagation(); playNext(); }}
          onPrev={(e) => { e.stopPropagation(); playPrev(); }}
          onExpand={() => setIsExpanded(true)}
          currentTime={currentTime}
          duration={duration}
          isExiting={isExitingMiniPlayer}
        />
      )}

      {/* Expanded Player */}
      {currentSong && isExpanded && (
        <ExpandedPlayer 
          song={currentSong}
          playerState={playerState}
          onPlayPause={togglePlayPause}
          onNext={playNext}
          onPrev={playPrev}
          onCollapse={() => setIsExpanded(false)}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      )}
    </div>
  );
};

export default App;