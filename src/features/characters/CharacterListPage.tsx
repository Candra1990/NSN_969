import React, { useState } from 'react';
import { Sparkles, Search, User, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';
import { useCharacters } from '@/hooks/useCharacters';
import type { Character } from '@/types/character';
import { CharacterCard } from './CharacterCard';
import { CharacterProfile } from './CharacterProfile';

export function CharacterListPage() {
  const { theme } = useTheme();
  const { characters, loading } = useCharacters();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const roles = Array.from(new Set(characters.map((c) => c.role).filter(Boolean)));

  const filteredCharacters = characters.filter((c) => {
    const matchesSearch =
      c.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.characterAlias && c.characterAlias.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.occupation && c.occupation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = filterRole === 'all' || c.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className={`min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none ${
      theme === 'light' ? 'text-zinc-900' : 'text-white'
    }`}>
      {/* Banner / Title Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
        theme === 'light'
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200'
          : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-zinc-950 border-amber-500/20'
      }`}>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> NSN969 Roleplay
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Karakter In-Character (IC)
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Eksplorasi profil karakter, identitas rahasia, pekerjaan, kepribadian, dan cerita latar belakang anggota komunitas NSN969.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama karakter, alias, pekerjaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs focus:outline-none transition-colors ${
              theme === 'light'
                ? 'bg-white border-zinc-200 text-zinc-900 focus:border-amber-500'
                : 'bg-zinc-900 border-zinc-800 text-white focus:border-amber-500'
            }`}
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              filterRole === 'all'
                ? 'bg-[#e5a93c] text-black'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
            }`}
          >
            Semua Role
          </button>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                filterRole === r
                  ? 'bg-[#e5a93c] text-black'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Characters */}
      {loading ? (
        <div className="py-20 text-center text-zinc-400 text-sm">
          Memuat daftar karakter NSN969...
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="py-20 text-center text-zinc-400 text-sm border border-dashed rounded-3xl border-zinc-800">
          Tidak ada karakter yang cocok dengan pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onSelect={(c) => setSelectedCharacter(c)}
            />
          ))}
        </div>
      )}

      {/* Character Profile Modal */}
      {selectedCharacter && (
        <CharacterProfile
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </div>
  );
}
