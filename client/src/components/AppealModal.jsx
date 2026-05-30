import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';

export default function AppealModal({ isOpen, onClose, notification }) {
  const [appealText, setAppealText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !notification) return null;

  const getContentTypeFromMessage = (msg) => {
    if (!msg) return 'other';
    if (msg.toLowerCase().includes('forum post')) return 'post';
    if (msg.toLowerCase().includes('forum reply')) return 'reply';
    if (msg.toLowerCase().includes('vault resource')) return 'resource';
    if (msg.toLowerCase().includes('classroom')) return 'classroom';
    return 'other';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appealText.trim()) {
      setError('Please provide an appeal reason.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const contentType = getContentTypeFromMessage(notification.message);
      await api.post('/concerns', {
        concernType: 'ADMIN_APPEAL',
        text: appealText,
        contentType,
        contentId: notification.relatedItem
      });
      useToastStore.getState().addToast('APPEAL SUBMITTED SUCCESSFULLY!', 'success');
      setAppealText('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit appeal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-4 border-slate-900 shadow-neo max-w-md w-full mx-4 overflow-hidden relative font-mono text-left">
        {/* Header */}
        <div className="bg-[#ffb800] text-slate-950 px-4 py-3 border-b-4 border-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-extrabold text-sm uppercase tracking-wider">Appeal Moderation Action</span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 hover:bg-black/10 border border-transparent hover:border-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border-2 border-slate-900 p-3 text-xs leading-relaxed text-slate-700">
            <span className="font-extrabold uppercase text-slate-400 block mb-1 text-[9px]">Original Notification:</span>
            "{notification.message}"
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-slate-700">Your Appeal Justification *</label>
            <p className="text-[10px] text-slate-500">Explain why this deletion was unfair, a misunderstanding, or why the content should be restored.</p>
          </div>

          <textarea
            value={appealText}
            onChange={(e) => {
              setAppealText(e.target.value);
              if (e.target.value.trim()) setError('');
            }}
            placeholder="Type your explanation here..."
            className="w-full bg-slate-50 border-2 border-slate-900 p-3 text-xs font-bold outline-none focus:bg-white focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all shadow-neo-sm placeholder:text-slate-400 text-slate-800 min-h-[100px]"
            required
            disabled={loading}
          />

          {error && (
            <p className="text-[10px] font-bold text-red-650 bg-red-50 border border-red-200 px-2.5 py-1 uppercase animate-shake">
              ⚠️ {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-slate-900 font-extrabold text-xs uppercase bg-white hover:bg-slate-50 active:translate-y-[1px] shadow-neo-sm hover:shadow-none transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border-2 border-slate-900 font-extrabold text-xs uppercase bg-[#ffb800] text-slate-950 hover:bg-[#e0a200] active:translate-y-[1px] shadow-neo-sm hover:shadow-none transition-all flex items-center gap-1.5"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Appeal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
