import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, UserCheck, Sparkles, UserX } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';
import { useCharacters } from '@/hooks/useCharacters';
import type { Character } from '@/types/character';
import { CharacterCard } from '@/features/characters/CharacterCard';
import { CharacterForm } from '@/features/characters/CharacterForm';
import { CharacterProfile } from '@/features/characters/CharacterProfile';

export function CharacterAdmin() {
  const { theme } = useTheme();
  const { characters, loading, saveCharacter, deleteCharacter } = useCharacters();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = characters.filter((c) =>
    c.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.characterAlias && c.characterAlias.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartCreate = () => {
    setEditingCharacter(null);
    setIsFormOpen(true);
  };

  const handleStartEdit = (char: Character, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCharacter(char);
    setIsFormOpen(true);
  };

  const handleDelete = async (charId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Hapus karakter IC ini secara permanen?')) return;
    try {
      await deleteCharacter(charId);
    } catch (err) {
      console.error('Delete character failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
      }`}>
        <div>
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Pengelolaan Karakter In-Character (IC)
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Atur biodata, kepribadian, role, dan latar belakang karakter RP / GTA V NSN969.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e5a93c] text-black font-bold text-xs hover:bg-amber-400 transition-colors shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah Karakter
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Cari karakter berdasarkan nama, alias, atau role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full max-w-md px-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
            theme === 'light'
              ? 'bg-white border-zinc-200 text-zinc-900 focus:border-amber-500'
              : 'bg-zinc-900 border-zinc-800 text-white focus:border-amber-500'
          }`}
        />
        <span className="text-xs text-zinc-400 font-mono">
          Total: {filteredCharacters.length} karakter
        </span>
      </div>

      {/* Grid of Characters */}
      {loading ? (
        <div className="py-12 text-center text-zinc-400 text-sm">
          Memuat data karakter...
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="py-12 text-center text-zinc-400 text-sm border border-dashed rounded-2xl border-zinc-800">
          Tidak ada karakter IC ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCharacters.map((char) => (
            <div key={char.id} className="relative group">
              <CharacterCard
                character={char}
                onSelect={(c) => setSelectedCharacter(c)}
              />

              {/* Admin Overlay Action buttons */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 opacity-90 group-hover:opacity-100">
                <button
                  onClick={(e) => handleStartEdit(char, e)}
                  className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 hover:bg-amber-500 hover:text-black transition-colors"
                  title="Edit Karakter"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(char.id, e)}
                  className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                  title="Hapus Karakter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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

      {/* Character Form Modal */}
      {isFormOpen && (
        <CharacterForm
          initialData={editingCharacter}
          onSave={saveCharacter}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
