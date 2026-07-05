/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Play } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
  userEmail?: string | null;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, userEmail }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showTitleAndBtn, setShowTitleAndBtn] = useState(false);
  const [showBtnPulse, setShowBtnPulse] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Array of boot sequence strings matching terminal console logic
  const bootSequence = [
    "Establishing connection to secure Node network...",
    `User verified: [${userEmail || 'authenticated_node'}] ... OK`,
    "Initializing Core Engine v2.04...",
    "Mounting GLOBAL BUFFER & database pipelines...",
    "Synchronizing Memory Matrix with cloud indices...",
    "Retrieving system aesthetics & color schema...",
    "Loading tag mappings: MARKETING, METRICS, DISCOVERIES ... OK",
    "Running telemetry checks on memory fragments...",
    "Checking workspace status: [30 NODES] ... OK",
    "System verification complete.",
    "Engine Node Status: OPTIMAL."
  ];

  useEffect(() => {
    let currentLineIdx = 0;
    let timer: NodeJS.Timeout;

    const printNextLine = () => {
      if (currentLineIdx < bootSequence.length) {
        setLines(prev => [...prev, bootSequence[currentLineIdx]]);
        currentLineIdx++;
        
        // Random delay to make it feel authentic
        const nextDelay = 350 + Math.random() * 350;
        timer = setTimeout(printNextLine, nextDelay);
      } else {
        // All lines printed, start final reveal sequence
        timer = setTimeout(() => {
          setShowTerminal(false);
          // Reveal main console title & buttons
          setTimeout(() => {
            setShowTitleAndBtn(true);
            setTimeout(() => {
              setShowBtnPulse(true);
            }, 1000);
          }, 400);
        }, 1200);
      }
    };

    // Begin printing after a short initial pause
    timer = setTimeout(printNextLine, 500);

    return () => clearTimeout(timer);
  }, []);

  // Auto scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleEnterWorkspace = () => {
    setIsInitializing(true);
    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] text-white font-mono flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      
      {/* SCANLINES OVERLAY to give realistic CRT/Terminal feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40" />

      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00ffff]/5 blur-[120px] pointer-events-none" />

      {/* TERMINAL BOOT STREAM */}
      <AnimatePresence mode="wait">
        {showTerminal && (
          <motion.div 
            key="terminal-view"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl px-4 md:px-8 text-left flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6 opacity-40 border-b border-white/10 pb-3">
              <Terminal size={14} className="text-[#00ffff]" />
              <span className="text-[10px] tracking-widest uppercase">System Console Loader v2.04</span>
            </div>

            <div className="space-y-2 md:space-y-3 min-h-[220px] max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {lines.map((text, idx) => {
                if (!text || typeof text !== 'string') return null;
                // Highlight tags or status checks
                let renderedText = text;
                if (text.includes("OK")) {
                  renderedText = text.replace("OK", "<span class='text-[#00ffff] font-bold drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]'>OK</span>");
                }
                if (text.includes("OPTIMAL")) {
                  renderedText = text.replace("OPTIMAL", "<span class='text-[#00ffff] font-bold drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]'>OPTIMAL</span>");
                }
                if (text.includes("complete") || text.includes("verified")) {
                  renderedText = text.replace("complete", "<span class='text-[#00ffff]'>complete</span>").replace("verified", "<span class='text-[#00ffff]'>verified</span>");
                }

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs md:text-sm text-gray-400 leading-relaxed font-mono"
                  >
                    <span className="text-gray-600 mr-2">&gt;</span>
                    <span dangerouslySetInnerHTML={{ __html: renderedText }} />
                  </motion.div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </motion.div>
        )}

        {/* REVEAL SEQUENCE */}
        {showTitleAndBtn && (
          <motion.div 
            key="reveal-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center relative z-10"
          >
            {/* Title with Cyan & Blue Glows */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none mb-4 select-none"
              style={{
                textShadow: '0 0 15px rgba(0,255,255,0.7), 0 0 30px rgba(0,255,255,0.3), 0 0 50px rgba(0,85,255,0.4)'
              }}
            >
              Impulsive<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00ffff]">Engine Console</span>
            </motion.h1>

            {/* Active Status Display */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 border border-[#00ffff]/20 px-4 py-2 rounded-full bg-[#00ffff]/5 mb-10"
            >
              <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-ping" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#00ffff]">
                ACTIVE NODE: <span className="text-white">OPTIMAL</span>
              </span>
            </motion.div>

            {/* Enter/Initialize Workspace Button */}
            <motion.button
              onClick={handleEnterWorkspace}
              disabled={isInitializing}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`relative px-8 py-4 bg-transparent border border-[#00ffff] text-[#00ffff] font-mono text-sm md:text-base font-bold uppercase tracking-[0.2em] rounded-xl cursor-pointer overflow-hidden transition-all duration-300 ${
                showBtnPulse ? 'animate-[pulseBtn_2s_infinite_alternate]' : ''
              } hover:bg-[#00ffff]/10 hover:shadow-[0_0_25px_rgba(0,255,255,0.5),inset_0_0_15px_rgba(0,255,255,0.3)]`}
              style={{
                boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.2)'
              }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                {isInitializing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-[#00ffff] rounded-full animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-current" />
                    Initialize Workspace
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic keyframe animation styles injected explicitly to ensure precise CSS pulse compatibility */}
      <style>{`
        @keyframes pulseBtn {
          0% { border-color: #00ffff; color: #00ffff; }
          100% { border-color: #0088ff; color: #0088ff; box-shadow: 0 0 15px rgba(0, 136, 255, 0.4) inset, 0 0 20px rgba(0, 255, 255, 0.2); }
        }
      `}</style>
    </div>
  );
};
