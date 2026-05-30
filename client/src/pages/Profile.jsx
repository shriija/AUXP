import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { FileText, Loader2, Sparkles, AlertCircle, ArrowLeft, RefreshCw, Trash2, Eye, EyeOff, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import EditModal from '../components/EditModal';
import ConfirmModal from '../components/ConfirmModal';

function ActivityBreakdownChart({ counts }) {
  const categories = [
    { label: 'Uploads', val: counts.uploads, color: '#34d399' },
    { label: 'Downloads', val: counts.downloads, color: '#38bdf8' },
    { label: 'Forum Posts', val: counts.forumPosts, color: '#a855f7' },
    { label: 'Forum Replies', val: counts.forumReplies, color: '#ec4899' },
    { label: 'Classrooms', val: counts.classrooms, color: '#fb923c' }
  ];

  const width = 450;
  const height = 220;
  const chartHeight = 150;
  const chartWidth = 390;
  const maxVal = Math.max(...categories.map(c => c.val), 5);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[450px] mx-auto font-mono">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const y = 30 + ratio * chartHeight;
        const gridVal = Math.round(maxVal * (1 - ratio));
        return (
          <g key={idx}>
            <line x1="45" y1={y} x2={45 + chartWidth} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
            <text x="35" y={y + 4} textAnchor="end" className="text-[9px] font-bold fill-slate-400">{gridVal}</text>
          </g>
        );
      })}

      {categories.map((c, i) => {
        const barSpacing = chartWidth / categories.length;
        const x = 50 + i * barSpacing + (barSpacing - 40) / 2;
        const barHeight = (c.val / maxVal) * chartHeight;
        const y = 30 + chartHeight - barHeight;

        return (
          <g key={i}>
            {barHeight > 0 && (
              <rect x={x + 4} y={y + 4} width="36" height={barHeight} fill="#0f172a" />
            )}
            <rect
              x={x}
              y={y}
              width="36"
              height={barHeight}
              fill={c.color}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            <text x={x + 18} y={y - 8} textAnchor="middle" className="text-[10px] font-black fill-slate-900">{c.val}</text>
            <text x={x + 18} y={30 + chartHeight + 18} textAnchor="middle" className="text-[9px] font-bold fill-slate-650 uppercase tracking-tight">{c.label}</text>
          </g>
        );
      })}
      
      <line x1="45" y1={30 + chartHeight} x2={45 + chartWidth} y2={30 + chartHeight} stroke="#0f172a" strokeWidth="2.5" />
    </svg>
  );
}

