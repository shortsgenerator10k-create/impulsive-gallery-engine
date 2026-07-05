/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ImageRecord } from '../types';
import { Check, Tag, Maximize2, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageCardProps {
  image: ImageRecord;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: (image: ImageRecord) => void;
  isDarkMode: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, isSelected, onSelect, onPreview, isDarkMode }) => {
  const keywords = image.keywords || [];
  const hasKeywords = keywords.length > 0;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareData: any = {
        title: 'Impulsive Gallery Reference',
        text: `Indexed via Impulsive Engine: ${keywords.join(', ') || 'Uncategorized'}`,
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
        // Fallback: Copy ID/Keywords if it's a data URL, or the URL itself if it's a link
        const copyText = image.url.startsWith('data:') 
          ? `Impulsive Asset [${image.id}]\nTags: ${keywords.join(', ')}`
          : image.url;
        
        await navigator.clipboard.writeText(copyText);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <motion.div
      layout
      id={`image-card-${image.id}`}
      className={`relative group cursor-pointer aspect-square overflow-hidden rounded-[2rem] border-2 transition-all duration-500 card-3d ${
        isSelected 
          ? (isDarkMode 
              ? 'border-accent shadow-[0_0_30px_var(--accent-glow)] scale-[0.98] -rotate-1' 
              : 'border-black ring-[12px] ring-black/5 shadow-2xl scale-[0.98] -rotate-1')
          : (isDarkMode 
              ? 'border-main bg-surface-1 hover:border-accent hover:shadow-[0_0_20px_var(--accent-glow)] hover:-translate-y-1 hover:rotate-1' 
              : 'border-gray-100 bg-gray-50 hover:border-black hover:shadow-xl hover:-translate-y-1 hover:rotate-1')
      }`}
      style={{ borderColor: isSelected && isDarkMode ? 'var(--accent)' : undefined }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
    >
      <img
        src={image.url}
        alt={`Gallery photo ${image.id}`}
        onClick={() => onSelect(image.id)}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
          hasKeywords ? (isDarkMode ? 'opacity-40 grayscale-[0.2]' : 'opacity-50') : 'opacity-100'
        }`}
        referrerPolicy="no-referrer"
      />
      
      {/* Selection Overlay */}
      {isSelected && (
        <div className={`absolute top-4 right-4 p-1.5 rounded-full shadow-lg z-20 transition-colors ${isDarkMode ? 'bg-accent text-black shadow-accent/40' : 'bg-black text-white'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}>
          <Check size={14} strokeWidth={3} />
        </div>
      )}

      {/* Select Label Overlay */}
      <div 
        id={`select-btn-${image.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(image.id);
        }}
        className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-30 ${
          isSelected 
            ? (isDarkMode ? 'bg-accent text-black opacity-100' : 'bg-black text-white opacity-100')
            : (isDarkMode 
                ? 'bg-[#121214]/90 text-accent opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 border border-accent/20 backdrop-blur-md shadow-2xl shadow-black/80' 
                : 'bg-white/90 text-gray-900 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl')
        }`}
        style={{ 
          backgroundColor: isSelected && isDarkMode ? 'var(--accent)' : undefined,
          color: !isSelected && isDarkMode ? 'var(--accent)' : undefined,
          borderColor: !isSelected && isDarkMode ? 'var(--accent-glow)' : undefined
        }}
      >
        {isSelected ? 'ACTIVE' : 'SELECT'}
      </div>

      <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isDarkMode ? 'bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80' : 'bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100'}`} />

      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20 pointer-events-none">
        <div className="flex flex-wrap gap-1 mb-2">
          {keywords.slice(0, 3).map(kw => (
            <span key={kw} className={`px-2 py-1 backdrop-blur-md rounded-md text-[8px] font-black uppercase tracking-widest border transition-colors ${isDarkMode ? 'bg-accent/10 text-accent border-accent/20' : 'bg-white/10 text-white border-white/20'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined, borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}>
              {kw}
            </span>
          ))}
          {keywords.length > 3 && (
            <span className={`px-2 py-1 backdrop-blur-md rounded-md text-[8px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-white/10 text-white border-white/20'}`}>
              +{keywords.length - 3}
            </span>
          )}
        </div>
        <p className={`text-[10px] font-mono uppercase tracking-widest truncate ${isDarkMode ? 'text-accent/40' : 'text-white/40'}`} style={{ color: isDarkMode ? 'var(--accent-glow)' : undefined }}>
          {image.title || `Asset_${image.id.slice(0, 8)}`}
        </p>
      </div>

      {/* Actions Trigger */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        <button 
          onClick={handleShare}
          className={`p-2 backdrop-blur-md rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all ${isDarkMode ? 'bg-[#121214]/90 text-accent border border-accent/20' : 'bg-white/90 text-orange-500'}`}
          style={{ color: isDarkMode ? 'var(--accent)' : undefined, borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}
        >
          <Share2 size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPreview(image);
          }}
          className={`p-2 backdrop-blur-md rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all ${isDarkMode ? 'bg-[#121214]/90 text-white border border-[#1F1F23]' : 'bg-white/90 text-gray-900'}`}
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Centered Keywords Overlay */}
      <div 
        onClick={() => onSelect(image.id)}
        className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none z-10"
      >
        <div className="flex flex-wrap justify-center gap-1.5">
          {keywords.map(kw => (
            <span 
              key={kw} 
              className={`px-3 py-1.5 backdrop-blur-md text-[10px] font-bold rounded-xl flex items-center gap-1.5 shadow-xl border uppercase tracking-tighter transition-all ${
                isDarkMode 
                  ? 'bg-black/60 text-accent border-accent/20 shadow-black' 
                  : 'bg-black/80 text-white border-white/10'
              }`}
              style={{ color: isDarkMode ? 'var(--accent)' : undefined, borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}
            >
              <Tag size={10} className={isDarkMode ? 'text-accent' : 'text-white'} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} />
              {kw}
            </span>
          ))}
        </div>
        {keywords.length === 0 && (
          <span className={`text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity tracking-[0.2em] ${isDarkMode ? 'text-accent/40' : 'text-gray-400'}`} style={{ color: isDarkMode ? 'var(--accent-glow)' : undefined }}>
            UNINDEXED ASSET
          </span>
        )}
      </div>

      {/* Hover Selection Grade */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode ? 'bg-accent/5 group-hover:opacity-100 opacity-0' : 'bg-orange-500/5 group-hover:opacity-100 opacity-0'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent-glow)' : undefined }} />
    </motion.div>
  );
};
