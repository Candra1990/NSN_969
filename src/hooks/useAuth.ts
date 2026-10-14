import { useFirebase } from '@/contexts/FirebaseProvider';

export function useAuth() {
  const { 
    user, 
    isAdmin, 
    adminAuthDetails, 
    recheckAdminAccess, 
    loading, 
    login, 
    loginWithCredentials, 
    logout 
  } = useFirebase();

  return { 
    user, 
    isAdmin, 
    adminAuthDetails, 
    recheckAdminAccess, 
    loading, 
    login, 
    loginWithCredentials, 
    logout 
  };
}
