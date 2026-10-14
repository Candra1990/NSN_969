import { useFirebase } from '@/contexts/FirebaseProvider';

export function useStreamers() {
  const { streamers, liveStatuses, refreshLiveStatuses, addStreamerToDb, removeStreamerFromDb } = useFirebase();
  return { streamers, liveStatuses, refreshLiveStatuses, addStreamerToDb, removeStreamerFromDb };
}
