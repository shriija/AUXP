import React, { useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';

export default function DeleteReasonModal({ isOpen, onClose, onSubmit, title = "Delete Content", placeholder = "Enter reason for deletion..." }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please state a reason.');
      return;
    }
    setError('');
    onSubmit(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-4 border-slate-900 shadow-neo max-w-md w-full mx-4 overflow-hidden relative font-mono">
        {/* Header */}
        <div className="bg-red-500 text-white px-4 py-3 border-b-4 border-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            <span className="font-extrabold text-sm uppercase tracking-wider">{title}</span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 hover:bg-black/10 border border-transparent hover:border-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-slate-700">Reason for Administrative Action *</label>
            <p className="text-[10px] text-slate-500">This explanation will be logged and sent directly to the user's notifications.</p>
          </div>

          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError('');
            }}
            placeholder={placeholder}
            className="w-full bg-slate-50 border-2 border-slate-900 p-3 text-xs font-bold outline-none focus:bg-white focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all shadow-neo-sm placeholder:text-slate-400 text-slate-800 min-h-[100px]"
            required
          />

          {error && (
            <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 uppercase animate-shake">
              ⚠️ {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-slate-900 font-extrabold text-xs uppercase bg-white hover:bg-slate-50 active:translate-y-[1px] shadow-neo-sm hover:shadow-none transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border-2 border-slate-900 font-extrabold text-xs uppercase bg-red-500 text-white hover:bg-red-600 active:translate-y-[1px] shadow-neo-sm hover:shadow-none transition-all"
            >
              Confirm Deletion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
