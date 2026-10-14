import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastNotifProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function ToastNotif({ toast, onClose }: ToastNotifProps) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[110] animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md max-w-md ${
          toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
            : toast.type === 'error'
            ? 'bg-red-950/90 border-red-500/30 text-red-300'
            : 'bg-blue-950/90 border-blue-500/30 text-blue-300'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />}
        {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-400" />}

        <span className="text-sm font-semibold tracking-wide flex-1">{toast.text}</span>

        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 opacity-70" />
        </button>
      </div>
    </div>
  );
}
