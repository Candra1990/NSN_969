import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { auth, loginWithGoogle as firebaseLoginWithGoogle, logoutUser as firebaseLogoutUser } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export interface UnifiedUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'supabase' | 'firebase';
}

/**
 * Unified auth service supporting Supabase Auth with legacy Firebase Auth fallback.
 */

export async function getCurrentUser(): Promise<UnifiedUser | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        id: user.id,
        email: user.email || null,
        displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
        photoURL: user.user_metadata?.avatar_url || null,
        provider: 'supabase',
      };
    }
  }

  // Fallback to Firebase Auth
  const fbUser = auth.currentUser;
  if (fbUser) {
    return {
      id: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
      photoURL: fbUser.photoURL,
      provider: 'firebase',
    };
  }

  return null;
}

export async function signInWithGoogle(): Promise<UnifiedUser | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('[AuthService] Supabase OAuth error:', error);
      throw error;
    }
    return await getCurrentUser();
  }

  // Legacy Firebase fallback
  const fbUser = await firebaseLoginWithGoogle();
  if (fbUser) {
    return {
      id: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || 'Member',
      photoURL: fbUser.photoURL,
      provider: 'firebase',
    };
  }
  return null;
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  }
  await firebaseLogoutUser();
}

export function onAuthStateChange(callback: (user: UnifiedUser | null) => void): () => void {
  if (isSupabaseConfigured() && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Member',
          photoURL: session.user.user_metadata?.avatar_url || null,
          provider: 'supabase',
        });
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  // Fallback to Firebase onAuthStateChanged
  const unsubFb = onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      callback({
        id: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
        photoURL: fbUser.photoURL,
        provider: 'firebase',
      });
    } else {
      callback(null);
    }
  });

  return unsubFb;
}

export type AdminAuthStatus = 
  | 'AUTHORIZED'
  | 'ROLE_NOT_FOUND'
  | 'NOT_ADMIN'
  | 'DB_ERROR'
  | 'EXPIRED_SESSION'
  | 'NOT_CONFIGURED';

export interface AdminValidationDetails {
  isAdmin: boolean;
  role: string | null;
  status: AdminAuthStatus;
  message: string;
  userEmail: string | null;
  userId: string | null;
}

export async function checkAdminAuthorizationDetailed(): Promise<AdminValidationDetails> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      isAdmin: false,
      role: null,
      status: 'NOT_CONFIGURED',
      message: 'Koneksi Supabase belum terkonfigurasi di environment frontend. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
      userEmail: null,
      userId: null,
    };
  }

  try {
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !session?.user) {
      return {
        isAdmin: false,
        role: null,
        status: 'EXPIRED_SESSION',
        message: 'Sesi autentikasi telah kedaluwarsa atau pengguna belum login.',
        userEmail: null,
        userId: null,
      };
    }

    const verifiedUser = session.user;
    const verifiedUserId = verifiedUser.id;
    const verifiedEmail = verifiedUser.email || null;

    // 1. Primary check: Call public.is_admin() RPC function in Supabase (SECURITY DEFINER)
    try {
      const { data: rpcIsAdmin, error: rpcErr } = await supabase.rpc('is_admin');
      if (!rpcErr && rpcIsAdmin === true) {
        console.info('[NSN969 Auth Flow] RPC is_admin: GRANTED');
        return {
          isAdmin: true,
          role: 'admin',
          status: 'AUTHORIZED',
          message: 'Hak akses admin terverifikasi via fungsi database public.is_admin().',
          userEmail: verifiedEmail,
          userId: verifiedUserId,
        };
      }
      if (rpcErr) {
        console.warn('[NSN969 Auth Flow] RPC is_admin error/fallback:', rpcErr.message);
      }
    } catch (e: any) {
      console.warn('[NSN969 Auth Flow] RPC execution notice:', e?.message || e);
    }

    // 2. Direct lookup in user_profiles by authentic user UUID (prevents spoofing)
    let dbErrorMessage: string | null = null;
    const { data: profile, error: profErr } = await supabase
      .from('user_profiles')
      .select('id, role, email')
      .eq('id', verifiedUserId)
      .maybeSingle();

    if (profErr) {
      console.error('[NSN969 Auth Flow] user_profiles query error:', profErr);
      dbErrorMessage = profErr.message;
    }

    if (profile) {
      const roleLower = (profile.role || '').toLowerCase();
      if (roleLower === 'admin' || roleLower === 'super_admin') {
        console.info('[NSN969 Auth Flow] user_profiles role check: GRANTED', profile.role);
        return {
          isAdmin: true,
          role: profile.role,
          status: 'AUTHORIZED',
          message: `Hak akses admin terverifikasi (Peran: ${profile.role}).`,
          userEmail: verifiedEmail,
          userId: verifiedUserId,
        };
      } else {
        console.warn('[NSN969 Auth Flow] user_profiles role check: NOT_ADMIN', profile.role);
        return {
          isAdmin: false,
          role: profile.role,
          status: 'NOT_ADMIN',
          message: `Akun Anda memiliki peran "${profile.role || 'member'}", bukan administrator.`,
          userEmail: verifiedEmail,
          userId: verifiedUserId,
        };
      }
    }

    // 3. Fallback check: Server-trusted JWT app_metadata claim
    const appRole = verifiedUser.app_metadata?.role;
    if (appRole === 'admin' || appRole === 'super_admin') {
      return {
        isAdmin: true,
        role: appRole,
        status: 'AUTHORIZED',
        message: 'Hak akses admin terverifikasi melalui klaim server app_metadata.',
        userEmail: verifiedEmail,
        userId: verifiedUserId,
      };
    }

    // If profile row was not found
    if (dbErrorMessage) {
      return {
        isAdmin: false,
        role: null,
        status: 'DB_ERROR',
        message: `Kueri database otorisasi gagal: ${dbErrorMessage}. Periksa koneksi atau kebijakan RLS.`,
        userEmail: verifiedEmail,
        userId: verifiedUserId,
      };
    }

    return {
      isAdmin: false,
      role: null,
      status: 'ROLE_NOT_FOUND',
      message: 'Akun Anda berhasil diautentikasi di Supabase Auth, namun belum terdaftar di tabel otorisasi "public.user_profiles".',
      userEmail: verifiedEmail,
      userId: verifiedUserId,
    };
  } catch (err: any) {
    console.error('[NSN969 Auth Flow] Unexpected error validating admin access:', err);
    return {
      isAdmin: false,
      role: null,
      status: 'DB_ERROR',
      message: err?.message || 'Terjadi kesalahan sistem saat memeriksa hak akses.',
      userEmail: null,
      userId: null,
    };
  }
}

export async function validateAdminAccess(userId?: string, userEmail?: string | null): Promise<boolean> {
  const result = await checkAdminAuthorizationDetailed();
  return result.isAdmin;
}

export async function isUserAdmin(user: UnifiedUser | null): Promise<boolean> {
  if (!user || !user.id) return false;
  return await validateAdminAccess(user.id, user.email);
}
