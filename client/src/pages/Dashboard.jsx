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
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-900 uppercase">AUXP VAULT</h1>
          <p className="text-sm font-semibold text-slate-600">Discover and share collaborative study resources.</p>
        </div>
        <button onClick={() => setIsUploadOpen(true)} className="bg-primary text-white hover:bg-primary/95 px-4.5 py-2.5 rounded-none font-bold flex items-center gap-2 border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-neo-sm transition-all text-xs">
          <Upload className="w-4 h-4" />
          UPLOAD NOTES
        </button>
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={fetchResources} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar - Gamification Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#cbe3db] border-2 border-slate-900 rounded-none p-6 shadow-neo font-mono relative">
            <div className="absolute -top-3 left-4 bg-[#ffb800] px-2 py-0.5 text-[9px] text-slate-950 border-2 border-slate-900 uppercase font-bold">
              USER_STATS
            </div>
            <div className="flex items-center gap-4 mb-4 mt-2">
              <div className="h-12 w-12 rounded-none bg-white flex items-center justify-center border-2 border-slate-900 text-lg font-extrabold text-primary shadow-neo-sm">
                {user?.level}
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">LEVEL {user?.level}</p>
                <p className="text-[10px] font-bold text-slate-700">{user?.xp} TOTAL XP</p>
              </div>
            </div>
            <div className="w-full bg-white border-2 border-slate-900 rounded-none h-4 mb-2 overflow-hidden">
              <div className="bg-primary h-full border-r-2 border-slate-900" style={{ width: `${(user?.xp % 100)}%` }}></div>
            </div>
            <p className="text-[9px] font-bold text-slate-700 text-right">{100 - (user?.xp % 100)} XP TO NEXT LEVEL</p>
          </div>
        </div>

        {/* Main Feed - Resources */}
        <div className="lg:col-span-3">
          <div className="bg-white border-2 border-slate-900 rounded-none shadow-neo overflow-hidden min-h-[500px]">
            {/* Category Tabs */}
            <div className="p-4 border-b-2 border-slate-900 bg-[#cbe3db]/55 sticky top-0 z-10 flex gap-3 overflow-x-auto">
              {['All', 'Class Notes', 'Past Papers', 'Resources'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => { setCategory(cat); setYear(''); }}
                  className={`px-4 py-1.5 rounded-none text-xs font-bold border-2 border-slate-900 shadow-neo-sm whitespace-nowrap transition-all ${category === cat || (!category && cat === 'All') ? 'bg-primary text-white' : 'bg-white text-slate-800 hover:bg-slate-50 hover:translate-y-[1px] hover:shadow-none'}`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
            
            {/* Year Filters */}
            {category && category !== 'All' && (
              <div className="p-3 border-b-2 border-slate-900 bg-[#cbe3db]/20 flex gap-3 overflow-x-auto">
                {['Year I', 'Year II', 'Year III', 'Year IV'].map(y => (
                  <button 
                    key={y}
                    onClick={() => setYear(y)}
                    className={`px-3 py-1 rounded-none text-[10px] font-bold border-2 border-slate-900 shadow-neo-sm whitespace-nowrap transition-all ${year === y ? 'bg-[#1b355a] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    {y.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            
            {/* Search & Filters */}
            <div className="p-4 border-b-2 border-slate-900 bg-[#cbe3db]/10 flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                placeholder="SEARCH NOTES, TAGS..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-white border-2 border-slate-900 rounded-none px-3.5 py-2 text-xs font-bold outline-none focus:bg-slate-50 placeholder:text-slate-400"
              />
              <input 
                type="text" 
                placeholder="SUBJECT" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full md:w-32 bg-white border-2 border-slate-900 rounded-none px-3.5 py-2 text-xs font-bold outline-none focus:bg-slate-50 placeholder:text-slate-400"
              />
              <input 
                type="text" 
                placeholder="TOPIC" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full md:w-32 bg-white border-2 border-slate-900 rounded-none px-3.5 py-2 text-xs font-bold outline-none focus:bg-slate-50 placeholder:text-slate-400"
              />
            </div>
            
            <div className="p-6 space-y-5">
              {category && category !== 'All' && !year ? (
                <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-900 rounded-none bg-slate-50/50 font-bold text-sm">
                  <p>PLEASE SELECT AN ACADEMIC YEAR TO VIEW THESE RESOURCES.</p>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-900 rounded-none bg-slate-50/50 font-bold text-sm">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-700" />
                  <p>NO RESOURCES FOUND. BE THE FIRST TO UPLOAD!</p>
                </div>
              ) : (
                resources.map((resource, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={resource._id} 
                    className="flex gap-5 p-5 rounded-none border-2 border-slate-900 bg-white shadow-neo hover:translate-y-[1px] hover:shadow-neo-sm transition-all group"
                  >
                    {/* Voting Column */}
                    <div className="flex flex-col items-center gap-1.5 min-w-[48px] font-mono">
                      <button onClick={() => handleVote(resource._id, 'up')} className="p-1 rounded-none border-2 border-transparent hover:border-slate-900 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <span className="font-extrabold text-xs text-slate-800">{resource.upvotes - resource.downvotes}</span>
                      <button onClick={() => handleVote(resource._id, 'down')} className="p-1 rounded-none border-2 border-transparent hover:border-slate-900 hover:bg-red-50 text-slate-500 hover:text-red-700 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${resource.fileUrl}`} target="_blank" rel="noopener noreferrer" className="font-bold text-base text-slate-850 hover:text-primary transition-colors line-clamp-1 hover:underline">
                          {resource.title.toUpperCase()}
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold mb-4">
                        {resource.year && <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">{resource.year.toUpperCase()}</span>}
                        <span className="bg-teal-50 text-teal-800 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">{resource.subject.toUpperCase()}</span>
                        <span className="bg-pink-50 text-pink-850 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">{resource.topic.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                        <div className="h-6 w-6 rounded-none bg-white flex items-center justify-center text-[10px] text-primary font-extrabold border-2 border-slate-900 shadow-neo-sm">
                          {resource.uploadedBy?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>UPLOADED BY <span className="text-slate-800 font-bold">{resource.uploadedBy?.name?.toUpperCase()}</span></span>
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
