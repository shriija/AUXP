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
  const { register, loading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 my-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white border-4 border-black rounded-neo shadow-neo overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-secondary border-b-4 border-black" />
        <div className="p-8 mt-2">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center border-4 border-black shadow-neo-sm">
              <BrainCircuit className="h-8 w-8 text-black" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center mb-2">Create Account</h2>
          <p className="text-center font-medium text-black/70 mb-8 text-sm">Join the Collaborative Study Vault</p>

          {error && (
            <div className="bg-red-200 border-2 border-black text-black font-bold text-sm p-3 rounded-neo mb-6 flex justify-between items-center shadow-neo-sm">
              {error}
              <button onClick={clearError} className="hover:opacity-70 px-2 font-black text-lg">&times;</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-1.5 text-black">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-pink-50 transition-all font-medium text-black placeholder:text-black/40"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-black">Email</label>
              <input
                type="email"
                required
                className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-pink-50 transition-all font-medium text-black placeholder:text-black/40"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-black">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-yellow-50 transition-all font-medium text-black placeholder:text-black/40 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-black font-black py-3 rounded-neo border-2 border-black shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-semibold text-black/70">
            Already have an account?{' '}
            <Link to="/login" className="text-black hover:text-secondary hover:underline font-black">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
