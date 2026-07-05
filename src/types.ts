/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ImageRecord {
  id: string;
  url: string;
  keywords: string[];
  ownerId: string;
  createdAt: any; // Firestore Timestamp
  folderId?: string;
  title?: string;
}

export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  createdAt: any;
}

export interface GallerySession {
  keywords: string[];
  synonyms: Record<string, string>;
  keywordMap: Record<string, string[]>; // keyword -> [imageIds]
}

export type ThemeId = 'CYBER' | 'GHOST' | 'ROYAL' | 'EMERALD' | 'AMETHYST';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  className: string;
  isDark: boolean;
  fontClass: string;
}

export type ConfirmationStep = 'none' | 'preview' | 'undo_timer';

export interface PendingAction {
  type: 'bulk_tag' | 'single_tag';
  imageIds: string[];
  keyword: string;
  timestamp: number;
}
