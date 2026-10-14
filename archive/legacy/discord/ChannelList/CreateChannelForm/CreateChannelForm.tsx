import React, { useState, useEffect } from 'react';
import { CloseMark, Speaker } from '../Icons';
import UserRow, { UserObject } from './UserRow';

type FormState = {
  channelType: 'text' | 'voice';
  channelName: string;
  category: string;
  users: UserObject[];
};

interface CreateChannelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (channelName: string, category: string, channelType: 'text' | 'voice') => void;
  suggestedCategory?: string;
  availableMembers?: { id: string; name: string; avatarUrl?: string }[];
}

export default function CreateChannelForm({
  isOpen,
  onClose,
  onSubmit,
  suggestedCategory = '',
  availableMembers = [],
}: CreateChannelFormProps) {
  const [formData, setFormData] = useState<FormState>({
    channelType: 'text',
    channelName: '',
    category: suggestedCategory || 'KOMUNITAS',
    users: [],
  });

  useEffect(() => {
    if (suggestedCategory) {
      setFormData((prev) => ({
        ...prev,
        category: suggestedCategory,
      }));
    }
  }, [suggestedCategory]);

  if (!isOpen) return null;

  // Convert availableMembers to UserObject structure
  const usersList: UserObject[] = availableMembers.map(m => ({
    id: m.id,
    name: m.name,
    image: m.avatarUrl,
  }));

  const buttonDisabled = !formData.channelName.trim() || !formData.category.trim();

  const handleUserChanged = (user: UserObject, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        users: [...prev.users, user],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        users: prev.users.filter((thisUser) => thisUser.id !== user.id),
      }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (buttonDisabled) return;
    onSubmit(
      formData.channelName.trim(),
      formData.category.trim(),
      formData.channelType
    );
    // Reset form
    setFormData({
      channelType: 'text',
      channelName: '',
      category: suggestedCategory || 'KOMUNITAS',
      users: [],
    });
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-fade-in'>
      <div className='bg-[#313338] border border-[#2b2d31] w-full max-w-md rounded-lg shadow-2xl overflow-hidden text-gray-200'>
        <div className='flex items-center justify-between p-4 border-b border-[#1f2023] bg-[#2b2d31]'>
          <h2 className='text-lg font-semibold text-gray-100 font-sans'>Tambah Saluran Baru</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-md transition text-gray-400 hover:text-gray-100 cursor-pointer">
            <CloseMark className='w-5 h-5' />
          </button>
        </div>
        
        <form onSubmit={handleFormSubmit} className='p-4 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-left'>
          {/* Channel Type Choice */}
          <div className='space-y-2'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-gray-400 font-mono'>Tipe Saluran</h3>
            
            {/* Text Type */}
            <label className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition select-none ${
              formData.channelType === 'text' 
                ? 'bg-gray-800/60 border-cyan-500/50 text-gray-100' 
                : 'bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800/30'
            }`}>
              <span className='text-2xl text-gray-500 font-mono select-none w-5 text-center'>#</span>
              <div className="flex-1 min-w-0">
                <p className='text-sm font-semibold text-gray-200 font-sans'>Teks</p>
                <p className='text-[11px] text-gray-500 truncate font-sans'>
                  Kirim pesan, gambar, emoji, dan pendapat murni.
                </p>
              </div>
              <input
                type='radio'
                name='channelType'
                value='text'
                checked={formData.channelType === 'text'}
                onChange={() => setFormData({ ...formData, channelType: 'text' })}
                className="text-cyan-500 focus:ring-cyan-500 border-gray-600 bg-gray-900 cursor-pointer"
              />
            </label>
            
            {/* Voice Type */}
            <label className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition select-none ${
              formData.channelType === 'voice' 
                ? 'bg-gray-800/60 border-cyan-500/50 text-gray-100' 
                : 'bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800/30'
            }`}>
              <Speaker className='text-gray-500 w-5 h-5 flex-shrink-0' />
              <div className="flex-1 min-w-0">
                <p className='text-sm font-semibold text-gray-200 font-sans'>Suara</p>
                <p className='text-[11px] text-gray-500 truncate font-sans'>
                  Ngobrol asyik mabar, layar share, dan bercanda gurau.
                </p>
              </div>
              <input
                type='radio'
                name='channelType'
                value='voice'
                checked={formData.channelType === 'voice'}
                onChange={() => setFormData({ ...formData, channelType: 'voice' })}
                className="text-cyan-500 focus:ring-cyan-500 border-gray-600 bg-gray-900 cursor-pointer"
              />
            </label>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5 text-left">
            <label className='text-xs font-bold uppercase tracking-wider text-gray-400 font-mono' htmlFor='channelName'>
              Nama Saluran
            </label>
            <div className='flex items-center bg-[#1e1f22] border border-gray-700 rounded-md focus-within:border-cyan-500/50 overflow-hidden'>
              <span className='text-lg px-2 text-gray-500 font-mono select-none'>#</span>
              <input
                type='text'
                id='channelName'
                name='channelName'
                placeholder="misal: info-mabar"
                value={formData.channelName}
                onChange={(e) =>
                  setFormData({ ...formData, channelName: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
                className="w-full bg-transparent border-0 text-sm text-gray-100 focus:ring-0 py-2 outline-none"
                required
              />
            </div>
          </div>

          {/* Category Input */}
          <div className="space-y-1.5 text-left">
            <label className='text-xs font-bold uppercase tracking-wider text-gray-400 font-mono' htmlFor='category'>
              Kategori
            </label>
            <div className='flex items-center bg-[#1e1f22] border border-gray-700 rounded-md focus-within:border-cyan-500/50 overflow-hidden'>
              <span className='text-xs px-2 text-gray-500 font-mono select-none'>📁</span>
              <input
                type='text'
                id='category'
                name='category'
                placeholder="misal: Komunitas"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-transparent border-0 text-sm text-gray-100 focus:ring-0 py-2 outline-none"
                required
              />
            </div>
          </div>

          {/* User Multi Select */}
          {usersList.length > 0 && (
            <div className="space-y-1.5 text-left">
              <h2 className='text-xs font-bold uppercase tracking-wider text-gray-400 font-mono'>
                Batasi Akses Anggota (Opsional)
              </h2>
              <div className='max-h-36 overflow-y-auto bg-[#1e1f22] border border-gray-700 rounded-md p-1.5 custom-scrollbar'>
                {usersList.map((user) => (
                  <UserRow user={user} userChanged={handleUserChanged} key={user.id} />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className='flex space-x-3 items-center justify-end pt-3 border-t border-gray-800'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-semibold text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded transition cursor-pointer'
            >
              Batal
            </button>
            <button
              type='submit'
              disabled={buttonDisabled}
              className={`bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm rounded py-2 px-4 transition cursor-pointer ${
                buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Buat Saluran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
