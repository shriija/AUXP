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
    <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
            <div className="bg-primary/10 p-1.5 rounded-neo border border-primary/20">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">StudyVault</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mr-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                    <p className="text-xs font-medium text-slate-500">Lvl {user?.level} • {user?.xp} XP</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-primary font-bold border border-indigo-100 shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <Link to="/forum" className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-all rounded-neo">
                  Forum
                </Link>
                <Link to="/classrooms" className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-all rounded-neo">
                  Classrooms
                </Link>
                <Link to="/dashboard" className="p-2 text-slate-500 hover:text-primary hover:bg-slate-50 transition-all rounded-neo" title="Dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-neo" title="Log out">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary px-3 py-2 rounded-neo transition-all">Log in</Link>
                <Link to="/register" className="bg-primary text-white hover:bg-primary/95 px-4 py-2 rounded-neo text-sm font-bold shadow-sm hover:shadow transition-all">
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
