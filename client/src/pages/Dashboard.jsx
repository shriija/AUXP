import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { FileText, ThumbsUp, ThumbsDown, Loader2, Sparkles, Upload, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import UploadModal from '../components/UploadModal';
import EditModal from '../components/EditModal';

export default function Dashboard() {
  const { user, token, getMe } = useAuthStore();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [myUploads, setMyUploads] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (category && category !== 'All' && !year) {
      setResources([]);
      return;
    }
    fetchResources();
  }, [category, year, search, subject, topic]);

  useEffect(() => {
    if (user?._id) {
      fetchMyUploads();
    }
  }, [user?._id]);

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

  const fetchMyUploads = async () => {
    try {
      if (!user?._id) return;
      const res = await api.get(`/resources?uploadedBy=${user._id}&includeDeleted=true`);
      setMyUploads(res.data);
    } catch (error) {
      console.error('Failed to fetch user uploads', error);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/resources/${resourceId}`);
      useToastStore.getState().addToast('RESOURCE DELETED!', 'info');
      fetchResources();
      fetchMyUploads();
      getMe();
    } catch (error) {
      console.error('Failed to delete resource', error);
      useToastStore.getState().addToast('FAILED TO DELETE RESOURCE', 'error');
    }
  };

  const handleRestoreResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to re-upload / restore this resource?')) return;
    try {
      await api.post(`/resources/${resourceId}/restore`);
      useToastStore.getState().addToast('RESOURCE RESTORED!', 'success');
      fetchResources();
      fetchMyUploads();
      getMe();
    } catch (error) {
      console.error('Failed to restore resource', error);
      useToastStore.getState().addToast('FAILED TO RESTORE RESOURCE', 'error');
    }
  };

  const handleVote = async (resourceId, type) => {
    try {
      await api.post('/votes', { resourceId, type });
      useToastStore.getState().addToast(type === 'up' ? 'VOTED UP!' : 'VOTED DOWN!', 'success');
      // Reload resources to sync state
      fetchResources();
      getMe();
    } catch (error) {
      console.error('Voting failed', error);
      useToastStore.getState().addToast('VOTING FAILED', 'error');
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
        onUploadSuccess={() => {
          fetchResources();
          fetchMyUploads();
          getMe();
        }} 
      />

      <EditModal 
        isOpen={isEditOpen} 
        onClose={() => {
          setIsEditOpen(false);
          setSelectedResource(null);
        }}
        onEditSuccess={() => {
          fetchResources();
          fetchMyUploads();
        }}
        resource={selectedResource}
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

          {/* User Profile / My Uploads Section */}
          <div className="bg-[#cbe3db] border-2 border-slate-900 rounded-none p-6 shadow-neo font-mono relative">
            <div className="absolute -top-3 left-4 bg-[#1b355a] px-2 py-0.5 text-[9px] text-white border-2 border-slate-900 uppercase font-bold">
              MY_UPLOADS
            </div>
            <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {myUploads.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-500 uppercase">No uploads yet.</p>
              ) : (
                myUploads.map(upload => (
                  <div key={upload._id} className="flex flex-col border-b border-slate-900/10 pb-2 last:border-b-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase truncate max-w-[120px] ${upload.isDeleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {upload.title}
                      </span>
                      {upload.isDeleted ? (
                        (upload.uploadedBy?._id === user?._id || upload.uploadedBy === user?._id) && (
                          <button
                            onClick={() => handleRestoreResource(upload._id)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[8px] font-bold border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                            title="Re-upload"
                          >
                            RE-UPLOAD
                          </button>
                        )
                      ) : (
                        (upload.uploadedBy?._id === user?._id || upload.uploadedBy === user?._id) && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedResource(upload);
                                setIsEditOpen(true);
                              }}
                              className="bg-[#ffb800] hover:bg-[#e0a200] text-slate-950 px-1.5 py-0.5 text-[8px] font-bold border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                              title="Edit"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteResource(upload._id)}
                              className="bg-red-55 hover:bg-red-100 text-red-700 px-1.5 py-0.5 text-[8px] font-bold border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                              title="Delete"
                            >
                              DELETE
                            </button>
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[8px] font-bold text-slate-500 uppercase">
                      <span>{upload.category}</span>
                      <span>•</span>
                      <span className={upload.isDeleted ? 'text-red-600' : 'text-emerald-700'}>
                        {upload.isDeleted ? 'DELETED' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* XP Economy System Card */}
          <div className="bg-white border-2 border-slate-900 rounded-none p-4 shadow-neo font-mono relative">
            <button
              onClick={() => setShowRules(!showRules)}
              className="w-full text-left font-extrabold text-xs text-slate-900 uppercase flex justify-between items-center cursor-pointer outline-none"
            >
              <span>XP ECONOMY SYSTEM</span>
              <span>{showRules ? '▼' : '▶'}</span>
            </button>
            {showRules && (
              <div className="mt-3 border-t border-slate-200 pt-2 space-y-1.5 text-[9px] font-bold text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Upload Resource</span><span className="text-emerald-600">+40 XP</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Resource Upvoted</span><span className="text-emerald-600">+5 XP</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Forum Post Created</span><span className="text-emerald-600">+10 XP</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Forum Reply Posted</span><span className="text-emerald-600">+5 XP</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Forum Reply Upvoted</span><span className="text-emerald-600">+3 XP</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Classroom Created</span><span className="text-emerald-600">+20 XP</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Joined Classroom</span><span className="text-emerald-600">+5 XP</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-1"><span>Daily Login Streak</span><span className="text-emerald-600">+2 XP</span></div>
                <div className="flex justify-between"><span>Notes Downloaded (Other)</span><span className="text-emerald-600">+2 XP</span></div>
              </div>
            )}
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
                      <div className="flex items-start justify-between mb-2 gap-4">
                        <a 
                          href={`${import.meta.env.VITE_API_URL}/resources/${resource._id}/download?token=${token}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={() => useToastStore.getState().addToast('STARTING DOWNLOAD...', 'info')}
                          className="font-bold text-base text-slate-850 hover:text-primary transition-colors line-clamp-1 hover:underline"
                        >
                          {resource.title.toUpperCase()}
                        </a>
                        {(resource.uploadedBy?._id === user?._id || resource.uploadedBy === user?._id) && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setSelectedResource(resource);
                                setIsEditOpen(true);
                              }}
                              className="bg-[#ffb800] hover:bg-[#e0a200] text-slate-950 px-2.5 py-1 text-[10px] font-bold border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteResource(resource._id)}
                              className="bg-red-55 hover:bg-red-100 text-red-700 px-2.5 py-1 text-[10px] font-bold border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                            >
                              DELETE
                            </button>
                          </div>
                        )}
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
