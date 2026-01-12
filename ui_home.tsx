import React from 'react';
import { Channel, Playlist, Video } from './types';

interface ViewProps {
  onNavigate: (view: string, payload: any) => void;
  channels?: Channel[];
  activeChannel?: Channel | null;
  activePlaylist?: Playlist | null;
  onRemoveChannel?: (id: string) => void;
}

const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

const AbstractIcon = ({ name, size = "w-14 h-14", watched = false }: { name: string, size?: string, watched?: boolean }) => (
  <div className={`${size} rounded-[28px] flex items-center justify-center font-black text-sm tracking-tighter transition-all duration-700 border border-white/10
    ${watched ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-gradient-to-br from-[var(--accent)] to-black text-white shadow-2xl'}`}>
    {watched ? (
      <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
    ) : getInitials(name)}
  </div>
);

export const ExplorerView: React.FC<ViewProps> = ({ onNavigate, channels, onRemoveChannel }) => (
  <div className="p-20 max-w-6xl mx-auto">
    <div className="mb-24">
      <h1 className="text-7xl font-black tracking-tighter mb-6 drop-shadow-2xl">Libreria</h1>
      <p className="text-[12px] font-black uppercase tracking-[0.6em] opacity-30">Sorgenti locali sincronizzate</p>
    </div>
    
    <div className="grid grid-cols-1 gap-8">
      {channels?.map(ch => (
        <div 
          key={ch.id} 
          onClick={() => onNavigate('CHANNEL_DETAIL', { activeChannel: ch })}
          onContextMenu={(e) => { e.preventDefault(); onRemoveChannel?.(ch.id); }}
          className="group magnificent-card p-10 rounded-[48px] flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-10">
            <AbstractIcon name={ch.displayName} size="w-24 h-24" />
            <div>
              <h3 className="text-3xl font-black group-hover:accent-text transition-colors drop-shadow-lg">{ch.displayName}</h3>
              <p className="text-[11px] opacity-30 font-black uppercase tracking-[0.4em] mt-3">{ch.handle} • {ch.playlists.length} PERCORSI</p>
            </div>
          </div>
          <div className="p-5 bg-white/5 rounded-full group-hover:accent-bg group-hover:text-white transition-all shadow-2xl border border-white/5">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      ))}
      
      {channels?.length === 0 && (
        <div className="py-32 text-center opacity-10 border-[5px] border-dashed border-white/10 rounded-[80px]">
          <p className="text-sm font-black uppercase tracking-[0.8em]">Trascina una cartella per mappare</p>
        </div>
      )}
    </div>
  </div>
);

export const ChannelView: React.FC<ViewProps> = ({ onNavigate, activeChannel: ch }) => {
  if (!ch) return null;
  return (
    <div className="p-20 max-w-6xl mx-auto">
      <div className="mb-24 flex items-end gap-16">
        <AbstractIcon name={ch.displayName} size="w-48 h-48" />
        <div className="pb-8">
          <h1 className="text-8xl font-black tracking-tighter leading-none mb-8 drop-shadow-2xl">{ch.displayName}</h1>
          <p className="text-[12px] font-black uppercase tracking-[0.7em] opacity-30">{ch.playlists.length} RACCOLTE INDIVIDUATE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {ch.playlists.map(p => {
          const videos = p.videos || [];
          const isFinished = videos.length > 0 && videos.every(v => v.isWatched);
          const watchedCount = videos.filter(v => v.isWatched).length;
          
          return (
            <div 
              key={p.id} 
              onClick={() => onNavigate('PLAYLIST_DETAIL', { activePlaylist: p })}
              className={`group magnificent-card p-12 rounded-[56px] flex items-center justify-between cursor-pointer
                ${isFinished ? 'opacity-40 grayscale-[0.5]' : ''}`}
            >
              <div className="flex items-center gap-12">
                <div className="w-2.5 h-20 rounded-full accent-bg opacity-10 group-hover:opacity-100 group-hover:shadow-[0_0_20px_var(--accent)] transition-all" />
                <div>
                  <h3 className="text-4xl font-black group-hover:accent-text transition-colors drop-shadow-lg">{p.name}</h3>
                  <div className="flex items-center gap-8 mt-5 text-[12px] font-black uppercase tracking-[0.3em] opacity-30">
                    <span className="flex items-center gap-2">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                       {p.videoCount || 0} VIDEO
                    </span>
                    <span className={`px-4 py-1.5 rounded-full ${watchedCount > 0 ? 'bg-[var(--accent)]/10 accent-text' : 'bg-white/5'}`}>
                      {watchedCount} COMPLETATI
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black opacity-20 uppercase mb-3 tracking-widest">VOLUME</p>
                <p className="text-2xl font-black opacity-70 tracking-tighter font-mono">{p.totalSize || '0 MB'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PlaylistView: React.FC<ViewProps> = ({ onNavigate, activePlaylist: p }) => {
  if (!p) return null;
  return (
    <div className="p-20 max-w-6xl mx-auto">
      <div className="mb-24 flex justify-between items-end border-b border-white/5 pb-16">
        <div>
          <h1 className="text-8xl font-black tracking-tighter leading-none mb-8 drop-shadow-2xl">{p.name}</h1>
          <p className="text-[12px] font-black uppercase tracking-[0.6em] opacity-30">SEQUENZA GEOMETRICA • {p.videoCount || 0} TRACKS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {(p.videos || []).map((v, i) => {
          const progress = v.currentTime && v.duration ? (v.currentTime / parseFloat(v.duration)) * 100 : 0;
          
          return (
            <div 
              key={v.id} 
              onClick={() => onNavigate('PLAYER', { activeVideo: v })}
              className={`group magnificent-card flex items-center gap-10 p-8 rounded-[40px] cursor-pointer
                ${v.isWatched ? 'opacity-40 grayscale' : ''}`}
            >
              <div className="w-16 text-center text-lg font-black opacity-10 group-hover:opacity-100 group-hover:accent-text transition-all font-mono">
                {(i + 1).toString().padStart(2, '0')}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-2xl font-black group-hover:accent-text transition-colors line-clamp-1 drop-shadow-sm">{v.title}</h4>
                  <div className="flex items-center gap-6">
                    {v.currentTime && v.currentTime > 0 && (
                      <span className="text-[10px] font-black bg-[var(--accent)]/10 accent-text px-4 py-1.5 rounded-full shadow-lg border border-[var(--accent)]/10">RESUME @ {Math.floor(v.currentTime / 60)}m</span>
                    )}
                    <span className="text-[11px] font-mono opacity-20 tracking-widest">{v.size}</span>
                  </div>
                </div>
                
                <div className="h-2.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${v.isWatched ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'accent-bg shadow-[0_0_20px_var(--accent)]'}`} 
                    style={{ width: `${v.isWatched ? 100 : progress || 0}%` }} 
                  />
                </div>
              </div>

              {v.isWatched && (
                <div className="w-16 h-16 flex items-center justify-center text-green-500 bg-green-500/10 rounded-full shadow-2xl border border-green-500/20">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};