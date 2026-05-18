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
          <h1 className="text-4xl font-black tracking-tight mb-2 text-black">Vault Dashboard</h1>
          <p className="text-black/70 font-semibold">Discover and share collaborative study resources.</p>
        </div>
        <button onClick={() => setIsUploadOpen(true)} className="bg-primary text-black border-2 border-black px-4 py-2.5 rounded-neo font-bold flex items-center gap-2 transition-all shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm">
          <Upload className="w-5 h-5" />
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
          <div className="bg-secondary border-4 border-black rounded-neo p-6 shadow-neo relative overflow-hidden">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2 text-black">
              <Sparkles className="w-6 h-6 text-black fill-white" /> 
              Your Progress
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center border-4 border-black text-2xl font-black text-black shadow-neo-sm">
                {user?.level}
              </div>
              <div>
                <p className="font-black text-lg text-black">Level {user?.level}</p>
                <p className="text-sm font-bold text-black/70">{user?.xp} total XP</p>
              </div>
            </div>
            <div className="w-full bg-white rounded-full h-4 mb-2 overflow-hidden border-2 border-black">
              <div className="bg-primary h-4 border-r-2 border-black" style={{ width: `${(user?.xp % 100)}%` }}></div>
            </div>
            <p className="text-xs font-bold text-black/70 text-right">{100 - (user?.xp % 100)} XP to next level</p>
          </div>
        </div>

        {/* Main Feed - Resources */}
        <div className="lg:col-span-3">
          <div className="bg-white border-4 border-black rounded-neo shadow-neo overflow-hidden min-h-[500px]">
            {/* Category Tabs */}
            <div className="p-4 border-b-4 border-black bg-white sticky top-0 z-10 flex gap-4 overflow-x-auto">
              {['All', 'Class Notes', 'Past Papers', 'Resources'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => { setCategory(cat); setYear(''); }}
                  className={`px-5 py-2 rounded-neo text-black text-sm font-bold border-2 border-black whitespace-nowrap transition-transform ${category === cat || (!category && cat === 'All') ? 'bg-primary shadow-neo-sm translate-y-[2px]' : 'bg-white hover:bg-secondary/20'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Year Filters (only show if category is selected and not 'All') */}
            {category && category !== 'All' && (
              <div className="p-3 border-b-4 border-black bg-yellow-100 flex gap-4 overflow-x-auto">
                {['Year I', 'Year II', 'Year III', 'Year IV'].map(y => (
                  <button 
                    key={y}
                    onClick={() => setYear(y)}
                    className={`px-4 py-1.5 rounded-neo text-black text-xs font-black border-2 border-black whitespace-nowrap transition-transform ${year === y ? 'bg-black text-white shadow-neo-sm translate-y-[2px]' : 'bg-white hover:bg-black/10'}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
            
            {/* Search & Filters */}
            <div className="p-4 border-b-4 border-black bg-secondary/10 flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Search notes, tags..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-white border-2 border-black rounded-neo px-4 py-2 text-sm font-bold outline-none focus:shadow-neo-sm placeholder:text-black/40"
              />
              <input 
                type="text" 
                placeholder="Subject" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full md:w-32 bg-white border-2 border-black rounded-neo px-4 py-2 text-sm font-bold outline-none focus:shadow-neo-sm placeholder:text-black/40"
              />
              <input 
                type="text" 
                placeholder="Topic" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full md:w-32 bg-white border-2 border-black rounded-neo px-4 py-2 text-sm font-bold outline-none focus:shadow-neo-sm placeholder:text-black/40"
              />
            </div>
            
            <div className="p-6 space-y-5">
              {category && category !== 'All' && !year ? (
                <div className="text-center py-20 text-black/60 border-4 border-dashed border-black/20 rounded-neo mx-4 my-2 font-bold">
                  <p>Please select an academic year to view these resources.</p>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-black" />
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-20 text-black/60 border-4 border-dashed border-black/20 rounded-neo mx-4 my-2 font-bold">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-40 text-black" />
                  <p>No resources found. Be the first to upload!</p>
                </div>
              ) : (
                resources.map((resource, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={resource._id} 
                    className="flex gap-5 p-5 rounded-neo border-4 border-black bg-white shadow-neo hover:-translate-y-1 hover:shadow-neo-lg transition-all group"
                  >
                    {/* Voting Column */}
                    <div className="flex flex-col items-center gap-2 min-w-[48px]">
                      <button onClick={() => handleVote(resource._id, 'up')} className="p-2 border-2 border-transparent rounded-neo hover:border-black hover:bg-green-300 text-black transition-colors">
                        <ThumbsUp className="w-6 h-6" />
                      </button>
                      <span className="font-black text-lg text-black">{resource.upvotes - resource.downvotes}</span>
                      <button onClick={() => handleVote(resource._id, 'down')} className="p-2 border-2 border-transparent rounded-neo hover:border-black hover:bg-red-300 text-black transition-colors">
                        <ThumbsDown className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="font-black text-xl text-black hover:text-primary transition-colors line-clamp-1 hover:underline">
                          {resource.title}
                        </a>
                      </div>
                      <div className="flex gap-2 text-xs font-bold text-black mb-4">
                        {resource.year && <span className="bg-green-200 px-3 py-1 rounded-neo border-2 border-black">{resource.year}</span>}
                        <span className="bg-accent px-3 py-1 rounded-neo border-2 border-black">{resource.subject}</span>
                        <span className="bg-pink-200 px-3 py-1 rounded-neo border-2 border-black">{resource.topic}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-black/70">
                        <div className="h-7 w-7 rounded-full bg-secondary border-2 border-black flex items-center justify-center text-[12px] text-black font-black">
                          {resource.uploadedBy?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>Uploaded by <span className="text-black">{resource.uploadedBy?.name}</span></span>
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
