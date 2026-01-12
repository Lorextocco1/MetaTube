import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';
import { Song, Playlist } from './types';

// Polyfill Buffer for the browser environment used by music-metadata
window.Buffer = window.Buffer || Buffer;

// --- INDEXED DB CONFIGURATION ---
const DB_NAME = 'NebulaMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'directories';

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Helper to save directory handle
const saveDirectoryToDB = async (playlist: Playlist, handle: FileSystemDirectoryHandle) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.put({
    id: playlist.id,
    name: playlist.name,
    handle: handle, // Storing the handle allows re-access (subject to browser permissions)
    createdAt: new Date().toISOString()
  });
};

// Helper to delete directory handle
export const deletePlaylistFromDB = async (id: string) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
};

// Helper to get all saved handles
const getAllSavedDirectories = async (): Promise<any[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- CORE PARSING LOGIC ---

const parseFile = async (fileHandle: FileSystemFileHandle): Promise<Song | null> => {
  try {
    const file = await fileHandle.getFile();
    // Only process audio files
    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3') && !file.name.endsWith('.flac') && !file.name.endsWith('.wav')) return null;

    let metadata;
    try {
        metadata = await mm.parseBlob(file);
    } catch (e) {
        console.warn("Metadata parsing failed for", file.name, e);
        // Fallback for files with corrupt metadata
        metadata = { common: {}, format: { duration: 0 } };
    }
    
    const { common, format } = metadata;

    let coverUrl = '';
    if (common.picture && common.picture.length > 0) {
      const picture = common.picture[0];
      const blob = new Blob([picture.data], { type: picture.format });
      coverUrl = URL.createObjectURL(blob);
    }

    return {
      id: file.name + '-' + file.lastModified,
      title: common.title || file.name.replace(/\.[^/.]+$/, ""),
      artist: common.artist || 'Sconosciuto',
      album: common.album || 'Album Sconosciuto',
      coverUrl: coverUrl,
      fileHandle: fileHandle,
      duration: format.duration || 0
    };
  } catch (err) {
    console.error("Error parsing file:", fileHandle.name, err);
    return null;
  }
};

const scanDirectoryHandle = async (dirHandle: FileSystemDirectoryHandle): Promise<Song[]> => {
    const songs: Song[] = [];
    // @ts-ignore
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const song = await parseFile(entry as FileSystemFileHandle);
        if (song) {
          songs.push(song);
        }
      }
    }
    // Sort by name
    songs.sort((a, b) => a.title.localeCompare(b.title));
    return songs;
}

// --- PUBLIC EXPORTS ---

export const selectDirectoryAndParse = async (): Promise<Playlist | null> => {
  try {
    // @ts-ignore
    const dirHandle = await window.showDirectoryPicker();
    const songs = await scanDirectoryHandle(dirHandle);

    if (songs.length === 0) return null;

    const newPlaylist: Playlist = {
      id: dirHandle.name + '-' + Date.now(),
      name: dirHandle.name,
      path: dirHandle.name,
      songs: songs
    };

    // Save for persistence
    await saveDirectoryToDB(newPlaylist, dirHandle);

    return newPlaylist;

  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error("Directory selection failed:", error);
    }
    return null;
  }
};

// Called on App init to restore playlists
export const loadSavedPlaylists = async (): Promise<Playlist[]> => {
    const savedDirs = await getAllSavedDirectories();
    const playlists: Playlist[] = [];

    for (const saved of savedDirs) {
        try {
            // Verify permission - currently we just try to use it.
            // On hard reload, the browser might block this without user gesture, 
            // but for PWA/Electron it persists better.
            const handle = saved.handle as FileSystemDirectoryHandle;
            
            // We verify permission query first
            // @ts-ignore
            const permission = await handle.queryPermission({ mode: 'read' });
            
            if (permission === 'granted') {
                const songs = await scanDirectoryHandle(handle);
                playlists.push({
                    id: saved.id,
                    name: saved.name,
                    path: saved.name,
                    songs: songs
                });
            } else {
                // If permission is lost (prompt), we still return the playlist shell
                // so the user can click it and re-trigger permission prompt
                playlists.push({
                    id: saved.id,
                    name: saved.name,
                    path: saved.name,
                    songs: [] // Empty initially, needs resync
                });
            }
        } catch (e) {
            console.error("Failed to restore playlist", saved.name, e);
        }
    }
    return playlists;
};

export const syncPlaylist = async (playlist: Playlist): Promise<Playlist | null> => {
    try {
        const savedDirs = await getAllSavedDirectories();
        const saved = savedDirs.find(d => d.id === playlist.id);
        
        if (!saved) return null;

        const handle = saved.handle as FileSystemDirectoryHandle;
        
        // Request permission if needed (must be triggered by user action in UI)
        // @ts-ignore
        const permission = await handle.requestPermission({ mode: 'read' });
        
        if (permission === 'granted') {
            const songs = await scanDirectoryHandle(handle);
            return {
                ...playlist,
                songs: songs
            };
        }
        return null;
    } catch (e) {
        console.error("Sync failed", e);
        return null;
    }
};