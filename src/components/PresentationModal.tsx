/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Zap, Target, BookOpen, ChevronRight, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [slide, setSlide] = React.useState(0);

  const slides = [
    {
      title: "Introduction to Agentic AI Gallery",
      subtitle: "The world is changing. Your gallery shouldn't stay in the past.",
      content: "Impulsive Gallery Engine is not a folder. It's a vision-aware companion that indexes the chaos of your local storage into an impulsive search database.",
      icon: <Sparkles className={isDarkMode ? "text-black" : "text-orange-500"} size={48} />,
      color: isDarkMode ? "bg-accent" : "bg-orange-500"
    },
    {
      title: "Scenario 01: The Airport Check-in",
      subtitle: "The Problem of Digital Panic",
      content: "You're at the boarding gate. The agent needs your QR code or entry permit. You scroll. And scroll. 4,000 photos deep. Panic sets in. \n\nSolution: Type 'ENTRY' or 'QR'. Find it in 0.4 seconds. No more digital sweating.",
      icon: <AlertCircle className="text-red-500" size={48} />,
      color: "bg-red-500"
    },
    {
      title: "Scenario 02: The Design Sprint",
      subtitle: "Stop Wasting Creative Potential",
      content: "You remember seeing a specific font or inspiration 3 months ago. You have 10,000 screenshots. You waste 20 minutes finding it. Your rhythm is broken. \n\nSolution: Impulsive remembers the visual context. One keyword, zero friction.",
      icon: <Zap className="text-yellow-500" size={48} />,
      color: "bg-yellow-500"
    },
    {
      title: "Scenario 03: The Recipe Lost",
      subtitle: "Hidden Gems in Plain Sight",
      content: "A screenshot of your grandma's recipe or a specific health note. It's 'somewhere' in there. It might as well be in the trash if you can't find it when you need it. \n\nSolution: Don't find it.召喚 (Summon) it. Use it. Move on.",
      icon: <Clock className="text-blue-500" size={48} />,
      color: "bg-blue-500"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className={`rounded-[3rem] max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-full md:h-auto max-h-[90vh] border ${isDarkMode ? 'bg-[#0B0B0C] border-[#1F1F23]' : 'bg-white border-gray-100'}`}
          >
            {/* Sidebar Visual */}
            <div 
              className={`md:w-1/3 p-12 flex flex-col justify-between transition-all duration-500 ${slide === 0 && isDarkMode ? 'bg-accent' : slides[slide].color}`}
              style={{ backgroundColor: slide === 0 && isDarkMode ? 'var(--accent)' : undefined }}
            >
              <div className="space-y-4">
                <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md inline-block">
                  {slides[slide].icon}
                </div>
                <h2 className={`text-4xl font-black tracking-tighter leading-none uppercase ${isDarkMode && slide === 0 ? 'text-black' : 'text-white'}`}>
                  Engine<br />Deck v1
                </h2>
              </div>
              <div className={`text-[10px] font-black tracking-[0.3em] uppercase ${isDarkMode && slide === 0 ? 'text-black/40' : 'text-white/40'}`}>
                Impulsive AI // 2026
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 md:p-16 flex flex-col justify-between overflow-y-auto">
              <button 
                onClick={onClose}
                className={`absolute top-8 right-8 p-2 transition-colors ${isDarkMode ? 'text-secondary hover:text-accent' : 'text-gray-300 hover:text-orange-500'}`}
                style={{ color: isDarkMode ? undefined : undefined }}
                id="close-deck-btn"
                mini-id="close-deck-btn"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <div className="space-y-2">
                  <span className={`font-black uppercase tracking-[0.2em] text-[10px] ${isDarkMode ? 'text-accent' : 'text-orange-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>Case Study {slide + 1}</span>
                  <h3 className={`text-3xl md:text-5xl font-black tracking-tighter leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {slides[slide].title}
                  </h3>
                  <p className={`font-bold uppercase tracking-widest text-[10px] sm:text-xs ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>
                    {slides[slide].subtitle}
                  </p>
                </div>

                <p className={`text-lg md:text-xl leading-relaxed font-medium whitespace-pre-line ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-600'}`}>
                  {slides[slide].content}
                </p>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 transition-all duration-300 rounded-full ${slide === i ? (isDarkMode ? 'w-8 bg-accent' : 'w-8 bg-orange-500') : (isDarkMode ? 'w-2 bg-main' : 'w-2 bg-gray-100')}`} 
                      style={{ backgroundColor: slide === i && isDarkMode ? 'var(--accent)' : undefined }}
                    />
                  ))}
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                  {slide > 0 && (
                    <button 
                      onClick={() => setSlide(s => s - 1)}
                      className={`px-6 py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all flex-1 sm:flex-initial ${isDarkMode ? 'border-[#1F1F23] text-[#8E8E93] hover:bg-[#1F1F23]' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                    >
                      Back
                    </button>
                  )}
                  {slide < slides.length - 1 ? (
                    <button 
                      onClick={() => setSlide(s => s + 1)}
                      className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial ${isDarkMode ? 'bg-white text-black hover:bg-accent' : 'bg-gray-900 text-white hover:bg-black'}`}
                    >
                      Next Case
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={onClose}
                      className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex-1 sm:flex-initial shadow-xl ${isDarkMode ? 'bg-accent text-black shadow-accent/20 hover:scale-[1.05]' : 'bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600'}`}
                      style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}
                    >
                      Launch Engine
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
