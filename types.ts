
export interface GeneratedSongData {
  title: string;
  artist: string;
  album: string;
  vibeDescription: string;
}

export interface Video {
  id: string;
  title: string;
  duration?: string;
  currentTime?: number;
  isWatched?: boolean;
  size?: string;
}

export interface Song {
  id: string; // Usually the file path or a UUID
  title: string;
  artist: string;
  album: string;
  coverUrl: string; // Blob URL or base64
  fileHandle: FileSystemFileHandle;
  duration: number; // in seconds
}

export interface Playlist {
  id: string; // Directory path hash or unique ID
  name: string;
  path: string;
  songs: Song[];
  videos?: Video[];
  videoCount?: number;
  totalSize?: string;
}

export interface Channel {
  id: string;
  displayName: string;
  handle: string;
  playlists: Playlist[];
}

export enum PlayerState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED'
}

export type ThemeMode = 'light' | 'dark';

export interface ThemePalette {
  name: string;
  primary: string; // Hex code for main accent
  glow: string; // Hex code for glow effects
  gradient: string; // CSS Gradient string
}
