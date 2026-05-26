import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, LayoutDashboard, BrainCircuit, Bell, Trash2, CheckCheck, X, MessageSquare, ArrowBigUpDash, Users } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { notifications, unreadCount, fetchNotifications, markAllRead, markAsRead, deleteNotification, clearAllNotifications } = useNotificationStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleNotificationClick = async (notif) => {
    setIsDropdownOpen(false);
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    
    if (notif.type === 'FORUM_REPLY') {
      navigate(`/forum/${notif.relatedItem}`);
    } else if (notif.type === 'RESOURCE_UPVOTE') {
      navigate('/profile');
    } else if (notif.type === 'CLASSROOM_JOIN') {
      navigate(`/classrooms/${notif.relatedItem}`);
    }
  };

  const renderNotifIcon = (type) => {
    switch (type) {
      case 'FORUM_REPLY':
        return (
          <div className="p-1.5 bg-blue-100 border border-slate-900 text-blue-600 flex items-center justify-center">
            <MessageSquare className="h-4 w-4" />
          </div>
        );
      case 'RESOURCE_UPVOTE':
        return (
          <div className="p-1.5 bg-emerald-100 border border-slate-900 text-emerald-650 flex items-center justify-center">
            <ArrowBigUpDash className="h-4 w-4" />
          </div>
        );
      case 'CLASSROOM_JOIN':
        return (
          <div className="p-1.5 bg-violet-100 border border-slate-900 text-violet-600 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="p-1.5 bg-slate-100 border border-slate-900 text-slate-600 flex items-center justify-center">
            <Bell className="h-4 w-4" />
          </div>
        );
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <nav className="border-b-2 border-slate-900 bg-[#d2e5dd]/90 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 hover:translate-y-[1px] transition-transform">
            <div className="bg-primary/10 p-1.5 rounded-none border-2 border-slate-900 shadow-neo-sm">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <span className="font-press text-sm tracking-widest text-slate-900 select-none">AUXP</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-3 mr-4 hover:opacity-85 transition-all group" title="View Profile">
                  <div className="text-right hidden sm:block font-mono">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">{user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-600">LVL {user?.level} • {user?.xp} XP</p>
                  </div>
                  <div className="h-8 w-8 rounded-none bg-white flex items-center justify-center text-primary font-extrabold border-2 border-slate-900 shadow-neo-sm group-hover:shadow-neo transition-all" title={user?.name}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <Link to="/leaderboard" className="px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:text-primary hover:bg-white/40 border-2 border-transparent hover:border-slate-900 rounded-none transition-all">
                  LEADERBOARDS
                </Link>
                <Link to="/forum" className="px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:text-primary hover:bg-white/40 border-2 border-transparent hover:border-slate-900 rounded-none transition-all">
                  FORUM
                </Link>
                <Link to="/classrooms" className="px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:text-primary hover:bg-white/40 border-2 border-transparent hover:border-slate-900 rounded-none transition-all">
                  CLASSROOMS
                </Link>
                <Link to="/dashboard" className="p-1.5 text-slate-700 hover:text-primary hover:bg-white/40 border-2 border-transparent hover:border-slate-900 rounded-none transition-all" title="Dashboard">
                  <LayoutDashboard className="h-4.5 w-4.5" />
                </Link>

                {/* Notification Bell */}
                <div className="relative flex items-center" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className="p-1.5 text-slate-700 hover:text-primary hover:bg-white/40 border-2 border-transparent hover:border-slate-900 rounded-none transition-all relative"
                    title="Notifications"
                    id="notification-bell-btn"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-extrabold h-4 w-4 flex items-center justify-center rounded-none border border-slate-900 shadow-neo-sm animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border-2 border-slate-900 shadow-neo z-50 font-mono text-left text-slate-900">
                      {/* Header */}
                      <div className="flex justify-between items-center px-4 py-2.5 border-b-2 border-slate-900 bg-[#cbe3db] text-xs font-extrabold uppercase">
                        <span>Notifications</span>
                        <div className="flex gap-2">
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllRead} 
                              className="hover:text-primary flex items-center gap-0.5 text-slate-700"
                              title="Mark all read"
                              id="notif-mark-all-read-btn"
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button 
                              onClick={clearAllNotifications} 
                              className="hover:text-red-500 flex items-center gap-0.5 text-slate-700"
                              title="Clear all"
                              id="notif-clear-all-btn"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content list */}
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs font-bold text-slate-500 uppercase">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              className={`flex items-start gap-3 p-3 border-b last:border-b-0 border-slate-900/10 cursor-pointer hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-slate-50/70 font-semibold' : ''}`}
                              onClick={() => handleNotificationClick(notif)}
                            >
                              {renderNotifIcon(notif.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-800 leading-normal break-words">
                                  {notif.message}
                                </p>
                                <span className="text-[8px] text-slate-400 font-bold block mt-1 uppercase">
                                  {formatTimeAgo(notif.createdAt)}
                                </span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notif._id);
                                }}
                                className="text-slate-400 hover:text-red-500 self-center"
                                title="Delete notification"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleLogout} className="p-1.5 text-slate-700 hover:text-red-650 hover:bg-red-50/50 border-2 border-transparent hover:border-slate-900 rounded-none transition-all" title="Log out">
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold text-slate-800 hover:text-primary px-3 py-1.5 rounded-none transition-all">LOG IN</Link>
                <Link to="/register" className="bg-primary text-white hover:bg-primary/95 px-4 py-1.5 rounded-none text-xs font-bold border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all">
                  SIGN UP
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
