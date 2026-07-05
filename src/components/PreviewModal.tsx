/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Tag, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageRecord } from '../types';

interface PreviewModalProps {
  image: ImageRecord | null;
  onClose: () => void;
  isDarkMode: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ image, onClose, isDarkMode }) => {
  const handleShare = async () => {
    if (!image) return;
    try {
      const shareData: any = {
        title: 'Impulsive Gallery Reference',
        text: `Indexed via Impulsive Engine: ${image.keywords.join(', ') || 'Uncategorized'}`,
      };

      // Only include URL if it's a real HTTP(S) link
      if (image.url && !image.url.startsWith('data:')) {
        shareData.url = image.url;
      }

      if (navigator.share && navigator.canShare) {
        // Attempt to share as file if it's a Data URL
        if (image.url.startsWith('data:')) {
          try {
            const res = await fetch(image.url);
            const blob = await res.blob();
            const file = new File([blob], `impulsive-${image.id.slice(0, 8)}.jpg`, { type: 'image/jpeg' });
            
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (fileErr) {
            console.warn('Could not prepare file for sharing', fileErr);
          }
        }
        
        await navigator.share(shareData);
      } else {
        const copyText = image.url.startsWith('data:') 
          ? `Impulsive Asset [${image.id}]\nTags: ${image.keywords.join(', ')}`
          : image.url;
        
        await navigator.clipboard.writeText(copyText);
        alert('Asset info copied to clipboard!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col md:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
            <button 
              onClick={onClose}
              className="p-3 text-white/80 hover:text-white transition-all bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10 hover:scale-110 active:scale-90"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3">
               <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-3 transition-all rounded-2xl backdrop-blur-xl border ${isDarkMode ? 'text-white/80 hover:text-white bg-white/10 border-white/10 hover:border-accent' : 'text-gray-900/80 hover:text-gray-900 bg-black/5 border-black/10 hover:border-orange-500'}`}
                style={{ borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}
              >
                <Share2 size={20} className={isDarkMode ? 'text-accent' : 'text-orange-500'} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Share Asset</span>
              </button>
              <a 
                href={image.url} 
                download={`impulsive-${image.id}`}
                className={`p-3 transition-all rounded-2xl backdrop-blur-xl border ${isDarkMode ? 'text-white/80 hover:text-white bg-white/10 border-white/10 hover:border-accent' : 'text-gray-900/80 hover:text-gray-900 bg-black/5 border-black/10 hover:border-orange-500'}`}
                style={{ borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}
              >
                <Download size={20} />
              </a>
            </div>
          </div>

          {/* Main Stage */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 25 }}
              src={image.url}
              alt="Preview"
              className="max-h-full max-w-full object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {/* Centered Large Keywords for Mobile */}
            <div className="absolute inset-x-0 bottom-32 flex flex-wrap justify-center gap-3 px-6">
              {image.keywords.map(kw => (
                <motion.span 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  key={kw}
                  className={`px-4 py-2 font-black text-sm rounded-2xl shadow-2xl flex items-center gap-2 ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}
                >
                  <Tag size={14} className={isDarkMode ? 'text-accent' : 'text-orange-500'} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} />
                  {kw}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-8 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-1">
              {image.title ? 'Asset Name / Reference' : 'Index Reference'}
            </p>
            <h4 className="text-white font-mono text-sm">{image.title || image.id}</h4>
            {image.title && (
              <span className="text-[9px] text-white/40 font-mono mt-1 block">ID: {image.id}</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
