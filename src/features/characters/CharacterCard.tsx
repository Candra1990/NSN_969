import React from 'react';
import { User, Shield, Briefcase, Sparkles, ExternalLink } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';
import type { Character } from '@/types/character';

interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
}

export function CharacterCard({ character, onSelect }: CharacterCardProps) {
  const { theme } = useTheme();

  return (
    <div
      onClick={() => onSelect(character)}
      className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
        theme === 'light'
          ? 'bg-white border-zinc-200 hover:border-amber-500 shadow-sm hover:shadow-md'
          : 'bg-zinc-900/80 border-zinc-800 hover:border-[#e5a93c]/50 shadow-lg'
      }`}
    >
      {/* Character Image Header */}
      <div className="h-48 w-full relative overflow-hidden bg-zinc-950">
        <img
          src={character.characterImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
          alt={character.characterName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${
            character.status === 'active'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : character.status === 'deceased'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
          }`}>
            {character.status}
          </span>
        </div>

        {/* Alias / Role overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h4 className="font-extrabold text-lg text-white truncate tracking-tight">
            {character.characterName}
          </h4>
          {character.characterAlias && (
            <p className="text-xs font-semibold text-[#e5a93c] truncate">
              "{character.characterAlias}"
            </p>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium text-amber-500/90">
            <Shield className="w-3.5 h-3.5" /> {character.role || 'Member'}
          </span>
          {character.age && (
            <span className="font-mono text-[11px] text-zinc-500">
              {character.age} thn
            </span>
          )}
        </div>

        {character.occupation && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-300 truncate">
            <Briefcase className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{character.occupation}</span>
          </div>
        )}

        {character.personality && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed pt-1 border-t border-zinc-800/50">
            {character.personality}
          </p>
        )}
      </div>
    </div>
  );
}
