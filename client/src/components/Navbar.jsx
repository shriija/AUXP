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
    <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
            <div className="bg-primary border-2 border-black p-1 rounded-neo shadow-neo-sm">
              <BrainCircuit className="h-6 w-6 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight text-black">StudyVault</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mr-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-black">{user?.name}</p>
                    <p className="text-xs font-semibold text-black/70">Lvl {user?.level} • {user?.xp} XP</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-secondary border-2 border-black flex items-center justify-center text-black font-bold shadow-neo-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <Link to="/forum" className="p-2 text-sm font-bold border-2 border-transparent hover:border-black hover:bg-yellow-100 hover:shadow-neo-sm transition-all rounded-neo text-black">
                  Forum
                </Link>
                <Link to="/classrooms" className="p-2 text-sm font-bold border-2 border-transparent hover:border-black hover:bg-pink-100 hover:shadow-neo-sm transition-all rounded-neo text-black">
                  Classrooms
                </Link>
                <Link to="/dashboard" className="p-2 border-2 border-transparent hover:border-black hover:bg-secondary/20 hover:shadow-neo-sm transition-all rounded-neo text-black">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                <button onClick={handleLogout} className="p-2 border-2 border-transparent hover:border-black hover:bg-primary/20 hover:shadow-neo-sm transition-all rounded-neo text-black">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-black border-2 border-transparent hover:border-black hover:shadow-neo-sm px-3 py-2 rounded-neo transition-all">Log in</Link>
                <Link to="/register" className="bg-primary text-black border-2 border-black px-4 py-2 rounded-neo text-sm font-bold shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm transition-all">
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
