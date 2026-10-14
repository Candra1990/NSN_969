import React, { useState } from 'react';
import { Users, Plus, Settings, Trash, ChevronRight } from 'lucide-react';
import type { Streamer, PlatformType } from '@/types';
import { saveStreamerToDb, deleteStreamerFromDb } from '@/services/streamers/streamerService';

interface MemberManagerProps {
  streamers: Streamer[];
}

export function MemberManager({ streamers }: MemberManagerProps) {
  const borderCard = 'border-[#1F2937]';
  const bgCard = 'bg-[#111827]';
  const textPrimary = 'text-white';
  const textSecondary = 'text-gray-400';

  const [showAddStreamer, setShowAddStreamer] = useState(false);
  const [editingStreamer, setEditingStreamer] = useState<string | null>(null);
  const [streamerForm, setStreamerForm] = useState<{
    name: string;
    platform: PlatformType;
    channelId: string;
    youtubeId: string;
    tiktokId: string;
    photoUrl: string;
    isFeatured: boolean;
    category: string;
  }>({
    name: '',
    platform: 'youtube',
    channelId: '',
    youtubeId: '',
    tiktokId: '',
    photoUrl: '',
    isFeatured: false,
    category: 'NSN Community Stream'
  });

  const handleEditStreamer = (member: Streamer) => {
    setEditingStreamer(member.id);
    setStreamerForm({
      name: member.name || '',
      platform: member.platform || 'youtube',
      channelId: member.channelId || '',
      youtubeId: member.youtubeId || '',
      tiktokId: member.tiktokId || '',
      photoUrl: member.photoUrl || '',
      isFeatured: member.isFeatured || false,
      category: member.category || 'NSN Community Stream'
    });
    setShowAddStreamer(true);
  };

  const handleSaveStreamer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamerForm.name) return;
    
    const id = editingStreamer || `str-${Date.now()}`;
    await saveStreamerToDb({
      id,
      ...streamerForm
    });
    
    setStreamerForm({
      name: '',
      platform: 'youtube',
      channelId: '',
      youtubeId: '',
      tiktokId: '',
      photoUrl: '',
      isFeatured: false,
      category: 'NSN Community Stream'
    });
    setEditingStreamer(null);
    setShowAddStreamer(false);
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Remove this streamer?')) {
      await deleteStreamerFromDb(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
         <h2 className={`text-3xl font-extrabold ${textPrimary} tracking-tight`}>Member Management</h2>
         <p className={`text-base ${textSecondary} mt-2 max-w-2xl`}>
            Add, remove, or modify NSN969 streamer accounts, custom channels, and photos.
         </p>
      </div>
      
      <div className={`p-8 rounded-3xl border ${borderCard} ${bgCard} flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl`}>
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Users className="w-6 h-6"/></div>
           <div>
             <h3 className={`text-xl font-bold ${textPrimary}`}>Streamer Directory</h3>
             <p className={`text-sm ${textSecondary} mt-1`}>{streamers.length} active streamers</p>
           </div>
        </div>
        <button 
          onClick={() => {
            if (!showAddStreamer) {
               setEditingStreamer(null);
               setStreamerForm({ name: '', platform: 'youtube', channelId: '', youtubeId: '', tiktokId: '', photoUrl: '', isFeatured: false, category: 'NSN Community Stream' });
            }
            setShowAddStreamer(!showAddStreamer);
          }} 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 cursor-pointer"
        >
          {showAddStreamer ? <><ChevronRight className="w-4 h-4 rotate-90" /> Close Form</> : <><Plus className="w-4 h-4" /> Add Streamer</>}
        </button>
      </div>
      
      {showAddStreamer && (
        <form onSubmit={handleSaveStreamer} className={`p-8 rounded-3xl border ${borderCard} bg-gray-900/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300 shadow-inner`}>
          <div className="space-y-2 lg:col-span-3 pb-4 border-b border-gray-700/50">
             <h4 className="text-lg font-bold text-white flex items-center gap-2">
               <Settings className="w-5 h-5 text-blue-400" />
               {editingStreamer ? 'Edit Streamer' : 'Add New Streamer'}
             </h4>
          </div>
          
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
             <input 
               type="text" placeholder="e.g. UCUP" 
               value={streamerForm.name} onChange={e => setStreamerForm(prev => ({...prev, name: e.target.value}))}
               className="w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500 transition-colors"
               required 
             />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Default Platform</label>
             <select 
               value={streamerForm.platform} onChange={e => setStreamerForm(prev => ({...prev, platform: e.target.value as PlatformType}))}
               className="w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500 transition-colors"
             >
               <option value="youtube">YouTube</option>
               <option value="tiktok">TikTok</option>
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Legacy Channel ID</label>
             <input 
               type="text" placeholder="Fallback ID" 
               value={streamerForm.channelId} onChange={e => setStreamerForm(prev => ({...prev, channelId: e.target.value}))}
               className="w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500 transition-colors"
             />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">YouTube ID (Multiview)</label>
             <input 
               type="text" placeholder="@youtube_handle or ID" 
               value={streamerForm.youtubeId} onChange={e => setStreamerForm(prev => ({...prev, youtubeId: e.target.value}))}
               className="w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500 transition-colors"
             />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">TikTok ID (Dashboard)</label>
             <input 
               type="text" placeholder="@tiktok_username" 
               value={streamerForm.tiktokId} onChange={e => setStreamerForm(prev => ({...prev, tiktokId: e.target.value}))}
               className="w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500 transition-colors"
             />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Photo / Avatar URL</label>
             <input 
               type="text" placeholder="https://..." 
               value={streamerForm.photoUrl} onChange={e => setStreamerForm(prev => ({...prev, photoUrl: e.target.value}))}
               className="w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500 transition-colors"
             />
          </div>
          
          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Settings</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-white">
                <input type="checkbox" checked={streamerForm.isFeatured} onChange={e => setStreamerForm(prev => ({...prev, isFeatured: e.target.checked}))} className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-500" />
                Featured Streamer
              </label>
            </div>
          </div>
          
          <div className="flex items-end lg:col-span-3 mt-4 pt-4 border-t border-gray-700/50">
             <button type="submit" className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer">
               {editingStreamer ? 'Update Streamer Details' : 'Save New Streamer'}
             </button>
          </div>
        </form>
      )}
      
      <div className={`rounded-3xl border ${borderCard} ${bgCard} overflow-hidden shadow-xl`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${borderCard} bg-[#0B0F19]/80`}>
                <th className={`px-6 py-5 text-xs font-bold ${textSecondary} uppercase tracking-wider`}>Streamer</th>
                <th className={`px-6 py-5 text-xs font-bold ${textSecondary} uppercase tracking-wider`}>YouTube ID</th>
                <th className={`px-6 py-5 text-xs font-bold ${textSecondary} uppercase tracking-wider`}>TikTok ID</th>
                <th className={`px-6 py-5 text-xs font-bold ${textSecondary} uppercase tracking-wider`}>Status</th>
                <th className={`px-6 py-5 text-xs font-bold ${textSecondary} uppercase tracking-wider text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {streamers?.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                  <td className={`px-6 py-5 whitespace-nowrap font-bold ${textPrimary}`}>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                          <img src={member.photoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0d0e12`} className="w-full h-full object-cover" />
                       </div>
                       {member.name}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {member.youtubeId || (member.platform === 'youtube' ? member.channelId : '-')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {member.tiktokId || (member.platform === 'tiktok' ? member.channelId : '-')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${member.isFeatured ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-500'}`}></div>
                      <span className={`text-xs font-bold ${member.isFeatured ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {member.isFeatured ? 'FEATURED' : 'STANDARD'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditStreamer(member)}
                        title="Edit Streamer"
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        title="Delete User"
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {streamers.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
               <Users className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-semibold">No members found in directory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
