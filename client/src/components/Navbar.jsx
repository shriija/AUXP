import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, LayoutDashboard, BrainCircuit } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                <Link to="/forum" className="px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:text-primary hover:bg-white/40 border-2 border-transparent hover:border-slate-900 rounded-none transition-all">
                  FORUM
                </Link>
                <Link to="/classrooms" className="px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:text-primary hover:bg-white/40 border-2 border-transparent hover:border-slate-900 rounded-none transition-all">
                  CLASSROOMS
                </Link>
                <Link to="/dashboard" className="p-1.5 text-slate-700 hover:text-primary hover:bg-white/40 border-2 border-transparent hover:border-slate-900 rounded-none transition-all" title="Dashboard">
                  <LayoutDashboard className="h-4.5 w-4.5" />
                </Link>
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
