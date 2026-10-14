import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};

// 1. Resolve Supabase URL
const supabaseUrl = 
  env.VITE_SUPABASE_URL || 
  env.VITE_SUPABASE || 
  '';

// 2. Resolve raw key from VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY
const rawKey = (
  env.VITE_SUPABASE_ANON_KEY || 
  env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  ''
).trim();

// Function to verify key is strictly a public/anon key and NOT a secret key
function validatePublicKey(key: string): { isValid: boolean; errorReason?: string } {
  if (!key) {
    return { isValid: false, errorReason: 'Public Supabase key belum tersedia di environment frontend.' };
  }

  // Check for secret key prefixes
  if (key.startsWith('sb_secret_') || key.startsWith('sbp_secret_') || key.includes('service_role')) {
    return {
      isValid: false,
      errorReason: 'Variabel VITE_SUPABASE_ANON_KEY saat ini berisi secret key (sb_secret_...). Penggunaan secret key di browser dilarang oleh Supabase.',
    };
  }

  // Check JWT payloads if key is in JWT format
  if (key.startsWith('eyJ')) {
    try {
      const parts = key.split('.');
      if (parts.length === 3) {
        const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padLength = (4 - (payloadBase64.length % 4)) % 4;
        const padded = payloadBase64 + '='.repeat(padLength);
        const payload = JSON.parse(atob(padded));
        if (payload?.role === 'service_role') {
          return {
            isValid: false,
            errorReason: 'Kunci JWT yang digunakan memiliki role service_role. Kunci rahasia ini dilarang digunakan di browser.',
          };
        }
      }
    } catch (_) {
      // Ignore parse errors for non-JWT keys
    }
  }

  return { isValid: true };
}

const keyValidation = validatePublicKey(rawKey);
const supabaseAnonKey = keyValidation.isValid ? rawKey : '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    !supabaseUrl.includes('placeholder')
  );
};

export const supabaseConfigError = !isSupabaseConfigured() 
  ? (keyValidation.errorReason || 'Public Supabase key belum tersedia di environment frontend.') 
  : null;

let client: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
  }
} else {
  console.warn(
    `[Supabase Configuration] ${supabaseConfigError}\n` +
    'To fix this, please configure VITE_SUPABASE_ANON_KEY in your environment / AI Studio Secrets with a public/anon key from your Supabase Dashboard.'
  );
}

export const supabase = client;


