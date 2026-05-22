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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-neo shadow-neo border border-slate-200 overflow-hidden relative"
        >
          <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-primary/5">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-slate-800">
              <UploadCloud className="w-5 h-5 text-primary" />
              Upload to Vault
            </h2>
            <button onClick={onClose} className="text-slate-500 transition-colors p-1.5 rounded-neo hover:bg-slate-100 hover:text-slate-750">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-neo mb-5 text-xs font-semibold shadow-sm">{error}</div>}
            
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-655">Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700 placeholder:text-slate-400" placeholder="e.g. Midterm Study Guide" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-655">Category</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700">
                    <option value="Class Notes">Class Notes</option>
                    <option value="Past Papers">Past Papers</option>
                    <option value="Resources">Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-655">Academic Year</label>
                  <select required value={year} onChange={e => setYear(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700">
                    <option value="Year I">Year I</option>
                    <option value="Year II">Year II</option>
                    <option value="Year III">Year III</option>
                    <option value="Year IV">Year IV</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-655">Subject</label>
                  <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700 placeholder:text-slate-400" placeholder="e.g. Physics" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-655">Topic</label>
                  <input required type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700 placeholder:text-slate-400" placeholder="e.g. Kinematics" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-655">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700 placeholder:text-slate-400" placeholder="e.g. exam, summary, chapter 1" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-655">File</label>
                <input required type="file" onChange={e => setFile(e.target.files[0])} className="w-full bg-white border border-slate-200 text-sm text-slate-750 font-medium rounded-neo px-3 py-2 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-neo file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 transition-colors shadow-sm" />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={onClose} className="px-5 py-2 rounded-neo font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all shadow-sm">Cancel</button>
                <button type="submit" disabled={loading} className="bg-primary text-white px-5 py-2 rounded-neo font-bold hover:bg-primary/95 transition-all flex items-center gap-2 shadow-sm">
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  {loading ? 'Securing Upload...' : 'Submit to Vault'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
