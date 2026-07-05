/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, RotateCcw, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PendingAction } from '../types';

interface ConfirmationDialogProps {
  pending: PendingAction | null;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  showSuccess: boolean;
  onFinalize: () => void;
  isDarkMode: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  pending, 
  onConfirm, 
  onCancel, 
  isProcessing,
  showSuccess,
  onFinalize,
  isDarkMode
}) => {
  if (!pending && !isProcessing && !showSuccess) return null;

  return (
    <div id="confirmation-portal" className={`fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl ${isDarkMode ? 'bg-black/80' : 'bg-gray-950/60'}`}>
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <div className="relative">
              <div className={`w-20 h-20 border-4 border-t-transparent rounded-full animate-spin ${isDarkMode ? 'border-accent/20 border-t-accent' : 'border-orange-500/10 border-t-orange-500'}`} style={{ borderTopColor: isDarkMode ? 'var(--accent)' : undefined, borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className={`animate-pulse ${isDarkMode ? 'text-accent' : 'text-orange-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} size={24} />
              </div>
            </div>
            <div className="space-y-2">
              <p className={`font-black uppercase tracking-[0.4em] text-sm ${isDarkMode ? 'text-white' : 'text-white'}`}>Synchronizing Database</p>
              <p className={`text-[10px] font-mono animate-pulse ${isDarkMode ? 'text-accent/50' : 'text-orange-500/50'}`} style={{ color: isDarkMode ? 'var(--accent-glow)' : undefined }}>REBUILDING GALLERY INDICES...</p>
            </div>
          </motion.div>
        ) : showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-[2.5rem] p-12 max-w-xl w-full shadow-2xl text-center border relative overflow-hidden ${isDarkMode ? 'bg-surface-1 border-main shadow-black' : 'bg-white border-white/20'}`}
          >
            {/* Background design element */}
            <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-50 ${isDarkMode ? 'bg-accent/5' : 'bg-orange-50'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent-glow)' : undefined }} />
            
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner transition-colors ${isDarkMode ? 'bg-accent/10 text-accent' : 'bg-green-50 text-green-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined, backgroundColor: isDarkMode ? 'var(--accent-glow)' : undefined }}>
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            
            <h3 className={`text-3xl font-black mb-6 tracking-tighter leading-[1.1] transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              INDEXING COMPLETE. SYSTEM IS SYNCHRONIZED.
            </h3>
            
            <p className={`font-black text-xl mb-12 tracking-tight ${isDarkMode ? 'text-accent' : 'text-orange-600'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>
              YOUR GALLERY IS NOW INTELLIGENTly MAPPED.
            </p>
            
            <div className={`w-full h-[1px] mb-10 ${isDarkMode ? 'bg-main' : 'bg-gray-100'}`} />
            
            <button
               onClick={onFinalize}
               className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] ${isDarkMode ? 'bg-white text-black hover:bg-accent' : 'bg-gray-900 text-white hover:bg-black'}`}
               style={{ backgroundColor: isDarkMode ? undefined : undefined }} // Class handled
            >
              <RefreshCw size={16} />
              Return to Engine Dashboard
            </button>
          </motion.div>
        ) : pending ? (
          <motion.div
            key="pre-save"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`rounded-3xl shadow-2xl border max-w-md w-full overflow-hidden transition-colors ${isDarkMode ? 'bg-[#0B0B0C] border-[#1F1F23]' : 'bg-white border-gray-100'}`}
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-accent/10' : 'bg-orange-100'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent-glow)' : undefined }}>
                  <AlertCircle className={isDarkMode ? 'text-accent' : 'text-orange-600'} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-black tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Verify Protocol</h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-secondary' : 'text-gray-400'}`}>Validation Checklist Active</p>
                </div>
              </div>

              <div className={`rounded-2xl p-6 mb-8 border transition-all ${isDarkMode ? 'bg-surface-1 border-main' : 'bg-gray-50 border-gray-100'}`}>
                <p className={`text-sm leading-relaxed transition-colors ${isDarkMode ? 'text-secondary' : 'text-gray-700'}`}>
                  Bulk tag: <span className={`font-black underline decoration-2 underline-offset-4 ${isDarkMode ? 'text-accent' : 'text-orange-600'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>{pending.imageIds.length}</span> items as 
                  <span className={`mx-2 px-3 py-1 rounded-lg font-mono font-black border transition-all ${isDarkMode ? 'bg-accent/10 text-accent border-accent/20' : 'bg-orange-100 text-orange-700 border-orange-200'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined, borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}>'{pending.keyword}'</span>
                </p>
                
                <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'bg-black/20 border-main' : 'border-gray-200/50'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-3 ${isDarkMode ? 'text-secondary' : 'text-gray-400'}`}>Target Indices</span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {pending.imageIds.map(id => (
                      <span key={id} className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border transition-all ${isDarkMode ? 'bg-black border-main text-secondary' : 'bg-white border-gray-200 text-gray-500'}`}>
                        REF_{id.slice(-6)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onCancel}
                  className={`flex-1 px-6 py-4 rounded-2xl border-2 text-sm font-bold transition-all uppercase tracking-widest ${isDarkMode ? 'border-main text-secondary hover:bg-surface-1' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                >
                  Abort
                </button>
                <button
                  onClick={onConfirm}
                  id="confirm-btn-trigger"
                  className={`flex-1 px-6 py-4 rounded-2xl text-sm font-black shadow-xl transition-all flex items-center justify-center gap-2 group ${isDarkMode ? 'bg-accent text-black shadow-accent/10 hover:scale-[1.05]' : 'bg-black text-white shadow-gray-200 hover:bg-orange-600'}`}
                  style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}
                >
                  ENGAGE
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            <div className={`px-8 py-4 border-t transition-all ${isDarkMode ? 'bg-black border-[#1F1F23]' : 'bg-orange-50 border-orange-100'}`}>
              <p className={`text-[10px] text-center font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#1F1F23]' : 'text-orange-400'}`}>Double Check Protocol v2.1</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
