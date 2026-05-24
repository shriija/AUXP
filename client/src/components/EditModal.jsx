import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Edit3, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditModal({ isOpen, onClose, onEditSuccess, resource }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Resources');
  const [year, setYear] = useState('Year I');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (resource) {
      setTitle(resource.title || '');
      setCategory(resource.category || 'Resources');
      setYear(resource.year || 'Year I');
      setSubject(resource.subject || '');
      setTopic(resource.topic || '');
      setTags(resource.tags ? resource.tags.join(', ') : '');
      setError(null);
    }
  }, [resource, isOpen]);

  if (!isOpen || !resource) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.put(`/resources/${resource._id}`, {
        title,
        category,
        year,
        subject,
        topic,
        tags
      });
      
      onEditSuccess(); // Refresh lists
      onClose(); // Close modal
    } catch (err) {
      console.error(err);
      setError('Update failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-mono">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-none shadow-neo border-2 border-slate-900 overflow-hidden relative"
        >
          <div className="flex justify-between items-center p-5 border-b-2 border-slate-900 bg-[#cbe3db]/40">
            <h2 className="text-sm font-extrabold flex items-center gap-2 text-slate-850 uppercase">
              <Edit3 className="w-4 h-4 text-primary" />
              EDIT VAULT ITEM
            </h2>
            <button onClick={onClose} className="text-slate-700 hover:text-red-700 transition-colors p-1.5 rounded-none border-2 border-transparent hover:border-slate-900 hover:bg-slate-50 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none bg-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6">
            {error && <div className="bg-red-55 text-red-800 border border-slate-900 p-3 rounded-none mb-5 text-xs font-bold shadow-neo-sm">{error.toUpperCase()}</div>}
            
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold mb-1.5 text-slate-700">TITLE</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850 placeholder:text-slate-400" placeholder="e.g. Midterm Study Guide" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1.5 text-slate-700">CATEGORY</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850">
                    <option value="Class Notes">Class Notes</option>
                    <option value="Past Papers">Past Papers</option>
                    <option value="Resources">Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1.5 text-slate-700">ACADEMIC YEAR</label>
                  <select required value={year} onChange={e => setYear(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850">
                    <option value="Year I">Year I</option>
                    <option value="Year II">Year II</option>
                    <option value="Year III">Year III</option>
                    <option value="Year IV">Year IV</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1.5 text-slate-700">SUBJECT</label>
                  <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850 placeholder:text-slate-400" placeholder="e.g. Physics" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1.5 text-slate-700">TOPIC</label>
                  <input required type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850 placeholder:text-slate-400" placeholder="e.g. Kinematics" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1.5 text-slate-700">TAGS (COMMA SEPARATED)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850 placeholder:text-slate-400" placeholder="e.g. exam, summary, chapter 1" />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={onClose} className="px-5 py-2 rounded-none font-bold text-slate-700 bg-white border-2 border-slate-900 hover:bg-slate-50 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo-sm text-xs">CANCEL</button>
                <button type="submit" disabled={loading} className="bg-[#ffb800] text-slate-950 px-5 py-2 rounded-none border-2 border-slate-900 font-bold hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2 shadow-neo text-xs">
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
                  {loading ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
