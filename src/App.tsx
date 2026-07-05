/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ImageCard } from './components/ImageCard';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { PreviewModal } from './components/PreviewModal';
import { PresentationModal } from './components/PresentationModal';
import { ExportModal } from './components/ExportModal';
import { BulkRenameModal } from './components/BulkRenameModal';
import { BootSequence } from './components/BootSequence';
import { ImageRecord, PendingAction, GallerySession, Folder, ThemeId } from './types';
import { INITIAL_SYNONYMS, SAMPLE_KEYWORDS, THEMES } from './constants';
import { LayoutGrid, CheckSquare, Square, Trash2, LogIn, Loader2, Plus, Menu, X, BookOpen, Download, Moon, Sun, Palette, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, signIn, signOut, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  setDoc,
  orderBy
} from 'firebase/firestore';
import { Folder as FolderIcon, Briefcase, Camera, Heart, Home, Search as SearchIcon, Sparkles as SparklesIcon, Zap as ZapIcon, FolderPlus } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<GallerySession>({
    keywords: SAMPLE_KEYWORDS,
    synonyms: INITIAL_SYNONYMS,
    keywordMap: {}
  });

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageRecord | null>(null);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasBooted, setHasBooted] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId>('CYBER');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const isDarkMode = currentTheme.isDark;

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.id === themeId);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setThemeId(THEMES[nextIndex].id);
  };

  // File Upload Logic
  const handleFileUpload = async (filesToUpload: FileList | File[]) => {
    if (!filesToUpload || !user) return;

    setLoading(true);
    const newImageIds: string[] = [];
    const filesArray = Array.from(filesToUpload);

    const resizeImage = (base64Str: string): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIDE = 1000;
          if (width > height) {
            if (width > MAX_SIDE) {
              height *= MAX_SIDE / width;
              width = MAX_SIDE;
            }
          } else {
            if (height > MAX_SIDE) {
              width *= MAX_SIDE / height;
              height = MAX_SIDE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      });
    };

    for (const file of filesArray) {
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        const rawUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const url = await resizeImage(rawUrl);

        try {
          const docRef = await addDoc(collection(db, 'images'), {
            url: url,
            keywords: [],
            ownerId: user.uid,
            createdAt: serverTimestamp()
          });
          newImageIds.push(docRef.id);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'images');
        }
      }
    }

    if (newImageIds.length > 0) {
      setSelectedIds(newImageIds);
    }
    
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setHasBooted(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync: Folders
  useEffect(() => {
    if (!user) {
      setFolders([]);
      return;
    }

    const q = query(collection(db, 'folders'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Folder)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'folders');
    });

    return () => unsubscribe();
  }, [user]);

  // Firestore Sync: Images
  useEffect(() => {
    if (!user) {
      setImages([]);
      return;
    }

    let q = query(collection(db, 'images'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imgs = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          keywords: data.keywords || []
        } as ImageRecord;
      });
      setImages(imgs);

      // Rebuild keyword map
      const map: Record<string, string[]> = {};
      imgs.forEach(img => {
        const kws = img.keywords || [];
        kws.forEach(kw => {
          if (kw) {
            if (!map[kw]) map[kw] = [];
            map[kw].push(img.id);
          }
        });
      });
      setSession(prev => ({ ...prev, keywordMap: map }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'images');
    });

    return () => unsubscribe();
  }, [user]);

  // Firestore Sync: Memory
  useEffect(() => {
    if (!user) return;

    const memoryDoc = doc(db, 'memories', user.uid);
    const unsubscribe = onSnapshot(memoryDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSession(prev => ({
          ...prev,
          keywords: data.keywords || SAMPLE_KEYWORDS,
          synonyms: data.synonyms || INITIAL_SYNONYMS
        }));
      } else {
        // Initialize memory if first time
        setDoc(memoryDoc, {
          keywords: SAMPLE_KEYWORDS,
          synonyms: INITIAL_SYNONYMS,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `memories/${user.uid}`));
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Selection Logic
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const current = prev || [];
      return current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    });
  };

  const selectAll = () => setSelectedIds(images.map(img => img.id));
  const deselectAll = () => setSelectedIds([]);

  const createFolder = async (name: string) => {
    if (!user || !name) return;
    try {
      await addDoc(collection(db, 'folders'), {
        name,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'folders');
    }
  };

  const moveImagesToFolder = async (folderId: string | null) => {
    if (selectedIds.length === 0) return;
    try {
      const promises = selectedIds.map(id => 
        updateDoc(doc(db, 'images', id), { folderId: folderId })
      );
      await Promise.all(promises);
      setSelectedIds([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'images');
    }
  };

  const handleBulkRename = async (renameConfigs: { id: string; newTitle: string }[]) => {
    if (!user || renameConfigs.length === 0) return;
    try {
      const promises = renameConfigs.map(config => 
        updateDoc(doc(db, 'images', config.id), { title: config.newTitle })
      );
      await Promise.all(promises);
      setSelectedIds([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'images');
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!window.confirm("Delete this library path? Files will remain in Global Root.")) return;
    try {
      // Unset folderId for all images in this folder
      const imgsToUpdate = images.filter(img => img.folderId === folderId);
      const updatePromises = imgsToUpdate.map(img => 
        updateDoc(doc(db, 'images', img.id), { folderId: null })
      );
      await Promise.all(updatePromises);
      await deleteDoc(doc(db, 'folders', folderId));
      if (currentFolderId === folderId) setCurrentFolderId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'folders');
    }
  };

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      await updateDoc(doc(db, 'folders', folderId), { name: newName });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'folders');
    }
  };

  // Tagging Logic (Double Check Edition)
  const initiateTagging = (keyword: string) => {
    if (selectedIds.length === 0) return;
    
    setPendingAction({
      type: 'bulk_tag',
      imageIds: [...selectedIds],
      keyword: keyword,
      timestamp: Date.now()
    });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || !user) return;

    setIsProcessing(true);
    try {
      // Bulk update
      const promises = pendingAction.imageIds.map(async (id) => {
        const imageRef = doc(db, 'images', id);
        const img = images.find(i => i.id === id);
        if (img) {
          const imgKeywords = img.keywords || [];
          const nextKeywords = imgKeywords.includes(pendingAction.keyword)
            ? imgKeywords
            : [...imgKeywords, pendingAction.keyword];
          
          return updateDoc(imageRef, { keywords: nextKeywords });
        }
      });

      // Update memory if it's a new keyword
      const sessionKeywords = session?.keywords || [];
      if (!sessionKeywords.includes(pendingAction.keyword)) {
        const memoryRef = doc(db, 'memories', user.uid);
        await updateDoc(memoryRef, {
          keywords: [...sessionKeywords, pendingAction.keyword],
          updatedAt: serverTimestamp()
        });
      }

      await Promise.all(promises);
      
      setPendingAction(null);
      setSelectedIds([]);
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
      setIsProcessing(false);
      handleFirestoreError(error, OperationType.UPDATE, 'images');
    }
  };

  const seedSamplePhotos = async () => {
    if (!user) return;
    for (let i = 0; i < 6; i++) {
      await addDoc(collection(db, 'images'), {
        url: `https://picsum.photos/seed/gallery-${Date.now()}-${i}/800/800`,
        keywords: [],
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (user && !hasBooted) {
    return <BootSequence onComplete={() => setHasBooted(true)} userEmail={user.email} />;
  }

  if (!user) {
    return (
      <div className={`h-screen w-full flex flex-col md:flex-row overflow-hidden transition-colors duration-700 ${currentTheme.className} ${currentTheme.fontClass} ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        {/* Left Side: Editorial Design */}
        <div className={`flex-1 p-12 md:p-24 flex flex-col justify-between relative overflow-hidden transition-all duration-700 ${isDarkMode ? 'bg-gradient-to-br from-[#0B0B0C] to-black' : 'bg-[#F5F5F7]'}`}>
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
             <div className={`absolute top-1/4 right-0 w-96 h-96 blur-[160px] ${isDarkMode ? 'bg-accent' : 'bg-orange-600'}`} style={{ backgroundColor: 'var(--accent)' }} />
          </div>
          
          <div className="relative z-10">
            <div className={`flex items-center gap-3 mb-12 group cursor-pointer`} onClick={cycleTheme}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.4em] transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Engine v2.04 // {currentTheme.name}</span>
            </div>

            <h1 
              className={`text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] font-black uppercase tracking-tighter mb-8 max-w-2xl transition-colors engine-glitch ${currentTheme.id === 'ROYAL' ? 'calligraphy' : (currentTheme.fontClass === 'font-serif' ? 'italic' : 'transform -skew-x-12')} ${isDarkMode ? 'text-white' : 'text-black'}`}
              data-text="Organize"
            >
              Organize <br />
              <span className={isDarkMode ? "text-accent" : "text-black"} style={{ color: 'var(--accent)' }}>Impulsively</span>
            </h1>

            <div className="flex flex-col gap-6 max-w-sm">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
                  <SearchIcon size={16} />
                </div>
                <div>
                   <p className={`font-bold text-sm mb-1 uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Instant Recovery</p>
                   <p className={`text-xs leading-relaxed font-medium transition-colors ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Never lose a photo again. Our engine indexes visual context in real-time.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
                  <SparklesIcon size={16} />
                </div>
                <div>
                   <p className={`font-bold text-sm mb-1 uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Agentic Tagging</p>
                   <p className={`text-xs leading-relaxed font-medium transition-colors ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Smart bulk tagging that remembers synonyms and context for you.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`relative z-10 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] border-t pt-8 transition-colors ${isDarkMode ? 'text-white/20 border-white/10' : 'text-black/20 border-black/10'}`}>
            <span>Built for Speed</span>
            <span>Est. 2026 // Gallery Engine</span>
          </div>
        </div>

        {/* Right Side: Simple Sign In */}
        <div className={`w-full md:w-[450px] p-12 flex flex-col justify-center items-center relative transition-colors duration-700 ${isDarkMode ? 'bg-[#121214]' : 'bg-white'}`}>
          <div className="w-full max-w-xs relative z-10">
            <h2 className={`text-2xl font-black mb-8 tracking-tighter uppercase italic transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Secure Console</h2>
            
            <button 
              onClick={signIn}
              id="signin-btn"
              className={`w-full flex items-center justify-center gap-4 px-8 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 group ${
                isDarkMode 
                  ? 'bg-accent text-black shadow-accent/10 hover:scale-[1.02]' 
                  : 'bg-black text-white shadow-black/10 hover:bg-orange-600 hover:scale-[1.02]'
              }`}
              style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}
            >
              <LogIn size={18} className="group-hover:rotate-12 transition-transform" />
              Initialize Session
            </button>
            
            <p className={`mt-8 text-center text-[10px] font-bold uppercase tracking-widest leading-loose ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>
              By accessing the engine, you agree to our <br />
              <span className={`underline cursor-pointer ${isDarkMode ? 'text-accent' : 'text-black'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>Protocol terms</span> & <span className={`underline cursor-pointer ${isDarkMode ? 'text-accent' : 'text-black'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>Security bypass</span>
            </p>
          </div>

          {isDarkMode && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t opacity-40" style={{ backgroundImage: `linear-gradient(to top, var(--accent-glow), transparent)` }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredImages = images.filter(img => {
    // Search refinement: Handle comma separated search or partial keyword matching
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return !currentFolderId || img.folderId === currentFolderId;
    }

    const imgKeywords = img.keywords || [];
    const synonyms = session?.synonyms || {};

    const matchesSearch = 
      imgKeywords.some(kw => kw && typeof kw === 'string' && kw.toLowerCase().includes(query)) ||
      (img.id && img.id.toLowerCase().includes(query)) ||
      (img.title && img.title.toLowerCase().includes(query)) ||
      (synonyms[query] && imgKeywords.some(kw => kw && typeof kw === 'string' && kw.toLowerCase().includes(synonyms[query].toLowerCase())));
    
    const matchesFolder = !currentFolderId || img.folderId === currentFolderId;
    
    return matchesSearch && matchesFolder;
  });

  return (
    <div 
      className={`flex h-screen w-full transition-colors duration-500 overflow-hidden ${currentTheme.className} ${currentTheme.fontClass} ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Sidebar 
        keywords={session.keywords}
        synonyms={session.synonyms}
        selectionCount={selectedIds.length}
        onTagAction={initiateTagging}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        folders={folders}
        currentFolderId={currentFolderId}
        onFolderSelect={setCurrentFolderId}
        onCreateFolder={createFolder}
        onMoveToFolder={moveImagesToFolder}
        onDeleteFolder={deleteFolder}
        onRenameFolder={renameFolder}
        isDarkMode={isDarkMode}
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)} 
        accept="image/jpeg,image/png" 
        multiple 
        className="hidden" 
      />

      <main className={`flex-1 flex flex-col min-w-0 transition-colors duration-500 relative ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-50 backdrop-blur-3xl border-4 border-dashed m-8 rounded-[4rem] flex flex-col items-center justify-center pointer-events-none ${isDarkMode ? 'bg-accent/5 border-accent' : 'bg-orange-500/10 border-orange-500'}`}
              style={{ borderColor: isDarkMode ? 'var(--accent)' : undefined, backgroundColor: isDarkMode ? 'var(--accent-glow)' : undefined }}
            >
              <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-3xl animate-bounce ${isDarkMode ? 'bg-accent text-black shadow-accent/20' : 'bg-orange-500 text-white shadow-orange-500/20'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}>
                <Plus size={48} />
              </div>
              <h3 className={`mt-8 text-4xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-accent' : 'text-orange-600'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>Release to Index</h3>
              <p className={`font-bold uppercase tracking-[0.3em] text-xs ${isDarkMode ? 'text-accent/60' : 'text-orange-400'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>Direct Intake Active</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header bar */}
        <header className={`h-16 md:h-20 border-b flex items-center justify-between px-4 md:px-8 backdrop-blur-md sticky top-0 z-20 transition-colors ${isDarkMode ? 'bg-black/80 border-[#1F1F23]' : 'bg-white/80 border-gray-50'}`}>
          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 -ml-2 md:hidden ${isDarkMode ? 'text-[#8E8E93] hover:text-accent' : 'text-gray-400 hover:text-orange-500'}`}
              style={{ color: isDarkMode ? 'var(--accent)' : undefined }}
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-3">
              {user.photoURL && <img src={user.photoURL} alt="" className={`w-8 h-8 rounded-full border ${isDarkMode ? 'border-[#1F1F23]' : 'border-gray-200'}`} referrerPolicy="no-referrer" />}
              <button id="signout-btn" onClick={() => signOut()} className={`text-xs font-black transition-colors uppercase tracking-widest ${isDarkMode ? 'text-[#8E8E93] hover:text-red-500' : 'text-gray-400 hover:text-red-500'}`}>SignOut</button>
            </div>
            <div className={`hidden md:block h-4 w-[1px] ${isDarkMode ? 'bg-[#1F1F23]' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-accent shadow-[0_0_8px_var(--accent)]' : 'bg-green-500'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }} />
              <div className="flex flex-col">
                <h2 className={`text-[10px] md:text-sm font-black uppercase tracking-widest truncate max-w-[80px] md:max-w-none leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentFolderId ? (folders.find(f => f.id === currentFolderId)?.name || 'Library') : 'Active Node'}
                </h2>
                <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>
                  Engine Status: Optimal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 group ${
                  isDarkMode 
                    ? 'bg-[#1F1F23] border-[#2A2A2E] text-white hover:border-accent hover:shadow-[0_0_15px_var(--accent-glow)]' 
                    : 'bg-white border-gray-100 text-gray-900 hover:border-black shadow-sm'
                }`}
                title="Change Theme"
              >
                 <Palette size={18} className={`transition-transform group-hover:rotate-12 ${isDarkMode ? 'text-accent' : 'text-orange-500'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} />
                 <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{currentTheme.name}</span>
              </button>

              <AnimatePresence>
                {showThemeSelector && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setShowThemeSelector(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className={`absolute right-0 top-full mt-3 w-64 rounded-2xl border-2 z-50 p-2 shadow-2xl backdrop-blur-3xl transition-all ${
                        isDarkMode ? 'bg-[#0B0B0C]/90 border-[#1F1F23] shadow-black' : 'bg-white/90 border-gray-100 shadow-gray-200'
                      }`}
                    >
                      <div className="px-3 py-2 mb-2 border-b border-white/5 pb-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>System Aesthetics</span>
                          <Palette size={10} className={isDarkMode ? 'text-accent' : 'text-gray-400'} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        {THEMES.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setThemeId(t.id);
                              setShowThemeSelector(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${
                              themeId === t.id 
                                ? (isDarkMode ? 'bg-accent text-black font-black' : 'bg-black text-white font-black') 
                                : (isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-black')
                            }`}
                            style={{ backgroundColor: themeId === t.id && isDarkMode ? 'var(--accent)' : undefined }}
                          >
                            <div className="flex items-center gap-3 relative z-10">
                              <div className={`w-3 h-3 rounded-full border transition-transform group-hover:scale-125 ${t.isDark ? (isDarkMode ? 'border-white/20' : 'border-black/20') : 'border-gray-300'}`} style={{ backgroundColor: `var(--accent)`, borderColor: themeId === t.id ? 'transparent' : undefined }} />
                              <span className={`text-[11px] uppercase tracking-widest ${t.fontClass === 'font-serif' ? 'italic font-serif' : (t.fontClass === 'font-display' ? 'font-display' : '')}`}>{t.name}</span>
                            </div>
                            {themeId === t.id && (
                              <div className={`w-1.5 h-1.5 rounded-full animate-pulse relative z-10 ${isDarkMode ? 'bg-black' : 'bg-white'}`} />
                            )}
                            {/* Hover effect highlight */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-white pointer-events-none`} />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <motion.button 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowRename(true)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black shadow-xl transition-all uppercase tracking-widest ${
                    isDarkMode 
                      ? 'bg-[#1F1F23]/60 border border-white/5 hover:border-accent text-white hover:shadow-[0_0_15px_var(--accent-glow)]' 
                      : 'bg-white border border-gray-200 text-gray-900 shadow-sm hover:border-black hover:bg-gray-50'
                  }`}
                >
                  <Type size={14} className={isDarkMode ? 'text-accent' : 'text-gray-500'} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} />
                  <span className="hidden sm:inline">Bulk Rename</span>
                  <span className="inline sm:hidden">Rename</span> ({selectedIds.length})
                </motion.button>

                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowExport(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black shadow-xl transition-all uppercase tracking-widest ${isDarkMode ? 'bg-accent text-black shadow-accent/20 hover:scale-[1.05]' : 'bg-orange-500 text-white shadow-orange-100 hover:bg-orange-600 shadow-sm'}`}
                  style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}
                >
                  <Download size={14} /> Export ({selectedIds.length})
                </motion.button>
              </div>
            )}

            <button 
              onClick={() => setShowPresentation(true)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2.5 border-2 rounded-xl text-[10px] md:text-xs font-black transition-all uppercase tracking-widest hidden lg:flex ${isDarkMode ? 'border-[#1F1F23] text-[#8E8E93] hover:text-accent hover:border-accent/20' : 'border-gray-100 text-gray-400 hover:text-orange-500 hover:border-orange-500/20 shadow-sm'}`}
              style={{ color: isDarkMode ? undefined : undefined }}
            >
              <BookOpen size={14} className={isDarkMode ? 'text-accent' : ''} style={{ color: isDarkMode ? 'var(--accent)' : undefined }} />
              Deck
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black shadow-xl transition-all uppercase tracking-widest ${isDarkMode ? 'bg-white text-black hover:bg-[#00F2FE]' : 'bg-gray-900 text-white shadow-gray-200 hover:bg-black'}`}
            >
              <Plus size={14} className="md:size-4" /> 
              <span className="hidden xs:inline">Import</span>
            </button>

            <div className={`h-6 w-[1px] ${isDarkMode ? 'bg-[#1F1F23]' : 'bg-gray-100'}`} />

            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-1 md:gap-4">
                <button 
                  onClick={deselectAll}
                  className={`p-2 transition-colors ${isDarkMode ? 'text-[#8E8E93] hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                  title="Clear selection"
                >
                  <X size={18} />
                </button>
                <button 
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-red-500 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
                  onClick={async () => {
                    if (window.confirm("Delete these photos?")) {
                      const ids = [...selectedIds];
                      setSelectedIds([]);
                      await Promise.all(ids.map(id => deleteDoc(doc(db, 'images', id))));
                    }
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={selectAll}
                className={`p-2 text-gray-400 hover:text-gray-900 md:px-4 md:py-2 md:text-xs md:font-semibold md:flex md:items-center md:gap-2 transition-colors ${isDarkMode ? 'hover:text-white' : ''}`}
              >
                <CheckSquare size={18} className="md:size-[14px]" />
                <span className="hidden md:inline">Select all</span>
              </button>
            )}
          </div>
        </header>

        {/* Gallery Grid */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar transition-colors ${isDarkMode ? 'bg-black' : 'bg-gray-50/20'}`}>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDarkMode ? 'bg-accent text-black shadow-accent/30' : 'bg-black text-white'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}>
                      <LayoutGrid size={16} />
                   </div>
                   <h2 className={`text-3xl font-black tracking-tighter uppercase italic transform -skew-x-12 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                     {currentFolderId ? folders.find(f => f.id === currentFolderId)?.name : 'Global Buffer'}
                   </h2>
                </div>
                <div className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>
                   <span>Inventory: {filteredImages.length} Nodes</span>
                   {searchQuery && (
                     <span className={`px-2 py-0.5 rounded-md animate-pulse ${isDarkMode ? 'text-accent bg-accent/10' : 'text-orange-500 bg-orange-50'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined, backgroundColor: isDarkMode ? 'var(--accent-glow)' : undefined }}>
                        Query: "{searchQuery}" Active
                     </span>
                   )}
                </div>
             </div>
             
             {selectedIds.length > 0 && (
               <div className={`flex items-center gap-2 px-6 py-3 border-2 rounded-2xl shadow-xl transition-all ${isDarkMode ? 'bg-accent/5 border-accent/20 shadow-accent/5' : 'bg-white border-orange-500/20 shadow-orange-100/50'}`} style={{ borderColor: isDarkMode ? 'var(--accent-glow)' : undefined }}>
                  <div className={`w-2 h-2 rounded-full animate-ping ${isDarkMode ? 'bg-accent' : 'bg-orange-500'}`} style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-accent' : 'text-gray-900'}`} style={{ color: isDarkMode ? 'var(--accent)' : undefined }}>
                    Targeting {selectedIds.length} Assets
                  </span>
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((img, idx) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 15, 
                    stiffness: 100,
                    delay: idx * 0.01 
                  }}
                  className="perspective-1000"
                >
                  <ImageCard 
                    image={img}
                    isSelected={(selectedIds || []).includes(img.id)}
                    onSelect={toggleSelect}
                    onPreview={(image: ImageRecord) => setPreviewImage(image)}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredImages.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-48">
                <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center mb-10 border-2 border-dashed animate-pulse ${isDarkMode ? 'bg-[#1F1F23]/20 text-[#8E8E93]/20 border-[#1F1F23]' : 'bg-gray-100/50 text-gray-200 border-gray-100'}`}>
                  <Camera size={48} />
                </div>
                <h3 className={`text-4xl font-black tracking-tighter uppercase mb-4 italic transform -skew-x-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Data Found</h3>
                <p className={`text-xs font-bold uppercase tracking-[0.3em] mb-8 ${isDarkMode ? 'text-[#8E8E93]' : 'text-gray-400'}`}>System is clear of indexed assets</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all ${isDarkMode ? 'bg-accent text-black shadow-accent/10 hover:scale-105' : 'bg-orange-500 text-white shadow-orange-100 hover:bg-orange-600 hover:scale-105'}`}
                  style={{ backgroundColor: isDarkMode ? 'var(--accent)' : undefined }}
                >
                  Index New Discovery
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmationDialog 
        pending={pendingAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
        isProcessing={isProcessing}
        showSuccess={showSuccess}
        onFinalize={() => setShowSuccess(false)}
        isDarkMode={isDarkMode}
      />

      <PreviewModal 
        image={previewImage}
        onClose={() => setPreviewImage(null)}
        isDarkMode={isDarkMode}
      />

      <PresentationModal 
        isOpen={showPresentation}
        onClose={() => setShowPresentation(false)}
        isDarkMode={isDarkMode}
      />

      <ExportModal 
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        selectedImages={images.filter(img => img && (selectedIds || []).includes(img.id))}
        isDarkMode={isDarkMode}
      />

      <BulkRenameModal
        isOpen={showRename}
        onClose={() => setShowRename(false)}
        selectedImages={images.filter(img => img && (selectedIds || []).includes(img.id))}
        onRename={handleBulkRename}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
