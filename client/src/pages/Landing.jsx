import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { TreePine, Smile, Book, Leaf } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // If already authenticated, this will be handled in App or can redirect to dashboard
  const handleStartJourney = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#d2e5df] text-[#2c3d36] font-mono selection:bg-[#df5e5a]/30 overflow-x-hidden">
      {/* Quiet Place Navigation Bar */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        {/* Left: Brand logo & icon */}
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs tracking-wider">
          <TreePine className="w-4 h-4 text-emerald-800" />
          <span>AUXP</span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden sm:flex items-center gap-8 text-[11px] font-bold text-slate-700 tracking-wider">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
        </div>

        {/* Right: Journey Button */}
        <div>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-[#df5e5a] hover:bg-[#d8504c] text-white px-5 py-2.5 rounded-full text-[10px] font-bold transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-0 inline-block text-center"
            >
              Back to Dashboard
            </Link>
          ) : (
            <button
              onClick={handleStartJourney}
              className="bg-[#df5e5a] hover:bg-[#d8504c] text-white px-5 py-2.5 rounded-full text-[10px] font-bold transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-0"
            >
              Start Your Journey +
            </button>
          )}
        </div>
      </nav>

      {/* Hero Content Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-10 pb-4 max-w-4xl mx-auto z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          {/* Main Title */}
          <h1 className="text-3xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#2d3a3a] mb-6 leading-[1.2] max-w-2xl mx-auto">
            Where Calm Meets<br />Creativity.
          </h1>

          {/* Subtitle */}
          <p className="text-[11px] md:text-xs text-slate-600 max-w-md mx-auto mb-12 leading-relaxed font-sans font-medium">
            In the rush of college life, imagine a space that feels like a deep breath - gentle and grounding. Here, you can reflect, create, or simply study, with tools to reconnect with your academic stillness.
          </p>

          {/* 3-Column Features Section */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-12 text-center">
            {/* Feature 1 */}
            <div className="flex flex-col items-center px-4">
              <div className="w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center mb-3">
                <Smile className="w-5 h-5 text-amber-600 fill-amber-500/10" />
              </div>
              <h3 className="text-xs font-bold text-[#2d3a3a] mb-2 uppercase tracking-wide">Mindful Tools</h3>
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed font-medium">
                Use journals and notes to build habits for academic well-being.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center px-4">
              <div className="w-10 h-10 bg-slate-800/10 rounded-full flex items-center justify-center mb-3">
                <Book className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-xs font-bold text-[#2d3a3a] mb-2 uppercase tracking-wide">Creative Space</h3>
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed font-medium">
                Write, sketch, or study freely in your own collaborative whiteboard sanctuary.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center px-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                <Leaf className="w-5 h-5 text-emerald-700 fill-emerald-600/10" />
              </div>
              <h3 className="text-xs font-bold text-[#2d3a3a] mb-2 uppercase tracking-wide">Gentle Reminders</h3>
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed font-medium">
                Custom doubt boards to clear academic roadblocks and find clarity.
              </p>
            </div>
          </div>

          {/* Central Call-to-Action Buttons */}
          <div className="flex flex-row gap-4 justify-center items-center mb-10">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-[#df5e5a] hover:bg-[#d8504c] text-white px-6 py-3 rounded-full text-[11px] font-bold transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-0"
              >
                Back to Dashboard
              </Link>
            ) : (
              <>
                <button
                  onClick={handleStartJourney}
                  className="bg-[#df5e5a] hover:bg-[#d8504c] text-white px-6 py-3 rounded-full text-[11px] font-bold transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-0"
                >
                  Start Your Journey +
                </button>
                <Link
                  to="/login"
                  className="bg-white/40 hover:bg-white/60 text-slate-800 border border-slate-900/10 px-6 py-3 rounded-full text-[11px] font-bold transition-all hover:translate-y-[-1px]"
                >
                  Explore Features
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Lakeside Illustration spanning the bottom */}
      <div className="w-full mt-auto relative select-none pointer-events-none">
        <img
          src="/src/assets/hero.png"
          alt="Lakeside Study Scenery"
          className="w-full max-w-5xl mx-auto block object-contain"
        />
      </div>
    </div>
  );
}
