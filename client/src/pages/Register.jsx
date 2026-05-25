import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BrainCircuit, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('CSE');
  const { register, loading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password, department);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 my-auto font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white border-2 border-slate-900 rounded-none shadow-neo overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary border-b-2 border-slate-900" />
        <div className="p-8 mt-2">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-secondary/15 rounded-none flex items-center justify-center border-2 border-slate-900 shadow-neo-sm">
              <BrainCircuit className="h-5 w-5 text-slate-700" />
            </div>
          </div>
          <h2 className="text-lg font-extrabold text-center text-slate-800 mb-1 uppercase">Create Account</h2>
          <p className="text-center font-bold text-slate-500 mb-8 text-[10px]">JOIN THE AUXP COLLABORATIVE STUDY VAULT</p>

          {error && (
            <div className="bg-red-50 border-2 border-slate-900 text-red-750 font-bold text-xs p-3 rounded-none mb-6 flex justify-between items-center shadow-neo-sm">
              {error.toUpperCase()}
              <button onClick={clearError} className="hover:opacity-70 px-2 font-black text-lg">&times;</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold mb-1.5 text-slate-700">FULL NAME</label>
              <input
                type="text"
                required
                className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850 placeholder:text-slate-400"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1.5 text-slate-700">EMAIL</label>
              <input
                type="email"
                required
                className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850 placeholder:text-slate-400"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1.5 text-slate-700">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850 placeholder:text-slate-400 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1.5 text-slate-700">DEPARTMENT</label>
              <select
                required
                className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-850"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="CSE">CSE (Computer Science & Engineering)</option>
                <option value="AIML">AIML (AI & Machine Learning)</option>
                <option value="AI">AI (Artificial Intelligence)</option>
                <option value="IT">IT (Information Technology)</option>
                <option value="ECE">ECE (Electronics & Communication Engineering)</option>
                <option value="EEE">EEE (Electrical & Electronics Engineering)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-none border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-6 text-xs"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'CREATING...' : 'SIGN UP'}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] font-bold text-slate-500">
            ALREADY HAVE AN ACCOUNT?{' '}
            <Link to="/login" className="text-slate-850 hover:text-primary transition-colors font-bold underline">SIGN IN</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
