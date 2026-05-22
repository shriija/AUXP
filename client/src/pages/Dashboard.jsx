import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { FileText, ThumbsUp, ThumbsDown, Loader2, Sparkles, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import UploadModal from '../components/UploadModal';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (category && category !== 'All' && !year) {
      setResources([]);
      return;
    }
    fetchResources();
  }, [category, year, search, subject, topic]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (year && category !== 'All') params.append('year', year);
      if (search) params.append('search', search);
      if (subject) params.append('subject', subject);
      if (topic) params.append('topic', topic);
      
      const res = await api.get(`/resources?${params.toString()}`);
      setResources(res.data);
    } catch (error) {
      console.error('Failed to fetch resources', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (resourceId, type) => {
    try {
      await api.post('/votes', { resourceId, type });
      // Reload resources to sync state
      fetchResources();
    } catch (error) {
      console.error('Voting failed', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-900">Vault Dashboard</h1>
          <p className="text-sm font-medium text-slate-500">Discover and share collaborative study resources.</p>
        </div>
        <button onClick={() => setIsUploadOpen(true)} className="bg-primary text-white hover:bg-primary/95 px-4 py-2.5 rounded-neo font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow">
          <Upload className="w-4 h-4" />
          Upload Notes
        </button>
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={fetchResources} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar - Gamification */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 border border-amber-200/60 rounded-neo p-6 shadow-sm relative overflow-hidden">
            <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2 text-amber-800">
              <Sparkles className="w-5 h-5 text-amber-600 fill-amber-500/20" /> 
              Your Progress
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center border border-amber-200 text-xl font-extrabold text-amber-700 shadow-sm">
                {user?.level}
              </div>
              <div>
                <p className="font-extrabold text-base text-amber-900">Level {user?.level}</p>
                <p className="text-xs font-semibold text-amber-800/80">{user?.xp} total XP</p>
              </div>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-3 mb-2 overflow-hidden border border-amber-200/50">
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full" style={{ width: `${(user?.xp % 100)}%` }}></div>
            </div>
            <p className="text-xs font-medium text-amber-800/80 text-right">{100 - (user?.xp % 100)} XP to next level</p>
          </div>
        </div>

        {/* Main Feed - Resources */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-neo shadow-neo overflow-hidden min-h-[500px]">
            {/* Category Tabs */}
            <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex gap-3 overflow-x-auto">
              {['All', 'Class Notes', 'Past Papers', 'Resources'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => { setCategory(cat); setYear(''); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${category === cat || (!category && cat === 'All') ? 'bg-primary text-white shadow-sm' : 'text-slate-650 hover:text-primary hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Year Filters (only show if category is selected and not 'All') */}
            {category && category !== 'All' && (
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex gap-3 overflow-x-auto">
                {['Year I', 'Year II', 'Year III', 'Year IV'].map(y => (
                  <button 
                    key={y}
                    onClick={() => setYear(y)}
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${year === y ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
            
            {/* Search & Filters */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/20 flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Search notes, tags..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-neo px-3.5 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
              />
              <input 
                type="text" 
                placeholder="Subject" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full md:w-32 bg-white border border-slate-200 rounded-neo px-3.5 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
              />
              <input 
                type="text" 
                placeholder="Topic" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full md:w-32 bg-white border border-slate-200 rounded-neo px-3.5 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
              />
            </div>
            
            <div className="p-6 space-y-5">
              {category && category !== 'All' && !year ? (
                <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-neo mx-4 my-2 font-medium">
                  <p>Please select an academic year to view these resources.</p>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-neo mx-4 my-2 font-medium">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-450" />
                  <p>No resources found. Be the first to upload!</p>
                </div>
              ) : (
                resources.map((resource, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={resource._id} 
                    className="flex gap-5 p-5 rounded-neo border border-slate-200 bg-white shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 transition-all group"
                  >
                    {/* Voting Column */}
                    <div className="flex flex-col items-center gap-1.5 min-w-[48px]">
                      <button onClick={() => handleVote(resource._id, 'up')} className="p-1.5 rounded-full hover:bg-emerald-50 text-slate-450 hover:text-emerald-600 transition-colors">
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <span className="font-extrabold text-sm text-slate-700">{resource.upvotes - resource.downvotes}</span>
                      <button onClick={() => handleVote(resource._id, 'down')} className="p-1.5 rounded-full hover:bg-red-50 text-slate-450 hover:text-red-600 transition-colors">
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${resource.fileUrl}`} target="_blank" rel="noopener noreferrer" className="font-bold text-lg text-slate-800 hover:text-primary transition-colors line-clamp-1 hover:underline">
                          {resource.title}
                        </a>
                      </div>
                      <div className="flex gap-2 text-xs font-semibold mb-4">
                        {resource.year && <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">{resource.year}</span>}
                        <span className="bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-100">{resource.subject}</span>
                        <span className="bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-100">{resource.topic}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] text-primary font-bold border border-indigo-100 shadow-sm">
                          {resource.uploadedBy?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>Uploaded by <span className="text-slate-700 font-semibold">{resource.uploadedBy?.name}</span></span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
