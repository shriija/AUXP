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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-neo shadow-neo border-4 border-black overflow-hidden relative"
        >
          <div className="flex justify-between items-center p-6 border-b-4 border-black bg-primary">
            <h2 className="text-2xl font-black flex items-center gap-2 text-black">
              <UploadCloud className="w-6 h-6 text-black" />
              Upload to Vault
            </h2>
            <button onClick={onClose} className="text-black transition-colors p-1 rounded-neo border-2 border-transparent hover:border-black hover:bg-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            {error && <div className="bg-red-200 text-black border-2 border-black p-3 rounded-neo mb-5 text-sm font-bold shadow-neo-sm">{error}</div>}
            
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-black">Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-blue-50 transition-colors font-medium text-black placeholder:text-black/40" placeholder="e.g. Midterm Study Guide" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-black">Category</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-blue-50 transition-colors font-medium text-black">
                    <option value="Class Notes">Class Notes</option>
                    <option value="Past Papers">Past Papers</option>
                    <option value="Resources">Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-black">Academic Year</label>
                  <select required value={year} onChange={e => setYear(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-blue-50 transition-colors font-medium text-black">
                    <option value="Year I">Year I</option>
                    <option value="Year II">Year II</option>
                    <option value="Year III">Year III</option>
                    <option value="Year IV">Year IV</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-black">Subject</label>
                  <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-blue-50 transition-colors font-medium text-black placeholder:text-black/40" placeholder="e.g. Physics" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-black">Topic</label>
                  <input required type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-blue-50 transition-colors font-medium text-black placeholder:text-black/40" placeholder="e.g. Kinematics" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-black">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-blue-50 transition-colors font-medium text-black placeholder:text-black/40" placeholder="e.g. exam, summary, chapter 1" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-black">File</label>
                <input required type="file" onChange={e => setFile(e.target.files[0])} className="w-full bg-white border-2 border-black text-black font-medium rounded-neo px-4 py-2.5 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-neo file:border-2 file:border-black file:text-sm file:font-bold file:bg-accent file:text-black hover:file:translate-y-[1px] transition-colors shadow-neo-sm" />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-neo font-bold text-black bg-white border-2 border-black shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="bg-secondary text-black border-2 border-black px-6 py-2.5 rounded-neo font-black shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm transition-all flex items-center gap-2">
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
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
