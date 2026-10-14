import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import type { Character } from '@/types/character';

export function CharacterPreview({ character }: { character: Character }) {
  return (
    <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={character.characterImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
          alt={character.characterName}
          className="w-12 h-12 rounded-xl object-cover border border-amber-500/30"
        />
        <div>
          <h4 className="font-bold text-sm text-white">{character.characterName}</h4>
          <p className="text-xs text-amber-500">{character.role}</p>
        </div>
      </div>
      {character.personality && (
        <p className="text-xs text-zinc-400 line-clamp-2">{character.personality}</p>
      )}
    </div>
  );
}
