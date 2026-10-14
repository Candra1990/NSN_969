import { useFirebase } from '@/contexts/FirebaseProvider';

export function useTracks() {
  const { tracks, addTrackToDb, removeTrackFromDb } = useFirebase();
  return { tracks, addTrackToDb, removeTrackFromDb };
}
