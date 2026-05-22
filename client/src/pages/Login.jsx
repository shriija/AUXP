import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BrainCircuit, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 h-full my-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-neo shadow-neo overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
        <div className="p-8 mt-2">
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/25 shadow-sm text-secondary">
              <BrainCircuit className="h-7 w-7 text-secondary-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center mb-1.5">Welcome back</h2>
          <p className="text-center font-medium text-slate-500 mb-8 text-sm">Enter your credentials to access the vault</p>

          {error && (
            <div className="bg-red-550/10 border border-red-200 text-red-700 font-semibold text-xs p-3.5 rounded-neo mb-6 flex justify-between items-center">
              {error}
              <button onClick={clearError} className="hover:opacity-70 px-2 font-bold text-lg">&times;</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700">Email</label>
              <input
                type="email"
                required
                className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-neo shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6 text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs font-semibold text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary/90 font-bold underline underline-offset-4">Create one</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
