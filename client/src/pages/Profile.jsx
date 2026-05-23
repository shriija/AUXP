import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { FileText, Loader2, Sparkles, AlertCircle, ArrowLeft, RefreshCw, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, getMe } = useAuthStore();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, [user?._id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      await getMe(); // update user details from DB
      if (user?._id) {
        const res = await api.get(`/resources?uploadedBy=${user._id}&includeDeleted=true`);
        setUploads(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile uploads', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource? This will deduct 40 XP.')) return;
    try {
      setActionLoading(resourceId);
      await api.delete(`/resources/${resourceId}`);
      await getMe(); // sync XP
      // Refresh local uploads list
      const res = await api.get(`/resources?uploadedBy=${user._id}&includeDeleted=true`);
      setUploads(res.data);
    } catch (error) {
      console.error('Failed to delete resource', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to restore / re-upload this resource? This will add 40 XP back.')) return;
    try {
      setActionLoading(resourceId);
      await api.post(`/resources/${resourceId}/restore`);
      await getMe(); // sync XP
      // Refresh local uploads list
      const res = await api.get(`/resources?uploadedBy=${user._id}&includeDeleted=true`);
      setUploads(res.data);
    } catch (error) {
      console.error('Failed to restore resource', error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-primary transition-colors font-mono">
          <ArrowLeft className="w-4 h-4" />
          BACK TO DASHBOARD
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-900 uppercase">STUDENT PROFILE</h1>
        <p className="text-sm font-semibold text-slate-600">Review your stats, accomplishments, and uploaded vault items.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: User Profile Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#cbe3db] border-2 border-slate-900 rounded-none p-6 shadow-neo font-mono relative">
            <div className="absolute -top-3 left-4 bg-[#ffb800] px-2 py-0.5 text-[9px] text-slate-950 border-2 border-slate-900 uppercase font-bold">
              USER_OVERVIEW
            </div>
            
            <div className="flex flex-col items-center text-center mt-4 mb-6">
              <div className="h-20 w-20 rounded-none bg-white flex items-center justify-center text-3xl font-black text-primary border-4 border-slate-900 shadow-neo mb-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">{user?.name}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{user?.email}</p>
            </div>

            <div className="border-t-2 border-slate-900/10 pt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-800">
                  <span>LEVEL {user?.level}</span>
                  <span>{user?.xp} TOTAL XP</span>
                </div>
                <div className="w-full bg-white border-2 border-slate-900 rounded-none h-4 overflow-hidden">
                  <div className="bg-primary h-full border-r-2 border-slate-900" style={{ width: `${(user?.xp || 0) % 100}%` }}></div>
                </div>
                <p className="text-[9px] font-bold text-slate-600 text-right mt-1">
                  {100 - ((user?.xp || 0) % 100)} XP TO NEXT LEVEL
                </p>
              </div>

              <div className="bg-white border-2 border-slate-900 p-3 rounded-none">
                <p className="text-[9px] font-bold text-slate-400 mb-1">XP BREAKDOWN</p>
                <div className="flex justify-between text-[10px] font-bold text-slate-850">
                  <span>NOTES UPLOADED</span>
                  <span>{uploads.filter(u => !u.isDeleted).length} ACTIVE</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>SOFT DELETED</span>
                  <span>{uploads.filter(u => u.isDeleted).length} ITEMS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Uploaded Resources Management */}
        <div className="lg:col-span-3">
          <div className="bg-white border-2 border-slate-900 rounded-none shadow-neo overflow-hidden min-h-[500px]">
            <div className="p-4 border-b-2 border-slate-900 bg-[#cbe3db]/55 sticky top-0 z-10 flex justify-between items-center font-mono">
              <span className="text-xs font-extrabold uppercase">MY VAULT UPLOADS ({uploads.length})</span>
              <button 
                onClick={fetchProfileData} 
                className="p-1 border border-slate-900 bg-white hover:bg-slate-50 transition-colors shadow-neo-sm hover:translate-y-[1px] hover:shadow-none"
                title="Refresh List"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : uploads.length === 0 ? (
                <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-900 rounded-none bg-slate-50/50 font-bold text-xs uppercase font-mono">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-700" />
                  <p className="mb-2">You haven't uploaded any study materials yet.</p>
                  <Link to="/dashboard" className="mt-4 inline-block bg-primary text-white border-2 border-slate-900 px-4 py-1.5 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all text-[10px] font-bold">
                    UPLOAD YOUR FIRST RESOURCE
                  </Link>
                </div>
              ) : (
                uploads.map((upload) => (
                  <div 
                    key={upload._id}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-2 border-slate-900 font-mono transition-all shadow-neo-sm relative ${upload.isDeleted ? 'bg-slate-50/70 border-dashed opacity-80' : 'bg-white hover:translate-y-[1px] hover:shadow-none'}`}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {upload.isDeleted ? (
                          <span className="bg-red-50 text-red-750 px-2 py-0.5 border border-slate-900 text-[8px] font-bold shadow-neo-sm uppercase">DELETED</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-slate-900 text-[8px] font-bold shadow-neo-sm uppercase">ACTIVE</span>
                        )}
                        <span className="text-[10px] font-bold text-slate-500">{upload.category.toUpperCase()}</span>
                      </div>

                      <h3 className={`font-extrabold text-sm uppercase tracking-tight line-clamp-1 ${upload.isDeleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {upload.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                        {upload.year && <span className="bg-emerald-50/40 text-emerald-900 px-1.5 py-0.2 border border-slate-900/30">{upload.year.toUpperCase()}</span>}
                        <span className="bg-teal-50/40 text-teal-900 px-1.5 py-0.2 border border-slate-900/30">{upload.subject.toUpperCase()}</span>
                        <span className="bg-pink-50/40 text-pink-900 px-1.5 py-0.2 border border-slate-900/30">{upload.topic.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:self-center shrink-0">
                      {!upload.isDeleted && (
                        <a 
                          href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${upload.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-slate-50 hover:bg-slate-100 text-slate-800 p-2 border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 text-[9px] font-bold"
                          title="View Uploaded File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          VIEW
                        </a>
                      )}
                      
                      {upload.isDeleted ? (
                        <button
                          disabled={actionLoading === upload._id}
                          onClick={() => handleRestoreResource(upload._id)}
                          className="bg-emerald-55 hover:bg-emerald-100 text-emerald-800 px-3 py-2 border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading === upload._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          RESTORE
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading === upload._id}
                          onClick={() => handleDeleteResource(upload._id)}
                          className="bg-red-55 hover:bg-red-100 text-red-800 px-3 py-2 border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 text-[9px] font-bold cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading === upload._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          DELETE
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
