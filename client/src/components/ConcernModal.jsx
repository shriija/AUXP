import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { X, ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_CONCERNS = [
  {
    type: 'FORUM_ABUSE',
    label: '🚨 Forum Abuse',
    description: 'Inappropriate posts, replies, or offensive language.',
    defaultText: 'I would like to report inappropriate content or behavior in the discussion forums.'
  },
  {
    type: 'NOTES_SPAM',
    label: '📁 Notes Spam',
    description: 'Spam, promotional advertisements, or plagiarism in Vault Notes.',
    defaultText: 'I would like to report spam, advertising, or plagiarism in the Shared Vault Notes uploads.'
  },
  {
    type: 'ROOM_TOXICITY',
    label: '👥 Room Toxicity',
    description: 'Harassment, toxic behavior, or disruption inside Study Classrooms.',
    defaultText: 'I would like to report disruptive, toxic, or inappropriate behavior inside study rooms.'
  },
  {
    type: 'TECH_BUG',
    label: '🐛 Tech Bug',
    description: 'Technical issue, interface glitch, or system error.',
    defaultText: 'I encountered a technical issue or bug on the platform: [Describe here]'
  }
];

export default function ConcernModal({ isOpen, onClose }) {
  const [selectedType, setSelectedType] = useState('CUSTOM');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedType('CUSTOM');
      setText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectQuickConcern = (concern) => {
    setSelectedType(concern.type);
    setText(concern.defaultText);
  };

  const handleSelectCustom = () => {
    setSelectedType('CUSTOM');
    setText('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      useToastStore.getState().addToast('PLEASE SPECIFY YOUR CONCERN TEXT', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/concerns', {
        concernType: selectedType,
        text: text.trim()
      });
      useToastStore.getState().addToast('CONCERN SUBMITTED TO ADMINS!', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      useToastStore.getState().addToast(
        err.response?.data?.message || 'FAILED TO SUBMIT CONCERN',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl rounded-none shadow-neo border-4 border-slate-900 overflow-hidden relative text-slate-900"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b-4 border-slate-900 bg-[#ffb800]">
            <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-wide">
              <ShieldAlert className="w-5 h-5" />
              🚨 Report a Concern
            </h2>
            <button
              onClick={onClose}
              className="text-slate-900 hover:bg-slate-900 hover:text-white transition-all p-1 border-2 border-slate-900 bg-white shadow-neo-sm hover:translate-y-[1px] hover:shadow-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <div className="bg-amber-50 border-2 border-amber-300 p-3 mb-5 flex gap-3 items-center text-xs font-bold text-amber-800">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>YOUR REPORT WILL BE REVIEWED BY AN ADMINISTRATOR. TOXICITY OR ABUSE RESOLUTION INVOLVES ACCOUNT AND UPLOAD SANCTIONS.</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quick Options */}
              <div>
                <label className="block text-[10px] font-black mb-3 text-slate-700 uppercase tracking-widest">
                  1-Click Default Concerns (Prefills description)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUICK_CONCERNS.map((c) => {
                    const isSelected = selectedType === c.type;
                    return (
                      <button
                        key={c.type}
                        type="button"
                        onClick={() => handleSelectQuickConcern(c)}
                        className={`text-left p-3 border-2 border-slate-900 transition-all font-mono shadow-neo-sm hover:translate-y-[1px] hover:shadow-none flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#cbe3db] translate-y-[1px] shadow-none'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-extrabold text-xs uppercase">{c.label}</span>
                        <span className="text-[9px] font-semibold text-slate-500 mt-1 leading-normal">
                          {c.description}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleSelectCustom}
                    className={`text-left p-3 border-2 border-slate-900 transition-all font-mono shadow-neo-sm hover:translate-y-[1px] hover:shadow-none flex flex-col justify-center ${
                      selectedType === 'CUSTOM'
                        ? 'bg-[#cbe3db] translate-y-[1px] shadow-none'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-extrabold text-xs uppercase">✍️ Custom Message</span>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1 leading-normal">
                      Write a customized concern from scratch.
                    </span>
                  </button>
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  Concern Details & Custom Text *
                </label>
                <textarea
                  required
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe your concern in detail. Please provide post titles, user names, or URLs if applicable so admins can quickly take action..."
                  className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-3 outline-none font-semibold text-xs leading-relaxed focus:bg-slate-50 placeholder:text-slate-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t-2 border-slate-900/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-none font-bold text-slate-700 bg-white border-2 border-slate-900 hover:bg-slate-50 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo-sm text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-500 text-white px-5 py-2.5 rounded-none border-2 border-slate-900 font-extrabold hover:bg-red-600 hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2 shadow-neo text-xs uppercase"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Submitting...' : 'Submit Concern'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
