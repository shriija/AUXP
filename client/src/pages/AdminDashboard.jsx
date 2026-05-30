import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { useAuthStore } from '../store/useAuthStore';
import { FileText, MessageSquare, Users, Check, X, ShieldAlert, FileDown, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [pendingData, setPendingData] = useState({ resources: [], posts: [], replies: [], classrooms: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources');
  const [concerns, setConcerns] = useState([]);
  
  // Rejection modal/state
  const [rejectingItem, setRejectingItem] = useState(null); // { id, type, title }
  const [rejectionReason, setRejectionReason] = useState('');

  const getItemType = (tabId) => {
    if (tabId === 'replies') return 'reply';
    return tabId.slice(0, -1);
  };

  useEffect(() => {
    fetchPending();
    fetchConcerns();
  }, []);

  const fetchConcerns = async () => {
    try {
      const res = await api.get('/concerns');
      setConcerns(res.data.concerns || []);
    } catch (error) {
      console.error('Failed to fetch concerns', error);
      useToastStore.getState().addToast('FAILED TO FETCH USER CONCERNS', 'error');
    }
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/pending');
      setPendingData(res.data);
    } catch (error) {
      console.error('Failed to fetch pending items', error);
      useToastStore.getState().addToast('FAILED TO FETCH PENDING QUEUE', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveConcern = async (concernId) => {
    try {
      await api.put(`/concerns/${concernId}/resolve`);
      useToastStore.getState().addToast('CONCERN RESOLVED!', 'success');
      fetchConcerns();
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('FAILED TO RESOLVE CONCERN', 'error');
    }
  };

  const handleApprove = async (itemId, itemType) => {
    try {
      await api.post('/admin/approve', { itemId, itemType });
      useToastStore.getState().addToast(`${itemType.toUpperCase()} APPROVED!`, 'success');
      fetchPending();
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('FAILED TO APPROVE ITEM', 'error');
    }
  };

  const initiateReject = (itemId, itemType, itemTitle) => {
    setRejectingItem({ id: itemId, type: itemType, title: itemTitle });
    setRejectionReason('');
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      useToastStore.getState().addToast('REJECTION REASON IS REQUIRED', 'error');
      return;
    }

    try {
      await api.post('/admin/reject', {
        itemId: rejectingItem.id,
        itemType: rejectingItem.type,
        rejectionReason: rejectionReason.trim()
      });
      useToastStore.getState().addToast(`${rejectingItem.type.toUpperCase()} REJECTED`, 'info');
      setRejectingItem(null);
      fetchPending();
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('FAILED TO REJECT ITEM', 'error');
    }
  };

  const getActiveList = () => {
    if (activeTab === 'resources') return pendingData.resources;
    if (activeTab === 'posts') return pendingData.posts;
    if (activeTab === 'replies') return pendingData.replies;
    if (activeTab === 'classrooms') return pendingData.classrooms;
    if (activeTab === 'concerns') return concerns;
    return [];
  };

  const tabs = [
    { id: 'resources', label: 'Vault Uploads', icon: FileText, count: pendingData.resources?.length || 0 },
    { id: 'posts', label: 'Forum Questions', icon: ShieldAlert, count: pendingData.posts?.length || 0 },
    { id: 'replies', label: 'Forum Replies', icon: MessageSquare, count: pendingData.replies?.length || 0 },
    { id: 'classrooms', label: 'Classrooms', icon: Users, count: pendingData.classrooms?.length || 0 },
    { id: 'concerns', label: 'Concerns', icon: AlertTriangle, count: concerns.filter(c => c.status === 'pending').length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 uppercase flex items-center gap-2">
            🛡️ ADMIN MODERATION PANEL
          </h1>
          <p className="text-sm font-semibold text-slate-650 uppercase">
            Review, approve, or reject user-submitted content. XP & Notifications are sent on approval.
          </p>
        </div>
        <div className="bg-[#ffb800] border-2 border-slate-900 shadow-neo px-4 py-2 font-bold text-xs uppercase text-slate-950">
          Admin: {user?.name}
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 border-b-2 border-slate-900 pb-6 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-none font-bold text-xs border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2.5 w-full ${
                isActive 
                  ? 'bg-primary text-white shadow-none translate-y-[1px]' 
                  : 'bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="uppercase tracking-wider">{tab.label}</span>
              <span className={`px-2 py-0.5 text-[10px] font-black border border-slate-900 shrink-0 ${isActive ? 'bg-white text-primary' : 'bg-slate-100 text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main moderator queue */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : getActiveList().length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-900 rounded-none bg-slate-50/50 font-bold text-sm">
          <Check className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-700" />
          <p className="uppercase">ALL CLEAR! NO PENDING SUBMISSIONS IN THIS CATEGORY.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {getActiveList().map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-white border-2 border-slate-900 rounded-none shadow-neo p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Meta info */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2.5 mb-3.5 text-[10px] font-bold text-slate-500 uppercase">
                    <span>
                      Submitted by: <strong className="text-slate-800">{item.uploadedBy?.name || item.author?.name || item.creator?.name || item.sender?.name || 'Anonymous'}</strong>
                    </span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Render based on tab type */}
                  {activeTab === 'resources' && (
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{item.title?.toUpperCase()}</h3>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-bold">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-1.5 py-0.5">{item.category?.toUpperCase()}</span>
                        <span className="bg-teal-50 text-teal-800 border border-teal-300 px-1.5 py-0.5">{item.year?.toUpperCase()}</span>
                        <span className="bg-pink-50 text-pink-800 border border-pink-300 px-1.5 py-0.5">{item.subject?.toUpperCase()}</span>
                      </div>
                      {item.fileUrl && (
                        <div className="flex gap-2 pt-2.5">
                          <a
                            href={item.fileUrl.startsWith('http') ? item.fileUrl : `http://localhost:5000${item.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#d0ebff] hover:bg-[#d0ebff]/90 border border-slate-900 px-2 py-1 text-[9px] font-black text-[#228be6] flex items-center gap-1 hover:translate-y-[1px] transition-all shadow-neo-sm hover:shadow-none"
                          >
                            <Eye className="w-3 h-3" /> PREVIEW NOTES
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'posts' && (
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{item.title?.toUpperCase()}</h3>
                      <p className="text-xs text-slate-650 font-medium whitespace-pre-wrap leading-normal line-clamp-4 bg-slate-50 border border-slate-200 p-2.5">
                        {item.description}
                      </p>
                      {item.imageUrl && (
                        <div className="mt-2 max-w-sm">
                          <img 
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                            alt="Post Attachment Review" 
                            className="border-2 border-slate-900 max-h-32 object-cover shadow-neo-sm" 
                          />
                        </div>
                      )}
                      {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map(tag => (
                            <span key={tag} className="bg-slate-100 text-slate-700 text-[8px] font-extrabold border border-slate-300 px-1">
                              #{tag.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'replies' && (
                    <div className="space-y-2">
                      <div className="bg-slate-150 border border-slate-300 p-2 text-[9px] font-black text-slate-650 uppercase">
                        Question: {item.post?.title || 'Unknown Post'} (by {item.post?.author?.name})
                      </div>
                      <p className="text-xs text-slate-650 font-medium whitespace-pre-wrap leading-normal line-clamp-4 bg-slate-50 border border-slate-200 p-2.5">
                        {item.content}
                      </p>
                      {item.imageUrl && (
                        <div className="mt-2 max-w-sm">
                          <img 
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                            alt="Reply Attachment Review" 
                            className="border-2 border-slate-900 max-h-32 object-cover shadow-neo-sm" 
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'classrooms' && (
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{item.name?.toUpperCase()}</h3>
                      <p className="text-xs text-slate-650 font-medium leading-normal bg-slate-50 border border-slate-200 p-2.5">
                        {item.description || 'No description provided.'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-bold">
                        <span className="bg-violet-50 text-violet-850 border border-violet-300 px-1.5 py-0.5">
                          {item.isPrivate ? '🔒 PRIVATE' : '🌍 PUBLIC'}
                        </span>
                        <span className="bg-orange-50 text-orange-850 border border-orange-300 px-1.5 py-0.5">
                          ⏱️ {item.duration} MINS
                        </span>
                        <span className="bg-blue-50 text-blue-800 border border-blue-300 px-1.5 py-0.5">
                          STATUS: {item.sessionStatus?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'concerns' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5">
                        <span className="text-[10px] font-black uppercase text-slate-700">
                          TYPE: {item.concernType?.split('_').join(' ')}
                        </span>
                        <span className={`px-2 py-0.5 text-[8px] font-black border ${
                          item.status === 'resolved' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-red-50 text-red-800 border-red-300 animate-pulse'
                        }`}>
                          {item.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-650 font-medium whitespace-pre-wrap leading-normal bg-slate-50 border border-slate-200 p-2.5">
                        {item.text}
                      </p>
                      {item.sender && (
                        <div className="text-[9px] font-bold text-slate-500 bg-slate-100/50 p-2 border border-dashed border-slate-200 uppercase space-y-0.5">
                          <div>Sender: {item.sender.name} ({item.sender.email})</div>
                          <div>Dept: {item.sender.department || 'N/A'} • Level: {item.sender.level} • XP: {item.sender.xp}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Moderate Buttons */}
                {activeTab === 'concerns' ? (
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-5">
                    {item.status === 'pending' ? (
                      <button
                        onClick={() => handleResolveConcern(item._id)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 text-xs rounded-none border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 uppercase"
                      >
                        <Check className="w-4 h-4" /> Resolve Concern
                      </button>
                    ) : (
                      <span className="flex-1 text-center py-1.5 bg-slate-100 text-slate-500 text-xs font-black uppercase border border-slate-300">
                        Resolved
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-5">
                    <button
                      onClick={() => handleApprove(item._id, getItemType(activeTab))}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 text-xs rounded-none border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" /> APPROVE
                    </button>
                    <button
                      onClick={() => initiateReject(item._id, getItemType(activeTab), item.title || item.name || (activeTab === 'replies' ? 'Reply content' : 'Submission'))}
                      className="flex-1 bg-red-500 hover:bg-red-650 text-white font-bold py-1.5 text-xs rounded-none border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" /> REJECT
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reject Modal dialog */}
      {rejectingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white border-4 border-slate-900 p-6 max-w-md w-full shadow-neo font-mono relative"
          >
            <button
              type="button"
              onClick={() => setRejectingItem(null)}
              className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 border-2 border-transparent hover:border-slate-900 p-0.5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-base font-extrabold uppercase text-red-600 mb-2 flex items-center gap-2">
              ⚠️ Reject Submission
            </h3>
            
            <div className="bg-slate-50 border border-slate-200 p-3 mb-4 text-[10px] text-slate-650 font-bold uppercase truncate">
              {rejectingItem.type}: "{rejectingItem.title}"
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold mb-1.5 text-slate-700 uppercase">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State the reason clearly. The submitter will receive this as feedback..."
                className="w-full bg-white border-2 border-slate-900 rounded-none px-3.5 py-2 text-xs font-semibold leading-relaxed outline-none focus:bg-slate-50 text-slate-800"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-red-600 text-white font-bold py-2 text-xs border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all uppercase"
              >
                Confirm Reject
              </button>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 text-xs border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all uppercase"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
