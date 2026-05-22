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
    <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 transition-transform active:scale-[0.98]">
            <div className="bg-primary/10 p-1.5 rounded-neo border border-primary/20 flex items-center justify-center">
              <BrainCircuit className="h-5.5 w-5.5 text-primary" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">StudyVault</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mr-2 sm:mr-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
                    <p className="text-[11px] font-medium text-slate-500">Lvl {user?.level} • {user?.xp} XP</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary font-bold text-sm shadow-sm" style={{ color: 'var(--secondary)' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <Link to="/forum" className="px-3.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors rounded-neo">
                  Forum
                </Link>
                <Link to="/classrooms" className="px-3.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors rounded-neo">
                  Classrooms
                </Link>
                <Link to="/dashboard" className="p-2 text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors rounded-neo" title="Dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-neo" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 px-3.5 py-2 rounded-neo transition-colors">Log in</Link>
                <Link to="/register" className="bg-primary text-white hover:bg-primary/95 shadow-sm px-4.5 py-2 rounded-neo text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98]">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
