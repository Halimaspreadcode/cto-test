"use client";

import {create} from 'zustand';

export type PresetId = 'instagram-square' | 'linkedin-landscape';

export type SizePreset = {
  id: PresetId;
  label: string;
  width: number;
  height: number;
};

export const PRESETS: Record<PresetId, SizePreset> = {
  'instagram-square': {id: 'instagram-square', label: 'Instagram (1080×1080)', width: 1080, height: 1080},
  'linkedin-landscape': {id: 'linkedin-landscape', label: 'LinkedIn (1200×627)', width: 1200, height: 627}
};

export type FitMode = 'cover' | 'contain';

export type TextLayer = {
  id: string;
  text: string;
  // Normalized position and size relative to stage (0..1)
  xFrac: number; // relative to stage width
  yFrac: number; // relative to stage height
  widthFrac: number; // width as fraction of stage width
  fontScale: number; // font size as fraction of stage height
  align?: 'left' | 'center' | 'right';
};

export type EditorState = {
  presetId: PresetId;
  aspectLocked: boolean;
  fitMode: FitMode;
  safeMarginRatio: number; // ratio of min(stageW, stageH)
  showSafeMargins: boolean;
  textLayers: TextLayer[];

  setPreset: (id: PresetId) => void;
  setAspectLocked: (locked: boolean) => void;
  setFitMode: (mode: FitMode) => void;
  setShowSafeMargins: (show: boolean) => void;
  setSafeMarginRatio: (ratio: number) => void;

  updateTextPosition: (id: string, x: number, y: number, stageW: number, stageH: number) => void;
  updateText: (id: string, text: string) => void;
};

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export const useEditorStore = create<EditorState>((set) => ({
  presetId: 'instagram-square',
  aspectLocked: true,
  fitMode: 'cover',
  safeMarginRatio: 0.06, // ~6%
  showSafeMargins: true,
  textLayers: [
    {
      id: 'title',
      text: 'Your Headline',
      xFrac: 0.1,
      yFrac: 0.1,
      widthFrac: 0.8,
      fontScale: 0.07,
      align: 'left'
    },
    {
      id: 'subtitle',
      text: 'Supporting text goes here',
      xFrac: 0.1,
      yFrac: 0.25,
      widthFrac: 0.8,
      fontScale: 0.035,
      align: 'left'
    }
  ],

  setPreset: (id) => set({presetId: id}),
  setAspectLocked: (locked) => set({aspectLocked: locked}),
  setFitMode: (mode) => set({fitMode: mode}),
  setShowSafeMargins: (show) => set({showSafeMargins: show}),
  setSafeMarginRatio: (ratio) => set({safeMarginRatio: ratio}),

  updateTextPosition: (id, x, y, stageW, stageH) =>
    set((s) => {
      const xFrac = clamp(x / stageW, 0, 1);
      const yFrac = clamp(y / stageH, 0, 1);
      return {
        textLayers: s.textLayers.map((tl) => (tl.id === id ? {...tl, xFrac, yFrac} : tl))
      };
    }),

  updateText: (id, text) =>
    set((s) => ({textLayers: s.textLayers.map((tl) => (tl.id === id ? {...tl, text} : tl))}))
}));
