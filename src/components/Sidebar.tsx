/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, History, BookMarked, Layers, FolderPlus, Folder as FolderIcon, Download, Upload, Trash2, Archive, Zap, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, ThemeId } from '../types';

interface SidebarProps {
  keywords: string[];
  synonyms: Record<string, string>;
  onTagAction: (keyword: string) => void;
  selectionCount: number;
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  folders: Folder[];
  currentFolderId: string | null;
  onFolderSelect: (id: string | null) => void;
  onCreateFolder: (name: string) => void;
  onMoveToFolder: (folderId: string | null) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, name: string) => void;
  isDarkMode: boolean;
  themeId?: ThemeId;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  keywords, synonyms, onTagAction, selectionCount, isOpen, onClose,
  searchQuery, onSearchChange, folders, currentFolderId, onFolderSelect, onCreateFolder, onMoveToFolder,
  onDeleteFolder, onRenameFolder, isDarkMode, themeId
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const displaySynonyms = Object.entries(synonyms || {}).filter(([key, val]) => {
    const query = (searchQuery || '').toLowerCase();
    return String(key).toLowerCase().includes(query) || 
           String(val).toLowerCase().includes(query);
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <div 
        id="gallery-sidebar" 
        className={`fixed md:relative z-40 w-72 md:w-80 border-r h-full flex flex-col p-6 overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isDarkMode ? 'bg-[#090D16] border-slate-800' : 'bg-white border-gray-100'}`}
      >
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
             <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shadow-lg ${isDarkMode ? 'bg-accent/15 text-accent border border-accent/25' : 'bg-black text-white'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined, borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}>
                {themeId === 'ENTERPRISE' ? <Layers size={14} /> : <Zap size={14} className={isDarkMode ? 'fill-current' : 'fill-white'} />}
             </div>
             <h1 className={`text-lg font-black tracking-tight leading-none uppercase transition-colors ${themeId === 'ENTERPRISE' ? '' : 'italic'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Impulsive</h1>
          </div>
          <p className={`text-[9px] font-extrabold uppercase tracking-[0.25em] leading-none ml-8 transition-colors ${isDarkMode ? 'text-accent' : 'text-orange-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>Engine Console</p>
        </div>

        <div className="space-y-8 flex-1">
          {/* Active Selection Mobile Pill */}
          <motion.div 
            layout
            className={`p-5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#121214] border-[#1F1F23]' : 'bg-gray-50 border-gray-100'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-secondary' : 'text-gray-400'}`}>Active Buffer</span>
              <div className={`w-2 h-2 rounded-full transition-all ${selectionCount > 0 ? (isDarkMode ? 'bg-accent shadow-[0_0_8px_var(--accent)] animate-pulse' : 'bg-orange-500 animate-pulse') : (isDarkMode ? 'bg-main' : 'bg-gray-300')}`} style={{ backgroundColor: selectionCount > 0 && isDarkMode ? 'var(--accent)' : undefined }} />
            </div>
            <div className={`text-3xl font-black flex items-baseline gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectionCount}
              <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>indexed</span>
            </div>
            
            {selectionCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <div className={`w-full h-[1px] mb-2 ${isDarkMode ? 'bg-[#1F1F23]' : 'bg-gray-200/50'}`} />
                <button 
                  onClick={() => onMoveToFolder(currentFolderId)}
                  className={`flex-1 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-accent text-black hover:scale-[1.02] shadow-[0_0_15px_var(--accent-glow)]' : 'bg-black text-white hover:bg-orange-600'}`}
                  style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}
                >
                  <Archive size={12} />
                  Archive
                </button>
              </div>
            )}
          </motion.div>

        {/* Universal Search */}
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 flex justify-between items-center transition-colors ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>
            <span>Universal Search</span>
            {searchQuery && <span className={`animate-pulse ${isDarkMode ? 'text-accent' : 'text-orange-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>Filtering Active</span>}
          </label>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-secondary' : 'text-gray-400'}`} size={16} />
            <input
              type="text"
              placeholder="Tag, ID or context..."
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-xs font-bold focus:outline-none transition-all ${isDarkMode ? 'bg-surface-1 border-main text-white focus:border-accent placeholder:text-[#1F1F23]' : 'bg-white border-gray-100 text-gray-900 focus:border-black placeholder:text-gray-300'}`}
              style={{ borderColor: isDarkMode ? undefined : undefined }} // Handled by tailwind
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Tagging Action */}
        <AnimatePresence>
          {selectionCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 transition-colors ${isDarkMode ? 'text-accent' : 'text-orange-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>
                Bulk Tag Action ({selectionCount})
              </label>
              <div className="relative">
                <Zap size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-accent' : 'text-orange-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} />
                <input
                  type="text"
                  placeholder="Apply new tag..."
                  onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === 'Enter' && target.value) {
                      onTagAction(target.value);
                      target.value = '';
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-xs font-bold focus:outline-none transition-all ${isDarkMode ? 'bg-accent/5 border-accent/20 text-accent focus:border-accent placeholder:text-accent/30' : 'bg-orange-50 border-orange-100 text-orange-900 focus:border-orange-500 placeholder:text-orange-300'}`}
                  style={{ color: isDarkMode ? 'var(--accent)' : undefined, borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}
                />
              </div>
              <p className={`mt-2 text-[9px] font-bold uppercase tracking-widest animate-pulse italic ${isDarkMode ? 'text-accent/50' : 'text-orange-400'}`} style={{ color: isDarkMode ? 'var(--accent-glow)' : undefined }}>
                Press Enter to commit to buffer
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Folders System */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderIcon size={14} className={isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'} />
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>Library Path</span>
              </div>
              <button 
                onClick={() => setShowFolderInput(!showFolderInput)}
                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#1F1F23] text-[#8E8E93]' : 'hover:bg-gray-100 text-gray-400'}`}
                title="Create Path"
              >
                <FolderPlus size={16} />
              </button>
           </div>
           
           <AnimatePresence>
             {showFolderInput && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="mb-4"
               >
                 <input 
                   type="text"
                   autoFocus
                   placeholder="New path name..."
                   className={`w-full px-4 py-2 text-xs font-bold border-2 rounded-xl outline-none transition-all ${isDarkMode ? 'bg-[#121214] border-[#00F2FE]/20 text-white focus:border-[#00F2FE]' : 'border-orange-500/20 focus:border-orange-500'}`}
                   value={newFolderName}
                   onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFolderName) {
                      onCreateFolder(newFolderName);
                      setNewFolderName('');
                      setShowFolderInput(false);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <button 
              onClick={() => onFolderSelect(null)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                currentFolderId === null 
                  ? (isDarkMode ? 'bg-accent text-black shadow-[0_0_15px_var(--accent-glow)]' : 'bg-black text-white shadow-lg') 
                  : (isDarkMode ? 'text-secondary hover:bg-surface-1/50' : 'text-gray-400 hover:bg-gray-50')
              }`}
              style={{ backgroundColor: currentFolderId === null && isDarkMode ? 'var(--accent)' : undefined }}
            >
              <span>Global Root</span>
              <Archive size={14} />
            </button>
            
            {folders.map(folder => (
              <div key={folder.id} className="relative group">
                <div 
                 role="button"
                 tabIndex={0}
                 onClick={() => onFolderSelect(folder.id)}
                 onKeyDown={(e) => e.key === 'Enter' && onFolderSelect(folder.id)}
                 className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                   currentFolderId === folder.id 
                     ? (isDarkMode ? 'bg-white text-black shadow-lg shadow-white/5' : 'bg-orange-500 text-white shadow-lg shadow-orange-100') 
                     : (isDarkMode ? 'text-secondary hover:bg-surface-1/50' : 'text-gray-400 hover:bg-gray-50')
                 }`}
               >
                 <span className="truncate">{folder.name}</span>
                 <div className="flex items-center gap-1">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setActiveMenu(activeMenu === folder.id ? null : folder.id);
                     }}
                     className={`p-1 rounded-md transition-colors ${currentFolderId === folder.id ? 'hover:bg-black/10' : (isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10')}`}
                   >
                     <MoreVertical size={14} className="opacity-40" />
                   </button>
                 </div>
               </div>

               <AnimatePresence>
                 {activeMenu === folder.id && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                     className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl border z-50 p-2 overflow-hidden ${isDarkMode ? 'bg-surface-0 border-main' : 'bg-white border-gray-100'}`}
                   >
                     <button 
                       onClick={() => {
                         const newName = window.prompt("Rename to:", folder.name);
                         if (newName) onRenameFolder(folder.id, newName);
                         setActiveMenu(null);
                       }}
                       className={`w-full text-left px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${isDarkMode ? 'text-secondary hover:bg-surface-1 hover:text-accent' : 'text-gray-600 hover:bg-gray-50'}`}
                     >
                       <Upload size={14} /> Rename
                     </button>
                     <button 
                       onClick={() => {
                         onDeleteFolder(folder.id);
                         setActiveMenu(null);
                       }}
                       className="w-full text-left px-4 py-2 hover:bg-red-500/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-3 transition-colors"
                     >
                       <Trash2 size={14} /> Delete
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Known Keywords */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookMarked size={14} className={isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'} />
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>Memory Matrix</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <button
                key={kw}
                id={`kw-btn-${kw}`}
                onClick={() => {
                  if (selectionCount > 0) {
                    onTagAction(kw);
                  } else {
                    onSearchChange(kw);
                  }
                }}
                className={`px-3 py-2 border rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${isDarkMode ? 'bg-surface-1 border-main text-secondary hover:border-accent hover:text-accent hover:bg-accent/5' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600'}`}
                style={{ color: isDarkMode ? undefined : undefined, borderColor: isDarkMode ? undefined : undefined }}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Synonyms */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History size={14} className={isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'} />
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>Synonym Aliases</span>
          </div>
          <div className="space-y-2">
            {displaySynonyms.map(([alias, target]) => (
              <div key={alias} className={`flex items-center justify-between p-3 rounded-xl border-2 group transition-all ${isDarkMode ? 'bg-surface-1 border-main hover:border-accent/20' : 'bg-white border-gray-50 hover:border-orange-500/20'}`}>
                <span className={`text-[10px] font-mono font-bold ${isDarkMode ? 'text-secondary/40' : 'text-gray-400'}`}>{alias}</span>
                <span className={isDarkMode ? 'text-main' : 'text-gray-200'}>→</span>
                <button
                   onClick={() => {
                      if (selectionCount > 0) {
                        onTagAction(target);
                      } else {
                        onSearchChange(target);
                      }
                  }}
                className={`text-[10px] font-black transition-colors uppercase tracking-widest ${isDarkMode ? 'text-white hover:text-accent' : 'text-gray-900 hover:text-orange-600'}`}
                style={{ color: isDarkMode ? undefined : undefined }}
              >
                {target}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Engine Console Log */}
    <div className={`mt-8 p-4 rounded-2xl overflow-hidden shadow-inner font-mono transition-colors ${isDarkMode ? 'bg-black' : 'bg-gray-900'}`}>
       <div className="flex items-center gap-2 mb-2">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDarkMode ? 'bg-accent' : 'bg-orange-500'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }} />
          <span className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-secondary' : 'text-gray-500'}`}>Console Stream</span>
       </div>
       <div className="space-y-1.5 opacity-50">
          <div className={`text-[7px] ${isDarkMode ? 'text-accent/80' : 'text-orange-500/80'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>[SYSTEM] Session initialized successfully.</div>
          <div className="text-[7px] text-white/40">[BUFFER] Indexed {selectionCount} nodes.</div>
          <div className="text-[7px] text-white/40">[NETWORK] Latency 14ms // Stable.</div>
       </div>
    </div>

    {/* Version Info */}
    <div className={`mt-6 pt-6 border-t flex items-center justify-between text-[8px] font-black uppercase tracking-[0.4em] transition-colors ${isDarkMode ? 'border-[#1F1F23] text-[#1F1F23]' : 'border-gray-100 text-gray-300'}`}>
       <span>Engine v2.04</span>
       <span>RC-1 // Stable</span>
    </div>

  </div>
</>
  );
};
