import React from 'react';
import { Shield, Briefcase, User, Calendar, MapPin, X, Sparkles, BookOpen } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';
import type { Character } from '@/types/character';

interface CharacterProfileProps {
  character: Character;
  onClose: () => void;
}

export function CharacterProfile({ character, onClose }: CharacterProfileProps) {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl max-h-[90vh] flex flex-col ${
        theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Header Banner & Portrait */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
            <img
              src={character.characterImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
              alt={character.characterName}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
              }}
            />

            <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  IC Character
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  character.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                }`}>
                  {character.status}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {character.characterName}
              </h2>

              {character.characterAlias && (
                <p className="text-sm font-semibold text-[#e5a93c]">
                  Alias: "{character.characterAlias}"
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>{character.role}</span>
                </div>
                {character.occupation && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-zinc-400" />
                    <span>{character.occupation}</span>
                  </div>
                )}
                {character.age && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>{character.age} Tahun ({character.gender || 'N/A'})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personality / Overview */}
          {character.personality && (
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Kepribadian & Sifat
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {character.personality}
              </p>
            </div>
          )}

          {/* Background / Latar Belakang */}
          {character.background && (
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Latar Belakang & Cerita In-Character
              </h4>
              <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {character.background}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
