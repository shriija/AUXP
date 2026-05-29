import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'CONFIRM ACTION',
  message = 'Are you sure you want to proceed?',
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  type = 'danger'
}) {
  if (!isOpen) return null;

  const headerBg = type === 'danger' ? 'bg-red-500' : 'bg-emerald-500';
  const icon = type === 'danger' ? <AlertTriangle className="w-5 h-5 text-white" /> : <HelpCircle className="w-5 h-5 text-white" />;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white border-4 border-slate-900 rounded-none w-full max-w-md shadow-neo relative z-10 font-mono overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Bar */}
        <div className={`p-4 border-b-4 border-slate-900 ${headerBg} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-black text-white text-xs tracking-wider uppercase">
              {title}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-slate-900 transition-colors p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-normal leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t-4 border-slate-900 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-white hover:bg-slate-100 text-slate-850 px-4 py-2 border-2 border-slate-900 text-[10px] font-black tracking-wide shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer uppercase"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`${
              type === 'danger' 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            } px-4 py-2 border-2 border-slate-900 text-[10px] font-black tracking-wide shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer uppercase`}
          >
            {confirmText}
          </button>
        </div>
        
      </div>
    </div>
  );
}
