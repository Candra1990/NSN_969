import React, { useState } from 'react';
import { supabase, isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';
import { checkAdminAuthorizationDetailed } from '@/services/auth/authService';
import { Lock, LogIn, AlertTriangle, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';
import { useLanguage } from '@/contexts/LanguageProvider';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(supabaseConfigError || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(language === 'id' ? 'Harap isi email dan kata sandi admin.' : 'Please enter admin email and password.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setError(supabaseConfigError || (language === 'id' 
        ? 'Public Supabase key belum tersedia di environment frontend.' 
        : 'Supabase configuration is missing in the frontend environment.'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (authError) {
        let errorMsg = authError.message;
        if (errorMsg === 'Invalid login credentials') {
          errorMsg = language === 'id' 
            ? 'Email atau kata sandi yang Anda masukkan tidak valid.' 
            : 'Invalid email or password.';
        } else if (errorMsg.includes('Email not confirmed')) {
          errorMsg = language === 'id' 
            ? 'Email belum dikonfirmasi. Silakan verifikasi akun Anda.' 
            : 'Email address has not been confirmed yet.';
        }
        setError(errorMsg);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError(language === 'id' ? 'Data akun pengguna tidak ditemukan.' : 'User data not found.');
        setLoading(false);
        return;
      }

      const authResult = await checkAdminAuthorizationDetailed();
      if (!authResult.isAdmin) {
        await supabase.auth.signOut().catch(() => {});
        setError(authResult.message || (language === 'id' ? 'Akses ditolak: Akun Anda bukan admin.' : 'Access denied: You are not authorized as an admin.'));
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || (language === 'id' ? 'Terjadi kesalahan sistem.' : 'A system error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0B0F19] text-white relative overflow-y-auto select-none">
      {/* Top Bar with Back Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <button
          type="button"
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              window.location.pathname = '/';
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'Kembali' : 'Back'}</span>
        </button>
      </div>

      {/* Background Subtle Watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-5">
        <ShieldCheck className="w-[600px] h-[600px] text-amber-500" />
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl border shadow-2xl bg-[#111318] border-zinc-800/90 relative z-10 my-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black tracking-wider uppercase text-center text-white">
            {language === 'id' ? 'Panel Admin' : 'Admin Panel'}
          </h2>
          <p className="text-sm mt-2 text-center text-zinc-400">
            {language === 'id' 
              ? 'Silakan masuk dengan akun terdaftar untuk mengakses dasbor admin NSN969.' 
              : 'Please sign in with your authorized credentials to access the NSN969 admin dashboard.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={`text-[10px] font-mono tracking-widest uppercase font-extrabold ${
              theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {language === 'id' ? 'Email Admin' : 'Admin Email'}
            </label>
            <div className="relative flex items-center">
              <Mail className={`absolute left-4 w-4 h-4 ${
                theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'
              }`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border rounded-xl py-3 pl-11 pr-4 text-xs outline-none transition-all ${
                  theme === 'light' 
                    ? 'bg-zinc-50 border-zinc-200 focus:border-amber-500 text-zinc-900' 
                    : 'bg-[#0a0c10] border-zinc-800 focus:border-amber-500 text-white'
                }`}
                placeholder="admin@nsn969.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-mono tracking-widest uppercase font-extrabold ${
              theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {language === 'id' ? 'Kata Sandi' : 'Password'}
            </label>
            <div className="relative flex items-center">
              <Lock className={`absolute left-4 w-4 h-4 ${
                theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'
              }`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-xl py-3 pl-11 pr-4 text-xs outline-none transition-all ${
                  theme === 'light' 
                    ? 'bg-zinc-50 border-zinc-200 focus:border-amber-500 text-zinc-900' 
                    : 'bg-[#0a0c10] border-zinc-800 focus:border-amber-500 text-white'
                }`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading 
              ? (language === 'id' ? 'MEMPROSES...' : 'PROCESSING...') 
              : (language === 'id' ? 'MASUK ADMIN' : 'SIGN IN TO ADMIN')}
            {!loading && <LogIn className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
