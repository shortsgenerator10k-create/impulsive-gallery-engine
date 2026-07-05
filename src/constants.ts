/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeConfig } from './types';

export const INITIAL_SYNONYMS: Record<string, string> = {
  "travel": "vacation_2024",
  "ad": "marketing_v1",
  "promo": "marketing_v1",
  "trip": "vacation_2024"
};

export const SAMPLE_KEYWORDS = ["marketing_v1", "vacation_2024"];

export const THEMES: ThemeConfig[] = [
  { id: 'ENTERPRISE', name: 'Enterprise Dark', className: 'theme-enterprise', isDark: true, fontClass: 'font-sans' },
  { id: 'CYBER', name: 'Neon Cyber', className: 'theme-cyber', isDark: true, fontClass: 'font-sans' },
  { id: 'GHOST', name: 'Ghost Proto', className: 'theme-ghost', isDark: false, fontClass: 'font-sans' },
  { id: 'ROYAL', name: 'Royal Crimson', className: 'theme-royal', isDark: true, fontClass: 'font-serif' },
  { id: 'EMERALD', name: 'Emerald Vibe', className: 'theme-emerald', isDark: true, fontClass: 'font-display' },
  { id: 'AMETHYST', name: 'Midnight Amethyst', className: 'theme-amethyst', isDark: true, fontClass: 'font-sans' },
];