function ActivityTrendChart({ trend }) {
  const width = 450;
  const height = 220;
  const chartHeight = 150;
  const chartWidth = 390;
  const maxVal = Math.max(...trend.map(t => t.total), 5);

  const points = trend.map((t, i) => {
    const xSpacing = chartWidth / (trend.length - 1);
    const x = 50 + i * xSpacing;
    const y = 30 + chartHeight - (t.total / maxVal) * chartHeight;
    return { x, y, ...t };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${30 + chartHeight} L ${points[0].x} ${30 + chartHeight} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[450px] mx-auto font-mono">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const y = 30 + ratio * chartHeight;
        const gridVal = Math.round(maxVal * (1 - ratio));
        return (
          <g key={idx}>
            <line x1="45" y1={y} x2={45 + chartWidth} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
            <text x="35" y={y + 4} textAnchor="end" className="text-[9px] font-bold fill-slate-400">{gridVal}</text>
          </g>
        );
      })}

      {points.length > 0 && (
        <path d={areaD} fill="#fff9db" fillOpacity="0.8" />
      )}

      {points.length > 0 && (
        <path d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x + 2} ${p.y + 2}`).join(' ')} fill="none" stroke="#0f172a" strokeWidth="3" opacity="0.15" />
      )}

      {points.length > 0 && (
        <path d={pathD} fill="none" stroke="#ffb800" strokeWidth="3" />
      )}

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x + 2} cy={p.y + 2} r="5" fill="#0f172a" />
          <circle
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] font-black fill-slate-900">{p.total}</text>
          <text x={p.x} y={30 + chartHeight + 18} textAnchor="middle" className="text-[9px] font-black fill-slate-650 uppercase">{p.day}</text>
          <text x={p.x} y={30 + chartHeight + 28} textAnchor="middle" className="text-[7px] font-bold fill-slate-400">{p.dateStr}</text>
        </g>
      ))}

      <line x1="45" y1={30 + chartHeight} x2={45 + chartWidth} y2={30 + chartHeight} stroke="#0f172a" strokeWidth="2.5" />
    </svg>
  );
}

function StatsSkeleton() {
  return (
    <div className="mb-8 font-mono animate-pulse">
      <div className="bg-[#fffbeb]/60 border-4 border-slate-900 p-6 shadow-neo mb-6 relative">
        <div className="absolute -top-4.5 left-6 bg-[#ffb800]/60 h-7 w-48 border-4 border-slate-900"></div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="p-4 border-2 border-slate-900 rounded-none shadow-neo-sm bg-slate-100/70 h-20 flex flex-col justify-between">
              <div className="h-2 w-12 bg-slate-300 rounded"></div>
              <div className="h-6 w-8 bg-slate-300 rounded mt-2"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 border-t-4 border-slate-900/10 pt-8">
          <div className="bg-white border-2 border-slate-900 p-4 rounded-none shadow-neo-sm h-[252px] relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-4 bg-slate-300 h-5 w-28 border border-slate-900"></div>
            <div className="w-full h-full flex items-end gap-6 px-8 pb-4 pt-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-1 bg-slate-150 border-2 border-slate-300" style={{ height: `${20 + i * 15}%` }}></div>
              ))}
            </div>
          </div>

          <div className="bg-white border-2 border-slate-900 p-4 rounded-none shadow-neo-sm h-[252px] relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-4 bg-slate-300 h-5 w-36 border border-slate-900"></div>
            <div className="w-full h-full flex items-center justify-center p-6">
              <svg className="w-full h-full text-slate-200" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0,35 Q15,10 30,25 T60,5 T90,30 L100,40 L0,40 Z" fill="currentColor" opacity="0.3" />
                <path d="M0,35 Q15,10 30,25 T60,5 T90,30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ALL_BADGES = [
  { key: 'First Upload', desc: 'Uploaded your first resource' },
  { key: '10 Resources Shared', desc: 'Shared 10 active study notes' },
  { key: 'Forum Helper', desc: 'Replied 5 times to forum posts' },
  { key: 'Whiteboard Wizard', desc: 'Saved or collaborated on whiteboard' },
  { key: '30-Day Streak', desc: 'Maintained a 30-day login streak' },
  { key: 'Level 10 Scholar', desc: 'Reached Level 10 or higher' }
];

export default function Profile() {
  const { user, token, getMe, updateProfile } = useAuthStore();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [isEditingDept, setIsEditingDept] = useState(false);
  const [tempDept, setTempDept] = useState('CSE');
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setPasswordError('PASSWORD IS REQUIRED');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('PASSWORD MUST BE AT LEAST 8 CHARACTERS');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('PASSWORD MUST CONTAIN AT LEAST ONE UPPERCASE LETTER');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('PASSWORD MUST CONTAIN AT LEAST ONE LOWERCASE LETTER');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('PASSWORD MUST CONTAIN AT LEAST ONE NUMBER');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordError('PASSWORD MUST CONTAIN AT LEAST ONE SPECIAL CHARACTER');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('PASSWORDS DO NOT MATCH');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      const success = await updateProfile({ password: newPassword });
      if (success) {
        setIsEditingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError('FAILED TO UPDATE PASSWORD');
      console.error(err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/auth/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchStats();
  }, [user?._id]);

  const handleSaveDept = async () => {
    try {
      setLoading(true);
      await updateProfile({ department: tempDept });
      setIsEditingDept(false);
    } catch (err) {
      console.error('Failed to save department', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const fetchedUser = await getMe(); // update user details from DB
      const targetUserId = fetchedUser?._id || useAuthStore.getState().user?._id;
      if (targetUserId) {
        const res = await api.get(`/resources?uploadedBy=${targetUserId}&includeDeleted=true`);
        setUploads(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile uploads', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = (resourceId) => {
    setConfirmDeleteId(resourceId);
  };

  const executeDeleteResource = async () => {
    if (!confirmDeleteId) return;
    try {
      setActionLoading(confirmDeleteId);
      await api.delete(`/resources/${confirmDeleteId}`);
      useToastStore.getState().addToast('RESOURCE DELETED SUCCESSFULLY!', 'info');
      await getMe(); // sync XP
      fetchStats(); // sync stats
      // Refresh local uploads list
      const currentUser = useAuthStore.getState().user;
      if (currentUser?._id) {
        const res = await api.get(`/resources?uploadedBy=${currentUser._id}&includeDeleted=true`);
        setUploads(res.data);
      }
    } catch (error) {
      console.error('Failed to delete resource', error);
      const errMsg = error.response?.data?.message || 'FAILED TO DELETE RESOURCE';
      useToastStore.getState().addToast(errMsg.toUpperCase(), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreResource = (resourceId) => {
    setConfirmRestoreId(resourceId);
  };

  const executeRestoreResource = async () => {
    if (!confirmRestoreId) return;
    try {
      setActionLoading(confirmRestoreId);
      await api.post(`/resources/${confirmRestoreId}/restore`);
      useToastStore.getState().addToast('RESOURCE RESTORED SUCCESSFULLY!', 'success');
      await getMe(); // sync XP
      fetchStats(); // sync stats
      // Refresh local uploads list
      const currentUser = useAuthStore.getState().user;
      if (currentUser?._id) {
        const res = await api.get(`/resources?uploadedBy=${currentUser._id}&includeDeleted=true`);
        setUploads(res.data);
      }
    } catch (error) {
      console.error('Failed to restore resource', error);
      const errMsg = error.response?.data?.message || 'FAILED TO RESTORE RESOURCE';
      useToastStore.getState().addToast(errMsg.toUpperCase(), 'error');
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

      {/* Statistics Dashboard Section */}
      <AnimatePresence mode="wait">
        {statsLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <StatsSkeleton />
          </motion.div>
        ) : stats ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-8 font-mono"
          >
            <div className="bg-[#fffbeb] border-4 border-slate-900 p-6 shadow-neo mb-6 relative">
              <div className="absolute -top-4.5 left-6 bg-[#ffb800] text-slate-950 px-3 py-1 text-xs border-4 border-slate-900 uppercase font-black tracking-wider">
                Student Activity Dashboard
              </div>
              
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                {[
                  { title: 'Uploads', value: stats.counts.uploads, color: 'bg-emerald-100 text-emerald-800' },
                  { title: 'Downloads', value: stats.counts.downloads, color: 'bg-blue-100 text-blue-800' },
                  { title: 'Forum Contribs', value: stats.counts.forumContributions, color: 'bg-purple-100 text-purple-800' },
                  { title: 'Classrooms', value: stats.counts.classrooms, color: 'bg-orange-100 text-orange-850' },
                  { title: 'Login Streak', value: `${stats.counts.streak} Days`, color: 'bg-yellow-100 text-yellow-800' },
                  { title: 'Weekly XP', value: `${stats.counts.weeklyXp} XP`, color: 'bg-pink-100 text-pink-850' }
                ].map((c, idx) => (
                  <div key={idx} className={`p-4 border-2 border-slate-900 rounded-none shadow-neo-sm flex flex-col justify-between ${c.color}`}>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-85">{c.title}</span>
                    <span className="text-xl font-black mt-2">{c.value}</span>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 border-t-4 border-slate-900/10 pt-8">
                {/* Chart 1: Activity Breakdown */}
                <div className="bg-white border-2 border-slate-900 p-4 rounded-none shadow-neo-sm relative">
                  <div className="absolute -top-3.5 left-4 bg-slate-900 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    Activity Breakdown
                  </div>
                  <div className="w-full overflow-x-auto mt-4">
                    <ActivityBreakdownChart counts={stats.counts} />
                  </div>
                </div>

                {/* Chart 2: 7-Day Activity Trend */}
                <div className="bg-white border-2 border-slate-900 p-4 rounded-none shadow-neo-sm relative">
                  <div className="absolute -top-3.5 left-4 bg-slate-900 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    7-Day Contribution Trend
                  </div>
                  <div className="w-full overflow-x-auto mt-4">
                    <ActivityTrendChart trend={stats.trend} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">{user?.email}</p>
              
              <div className="flex flex-col items-center gap-1.5 w-full">
                <span className="text-[10px] bg-slate-900 text-white font-mono font-bold px-2 py-0.5 border border-slate-900 shadow-neo-sm uppercase">
                  {user?.department || 'CSE'} DEPT
                </span>
                
                {isEditingDept ? (
                  <div className="flex items-center gap-1.5 mt-2 w-full max-w-[180px]">
                    <select
                      className="bg-white border-2 border-slate-900 rounded-none px-2 py-1 text-[10px] font-bold text-slate-850 flex-1 outline-none font-mono"
                      value={tempDept}
                      onChange={(e) => setTempDept(e.target.value)}
                    >
                      <option value="CSE">CSE</option>
                      <option value="AIML">AIML</option>
                      <option value="AI">AI</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                    </select>
                    <button
                      onClick={handleSaveDept}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-slate-900 px-2 py-1 text-[9px] font-black cursor-pointer shadow-neo-sm"
                      title="Save"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setIsEditingDept(false)}
                      className="bg-red-50 hover:bg-red-100 text-red-800 border-2 border-slate-900 px-2 py-1 text-[9px] font-black cursor-pointer shadow-neo-sm"
                      title="Cancel"
                    >
                      ✗
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTempDept(user?.department || 'CSE');
                      setIsEditingDept(true);
                    }}
                    className="text-[9px] font-extrabold text-slate-500 hover:text-primary underline flex items-center gap-1 cursor-pointer mt-1 font-mono"
                  >
                    CHANGE DEPARTMENT
                  </button>
                )}

                <div className="border-t border-slate-900/10 w-full my-3"></div>

                {isEditingPassword ? (
                  <form onSubmit={handleSavePassword} className="w-full space-y-2 mt-1">
                    {passwordError && (
                      <div className="text-[8px] font-black text-red-600 bg-red-50 border border-red-200 p-1.5 uppercase text-center">
                        {passwordError}
                      </div>
                    )}
                    <div className="relative">
                      <input
                        required
                        type={showPasswordText ? "text" : "password"}
                        placeholder="NEW PASSWORD"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white border-2 border-slate-900 rounded-none px-2 py-1 text-[9px] font-bold text-slate-850 outline-none font-mono pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordText(!showPasswordText)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        required
                        type={showPasswordText ? "text" : "password"}
                        placeholder="CONFIRM PASSWORD"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border-2 border-slate-900 rounded-none px-2 py-1 text-[9px] font-bold text-slate-850 outline-none font-mono pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordText(!showPasswordText)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="p-2 bg-[#fffbeb] border border-slate-900 text-[8px] font-black text-slate-700 space-y-0.5 leading-tight">
                        <p className="font-extrabold uppercase border-b border-slate-900/10 pb-0.5 mb-1 text-[9px]">PASSWORD REQUIREMENTS</p>
                        <div className="flex items-center gap-1">
                          <span className={newPassword.length >= 8 ? "text-emerald-700" : "text-slate-400"}>
                            {newPassword.length >= 8 ? "✓" : "○"} 8+ CHARACTERS
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={/[A-Z]/.test(newPassword) ? "text-emerald-700" : "text-slate-400"}>
                            {/[A-Z]/.test(newPassword) ? "✓" : "○"} UPPERCASE (A-Z)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={/[a-z]/.test(newPassword) ? "text-emerald-700" : "text-slate-400"}>
                            {/[a-z]/.test(newPassword) ? "✓" : "○"} LOWERCASE (a-z)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={/[0-9]/.test(newPassword) ? "text-emerald-700" : "text-slate-400"}>
                            {/[0-9]/.test(newPassword) ? "✓" : "○"} NUMBER (0-9)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-emerald-700" : "text-slate-400"}>
                            {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "✓" : "○"} SPECIAL CHAR (!@#...)
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-1.5 w-full">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-slate-900 px-2 py-1 text-[9px] font-black cursor-pointer shadow-neo-sm flex-1 flex justify-center items-center"
                      >
                        {passwordLoading ? '...' : 'SAVE'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingPassword(false);
                          setPasswordError('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-800 border-2 border-slate-900 px-2 py-1 text-[9px] font-black cursor-pointer shadow-neo-sm flex-1"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="text-[9px] font-extrabold text-slate-500 hover:text-primary underline flex items-center gap-1 cursor-pointer font-mono"
                  >
                    SET / CHANGE PASSWORD
                  </button>
                )}
              </div>
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

          {/* Achievements Card */}
          <div className="bg-white border-2 border-slate-900 rounded-none p-6 shadow-neo font-mono relative mt-6">
            <div className="absolute -top-3 left-4 bg-primary text-white px-2 py-0.5 text-[9px] border-2 border-slate-900 uppercase font-bold">
              ACHIEVEMENTS
            </div>
            <div className="space-y-3 mt-2">
              {ALL_BADGES.map((b) => {
                const isUnlocked = user?.badges?.includes(b.key);
                return (
                  <div key={b.key} className={`border-2 border-slate-900 p-2 flex gap-2.5 items-center transition-all ${isUnlocked ? 'bg-[#fffbeb]' : 'bg-slate-50 opacity-60'}`}>
                    <div className="text-xl shrink-0">{isUnlocked ? '🏆' : '🔒'}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-[10px] text-slate-850 truncate">{b.key.toUpperCase()}</h4>
                      <p className="text-[8px] text-slate-500 font-bold leading-tight">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* XP Economy System Card */}
          <div className="bg-white border-2 border-slate-900 rounded-none p-4 shadow-neo font-mono relative mt-6">
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

            <div className="p-6 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
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
                        <>
                          <button
                            onClick={() => {
                              setSelectedResource(upload);
                              setIsEditOpen(true);
                            }}
                            className="bg-[#ffb800] hover:bg-[#e0a200] text-slate-950 px-3 py-2 border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 text-[9px] font-bold cursor-pointer"
                            title="Edit Resource Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            EDIT
                          </button>
                          <a 
                            href={`${import.meta.env.VITE_API_URL}/resources/${upload._id}/download?token=${token}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => useToastStore.getState().addToast('STARTING DOWNLOAD...', 'info')}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-800 px-3 py-2 border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 text-[9px] font-bold"
                            title="View Uploaded File"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            VIEW
                          </a>
                        </>
                      )}
                      
                      {upload.isDeleted ? (
                        <button
                          disabled={actionLoading === upload._id}
                          onClick={() => handleRestoreResource(upload._id)}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-2 border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 text-[9px] font-bold cursor-pointer disabled:opacity-50"
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
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 border border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 text-[9px] font-bold cursor-pointer disabled:opacity-50"
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

      <EditModal 
        isOpen={isEditOpen} 
        onClose={() => {
          setIsEditOpen(false);
          setSelectedResource(null);
        }}
        onEditSuccess={fetchProfileData}
        resource={selectedResource}
      />
      
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={executeDeleteResource}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This will deduct 40 XP."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      
      <ConfirmModal
        isOpen={!!confirmRestoreId}
        onClose={() => setConfirmRestoreId(null)}
        onConfirm={executeRestoreResource}
        title="Restore Resource"
        message="Are you sure you want to restore / re-upload this resource? This will add 40 XP back."
        confirmText="Restore"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
}
