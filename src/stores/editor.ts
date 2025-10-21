"use client";

import {create} from 'zustand';
import {persist} from 'zustand/middleware';

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

  setTextLayers: (layers: TextLayer[]) => void;
  updateTextPosition: (id: string, x: number, y: number, stageW: number, stageH: number) => void;
  updateText: (id: string, text: string) => void;
};

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

const initialState: Omit<EditorState, 'setPreset' | 'setAspectLocked' | 'setFitMode' | 'setShowSafeMargins' | 'setSafeMarginRatio' | 'setTextLayers' | 'updateTextPosition' | 'updateText'> = {
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
  ]
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      ...initialState,
      setPreset: (id) => set({presetId: id}),
      setAspectLocked: (locked) => set({aspectLocked: locked}),
      setFitMode: (mode) => set({fitMode: mode}),
      setShowSafeMargins: (show) => set({showSafeMargins: show}),
      setSafeMarginRatio: (ratio) => set({safeMarginRatio: ratio}),
      setTextLayers: (layers) => set({textLayers: layers}),

      updateTextPosition: (id, x, y, stageW, stageH) =>
        set((s) => {
          const xFrac = clamp(x / stageW, 0, 1);
          const yFrac = clamp(y / stageH, 0, 1);
          return {
            textLayers: s.textLayers.map((tl) => (tl.id === id ? {...tl, xFrac, yFrac} : tl))
          };
        }),

      updateText: (id, text) => set((s) => ({textLayers: s.textLayers.map((tl) => (tl.id === id ? {...tl, text} : tl))}))
    }),
    {
      name: 'editor-state-v1',
      partialize: (s) => ({
        presetId: s.presetId,
        aspectLocked: s.aspectLocked,
        fitMode: s.fitMode,
        safeMarginRatio: s.safeMarginRatio,
        showSafeMargins: s.showSafeMargins,
        textLayers: s.textLayers
      })
    }
  )
);
