/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Type, Calendar, ArrowRight, Save, Clock, Check, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageRecord } from '../types';

interface BulkRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: ImageRecord[];
  onRename: (renameConfigs: { id: string; newTitle: string }[]) => Promise<void>;
  isDarkMode: boolean;
}

export const BulkRenameModal: React.FC<BulkRenameModalProps> = ({
  isOpen,
  onClose,
  selectedImages,
  onRename,
  isDarkMode,
}) => {
  const [operationType, setOperationType] = useState<'prepend' | 'append'>('prepend');
  const [renameMode, setRenameMode] = useState<'text' | 'timestamp' | 'both'>('text');
  const [customText, setCustomText] = useState('');
  const [timestampFormat, setTimestampFormat] = useState<'date' | 'datetime' | 'unix'>('date');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewList, setPreviewList] = useState<{ id: string; original: string; preview: string }[]>([]);

  // Function to format timestamp
  const getFormattedTimestamp = (format: 'date' | 'datetime' | 'unix') => {
    const now = new Date();
    if (format === 'unix') {
      return Math.floor(now.getTime() / 1000).toString();
    }
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    if (format === 'date') {
      return `${year}-${month}-${day}`;
    }
    // datetime
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  };

  // Generate names based on options
  useEffect(() => {
    const tStamp = getFormattedTimestamp(timestampFormat);
    
    const newList = selectedImages.map(img => {
      const originalTitle = img.title || `Asset_${img.id.slice(0, 8)}`;
      let segment = '';

      if (renameMode === 'text') {
        segment = customText;
      } else if (renameMode === 'timestamp') {
        segment = tStamp;
      } else {
        // both
        segment = operationType === 'prepend' 
          ? `${customText}_${tStamp}` 
          : `${tStamp}_${customText}`;
      }

      let finalPreview = originalTitle;
      if (segment) {
        if (operationType === 'prepend') {
          finalPreview = `${segment}_${originalTitle}`;
        } else {
          finalPreview = `${originalTitle}_${segment}`;
        }
      }

      // Clean multiple underscores or hyphen bounds
      finalPreview = finalPreview.replace(/__+/g, '_').replace(/_$/, '').replace(/^_+/, '');

      return {
        id: img.id,
        original: originalTitle,
        preview: finalPreview || originalTitle
      };
    });

    setPreviewList(newList);
  }, [selectedImages, operationType, renameMode, customText, timestampFormat]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewList.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = previewList.map(item => ({
        id: item.id,
        newTitle: item.preview
      }));
      await onRename(payload);
      onClose();
    } catch (err) {
      console.error('Rename failure', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-40"
      />

      {/* Main Panel */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 150 }}
        className={`w-full max-w-4xl rounded-[3rem] shadow-3xlg border relative z-50 flex flex-col md:flex-row max-h-[85vh] overflow-hidden ${
          isDarkMode 
            ? 'bg-[#0B0B0C] border-[#1F1F23] text-white shadow-black/80' 
            : 'bg-white border-gray-100 text-gray-900 shadow-gray-200'
        }`}
      >
        {/* Left Control Column */}
        <div className={`w-full md:w-[45%] p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r overflow-y-auto ${
          isDarkMode ? 'border-[#1F1F23]' : 'border-gray-50'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isDarkMode 
                  ? 'bg-accent text-black shadow-[0_0_15px_var(--accent-glow)]' 
                  : 'bg-black text-white'
              }`} style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}>
                <Type size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tighter uppercase italic leading-none">Bulk Renamer</h2>
                <span className={`text-[9px] font-black tracking-widest uppercase mt-1 inline-block ${
                  isDarkMode ? 'text-accent' : 'text-orange-500'
                }`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>
                  {selectedImages.length} Nodes selected
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Switcher */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Renaming Action Position
                </label>
                <div className={`grid grid-cols-2 p-1 rounded-xl gap-1 ${isDarkMode ? 'bg-black/40' : 'bg-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setOperationType('prepend')}
                    className={`py-2 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                      operationType === 'prepend'
                        ? (isDarkMode ? 'bg-accent text-black font-black' : 'bg-black text-white')
                        : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                    }`}
                    style={{ backgroundColor: operationType === 'prepend' && isDarkMode ? 'var(--accent)' : undefined }}
                  >
                    Prepend Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperationType('append')}
                    className={`py-2 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                      operationType === 'append'
                        ? (isDarkMode ? 'bg-accent text-black font-black' : 'bg-black text-white')
                        : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                    }`}
                    style={{ backgroundColor: operationType === 'append' && isDarkMode ? 'var(--accent)' : undefined }}
                  >
                    Append Text
                  </button>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Operation Mode
                </label>
                <div className={`grid grid-cols-3 p-1 rounded-xl gap-1 ${isDarkMode ? 'bg-black/40' : 'bg-gray-100'}`}>
                  {(['text', 'timestamp', 'both'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRenameMode(mode)}
                      className={`py-1.5 px-1 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                        renameMode === mode
                          ? (isDarkMode ? 'bg-accent text-black' : 'bg-black text-white')
                          : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                      }`}
                      style={{ backgroundColor: renameMode === mode && isDarkMode ? 'var(--accent)' : undefined }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Block */}
              {(renameMode === 'text' || renameMode === 'both') && (
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Common Text Prefix / Suffix
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, '_'))}
                      placeholder="e.g. Summer_2026"
                      className={`w-full px-4 py-3 rounded-xl text-xs font-medium border transition-all md:text-sm focus:outline-none ${
                        isDarkMode
                          ? 'bg-[#121214] border-[#1F1F23] text-white focus:border-accent focus:ring-1 focus:ring-accent'
                          : 'bg-gray-50 border-gray-100 focus:border-black text-gray-900 focus:ring-1 focus:ring-black'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                      A-Z, 0-9, _
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamp Selector */}
              {(renameMode === 'timestamp' || renameMode === 'both') && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Timestamp Format
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'date', label: 'Simple Date', desc: 'YYYY-MM-DD' },
                        { id: 'datetime', label: 'Full Date & Time', desc: 'YYYYMMDD_HHMMSS' },
                        { id: 'unix', label: 'Epoch Timestamp', desc: 'Numeric Unix System Time' },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setTimestampFormat(fmt.id as any)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                            timestampFormat === fmt.id
                              ? (isDarkMode ? 'border-accent bg-accent/5 text-white' : 'border-black bg-black/5 text-gray-900')
                              : (isDarkMode ? 'border-[#1F1F23] hover:border-[#2C2C32] text-gray-400' : 'border-gray-100 hover:border-gray-200 text-gray-600')
                          }`}
                          style={{ borderColor: timestampFormat === fmt.id && isDarkMode ? 'var(--accent)' : undefined }}
                        >
                          <div className="flex items-center gap-3">
                            <Clock size={16} className={timestampFormat === fmt.id ? (isDarkMode ? 'text-accent' : 'text-black') : 'text-gray-400'} style={{ color: timestampFormat === fmt.id && isDarkMode ? 'var(--accent)' : undefined }} />
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider leading-none mb-1">{fmt.label}</p>
                              <span className="text-[9px] font-mono opacity-60 leading-none">{fmt.desc}</span>
                            </div>
                          </div>
                          {timestampFormat === fmt.id && (
                            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-accent' : 'bg-black'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="flex gap-3 pt-6 md:pt-0">
            <button
              onClick={onClose}
              className={`flex-1 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all text-center cursor-pointer border ${
                isDarkMode 
                  ? 'border-white/10 hover:border-white/20 text-[#8E8E93] hover:text-white' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:text-black shadow-sm'
              }`}
            >
              Cancel Action
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || previewList.length === 0}
              className={`flex-1 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting
                  ? 'opacity-50 cursor-not-allowed bg-gray-500 text-white'
                  : isDarkMode
                    ? 'bg-accent text-black hover:bg-white hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,254,0.1)]'
                    : 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02]'
              }`}
              style={{ backgroundColor: !isSubmitting && isDarkMode ? 'var(--accent)' : undefined }}
            >
              <Save size={14} />
              {isSubmitting ? 'Writing...' : 'Commit Rename'}
            </button>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className={`flex-1 p-8 md:p-10 flex flex-col justify-between overflow-hidden bg-opacity-20 ${
          isDarkMode ? 'bg-[#121214]/60' : 'bg-gray-50/50'
        }`}>
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div>
                <dt className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Live Stream Refactor
                </dt>
                <h3 className="text-sm font-bold uppercase tracking-wider mt-1">
                  Expected Changes Preview
                </h3>
              </div>
              <div className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-black/5 text-gray-500'
              }`}>
                {previewList.length} Units
              </div>
            </div>

            {/* Preview Stream List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-0">
              {previewList.map((item, index) => {
                const imgObj = selectedImages.find(x => x.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-3 md:p-4 rounded-2xl border transition-colors flex items-center gap-4 ${
                      isDarkMode ? 'bg-[#121214] border-[#1F1F23]/80 hover:border-[#1F1F23]' : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {imgObj && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-black/10">
                        <img src={imgObj.url} alt="target" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="min-w-0 max-w-[200px] md:max-w-[150px]">
                        <span className={`text-[8px] font-black uppercase tracking-wider block ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Original</span>
                        <p className={`text-xs font-mono truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.original}</p>
                      </div>
                      
                      <div className="shrink-0 flex items-center justify-center max-h-4">
                        <ArrowRight size={14} className="text-gray-400 hidden md:inline" />
                        <div className="h-[2px] w-4 bg-gray-200 md:hidden" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={`text-[8px] font-black uppercase tracking-wider block ${isDarkMode ? 'text-accent' : 'text-orange-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>New Name</span>
                        <p className={`text-xs font-mono select-all truncate ${isDarkMode ? 'text-white' : 'text-gray-900 font-bold'}`}>{item.preview}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {previewList.length === 0 && (
                <div className="text-center py-24">
                  <AlertCircle className="mx-auto text-gray-500 mb-4" size={32} />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">No Target Reference Selected</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className={`text-[9.5px] font-bold leading-normal uppercase tracking-widest ${isDarkMode ? 'text-[#8E8E93]/60' : 'text-gray-400'}`}>
              Double check formatting outputs before making state modifications. System changes write immediately.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-xl transition-all border z-50 ${isDarkMode ? 'bg-[#121214] border-[#1F1F23] hover:border-accent hover:text-white text-gray-400' : 'bg-white border-gray-100 hover:border-black text-gray-600'}`}
          style={{ borderColor: isDarkMode ? undefined : undefined }}
        >
          <X size={18} />
        </button>
      </motion.div>
    </div>
  );
};
