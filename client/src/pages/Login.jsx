import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BrainCircuit, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, loading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const loadScript = () => {
      const existingScript = document.getElementById('google-gsi-client');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = 'google-gsi-client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.body.appendChild(script);
      } else {
        initGoogle();
      }
    };

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleSuccess,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    };

    loadScript();
  }, [isAuthenticated]);

  const handleGoogleSuccess = async (response) => {
    const success = await loginWithGoogle(response.credential);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleMockGoogleLogin = async () => {
    const success = await loginWithGoogle('mock_google_token');
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 h-full my-auto font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white border-2 border-slate-900 rounded-none shadow-neo overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary border-b-2 border-slate-900" />
        <div className="p-8 mt-2">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-primary/10 rounded-none flex items-center justify-center border-2 border-slate-900 shadow-neo-sm">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h2 className="text-lg font-extrabold text-center text-slate-800 mb-1 uppercase">Welcome back</h2>
          <p className="text-center font-bold text-slate-500 mb-8 text-[10px]">ENTER YOUR CREDENTIALS TO ACCESS THE VAULT</p>

          {error && (
            <div className="bg-red-50 border-2 border-slate-900 text-red-750 font-bold text-xs p-3 rounded-none mb-6 flex justify-between items-center shadow-neo-sm">
              {error.toUpperCase()}
              <button onClick={clearError} className="hover:opacity-70 px-2 font-black text-lg">&times;</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold mb-1.5 text-slate-700">EMAIL</label>
              <input
                type="email"
                required
                className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-xs text-slate-800 placeholder:text-slate-400"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-none border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-6 text-xs"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">OR SIGN IN WITH</span>
          </div>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div id="google-signin-btn" className="w-full border-2 border-slate-900 shadow-neo-sm h-10 overflow-hidden flex items-center justify-center bg-white cursor-pointer" />
          ) : (
            <button
              type="button"
              onClick={handleMockGoogleLogin}
              className="w-full bg-white hover:bg-slate-50 text-slate-800 font-extrabold py-2.5 rounded-none border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all flex justify-center items-center gap-2.5 text-xs uppercase"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3A11.966 11.966 0 0 0 12 0C7.309 0 3.268 2.568.96 6.291l4.306 3.474z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 15.345c-1.077.732-2.432 1.164-4.04 1.164-2.955 0-5.464-1.996-6.359-4.691L1.305 15.28A11.97 11.97 0 0 0 12 24c3.245 0 6.182-1.077 8.382-2.918l-4.341-3.664-2.073-2.073z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.273c0-.818-.082-1.609-.227-2.373H12v4.518h6.436c-.277 1.482-1.114 2.736-2.382 3.591l4.341 3.664c2.536-2.336 4.1-5.773 4.1-9.4z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.64 11.818a7.042 7.042 0 0 1 0-2.309L1.334 6.035a11.984 11.984 0 0 0 0 11.473l4.306-3.473-1.04-1.04-.3-1.173z"
                />
              </svg>
              Google Account
            </button>
          )}

          <div className="mt-8 text-center text-[10px] font-bold text-slate-500">
            DON'T HAVE AN ACCOUNT?{' '}
            <Link to="/register" className="text-slate-800 hover:text-primary transition-colors font-bold underline">CREATE ONE</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
