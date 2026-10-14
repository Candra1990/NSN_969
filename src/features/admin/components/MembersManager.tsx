import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Shield, User, Star, RefreshCw } from 'lucide-react';
import type { AdminUser } from '@/types/admin';
import { fetchRegisteredMembers } from '@/services/admin/adminService';
import { ToastNotif, ToastMessage } from './ToastNotif';
import { useLanguage } from '@/contexts/LanguageProvider';

let cachedMembersList: AdminUser[] = [];

export function MembersManager() {
  const { language } = useLanguage();
  const isId = language === 'id';
  const [members, setMembers] = useState<AdminUser[]>(cachedMembersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [loading, setLoading] = useState(cachedMembersList.length === 0);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ id: Date.now().toString(), type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const loadMembers = async (forceSpinner = false) => {
    if (forceSpinner || cachedMembersList.length === 0) {
      setLoading(true);
    }
    try {
      const data = await fetchRegisteredMembers();
      cachedMembersList = data;
      setMembers(data);
    } catch (err) {
      showToast('error', 'Gagal memuat daftar anggota.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'ALL' || m.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ToastNotif toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-blue-400" />
            {isId ? 'Peran & Hak Akses Pengguna' : 'User Roles & Permissions'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isId 
              ? 'Daftar anggota resmi, streamer tersertifikasi, dan pengelola peran NSN969.' 
              : 'List of official members, verified broadcasters, and role permissions.'}
          </p>
        </div>

        <button
          onClick={() => loadMembers(true)}
          disabled={loading}
          className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isId ? 'Segarkan Data' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="p-4 bg-[#111827] border border-[#1F2937] rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={isId ? "Cari nama anggota atau email..." : "Search member name or email..."}
            className="w-full bg-gray-900/60 border border-gray-700/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider shrink-0 px-2">Role:</span>
          {['ALL', 'super_admin', 'streamer', 'moderator', 'member'].map(r => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all shrink-0 cursor-pointer ${
                selectedRole === r
                  ? 'bg-blue-600 text-white font-extrabold shadow-md'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-sm font-bold text-gray-400">Memuat data anggota Supabase...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-bold">Tidak ada anggota yang cocok.</div>
        ) : (
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Pengguna / Nama</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role / Peran</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80 text-sm">
              {filteredMembers.map(m => (
                <tr key={m.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                      {m.displayName.substring(0, 1)}
                    </div>
                    <span>{m.displayName}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-gray-400">{m.email}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      m.role === 'super_admin'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : m.role === 'streamer'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}>
                      {m.role === 'super_admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {m.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
