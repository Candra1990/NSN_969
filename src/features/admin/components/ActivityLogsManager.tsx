import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { getActivityLogs, fetchActivityLogsFromSupabase } from '@/services/admin/adminService';
import type { ActivityLog } from '@/types/admin';
import { useLanguage } from '@/contexts/LanguageProvider';

export function ActivityLogsManager() {
  const { language } = useLanguage();
  const isId = language === 'id';
  const [logs, setLogs] = useState<ActivityLog[]>(getActivityLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handleRefresh = async () => {
    const fetched = await fetchActivityLogsFromSupabase();
    setLogs(fetched);
  };

  useEffect(() => {
    fetchActivityLogsFromSupabase().then(fetched => {
      if (fetched && fetched.length > 0) {
        setLogs(fetched);
      }
    });
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            {isId ? 'Catatan Aktivitas & Audit Sistem' : 'Activity & System Audit Logs'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isId 
              ? 'Riwayat log aktivitas admin, perubahan konfigurasi, dan event sistem.' 
              : 'Audit history of admin actions, configuration modifications, and system events.'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#111827] border border-[#1F2937] rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari aksi, target, atau aktor..."
            className="w-full bg-gray-900/60 border border-gray-700/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider shrink-0 px-2">Status:</span>
          {['ALL', 'success', 'info', 'warning', 'error'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-extrabold shadow-md'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl overflow-x-auto">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-bold">Tidak ada log aktivitas.</div>
        ) : (
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Aksi / Event</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Pelaku</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80 text-sm">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="py-4 px-4 font-mono text-xs text-gray-400">
                    {new Date(l.timestamp).toLocaleTimeString('id-ID')}
                  </td>
                  <td className="py-4 px-4 font-bold text-white">
                    <div>{l.action}</div>
                    {l.details && <div className="text-xs text-gray-400 font-mono font-normal mt-0.5">{l.details}</div>}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-amber-400">{l.target}</td>
                  <td className="py-4 px-4 text-gray-300 font-semibold">{l.actor}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      l.status === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : l.status === 'error'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : l.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {l.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {l.status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                      {l.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {l.status === 'info' && <Info className="w-3.5 h-3.5" />}
                      {l.status}
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
