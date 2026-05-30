import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { FileText, ThumbsUp, ThumbsDown, Loader2, Sparkles, Upload, Edit3, Bookmark, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import UploadModal from '../components/UploadModal';
import EditModal from '../components/EditModal';
import PreviewModal from '../components/PreviewModal';
import ConfirmModal from '../components/ConfirmModal';
import DeleteReasonModal from '../components/DeleteReasonModal';

export default function Dashboard() {
  const { user, token, getMe } = useAuthStore();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState(null);
  const [topic, setTopic] = useState('');
  const [myUploads, setMyUploads] = useState([]);
  const [adminDeleteTarget, setAdminDeleteTarget] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);

  useEffect(() => {
    if (category && category !== 'All' && !year) {
      setResources([]);
      return;
    }
    fetchResources();
  }, [category, year, search, subject, topic, showSavedOnly]);

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
      const currentUser = useAuthStore.getState().user;
      if (!currentUser?._id) return;
      const res = await api.get(`/resources?uploadedBy=${currentUser._id}&includeDeleted=true`);
      setMyUploads(res.data);
    } catch (error) {
      console.error('Failed to fetch user uploads', error);
    }
  };

  const handleDeleteResource = (resourceId) => {
    setConfirmDeleteId(resourceId);
  };

  const executeDeleteResource = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/resources/${confirmDeleteId}`);
      useToastStore.getState().addToast('RESOURCE DELETED!', 'info');
      fetchResources();
      fetchMyUploads();
      getMe();
    } catch (error) {
      console.error('Failed to delete resource', error);
      useToastStore.getState().addToast('FAILED TO DELETE RESOURCE', 'error');
    }
  };

  const handleRestoreResource = (resourceId) => {
    setConfirmRestoreId(resourceId);
  };

  const executeRestoreResource = async () => {
    if (!confirmRestoreId) return;
    try {
      await api.post(`/resources/${confirmRestoreId}/restore`);
      useToastStore.getState().addToast('RESOURCE RESTORED!', 'success');
      fetchResources();
      fetchMyUploads();
      getMe();
    } catch (error) {
      console.error('Failed to restore resource', error);
      useToastStore.getState().addToast('FAILED TO RESTORE RESOURCE', 'error');
    }
  };

  const handleAdminDeleteClick = (itemId, itemType) => {
    setAdminDeleteTarget({ itemId, itemType });
  };

  const executeAdminDelete = async (reason) => {
    if (!adminDeleteTarget) return;
    try {
      const { itemId, itemType } = adminDeleteTarget;
      await api.post('/admin/delete-content', { itemId, itemType, reason });
      useToastStore.getState().addToast('RESOURCE DELETED BY ADMIN!', 'info');
      setAdminDeleteTarget(null);
      fetchResources();
      fetchMyUploads();
    } catch (error) {
      console.error('Failed to admin-delete resource', error);
      useToastStore.getState().addToast('FAILED TO DELETE RESOURCE', 'error');
    }
  };

  const refreshPreviewResource = async (resourceId) => {
    try {
      const res = await api.get(`/resources/${resourceId}`);
      const upvotes = res.data.upvotes || 0;
      const downloads = res.data.downloadedBy ? res.data.downloadedBy.length : 0;
      const bookmarks = res.data.bookmarkedBy ? res.data.bookmarkedBy.length : 0;
      const score = (upvotes * 3) + downloads + bookmarks;
      setPreviewResource({
        ...res.data,
        downloadsCount: downloads,
        bookmarksCount: bookmarks,
        score
      });
    } catch (err) {
      console.error('Failed to refresh preview resource', err);
    }
  };

  const handleVote = async (resourceId, type) => {
    try {
      const res = await api.post('/votes', { resourceId, type });
      const { message } = res.data;
      if (message === 'Vote removed') {
        useToastStore.getState().addToast(type === 'up' ? 'UPVOTE REMOVED' : 'DOWNVOTE REMOVED', 'info');
      } else {
        useToastStore.getState().addToast(type === 'up' ? 'VOTED UP!' : 'VOTED DOWN!', 'success');
      }
      // Reload resources to sync state
      fetchResources();
      getMe();
      if (previewResource && previewResource._id === resourceId) {
        refreshPreviewResource(resourceId);
      }
    } catch (error) {
      console.error('Voting failed', error);
      useToastStore.getState().addToast('VOTING FAILED', 'error');
    }
  };

  const handleBookmark = async (resourceId) => {
    try {
      const res = await api.post(`/resources/${resourceId}/bookmark`);
      useToastStore.getState().addToast(
        res.data.bookmarked ? 'SAVED TO LIBRARY!' : 'REMOVED FROM LIBRARY',
        res.data.bookmarked ? 'success' : 'info'
      );
      fetchResources();
      if (previewResource && previewResource._id === resourceId) {
        refreshPreviewResource(resourceId);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      useToastStore.getState().addToast('FAILED TO SAVE NOTE', 'error');
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
            <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
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
                              className="bg-red-100 hover:bg-red-200 text-red-700 px-1.5 py-0.5 text-[8px] font-bold border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                              title="Delete"
                            >
                              DELETE
                            </button>
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[8px] font-bold text-slate-500 uppercase">
                      <span>{upload.category}</span>
                      <span>•</span>
                      {upload.isDeleted ? (
                        <span className="text-red-600">DELETED</span>
                      ) : (
                        <>
                          {upload.approvalStatus === 'pending' && <span className="text-amber-600 bg-amber-50 px-1 border border-amber-500 rounded-none font-black animate-pulse">IN REVIEW</span>}
                          {upload.approvalStatus === 'rejected' && (
                            <span className="text-red-650 bg-red-50 px-1 border border-red-500 rounded-none font-black" title={`Rejection reason: ${upload.rejectionReason || 'No reason provided'}`}>
                              REJECTED (HOVER REASON)
                            </span>
                          )}
                          {upload.approvalStatus === 'approved' && <span className="text-emerald-700 bg-emerald-50 px-1 border border-emerald-500 rounded-none font-black">APPROVED</span>}
                        </>
                      )}
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
            <div className="p-4 border-b-2 border-slate-900 bg-[#cbe3db]/55 sticky top-0 z-10 flex gap-3 overflow-x-auto items-center">
              {['All', 'Class Notes', 'Past Papers', 'Resources'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => { setCategory(cat); setYear(''); setShowSavedOnly(false); }}
                  className={`px-4 py-1.5 rounded-none text-xs font-bold border-2 border-slate-900 shadow-neo-sm whitespace-nowrap transition-all ${!showSavedOnly && (category === cat || (!category && cat === 'All')) ? 'bg-primary text-white' : 'bg-white text-slate-800 hover:bg-slate-50 hover:translate-y-[1px] hover:shadow-none'}`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
              
              <button 
                onClick={() => {
                  setShowSavedOnly(!showSavedOnly);
                  setCategory('');
                  setYear('');
                }}
                className={`px-4 py-1.5 rounded-none text-xs font-bold border-2 border-slate-900 shadow-neo-sm whitespace-nowrap transition-all flex items-center gap-1 hover:translate-y-[1px] hover:shadow-none ${showSavedOnly ? 'bg-[#ffb800] text-slate-950' : 'bg-white text-slate-800 hover:bg-slate-50'}`}
              >
                ⭐ SAVED LIBRARY
              </button>
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
            
            <div className="p-6 space-y-5 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
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
                (showSavedOnly ? resources.filter(r => r.bookmarkedBy?.includes(user?._id)) : resources).map((resource, i) => (
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
                        <button 
                          onClick={() => {
                            setPreviewResource(resource);
                            setIsPreviewOpen(true);
                          }}
                          className="font-bold text-base text-slate-850 hover:text-primary transition-colors text-left line-clamp-1 hover:underline outline-none"
                        >
                          {resource.title.toUpperCase()}
                        </button>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {resource.approvalStatus === 'pending' && (
                            <span className="bg-amber-100 text-amber-800 border-2 border-slate-900 px-2 py-0.5 rounded-none shadow-neo-sm text-[9px] font-black uppercase whitespace-nowrap animate-pulse">
                              ⏳ IN REVIEW
                            </span>
                          )}
                          {resource.approvalStatus === 'rejected' && (
                            <span className="bg-red-100 text-red-800 border-2 border-slate-900 px-2 py-0.5 rounded-none shadow-neo-sm text-[9px] font-black uppercase whitespace-nowrap" title={`Reason: ${resource.rejectionReason}`}>
                              ❌ REJECTED
                            </span>
                          )}
                          <span className="bg-[#ffb800] text-slate-950 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm text-[9px] font-black uppercase whitespace-nowrap">
                            ⭐ QUALITY: {resource.score || 0}
                          </span>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleAdminDeleteClick(resource._id, 'resource')}
                              className="bg-red-500 text-white px-2.5 py-1 text-[10px] font-bold border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                              id={`admin-delete-resource-btn-${resource._id}`}
                            >
                              ADMIN DELETE
                            </button>
                          )}
                          {(resource.uploadedBy?._id === user?._id || resource.uploadedBy === user?._id) && (
                            <div className="flex items-center gap-1.5">
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
                                className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 text-[10px] font-bold border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                              >
                                DELETE
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold mb-4">
                        {resource.year && <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">{resource.year.toUpperCase()}</span>}
                        <span className="bg-teal-50 text-teal-800 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">{resource.subject.toUpperCase()}</span>
                        <span className="bg-pink-50 text-pink-850 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">{resource.topic.toUpperCase()}</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-900/10 pt-3 mt-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                          <div className="h-6 w-6 rounded-none bg-white flex items-center justify-center text-[10px] text-primary font-extrabold border-2 border-slate-900 shadow-neo-sm">
                            {resource.uploadedBy?.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>UPLOADED BY <span className="text-slate-800 font-bold">{resource.uploadedBy?.name?.toUpperCase()}</span></span>
                        </div>
                        
                        <div className="flex items-center gap-4 font-mono">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-650" title="Downloads">
                            <Download className="w-3.5 h-3.5" />
                            <span>{resource.downloadsCount || 0}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-650" title="Bookmarks">
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>{resource.bookmarksCount || 0}</span>
                          </div>

                          <button
                            onClick={() => handleBookmark(resource._id)}
                            className={`px-2.5 py-1 text-[9px] font-black border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1 cursor-pointer ${
                              resource.bookmarkedBy?.includes(user?._id)
                                ? 'bg-[#ffb800] text-slate-950'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Bookmark className="w-3 h-3 fill-current" />
                            {resource.bookmarkedBy?.includes(user?._id) ? 'SAVED' : 'SAVE FOR LATER'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
      
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewResource(null);
        }}
        resource={previewResource}
        user={user}
        token={token}
        onBookmark={handleBookmark}
        onVote={handleVote}
        onDownloadSuccess={() => {
          useToastStore.getState().addToast('STARTING DOWNLOAD...', 'info');
          setTimeout(() => {
            fetchResources();
            if (previewResource) {
              refreshPreviewResource(previewResource._id);
            }
          }, 1500);
        }}
      />
      
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={executeDeleteResource}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This will hide it from the library."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      
      <ConfirmModal
        isOpen={!!confirmRestoreId}
        onClose={() => setConfirmRestoreId(null)}
        onConfirm={executeRestoreResource}
        title="Restore Resource"
        message="Are you sure you want to restore / re-upload this resource to the library?"
        confirmText="Restore"
        cancelText="Cancel"
        type="success"
      />

      <DeleteReasonModal
        isOpen={!!adminDeleteTarget}
        onClose={() => setAdminDeleteTarget(null)}
        onSubmit={executeAdminDelete}
        title="Admin Delete Resource"
        placeholder="State reason for deleting this vault resource..."
      />
    </div>
  );
}
