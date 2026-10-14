import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Character } from '@/types/character';

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'char_1',
    characterName: 'Jax "Viper" Mercer',
    characterAlias: 'Viper',
    characterImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    role: 'Underboss / Lead Driver',
    age: 28,
    gender: 'Male',
    occupation: 'Custom Mechanic & Driver',
    personality: 'Calm under extreme pressure, ruthless when betrayed, fierce loyalty to squad.',
    background: 'Former street racer turned tactical driver for NSN Syndicate in Los Santos.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'char_2',
    characterName: 'Elena "Cipher" Rostova',
    characterAlias: 'Cipher',
    characterImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    role: 'Intelligence & Hacker',
    age: 25,
    gender: 'Female',
    occupation: 'Cyber Intelligence Specialist',
    personality: 'Analytical, sarcastic, highly perceptive.',
    background: 'Ex-corporate security engineer now running signals for NSN969 crew.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function subscribeToCharacters(
  callback: (characters: Character[]) => void
): () => void {
  if (isSupabaseConfigured() && supabase) {
    supabase
      .from('ic_characters')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          callback(data.map(d => ({
            id: d.id,
            characterName: d.name,
            characterAlias: d.player_name,
            characterImage: d.avatar,
            role: d.role,
            age: d.age,
            gender: 'Male',
            occupation: d.occupation,
            personality: '',
            background: d.bio,
            status: d.status as any,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          })));
        } else {
          callback(DEFAULT_CHARACTERS);
        }
      });

    const channelId = `characters_realtime_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ic_characters' },
        () => {
          supabase
            .from('ic_characters')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
              if (data && data.length > 0) {
                callback(data.map(d => ({
                  id: d.id,
                  characterName: d.name,
                  characterAlias: d.player_name,
                  characterImage: d.avatar,
                  role: d.role,
                  age: d.age,
                  gender: 'Male',
                  occupation: d.occupation,
                  personality: '',
                  background: d.bio,
                  status: d.status as any,
                  createdAt: d.created_at,
                  updatedAt: d.updated_at,
                })));
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  try {
    const q = query(collection(db, 'ic_characters'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Character[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Character);
          });
          callback(list);
        } else {
          callback(DEFAULT_CHARACTERS);
        }
      },
      (err) => {
        const fallbackUnsub = onSnapshot(
          collection(db, 'ic_characters'),
          (snap) => {
            if (!snap.empty) {
              const list: Character[] = [];
              snap.forEach((d) => {
                list.push({ id: d.id, ...d.data() } as Character);
              });
              callback(list);
            } else {
              callback(DEFAULT_CHARACTERS);
            }
          },
          (fallbackErr) => {
            handleFirestoreError(fallbackErr, OperationType.GET, 'ic_characters');
            callback(DEFAULT_CHARACTERS);
          }
        );
        return fallbackUnsub;
      }
    );
    return unsub;
  } catch (e) {
    console.error('Failed to subscribe to IC characters:', e);
    callback(DEFAULT_CHARACTERS);
    return () => {};
  }
}

export async function saveCharacterToDb(character: Character): Promise<void> {
  const charId = character.id || `char_${Date.now()}`;

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('ic_characters')
      .upsert({
        id: charId,
        name: character.characterName,
        player_name: character.characterAlias || '',
        avatar: character.characterImage || '',
        role: character.role || 'Civilian',
        occupation: character.occupation || '',
        age: character.age || 21,
        bio: character.background || '',
        status: character.status || 'Active',
        updated_at: new Date().toISOString(),
      });
    if (error) console.error('[CharacterService] Supabase save error:', error);
  }

  try {
    const data: Character = {
      ...character,
      id: charId,
      updatedAt: new Date().toISOString(),
      createdAt: character.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'ic_characters', charId), data, { merge: true });
  } catch (e) {
    if (!isSupabaseConfigured()) {
      handleFirestoreError(e, OperationType.WRITE, 'ic_characters');
      throw e;
    }
  }
}

export async function deleteCharacterFromDb(characterId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('ic_characters')
      .delete()
      .eq('id', characterId);
    if (error) console.error('[CharacterService] Supabase delete error:', error);
  }

  try {
    await deleteDoc(doc(db, 'ic_characters', characterId));
  } catch (e) {
    if (!isSupabaseConfigured()) {
      handleFirestoreError(e, OperationType.DELETE, 'ic_characters');
      throw e;
    }
  }
}
