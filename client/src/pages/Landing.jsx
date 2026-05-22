import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, Users, Video, Award, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Pixel Grid Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative z-10 min-h-[90vh]">
        {/* Soft background glow circles */}
        <div className="absolute top-20 left-10 md:left-20 w-48 h-48 bg-secondary/10 rounded-none blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-20 right-10 md:right-20 w-64 h-64 bg-primary/5 rounded-none blur-3xl opacity-50 pointer-events-none" />

        <motion.div
          className="max-w-4xl mx-auto z-10 relative"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 border-2 border-secondary/20 rounded-none text-slate-800 font-bold mb-8 text-sm md:text-base">
            <Sparkles className="w-4 h-4 text-accent fill-accent" />
            <span>Official Student Vault of Anurag University</span>
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-[6.5rem] font-extrabold tracking-tight mb-6 text-slate-900 leading-none">
            ANURAG UNIV <br />
            <span className="text-primary inline-block mt-2">AUXP VAULT</span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-lg md:text-xl font-medium text-slate-600 mb-10 max-w-2xl mx-auto bg-white/80 p-4 rounded-none border-2 border-slate-900 shadow-neo">
            Share notes, join real-time study rooms, discuss in forums, and level up your academic journey at Anurag.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="group flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold text-lg px-8 py-4 rounded-none border-2 border-slate-900 shadow-neo hover:translate-y-[2px] hover:shadow-neo transition-all">
              Start Learning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/login" className="flex items-center justify-center bg-white text-slate-700 font-bold text-lg px-8 py-4 rounded-none border-2 border-slate-900 shadow-neo hover:translate-y-[2px] hover:shadow-neo transition-all">
              Login
            </Link>
          </motion.div>

          <motion.div variants={fadeIn} className="mt-14 flex justify-center relative">
            <div className="absolute inset-0 bg-secondary/5 blur-2xl rounded-none pointer-events-none" />
            <img 
              src="/src/assets/hero.png" 
              alt="AUXP Digital Sanctuary" 
              className="w-full max-w-3xl border-4 border-slate-900 shadow-neo relative z-10" 
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-slate-50 border-t-2 border-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">CAMPUS POWER-UPS</h2>
            <p className="text-lg font-medium text-slate-500 max-w-xl mx-auto">All your study tools integrated in one seamless, collaborative environment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-primary" />}
              title="Resource Vault"
              description="Upload, share, and discover notes and past papers. Vote on the best resources to help everyone succeed."
              color="bg-primary/10 border-primary/20"
            />
            <FeatureCard
              icon={<Video className="w-8 h-8 text-secondary" />}
              title="Live Classrooms"
              description="Join real-time study rooms featuring a collaborative infinite whiteboard and live group chat."
              color="bg-secondary/10 border-secondary/20"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-slate-700" />}
              title="Community Forums"
              description="Ask questions, get answers, and discuss tricky topics with your peers to resolve doubts instantly."
              color="bg-accent/10 border-accent/20"
            />
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-24 px-4 bg-slate-900 text-white overflow-hidden relative z-10 border-t-2 border-b-2 border-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">LEVEL UP YOUR BRAIN</h2>
            <p className="text-lg md:text-xl font-medium text-slate-300 mb-10 leading-relaxed">
              Earn XP for sharing resources, helping others in the forum, and participating in classrooms. Unlock exclusive badges and climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-none border-2 border-white/20 hover:bg-white/10 transition-colors">
                <Award className="w-6 h-6 text-accent" />
                <span className="font-bold text-lg">Earn XP</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-none border-2 border-white/20 hover:bg-white/10 transition-colors">
                <Zap className="w-6 h-6 text-primary animate-pulse" />
                <span className="font-bold text-lg">Level Up</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-none border-2 border-white/20 hover:bg-white/10 transition-colors">
                <Shield className="w-6 h-6 text-green-400" />
                <span className="font-bold text-lg">Get Badges</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center mt-10 md:mt-0">
            <div className="border-4 border-white bg-slate-950 p-6 shadow-neo text-left font-mono relative w-full max-w-sm">
              <div className="absolute -top-3.5 left-4 bg-primary px-3 py-1 text-xs text-white uppercase font-bold border-2 border-white">
                STUDENT_STATS
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-6 border-b border-white/10 pb-2">
                  <span className="text-slate-400">STUDENT_NAME:</span>
                  <span className="font-bold text-accent">JANE DOE</span>
                </div>
                <div className="flex items-center justify-between gap-6 border-b border-white/10 pb-2">
                  <span className="text-slate-400">UNIVERSITY:</span>
                  <span className="font-bold text-white">ANURAG UNIV</span>
                </div>
                <div className="flex items-center justify-between gap-6 border-b border-white/10 pb-2">
                  <span className="text-slate-400">CURRENT_LEVEL:</span>
                  <span className="font-bold text-secondary">LVL 12</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-slate-400">CURRENT_XP:</span>
                  <span className="font-bold text-green-400">1,250 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-slate-900 py-10 px-4 text-center z-10 relative">
        <p className="font-bold text-slate-500 text-base">
          Built with ☕️ for students, by students. <br className="sm:hidden" />
          <span className="text-primary font-extrabold ml-2 text-lg">AUXP © 2026</span>
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`bg-white border border-slate-200/80 p-8 rounded-neo shadow-neo hover:shadow-neo-lg flex flex-col items-start`}
    >
      <div className={`p-3 rounded-neo border mb-6 ${color}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-extrabold mb-4 text-slate-850">{title}</h3>
      <p className="font-medium text-slate-550 leading-relaxed text-base">{description}</p>
    </motion.div>
  );
}
