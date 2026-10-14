import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  isDanger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const resolvedConfirmText = confirmText || (isId ? 'Konfirmasi' : 'Confirm');
  const resolvedCancelText = cancelText || (isId ? 'Batal' : 'Cancel');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl space-y-6 relative">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${
            isDanger ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 pr-6">
            <h3 className="text-lg font-extrabold text-white tracking-wide">{title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            {resolvedCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/30'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-900/30'
            }`}
          >
            {loading ? (isId ? 'Memproses...' : 'Processing...') : resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
