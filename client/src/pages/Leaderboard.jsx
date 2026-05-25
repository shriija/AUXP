import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Loader2, Trophy, Clock, Users, Globe, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEPARTMENTS = [
  { value: 'CSE', label: 'CSE (Computer Science)' },
  { value: 'AIML', label: 'AIML (AI & Machine Learning)' },
  { value: 'AI', label: 'AI (Artificial Intelligence)' },
  { value: 'IT', label: 'IT (Information Technology)' },
  { value: 'ECE', label: 'ECE (Electronics & Comm)' },
  { value: 'EEE', label: 'EEE (Electrical & Electronics)' }
];

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'weekly' | 'department'
  const [selectedDept, setSelectedDept] = useState(user?.department || 'CSE');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Weekly countdown timer (until next Monday 00:00:00)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMonday = new Date();
      
      // Find days until next Monday
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
      let daysToMonday = 1 - dayOfWeek;
      if (daysToMonday <= 0) {
        daysToMonday += 7; // Next week's Monday
      }
      
      nextMonday.setDate(now.getDate() + daysToMonday);
      nextMonday.setHours(0, 0, 0, 0);
      
      const diffMs = nextMonday - now;
      if (diffMs <= 0) {
        setTimeRemaining('RESETTING NOW...');
        return;
      }
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leaderboard?department=${selectedDept}`);
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, [selectedDept]);

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-xl" title="1st Place">🥇</span>;
    if (rank === 2) return <span className="text-xl" title="2nd Place">🥈</span>;
    if (rank === 3) return <span className="text-xl" title="3rd Place">🥉</span>;
    return <span className="font-mono text-slate-500 font-bold">#{rank}</span>;
  };

  const getActiveList = () => {
    if (!data) return [];
    if (activeTab === 'global') return data.global || [];
    if (activeTab === 'weekly') return data.weekly || [];
    if (activeTab === 'department') return data.department || [];
    return [];
  };

  const activeList = getActiveList();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full font-mono">
      {/* Back to dashboard */}
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          BACK TO DASHBOARD
        </Link>
      </div>

      {/* Header section */}
      <div className="bg-[#cbe3db] border-2 border-slate-900 rounded-none p-6 shadow-neo mb-8 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Trophy className="w-40 h-40 text-slate-950" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#ffb800] text-slate-950 px-2 py-0.5 border-2 border-slate-900 font-black text-xs uppercase shadow-neo-sm">
              ACADEMIC HALL OF FAME
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase">AUXP LEADERBOARDS</h1>
          <p className="text-xs text-slate-700 mt-1 font-bold">
            Share study notes, clear doubts, and log in daily to rise to the top!
          </p>
        </div>
      </div>

      {/* Countdown banner for weekly leaderboard */}
      <div className="bg-white border-2 border-slate-900 p-4 shadow-neo mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">WEEKLY LEADERBOARD RESET:</span>
        </div>
        <div className="bg-primary text-white border-2 border-slate-900 px-3 py-1 font-black text-xs tracking-wider shadow-neo-sm">
          {timeRemaining}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b-2 border-slate-900 mb-6 gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2 text-xs font-bold border-2 border-b-0 border-slate-900 rounded-t-none translate-y-[2px] transition-all cursor-pointer ${
            activeTab === 'global'
              ? 'bg-primary text-white shadow-none'
              : 'bg-white text-slate-700 hover:bg-slate-50 shadow-neo-sm'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            GLOBAL
          </div>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 text-xs font-bold border-2 border-b-0 border-slate-900 rounded-t-none translate-y-[2px] transition-all cursor-pointer ${
            activeTab === 'weekly'
              ? 'bg-primary text-white shadow-none'
              : 'bg-white text-slate-700 hover:bg-slate-50 shadow-neo-sm'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            WEEKLY (MON RESET)
          </div>
        </button>

        <button
          onClick={() => setActiveTab('department')}
          className={`px-4 py-2 text-xs font-bold border-2 border-b-0 border-slate-900 rounded-t-none translate-y-[2px] transition-all cursor-pointer ${
            activeTab === 'department'
              ? 'bg-primary text-white shadow-none'
              : 'bg-white text-slate-700 hover:bg-slate-50 shadow-neo-sm'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            DEPARTMENT ({selectedDept})
          </div>
        </button>
      </div>

      {/* Department Selector (Only visible on Department Tab) */}
      {activeTab === 'department' && (
        <div className="bg-white border-2 border-slate-900 p-4 shadow-neo mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-750">FILTER BY DEPT:</label>
          <select
            className="bg-white border-2 border-slate-900 px-3 py-1 text-xs font-bold text-slate-850 outline-none w-full sm:w-64"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Leaderboard Table Card */}
      <div className="bg-white border-2 border-slate-900 rounded-none shadow-neo overflow-hidden min-h-[400px]">
        <div className="bg-[#cbe3db]/40 p-4 border-b-2 border-slate-900 flex justify-between items-center text-xs font-black uppercase text-slate-900">
          <span>RANK & STUDENT</span>
          <span className="text-right">
            {activeTab === 'weekly' ? 'WEEKLY XP' : 'TOTAL XP'}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeList.length === 0 ? (
          <div className="text-center py-24 text-slate-500 font-bold text-xs uppercase">
            No rankings recorded yet.
          </div>
        ) : (
          <div className="divide-y-2 divide-slate-900/10">
            {activeList.map((student, idx) => {
              const isCurrentUser = user?._id === student._id;
              const rank = idx + 1;
              return (
                <div
                  key={student._id}
                  className={`p-4 flex items-center justify-between transition-all gap-4 ${
                    isCurrentUser ? 'bg-[#fffbeb] border-y border-slate-900/10' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 flex justify-center shrink-0">
                      {getRankBadge(rank)}
                    </div>
                    <div className="h-9 w-9 rounded-none bg-secondary/15 flex items-center justify-center font-black border border-slate-900 shrink-0 text-slate-800 text-xs">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-850 truncate">
                          {student.name.toUpperCase()}
                        </span>
                        {isCurrentUser && (
                          <span className="bg-primary text-white text-[8px] px-1.5 py-0.2 border border-slate-900 font-black shadow-neo-sm">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[8px] font-bold text-slate-500 mt-0.5">
                        <span className="bg-slate-100 border border-slate-900/30 px-1 py-0.1">
                          Lvl {student.level}
                        </span>
                        <span className="bg-teal-50/40 text-teal-900 border border-slate-900/30 px-1 py-0.1">
                          {student.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-xs text-slate-900">
                      {activeTab === 'weekly' ? student.weeklyXp : student.xp} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current User ranks panel (sticky or footer card) */}
      {!loading && data?.userRanks && (
        <div className="bg-[#fffbeb] border-2 border-slate-900 p-4 shadow-neo mt-8 relative">
          <div className="absolute -top-3 left-4 bg-primary text-white px-2 py-0.5 text-[8px] border-2 border-slate-900 uppercase font-black">
            YOUR STANDING
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2 divide-x-2 divide-slate-900/10">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">GLOBAL RANK</p>
              <p className="text-sm font-black text-slate-900">
                #{data.userRanks.global}
              </p>
              <p className="text-[8px] font-bold text-slate-400 mt-0.5">{data.userRanks.xp} TOTAL XP</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">WEEKLY RANK</p>
              <p className="text-sm font-black text-slate-900">
                #{data.userRanks.weekly}
              </p>
              <p className="text-[8px] font-bold text-slate-400 mt-0.5">{data.userRanks.weeklyXp} WEEKLY XP</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">{data.userRanks.userDepartment} RANK</p>
              <p className="text-sm font-black text-slate-900">
                #{data.userRanks.department}
              </p>
              <p className="text-[8px] font-bold text-slate-400 mt-0.5">Lvl {data.userRanks.level}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
