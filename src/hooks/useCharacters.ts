import { useState, useEffect, useCallback } from 'react';
import type { Character } from '@/types/character';
import { subscribeToCharacters, saveCharacterToDb, deleteCharacterFromDb } from '@/services/characters/characterService';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToCharacters((data) => {
      setCharacters(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const saveCharacter = useCallback(async (character: Character) => {
    await saveCharacterToDb(character);
  }, []);

  const deleteCharacter = useCallback(async (characterId: string) => {
    await deleteCharacterFromDb(characterId);
  }, []);

  return {
    characters,
    loading,
    saveCharacter,
    deleteCharacter,
  };
}
