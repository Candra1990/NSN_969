import { useFirebase } from '@/contexts/FirebaseProvider';

export function useAdminConfig() {
  const { maintenanceMode, announcementActive, announcementEn, announcementId, updateGlobalConfig } = useFirebase();
  return { maintenanceMode, announcementActive, announcementEn, announcementId, updateGlobalConfig };
}
