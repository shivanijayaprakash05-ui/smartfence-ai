import React from 'react';
import { ShieldAlert, X, MessageSquare, Droplets, CheckCircle2 } from 'lucide-react';
import { useSmartFence } from '../../context/SmartFenceContext';

export const ToastBanner: React.FC = () => {
  const { activeToast, dismissToast, settings } = useSmartFence();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-4 shadow-2xl text-slate-100 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  {activeToast.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                  DEMO DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeToast.message}
              </p>
            </div>
          </div>
          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Simulated SMS Message bubble */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span>Simulated SMS to {settings.phoneRecipientMasked}</span>
            </span>
            <span className="text-slate-500">{activeToast.timestamp}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300/90 leading-relaxed break-words select-all">
            {activeToast.smsPreview}
          </div>
        </div>
      </div>
    </div>
  );
};
