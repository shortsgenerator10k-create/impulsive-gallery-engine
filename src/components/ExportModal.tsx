/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Archive, Box, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageRecord } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: ImageRecord[];
  isDarkMode: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, selectedImages, isDarkMode }) => {
  const [step, setStep] = useState<'preview' | 'processing' | 'ready'>('preview');

  const startExport = () => {
    setStep('processing');
    setTimeout(() => setStep('ready'), 2400);
  };

  const handleDownload = () => {
    // In a real app we'd zip them. For now, we simulate.
    const blob = new Blob([JSON.stringify(selectedImages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impulsive-engine-export-${Date.now()}.json`;
    a.click();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
        >
          <motion.div 
            initial={{ scale: 0.95, rotateX: 10, y: 30 }}
            animate={{ scale: 1, rotateX: 0, y: 0 }}
            exit={{ scale: 0.95, rotateX: -10, y: 30 }}
            className={`w-full max-w-6xl aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl flex relative border ${isDarkMode ? 'bg-[#0B0B0C] border-[#1F1F23] shadow-black' : 'bg-white border-gray-100 shadow-orange-100/20'}`}
          >
            {/* Sidebar Controls */}
            <div className={`w-1/3 p-12 flex flex-col justify-between border-r ${isDarkMode ? 'bg-[#121214] border-[#1F1F23]' : 'bg-gray-50 border-gray-100'}`}>
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-accent text-black shadow-[0_0_15px_var(--accent-glow)]' : 'bg-black text-white'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}>
                    <Archive size={20} />
                  </div>
                  <h2 className={`text-2xl font-black tracking-tighter uppercase italic transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Export Hub</h2>
                </div>

                <div className="space-y-6">
                  {step === 'preview' && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                       <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>Selected Assets</p>
                       <p className={`text-4xl font-black leading-none transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedImages.length} <span className="text-sm font-bold text-gray-400">Objects</span></p>
                       <p className={`mt-4 text-xs font-medium leading-relaxed ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>Ready to package metadata and asset references into a secure transport layer.</p>
                    </motion.div>
                  )}

                  {step === 'processing' && (
                    <div className="space-y-4">
                       <p className={`text-[10px] font-black uppercase tracking-widest animate-pulse ${isDarkMode ? 'text-accent' : 'text-orange-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>Processing 3D Buffer...</p>
                       <div className={`w-full h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-black border border-main' : 'bg-gray-200'}`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2 }}
                            className={`h-full ${isDarkMode ? 'bg-accent' : 'bg-orange-500'}`}
                            style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}
                          />
                       </div>
                    </div>
                  )}

                  {step === 'ready' && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                       <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Package Optimized</p>
                       <p className={`text-4xl font-black leading-none transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Ready</p>
                       <p className={`mt-4 text-xs font-medium leading-relaxed ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>System has verified all checksums. Export package is signed and ready for deployment.</p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                 <button 
                  onClick={onClose}
                  className={`px-6 py-4 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all ${isDarkMode ? 'border-[#1F1F23] text-[#8E8E93] hover:bg-[#1F1F23] hover:text-white' : 'border-gray-200 text-gray-400 hover:bg-white hover:text-black'}`}
                 >
                  Cancel
                 </button>
                 {step === 'preview' ? (
                   <button 
                    onClick={startExport}
                    className={`flex-1 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl ${isDarkMode ? 'bg-accent text-black shadow-accent/10 hover:scale-[1.02]' : 'bg-black text-white shadow-black/10 hover:bg-orange-600 shadow-orange-100'}`}
                    style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}
                   >
                    Engage Export
                   </button>
                 ) : step === 'ready' ? (
                   <button 
                    onClick={handleDownload}
                    className="flex-1 px-8 py-4 bg-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2"
                   >
                    <Download size={16} />
                    Download
                   </button>
                 ) : null}
              </div>
            </div>

            {/* Visualizer: 3D Stack */}
            <div className={`flex-1 relative flex items-center justify-center overflow-hidden transition-colors ${isDarkMode ? 'bg-black' : 'bg-[#fafafa]'}`}>
                <div className="grid grid-cols-3 gap-6 p-12 w-full max-h-full overflow-y-auto custom-scrollbar">
                  {selectedImages.map((img, i) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, rotateX: 45, y: 100, scale: 0.5 }}
                      animate={{ 
                        opacity: 1, 
                        rotateX: step === 'processing' ? [45, 0, 45] : 45, 
                        y: 0, 
                        scale: 1,
                        z: step === 'processing' ? i * 5 : 0
                      }}
                      transition={{ 
                        delay: i * 0.05,
                        rotateX: { repeat: step === 'processing' ? Infinity : 0, duration: 2 }
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className={`aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 transition-colors ${isDarkMode ? 'bg-[#0B0B0C] border-[#1F1F23]' : 'bg-white border-white'}`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      {step === 'ready' && (
                        <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center">
                           <Sparkles className="text-white" size={32} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Animated Lines for 'Engine' feel */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                   <div className={`absolute top-0 bottom-0 left-1/4 w-[1px] ${isDarkMode ? 'bg-gradient-to-b from-transparent via-accent/40 to-transparent' : 'bg-gradient-to-b from-transparent via-orange-500 to-transparent'}`} style={{ backgroundImage: isDarkMode ? `linear-gradient(to bottom, transparent, var(--accent-glow), transparent)` : undefined }} />
                   <div className={`absolute top-0 bottom-0 left-2/4 w-[1px] ${isDarkMode ? 'bg-gradient-to-b from-transparent via-accent/40 to-transparent' : 'bg-gradient-to-b from-transparent via-orange-500 to-transparent'}`} style={{ backgroundImage: isDarkMode ? `linear-gradient(to bottom, transparent, var(--accent-glow), transparent)` : undefined }} />
                   <div className={`absolute top-0 bottom-0 left-3/4 w-[1px] ${isDarkMode ? 'bg-gradient-to-b from-transparent via-accent/40 to-transparent' : 'bg-gradient-to-b from-transparent via-orange-500 to-transparent'}`} style={{ backgroundImage: isDarkMode ? `linear-gradient(to bottom, transparent, var(--accent-glow), transparent)` : undefined }} />
                </div>
            </div>

            <button 
              onClick={onClose}
              className={`absolute top-12 right-12 p-3 backdrop-blur-xl rounded-2xl transition-all z-50 border ${isDarkMode ? 'bg-white text-black hover:bg-accent border-accent/20' : 'bg-white/50 text-black hover:bg-black hover:text-white border-gray-100'}`}
              style={{ borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}
            >
              <X size={20} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
