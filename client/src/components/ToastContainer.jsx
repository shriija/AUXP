import { useEffect } from 'react';
import { useToastStore } from '../store/useToastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertOctagon, Info, Award } from 'lucide-react';

function ConfettiEffect() {
  const particles = Array.from({ length: 45 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 110;
    const tx = `${Math.cos(angle) * distance}px`;
    const ty = `${Math.sin(angle) * distance - 30}px`; // launch slightly upward
    const tr = `${Math.random() * 720 - 360}deg`;
    const td = `${0.8 + Math.random() * 0.8}s`;
    
    // Anurag themed & retro neon colors
    const colors = ['#ffb800', '#c12632', '#00f0ff', '#ff007f', '#39ff14', '#ffffff', '#8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const borderRadius = Math.random() > 0.5 ? '50%' : '0%';
    const size = `${4 + Math.random() * 6}px`;

    return (
      <span
        key={i}
        className="confetti-particle"
        style={{
          '--tx': tx,
          '--ty': ty,
          '--tr': tr,
          '--td': td,
          backgroundColor: color,
          borderRadius: borderRadius,
          width: size,
          height: size,
          left: '50%',
          top: '50%',
        }}
      />
    );
  });

  return <div className="absolute inset-0 pointer-events-none overflow-visible">{particles}</div>;
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none font-mono">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-white';
          let borderColor = 'border-slate-900';
          let shadowColor = 'shadow-[4px_4px_0px_#0f172a]';
          let icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;

          switch (toast.type) {
            case 'success':
              bgColor = 'bg-[#cbe3db]'; // Cool sage green
              icon = <CheckCircle className="w-5 h-5 text-emerald-800 shrink-0" />;
              break;
            case 'error':
              bgColor = 'bg-[#ffccd5]'; // Soft pastel red
              icon = <AlertOctagon className="w-5 h-5 text-red-800 shrink-0" />;
              break;
            case 'xp':
              bgColor = 'bg-[#fffbeb]'; // Gold / Warm yellow
              icon = <Award className="w-5 h-5 text-amber-600 shrink-0" />;
              break;
            case 'badge':
              bgColor = 'bg-[#ffb800]'; // Anurag Gold
              borderColor = 'border-slate-950';
              shadowColor = 'shadow-[5px_5px_0px_#0f172a]';
              icon = <Award className="w-5.5 h-5.5 text-slate-950 shrink-0 animate-bounce" />;
              break;
            case 'info':
            default:
              bgColor = 'bg-white';
              icon = <Info className="w-5 h-5 text-slate-800 shrink-0" />;
              break;
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`relative pointer-events-auto border-2 ${borderColor} ${bgColor} ${shadowColor} p-4 flex items-center justify-between gap-3 rounded-none w-full overflow-visible`}
            >
              {toast.confetti && <ConfettiEffect />}
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {icon}
                <span className={`text-[11px] font-extrabold tracking-tight uppercase select-none ${toast.type === 'badge' ? 'text-slate-950 font-black text-xs' : 'text-slate-900'}`}>
                  {toast.message}
                </span>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-900 p-0.5 rounded-none border border-transparent hover:border-slate-900 hover:bg-white/20 transition-all shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
