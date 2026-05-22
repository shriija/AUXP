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
      {/* Background pattern (CSS dots) */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative z-10 min-h-[90vh]">
        {/* Soft background glow circles */}
        <div className="absolute top-20 left-10 md:left-20 w-48 h-48 bg-secondary/15 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute bottom-20 right-10 md:right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-36 h-36 bg-accent/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <motion.div
          className="max-w-4xl mx-auto z-10 relative"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 border border-secondary/20 rounded-full text-amber-700 font-semibold mb-8 text-sm md:text-base">
            <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
            <span>The ultimate study companion is here</span>
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-6xl md:text-8xl lg:text-[7rem] font-extrabold tracking-tight mb-6 text-slate-900 leading-none">
            Collaborative <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block mt-2">Study Vault</span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-lg md:text-xl font-medium text-slate-600 mb-10 max-w-2xl mx-auto bg-white/60 backdrop-blur-sm p-4 rounded-neo border border-slate-200/60 shadow-sm">
            Share notes, join real-time classrooms, discuss in forums, and level up your academic journey.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="group flex items-center justify-center gap-2 bg-primary text-white font-bold text-lg px-8 py-4 rounded-neo shadow-neo hover:-translate-y-0.5 transition-all">
              Start Learning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/login" className="flex items-center justify-center bg-white text-slate-700 font-semibold text-lg px-8 py-4 rounded-neo border border-slate-200 shadow-sm hover:shadow hover:bg-slate-50 transition-all">
              Login
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">Everything you need</h2>
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
              icon={<Users className="w-8 h-8 text-accent" />}
              title="Community Forums"
              description="Ask questions, get answers, and discuss tricky topics with your peers to resolve doubts instantly."
              color="bg-accent/10 border-accent/20"
            />
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-24 px-4 bg-slate-900 text-white overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Level Up Your Brain</h2>
            <p className="text-lg md:text-xl font-medium text-slate-300 mb-10 leading-relaxed">
              Earn XP for sharing resources, helping others in the forum, and participating in classrooms. Unlock exclusive badges and climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-neo border border-white/10 hover:bg-white/10 transition-colors">
                <Award className="w-6 h-6 text-secondary" />
                <span className="font-semibold text-lg">Earn XP</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-neo border border-white/10 hover:bg-white/10 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
                <span className="font-semibold text-lg">Level Up</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-neo border border-white/10 hover:bg-white/10 transition-colors">
                <Shield className="w-6 h-6 text-accent" />
                <span className="font-semibold text-lg">Get Badges</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center mt-10 md:mt-0">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-secondary to-orange-500 rounded-full border-8 border-white/10 flex items-center justify-center animate-bounce shadow-2xl transform rotate-12">
              <span className="text-6xl md:text-7xl font-extrabold text-white -rotate-12">Lvl 99</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-10 px-4 text-center z-10 relative">
        <p className="font-medium text-slate-500 text-base">
          Built with ☕️ for students, by students. <br className="sm:hidden" />
          <span className="text-primary font-bold ml-2 text-lg">StudyVault © 2026</span>
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
