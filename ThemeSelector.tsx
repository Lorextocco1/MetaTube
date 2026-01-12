import React from 'react';
import { ThemePalette, ThemeMode } from './types';
import { Moon, Sun, Check } from 'lucide-react';

export const THEME_PALETTES: ThemePalette[] = [
  { name: 'Cosmic',  primary: '#6366f1', glow: 'rgba(99, 102, 241, 0.6)', gradient: 'from-indigo-500 to-purple-600' },
  { name: 'Emerald', primary: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Rose',    primary: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)',  gradient: 'from-rose-500 to-pink-600' },
  { name: 'Amber',   primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)',  gradient: 'from-amber-500 to-orange-600' },
  { name: 'Ocean',   primary: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.6)',  gradient: 'from-sky-500 to-blue-600' },
  { name: 'Violet',  primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.6)',  gradient: 'from-violet-500 to-fuchsia-600' },
  { name: 'Crimson', primary: '#dc2626', glow: 'rgba(220, 38, 38, 0.6)',   gradient: 'from-red-600 to-rose-700' },
  { name: 'Toxic',   primary: '#84cc16', glow: 'rgba(132, 204, 22, 0.6)',  gradient: 'from-lime-500 to-green-500' },
  { name: 'Aqua',    primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)',   gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Fuchsia', primary: '#d946ef', glow: 'rgba(217, 70, 239, 0.6)',  gradient: 'from-fuchsia-500 to-purple-500' },
  { name: 'Sunset',  primary: '#f97316', glow: 'rgba(249, 115, 22, 0.6)',  gradient: 'from-orange-500 to-red-500' },
  { name: 'Silver',  primary: '#94a3b8', glow: 'rgba(148, 163, 184, 0.6)', gradient: 'from-slate-400 to-gray-500' },
];

interface ThemeSelectorProps {
  currentPalette: ThemePalette;
  currentMode: ThemeMode;
  onPaletteChange: (palette: ThemePalette) => void;
  onModeChange: (mode: ThemeMode) => void;
  isOpen: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  currentPalette, currentMode, onPaletteChange, onModeChange, isOpen 
}) => {
  if (!isOpen) return null;

  return (
    // Outer Wrapper: Handles Positioning ONLY. 
    // Uses -translate-x-1/2 to center relative to parent.
    // NOTE: Removed 'animate-fade-in' from here to prevent transform conflict.
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 w-[340px] cursor-default">
      
      {/* Animation Wrapper: Handles Fade/Slide effect independently */}
      <div className="animate-fade-in">
        
        <div className={`
          relative p-6 rounded-[2.5rem] border backdrop-blur-2xl shadow-glass flex flex-col gap-6
          ${currentMode === 'dark' ? 'bg-[#0a0a0a]/90 border-white/10' : 'bg-white/80 border-white/60'}
        `}>
          {/* Triangle Pointer */}
          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[14px] 
            ${currentMode === 'dark' ? 'border-b-[#0a0a0a]/90' : 'border-b-white/80'}`} 
          />
          
          {/* Mode Toggle - Pill Shape */}
          <div className="flex bg-black/5 dark:bg-white/5 rounded-full p-1.5 border border-black/5 dark:border-white/5 shadow-inner">
            <button
              onClick={() => onModeChange('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full transition-all duration-300
                ${currentMode === 'light' 
                  ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-black scale-100' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <Sun size={18} strokeWidth={2.5} /> 
              <span className="text-[10px] font-black uppercase tracking-widest">Light</span>
            </button>
            <button
              onClick={() => onModeChange('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full transition-all duration-300
                ${currentMode === 'dark' 
                  ? 'bg-gray-800 shadow-[0_2px_15px_rgba(0,0,0,0.5)] text-white scale-100 border border-white/5' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <Moon size={18} strokeWidth={2.5} /> 
              <span className="text-[10px] font-black uppercase tracking-widest">Dark</span>
            </button>
          </div>

          {/* Color Palette Grid */}
          <div className="grid grid-cols-4 gap-3">
            {THEME_PALETTES.map((palette) => {
              const isActive = currentPalette.name === palette.name;
              return (
                <button
                  key={palette.name}
                  onClick={() => onPaletteChange(palette)}
                  title={palette.name}
                  className={`
                    group relative h-14 rounded-2xl transition-all duration-300 flex items-center justify-center overflow-visible
                    hover:-translate-y-1 active:scale-95 active:translate-y-0
                  `}
                >
                  {/* The Glowing Underlayer */}
                  <div 
                    className={`absolute inset-2 rounded-xl blur-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100`}
                    style={{ backgroundColor: palette.primary }}
                  />

                  {/* The Main Button Body */}
                  <div 
                    className={`
                      relative w-full h-full rounded-2xl border flex items-center justify-center shadow-lg
                      ${isActive ? 'scale-110 border-white ring-2 ring-white/20' : 'border-white/10 hover:border-white/30'}
                    `}
                    style={{ 
                      background: `linear-gradient(135deg, ${palette.primary}, #000)`,
                      boxShadow: isActive 
                        ? `0 0 20px ${palette.glow}, inset 0 0 10px rgba(255,255,255,0.2)` 
                        : 'inset 0 0 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    {/* Glossy shine on top */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none" />
                    
                    {isActive && (
                       <Check size={20} className="text-white drop-shadow-md animate-[fadeIn_0.2s_ease-out]" strokeWidth={3} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className={`text-center text-[9px] font-black uppercase tracking-[0.3em] opacity-40 ${currentMode === 'dark' ? 'text-white' : 'text-black'}`}>
             Scegli la tua frequenza
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;