import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface AIDJPromptProps {
  onGenerate: (mood: string) => Promise<void>;
  isGenerating: boolean;
}

const AIDJPrompt: React.FC<AIDJPromptProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    await onGenerate(prompt);
    setPrompt('');
  };

  return (
    <div className="w-full bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border border-white/10 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-indigo-400" size={20} />
        <h2 className="text-lg font-semibold text-white">AI DJ</h2>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Describe your mood, activity, or a genre, and I'll build a custom playlist for you.
      </p>
      
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 'Cyberpunk coding session' or 'Lazy Sunday morning'"
          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          disabled={isGenerating}
        />
        <button 
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
};

export default AIDJPrompt;