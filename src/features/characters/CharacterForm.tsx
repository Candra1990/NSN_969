import React, { useState, useEffect } from 'react';
import { Save, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';
import type { Character } from '@/types/character';

interface CharacterFormProps {
  initialData?: Character | null;
  onSave: (character: Character) => Promise<void>;
  onClose: () => void;
}

export function CharacterForm({ initialData, onSave, onClose }: CharacterFormProps) {
  const { theme } = useTheme();
  const [saving, setSaving] = useState(false);

  const [characterName, setCharacterName] = useState(initialData?.characterName || '');
  const [characterAlias, setCharacterAlias] = useState(initialData?.characterAlias || '');
  const [characterImage, setCharacterImage] = useState(initialData?.characterImage || '');
  const [role, setRole] = useState(initialData?.role || 'Member');
  const [age, setAge] = useState<string | number>(initialData?.age || '');
  const [gender, setGender] = useState(initialData?.gender || 'Male');
  const [occupation, setOccupation] = useState(initialData?.occupation || '');
  const [personality, setPersonality] = useState(initialData?.personality || '');
  const [background, setBackground] = useState(initialData?.background || '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'deceased' | 'archived'>(initialData?.status || 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim() || saving) return;

    try {
      setSaving(true);
      await onSave({
        id: initialData?.id || `char_${Date.now()}`,
        characterName: characterName.trim(),
        characterAlias: characterAlias.trim(),
        characterImage: characterImage.trim(),
        role: role.trim(),
        age: age ? Number(age) : undefined,
        gender,
        occupation: occupation.trim(),
        personality: personality.trim(),
        background: background.trim(),
        status,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save character:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl max-h-[90vh] flex flex-col ${
        theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
      }`}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base">
              {initialData ? 'Edit Character IC' : 'Tambah Karakter IC Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">Nama Karakter *</label>
              <input
                type="text"
                placeholder="misal: Jax Mercer"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">Alias / Julukan</label>
              <input
                type="text"
                placeholder="misal: Viper"
                value={characterAlias}
                onChange={(e) => setCharacterAlias(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">URL Foto / Avatar</label>
              <input
                type="url"
                placeholder="https://..."
                value={characterImage}
                onChange={(e) => setCharacterImage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">Role In-Character</label>
              <input
                type="text"
                placeholder="misal: Underboss, Lead Driver"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">Umur (Tahun)</label>
              <input
                type="number"
                placeholder="28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">Gender / Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
              >
                <option value="Male">Laki-Laki (Male)</option>
                <option value="Female">Perempuan (Female)</option>
                <option value="Other">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">Pekerjaan In-Game</label>
              <input
                type="text"
                placeholder="misal: Mekanik, Taxi Driver, Lawyer"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">Status Karakter</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
              >
                <option value="active">Active (Aktif)</option>
                <option value="inactive">Inactive</option>
                <option value="deceased">Deceased (Meninggal IC)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">Kepribadian / Sifat</label>
            <textarea
              rows={2}
              placeholder="Deskripsi kepribadian karakter..."
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-400 mb-1 block">Latar Belakang / Story IC</label>
            <textarea
              rows={4}
              placeholder="Cerita latar belakang karakter..."
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs bg-zinc-900 border-zinc-700 text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Karakter'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
