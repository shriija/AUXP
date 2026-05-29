import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { 
  BrainCircuit, 
  BookOpen, 
  MessageSquare, 
  Users, 
  ArrowRight, 
  Search, 
  Plus, 
  ThumbsUp, 
  Check, 
  Clock, 
  FileText, 
  Download 
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vault');

  // Forum tab state
  const [forumPosts, setForumPosts] = useState([
    { id: 1, title: 'Can anyone explain the difference between BFS and DFS traversal times in sparse graphs?', upvotes: 24, replies: 6, tag: 'Algorithms', author: 'Sandeep R. (CSE)' },
    { id: 2, title: 'Need lab record diagrams for Physics Experiment 4 (Oscilloscope Calibration)', upvotes: 15, replies: 2, tag: 'Physics', author: 'Neha G. (ECE)' },
    { id: 3, title: 'Is there a makeup mid-term exam schedule announced for CSE Section C?', upvotes: 9, replies: 12, tag: 'ExamInfo', author: 'Vikas K. (CSE)' }
  ]);

  // Classroom tab state
  const [todoTasks, setTodoTasks] = useState([
    { id: 1, text: 'Review Slide Deck 4', done: true },
    { id: 2, text: 'Complete practice recurrence equations', done: false },
    { id: 3, text: 'Write summary report draft', done: false }
  ]);

  const [timeRemaining, setTimeRemaining] = useState('01:24:45');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const [h, m, s] = prev.split(':').map(Number);
        let totalSeconds = h * 3600 + m * 60 + s - 1;
        if (totalSeconds < 0) totalSeconds = 7200; // loop back to 2 hours
        const newH = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const newM = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const newS = (totalSeconds % 60).toString().padStart(2, '0');
        return `${newH}:${newM}:${newS}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartJourney = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleMockUpvote = (postId) => {
    setForumPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, upvotes: post.upvotes + 1 };
      }
      return post;
    }));
  };

  const handleToggleTask = (taskId) => {
    setTodoTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, done: !task.done };
      }
      return task;
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf8f5] text-slate-900 font-mono selection:bg-accent/40 overflow-x-hidden">
      {/* Neobrutalist Navigation Bar */}
      <nav className="w-full bg-white border-b-4 border-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand logo & icon */}
          <Link to="/" className="flex items-center gap-2.5 hover:translate-y-[1px] transition-transform">
            <div className="bg-primary/10 p-1.5 rounded-none border-2 border-slate-900 shadow-neo-sm">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <span className="font-press text-sm tracking-widest text-slate-900 select-none">AUXP</span>
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <a href="#features" className="text-xs font-black uppercase text-slate-700 hover:text-slate-900 border-2 border-transparent hover:border-slate-900 hover:bg-accent px-3 py-1.5 transition-all">Features</a>
            <a href="#demo" className="text-xs font-black uppercase text-slate-700 hover:text-slate-900 border-2 border-transparent hover:border-slate-900 hover:bg-accent px-3 py-1.5 transition-all">Dashboard Demo</a>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-accent text-slate-900 hover:bg-accent/95 px-4 py-2 border-2 border-slate-900 text-xs font-bold shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-100"
              >
                BACK TO DASHBOARD
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-black uppercase px-3 py-2 border-2 border-transparent hover:border-slate-900 hover:bg-slate-105 transition-all"
                >
                  LOG IN
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white hover:bg-primary/95 px-4 py-2 border-2 border-slate-900 text-xs font-bold shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-100"
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center"
        >
          {/* Main Title Badge */}
          <div className="inline-block bg-accent text-slate-900 border-2 border-slate-900 px-3 py-1 font-bold text-xs uppercase tracking-widest mb-6 -rotate-1 shadow-neo-sm">
            ⚡ COLLABORATIVE STUDY VAULT FOR ANURAGIANS
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl text-slate-900 uppercase">
            Level Up Your <br className="hidden sm:inline" />
            Study Game with <span className="bg-primary/10 text-primary border-b-4 border-primary px-2">AUXP</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl mb-10 leading-relaxed font-sans font-medium px-4">
            Ditch the messy drive folders and scattered WhatsApp chats. Welcome to Anurag University's ultimate study sanctuary. Share resources, clear doubts, and study in real-time rooms.
          </p>

          {/* Central Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mb-16 px-4">
            <button
              onClick={handleStartJourney}
              className="w-full sm:w-auto bg-primary text-white hover:bg-primary/95 px-8 py-4 border-2 border-slate-900 text-sm font-black shadow-neo hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-100 flex items-center justify-center gap-2"
            >
              START YOUR JOURNEY <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#demo"
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-50 px-8 py-4 border-2 border-slate-900 text-sm font-black shadow-neo hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-100 flex items-center justify-center"
            >
              EXPLORE LIVE DEMO
            </a>
          </div>
        </motion.div>
      </section>

      {/* 3-Column Features Section */}
      <section id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Study Vault */}
          <div className="bg-white border-4 border-slate-900 shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-lg transition-all duration-205 flex flex-col">
            <div className="bg-primary border-b-4 border-slate-900 p-3 flex justify-between items-center text-white">
              <span className="text-[10px] font-black uppercase tracking-wider">01 // STUDY VAULT</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-none bg-white border border-slate-900" />
                <div className="w-2.5 h-2.5 rounded-none bg-white border border-slate-900" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary/10 border-2 border-slate-900 flex items-center justify-center mb-4 shadow-neo-sm">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-black text-slate-950 mb-3 uppercase">Shared Vault</h3>
                <p className="text-xs text-slate-650 font-sans leading-relaxed font-semibold mb-6">
                  Access organized repository of lecture notes, past exam papers, and textbooks uploaded and vetted by your fellow institutional classmates.
                </p>
              </div>
              <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                <span>📂 File Repository</span>
                <span className="bg-slate-100 border border-slate-900 px-2 py-0.5 text-slate-900">VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Academic Forum */}
          <div className="bg-white border-4 border-slate-900 shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-lg transition-all duration-205 flex flex-col">
            <div className="bg-accent border-b-4 border-slate-900 p-3 flex justify-between items-center text-slate-900">
              <span className="text-[10px] font-black uppercase tracking-wider">02 // FORUM</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-none bg-slate-900" />
                <div className="w-2.5 h-2.5 rounded-none bg-slate-900" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-accent/20 border-2 border-slate-900 flex items-center justify-center mb-4 shadow-neo-sm">
                  <MessageSquare className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-lg font-black text-slate-950 mb-3 uppercase">Academic Forum</h3>
                <p className="text-xs text-slate-655 font-sans leading-relaxed font-semibold mb-6">
                  Stuck on a problem? Ask the community! Earn XP by posting answers, upvoting helpful solutions, and getting badges. Moderation keeps it spam-free.
                </p>
              </div>
              <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                <span>💬 Doubt Solving</span>
                <span className="bg-accent border border-slate-900 px-2 py-0.5 text-slate-900">GAMIFIED</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Live Classrooms */}
          <div className="bg-white border-4 border-slate-900 shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-lg transition-all duration-205 flex flex-col">
            <div className="bg-secondary border-b-4 border-slate-900 p-3 flex justify-between items-center text-white">
              <span className="text-[10px] font-black uppercase tracking-wider">03 // CLASSROOMS</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-none bg-white border border-slate-900" />
                <div className="w-2.5 h-2.5 rounded-none bg-white border border-slate-900" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-secondary/10 border-2 border-slate-900 flex items-center justify-center mb-4 shadow-neo-sm">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-black text-slate-950 mb-3 uppercase">Live Classrooms</h3>
                <p className="text-xs text-slate-655 font-sans leading-relaxed font-semibold mb-6">
                  Create focus study sessions, manage shared task boards, track focus duration, and study with colleagues in virtual rooms.
                </p>
              </div>
              <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                <span>⏳ Study Rooms</span>
                <span className="bg-secondary text-white border border-slate-900 px-2 py-0.5">REAL-TIME</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mockup Workspace Section */}
      <section id="demo" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-20">
        <div className="text-center mb-10">
          <div className="inline-block bg-primary/10 border-2 border-slate-900 px-3 py-1 font-bold text-xs uppercase mb-3">
            🔧 HANDS-ON PREVIEW
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase mb-3">Explore AUXP's Ecosystem</h2>
          <p className="text-[10px] text-slate-550 font-bold uppercase">Click the tabs below to test drive the dashboard modules</p>
        </div>

        {/* Tab Selectors */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {[
            { id: 'vault', label: 'Study Vault' },
            { id: 'forum', label: 'Academic Forum' },
            { id: 'classroom', label: 'Study Room' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 border-2 border-slate-900 font-black text-xs uppercase transition-all duration-100 hover:-translate-y-0.5 ${
                activeTab === tab.id 
                  ? `${
                      tab.id === 'vault' ? 'bg-primary text-white' : tab.id === 'forum' ? 'bg-accent text-slate-900' : 'bg-secondary text-white'
                    } shadow-neo-sm translate-y-0.5` 
                  : 'bg-white text-slate-900 shadow-neo'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Browser Mockup Window */}
        <div className="w-full max-w-4xl mx-auto bg-white border-4 border-slate-900 shadow-neo overflow-hidden flex flex-col font-mono">
          {/* Title Bar */}
          <div className="bg-[#e2e8f0] border-b-4 border-slate-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-none bg-[#ef4444] border-2 border-slate-900" />
              <div className="w-3 h-3 rounded-none bg-[#eab308] border-2 border-slate-900" />
              <div className="w-3 h-3 rounded-none bg-[#22c55e] border-2 border-slate-900" />
            </div>
            <span className="font-extrabold uppercase text-[10px] text-slate-700 tracking-wider">
              AUXP_STUDENT_DASHBOARD // {activeTab.toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-[8px] text-slate-500">LIVE</span>
            </div>
          </div>

          {/* Window Frame Content */}
          <div className="min-h-[350px] bg-white flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {activeTab === 'vault' && (
                <motion.div
                  key="vault"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Vault Header Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 border-b-2 border-slate-900">
                    <div className="flex-1 flex bg-white border-2 border-slate-900 px-3 py-1.5 items-center gap-2 text-xs">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search CS201 mid-term papers, DS lab manuals..."
                        className="bg-transparent outline-none w-full placeholder:text-slate-400 font-bold text-xs text-slate-800"
                        disabled
                      />
                    </div>
                    <button className="bg-primary text-white border-2 border-slate-900 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed">
                      <Plus className="w-3.5 h-3.5" /> UPLOAD
                    </button>
                  </div>

                  {/* Folder Repo Grid */}
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white text-xs">
                    {[
                      { code: 'CS201', title: 'Data Structures & Algorithms', files: '14 PDFs', downloads: 342, category: 'Engineering' },
                      { code: 'MA201', title: 'Linear Algebra & Calculus', files: '8 PDFs', downloads: 189, category: 'Mathematics' },
                      { code: 'EC210', title: 'Digital Electronics Lab', files: '11 PDFs', downloads: 275, category: 'Electronics' },
                      { code: 'ME102', title: 'Engineering Graphics', files: '6 PDFs', downloads: 120, category: 'Mechanical' },
                      { code: 'CH101', title: 'Applied Chemistry Lab Manuals', files: '5 PDFs', downloads: 98, category: 'Science' },
                      { code: 'HS201', title: 'Professional Communication', files: '4 PDFs', downloads: 64, category: 'Humanities' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-50 border-2 border-slate-900 p-4 shadow-neo-sm hover:translate-y-[-1px] transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-black bg-accent text-slate-900 border border-slate-900 px-1.5 py-0.5 uppercase">{item.code}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{item.category}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-xs mb-1.5 truncate">{item.title}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold pt-2 border-t border-slate-200">
                          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-primary" /> {item.files}</span>
                          <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-slate-500" /> {item.downloads}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'forum' && (
                <motion.div
                  key="forum"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col bg-white"
                >
                  {/* Forum List */}
                  <div className="p-4 sm:p-6 space-y-4 text-xs">
                    <div className="bg-slate-50 border-2 border-slate-900 p-3.5 font-bold text-slate-500 uppercase text-[10px] flex justify-between items-center">
                      <span>Recent Doubts & Discussions</span>
                      <span>3 Active Questions</span>
                    </div>

                    {forumPosts.map((post) => (
                      <div key={post.id} className="border-2 border-slate-900 p-4 bg-slate-50 flex gap-4 items-center justify-between hover:translate-y-[-1px] transition-all shadow-neo-sm">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[9px] font-black bg-primary/10 text-primary border border-primary px-1.5 py-0.5 uppercase">{post.tag}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Posted by {post.author}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm mb-1 leading-snug break-words">{post.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5 mt-2">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> {post.replies} Replies
                          </p>
                        </div>
                        <button
                          onClick={() => handleMockUpvote(post.id)}
                          className="bg-white hover:bg-accent border-2 border-slate-900 p-2 sm:p-3 flex flex-col items-center justify-center gap-1.5 shadow-neo-sm hover:translate-y-[-1px] hover:shadow-none active:translate-y-[1px] transition-all select-none shrink-0"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-800" />
                          <span className="font-black text-xs">{post.upvotes}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'classroom' && (
                <motion.div
                  key="classroom"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col md:flex-row bg-white border-t border-transparent text-xs"
                >
                  {/* Left Panel: Timer & Users */}
                  <div className="flex-1 p-6 border-b-2 md:border-b-0 md:border-r-2 border-slate-900 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm uppercase mb-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse inline-block" />
                            Algorithms Jam Room
                          </h3>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Host: Prof. Kumar (Guest Speaker)</span>
                        </div>
                        <div className="bg-secondary text-white border-2 border-slate-900 px-3 py-1 font-mono font-black text-xs shadow-neo-sm flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          {timeRemaining}
                        </div>
                      </div>

                      {/* Active Participants */}
                      <h4 className="text-[9px] font-black text-slate-500 uppercase mb-2">Active Students (8)</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
                        {[
                          { name: 'John Doe', char: 'JD', color: 'bg-amber-300' },
                          { name: 'Shrija G.', char: 'SG', color: 'bg-primary text-white' },
                          { name: 'Sandeep K.', char: 'SK', color: 'bg-accent' },
                          { name: 'Anil P.', char: 'AP', color: 'bg-emerald-300' },
                          { name: 'Vikram S.', char: 'VS', color: 'bg-blue-300' },
                          { name: 'Ritu M.', char: 'RM', color: 'bg-violet-300' },
                          { name: 'Preeti G.', char: 'PG', color: 'bg-pink-300' },
                          { name: 'Kiran K.', char: 'KK', color: 'bg-teal-300' },
                        ].map((p, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1" title={p.name}>
                            <div className={`w-8 h-8 ${p.color} text-slate-900 font-black text-[10px] border border-slate-900 flex items-center justify-center shadow-neo-sm relative`}>
                              {p.char}
                              <div className="w-1.5 h-1.5 rounded-none bg-emerald-400 absolute bottom-0 right-0 border border-slate-900" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-500 truncate max-w-full">{p.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat Box */}
                    <div className="border-2 border-slate-900 bg-slate-50 p-3 h-28 flex flex-col justify-between font-sans text-[10px] font-medium text-slate-700">
                      <div className="overflow-y-auto space-y-1.5">
                        <div><strong className="text-primary uppercase font-bold">[JD]</strong> Is there any tips for recursion depth?</div>
                        <div><strong className="text-secondary uppercase font-bold">[SK]</strong> Try drawing the recursion tree, it helps structure the base case.</div>
                        <div className="text-emerald-700 italic font-semibold">Preeti G. joined the classroom.</div>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex items-center gap-2">
                        <input type="text" placeholder="Type a message..." className="bg-transparent w-full outline-none font-bold text-[9px] text-slate-800" disabled />
                        <button className="bg-slate-200 border border-slate-900 px-2 py-0.5 text-[8px] font-black uppercase cursor-not-allowed" disabled>SEND</button>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel: Shared To-Do Board */}
                  <div className="w-full md:w-64 p-6 bg-slate-50 flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-slate-900">
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase mb-3 border-b-2 border-slate-900 pb-1.5 flex justify-between items-center">
                      <span>Room Tasks</span>
                      <span className="text-[9px] font-black bg-white border border-slate-900 px-1.5 py-0.5">3 TASKS</span>
                    </h3>

                    <div className="space-y-3 font-sans flex-1">
                      {todoTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleToggleTask(t.id)}
                          className="flex items-center gap-2 bg-white border-2 border-slate-900 p-2.5 cursor-pointer shadow-neo-sm hover:translate-y-[-1px] transition-all hover:bg-slate-50 active:translate-y-0"
                        >
                          <div className={`w-4 h-4 border-2 border-slate-900 flex items-center justify-center shrink-0 ${t.done ? 'bg-emerald-500 text-slate-900' : 'bg-white'}`}>
                            {t.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className={`text-[10px] font-semibold select-none truncate ${t.done ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-bold'}`}>
                            {t.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-slate-200 pt-3 text-[9px] text-slate-400 font-bold uppercase text-center">
                      Click boxes to toggle tasks
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="w-full bg-slate-900 text-accent py-3.5 overflow-hidden border-y-4 border-slate-900 select-none flex whitespace-nowrap mt-auto">
        <motion.div
          animate={{ x: [0, -1140] }}
          transition={{
            ease: "linear",
            duration: 25,
            repeat: Infinity,
          }}
          className="flex gap-8 font-black uppercase text-xs tracking-widest shrink-0"
        >
          {Array(4).fill("AUXP // THE COLLABORATIVE STUDY VAULT FOR ANURAG UNIVERSITY // SHARE KNOWLEDGE // CLEAR DOUBTS // EARN XP").map((text, idx) => (
            <span key={idx} className="mx-4">{text}</span>
          ))}
        </motion.div>
      </div>

      {/* Neobrutalist Footer */}
      <footer className="bg-white border-t-4 border-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-1.5 border-2 border-slate-900 shadow-neo-sm">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <span className="font-press text-sm tracking-widest text-slate-900 select-none">AUXP</span>
          </div>
          <div className="text-[9px] font-bold text-slate-500 uppercase text-center md:text-left">
            © {new Date().getFullYear()} Anurag University. Built for Students, by Students.
          </div>
          <div className="flex gap-4 text-[10px] font-bold">
            <a href="#features" className="hover:text-primary transition-colors uppercase">Features</a>
            <a href="#demo" className="hover:text-primary transition-colors uppercase">Demo</a>
            <Link to="/login" className="hover:text-primary transition-colors uppercase">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
