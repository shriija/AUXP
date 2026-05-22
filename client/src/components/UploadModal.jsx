import { useState } from 'react';
import api from '../services/api';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Resources');
  const [year, setYear] = useState('Year I');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file to upload');
    
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('year', year);
      formData.append('subject', subject);
      formData.append('topic', topic);
      // Join tags as a comma separated string so backend can parse or store them
      formData.append('tags', tags);

      await api.post('/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onUploadSuccess(); // Refresh dashboard list
      onClose(); // Close modal
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please check your connection.');
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
              <UploadCloud className="w-4 h-4 text-primary" />
              UPLOAD TO VAULT
            </h2>
            <button onClick={onClose} className="text-slate-700 hover:text-red-700 transition-colors p-1.5 rounded-none border-2 border-transparent hover:border-slate-900 hover:bg-slate-50 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none bg-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6">
            {error && <div className="bg-red-50 text-red-750 border-2 border-slate-900 p-3 rounded-none mb-5 text-xs font-bold shadow-neo-sm">{error.toUpperCase()}</div>}
            
            <form onSubmit={handleUpload} className="space-y-5">
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
              <div>
                <label className="block text-[10px] font-bold mb-1.5 text-slate-700">FILE</label>
                <input required type="file" onChange={e => setFile(e.target.files[0])} className="w-full bg-white border-2 border-slate-900 text-xs text-slate-800 font-bold rounded-none px-3 py-2 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-none file:border-2 file:border-slate-900 file:text-[10px] file:font-bold file:bg-white file:text-slate-800 hover:file:bg-slate-50 transition-colors shadow-neo-sm" />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={onClose} className="px-5 py-2 rounded-none font-bold text-slate-700 bg-white border-2 border-slate-900 hover:bg-slate-50 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo-sm text-xs">CANCEL</button>
                <button type="submit" disabled={loading} className="bg-[#ffb800] text-slate-950 px-5 py-2 rounded-none border-2 border-slate-900 font-bold hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2 shadow-neo text-xs">
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
                  {loading ? 'SECURING UPLOAD...' : 'SUBMIT TO VAULT'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
