"use client";

import {create} from 'zustand';
import type {FitMode, PresetId, TextLayer} from './editor';

export type Slide = {
  id: string;
  title: string;
  backgroundImageId?: string;
  // Per-slide overrides
  presetOverride?: PresetId;
  fitModeOverride?: FitMode;
  textLayers?: TextLayer[]; // if not set, use defaults
};

export type SlidesState = {
  slides: Slide[];
  selectedId?: string;

  // Computed helpers
  getIndexById: (id: string) => number;
  getSelectedIndex: () => number;
  getSelectedSlide: () => Slide | undefined;

  // CRUD
  addSlide: (partial?: Partial<Slide>) => string; // returns new id
  duplicateSelected: () => string | undefined;
  deleteSelected: () => void;
  selectSlide: (id?: string) => void;
  moveSelectedLeft: () => void;
  moveSelectedRight: () => void;
  reorder: (from: number, to: number) => void;

  // Background asset association
  setBackgroundForSelected: (imageId?: string) => void;
  detachBackgroundForImage: (imageId: string) => void;

  // Overrides per slide
  setPresetOverrideForSelected: (presetId?: PresetId) => void; // undefined to use default
  setFitModeOverrideForSelected: (mode?: FitMode) => void; // undefined to use default
  ensureTextLayersForSelected: (template: TextLayer[]) => void;
  updateTextPosition: (
    layerId: string,
    xFrac: number,
    yFrac: number
  ) => void;
  updateText: (layerId: string, text: string) => void;

  // Persistence
  hydrateFromStorage: () => void;
};

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const STORAGE_KEY = 'slidesState.v1';

function saveToStorage(state: Pick<SlidesState, 'slides' | 'selectedId'>) {
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, json);
  } catch {}
}

function loadFromStorage(): Pick<SlidesState, 'slides' | 'selectedId'> | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const str = window.localStorage.getItem(STORAGE_KEY);
    if (!str) return undefined;
    const parsed = JSON.parse(str) as Pick<SlidesState, 'slides' | 'selectedId'>;
    return parsed;
  } catch {
    return undefined;
  }
}

export const useSlidesStore = create<SlidesState>((set, get) => {
  const initial = loadFromStorage();
  return {
    slides: initial?.slides ?? [],
    selectedId: initial?.selectedId,

    getIndexById: (id) => get().slides.findIndex((s) => s.id === id),
    getSelectedIndex: () => {
      const {selectedId, slides} = get();
      if (!selectedId) return -1;
      return slides.findIndex((s) => s.id === selectedId);
    },
    getSelectedSlide: () => {
      const {selectedId, slides} = get();
      return slides.find((s) => s.id === selectedId);
    },

    addSlide: (partial) => {
      const id = generateId();
      const slide: Slide = {
        id,
        title: partial?.title ?? `Slide ${get().slides.length + 1}`,
        backgroundImageId: partial?.backgroundImageId,
        presetOverride: partial?.presetOverride,
        fitModeOverride: partial?.fitModeOverride,
        textLayers: partial?.textLayers
      };
      set((s) => {
        const next = {slides: [...s.slides, slide], selectedId: id};
        saveToStorage(next);
        return next as any;
      });
      return id;
    },

    duplicateSelected: () => {
      const current = get().getSelectedSlide();
      if (!current) return undefined;
      const copy: Partial<Slide> = {
        title: `${current.title} (copy)`,
        backgroundImageId: current.backgroundImageId,
        presetOverride: current.presetOverride,
        fitModeOverride: current.fitModeOverride,
        textLayers: current.textLayers ? current.textLayers.map((tl) => ({...tl})) : undefined
      };
      return get().addSlide(copy);
    },

    deleteSelected: () => {
      set((s) => {
        if (!s.selectedId) return s;
        const idx = s.slides.findIndex((sl) => sl.id === s.selectedId);
        if (idx === -1) return s;
        const newSlides = s.slides.filter((sl) => sl.id !== s.selectedId);
        const newSelected = newSlides.length === 0 ? undefined : newSlides[Math.max(0, idx - 1)].id;
        const next = {slides: newSlides, selectedId: newSelected};
        saveToStorage(next);
        return next as any;
      });
    },

    selectSlide: (id) => {
      set((s) => {
        const next = {selectedId: id};
        saveToStorage({slides: s.slides, selectedId: id});
        return next as any;
      });
    },

    moveSelectedLeft: () => {
      set((s) => {
        const idx = s.selectedId ? s.slides.findIndex((sl) => sl.id === s.selectedId) : -1;
        if (idx <= 0) return s;
        const arr = [...s.slides];
        const [item] = arr.splice(idx, 1);
        arr.splice(idx - 1, 0, item);
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      });
    },

    moveSelectedRight: () => {
      set((s) => {
        const idx = s.selectedId ? s.slides.findIndex((sl) => sl.id === s.selectedId) : -1;
        if (idx === -1 || idx >= s.slides.length - 1) return s;
        const arr = [...s.slides];
        const [item] = arr.splice(idx, 1);
        arr.splice(idx + 1, 0, item);
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      });
    },

    reorder: (from, to) => {
      set((s) => {
        if (from < 0 || from >= s.slides.length || to < 0 || to >= s.slides.length) return s;
        const arr = [...s.slides];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      });
    },

    setBackgroundForSelected: (imageId) =>
      set((s) => {
        if (!s.selectedId) return s;
        const arr = s.slides.map((sl) => (sl.id === s.selectedId ? {...sl, backgroundImageId: imageId} : sl));
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      }),

    detachBackgroundForImage: (imageId) =>
      set((s) => {
        const arr = s.slides.map((sl) => (sl.backgroundImageId === imageId ? {...sl, backgroundImageId: undefined} : sl));
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      }),

    setPresetOverrideForSelected: (presetId) =>
      set((s) => {
        if (!s.selectedId) return s;
        const arr = s.slides.map((sl) => (sl.id === s.selectedId ? {...sl, presetOverride: presetId} : sl));
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      }),

    setFitModeOverrideForSelected: (mode) =>
      set((s) => {
        if (!s.selectedId) return s;
        const arr = s.slides.map((sl) => (sl.id === s.selectedId ? {...sl, fitModeOverride: mode} : sl));
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      }),

    ensureTextLayersForSelected: (template) =>
      set((s) => {
        if (!s.selectedId) return s;
        const arr = s.slides.map((sl) => (sl.id === s.selectedId && !sl.textLayers ? {...sl, textLayers: template.map((t) => ({...t}))} : sl));
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      }),

    updateTextPosition: (layerId, xFrac, yFrac) =>
      set((s) => {
        if (!s.selectedId) return s;
        const arr = s.slides.map((sl) => {
          if (sl.id !== s.selectedId) return sl;
          const layers = sl.textLayers ?? [];
          const nextLayers = layers.map((tl) => (tl.id === layerId ? {...tl, xFrac, yFrac} : tl));
          return {...sl, textLayers: nextLayers};
        });
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      }),

    updateText: (layerId, text) =>
      set((s) => {
        if (!s.selectedId) return s;
        const arr = s.slides.map((sl) => {
          if (sl.id !== s.selectedId) return sl;
          const layers = sl.textLayers ?? [];
          const nextLayers = layers.map((tl) => (tl.id === layerId ? {...tl, text} : tl));
          return {...sl, textLayers: nextLayers};
        });
        const next = {slides: arr};
        saveToStorage({slides: arr, selectedId: s.selectedId});
        return next as any;
      }),

    hydrateFromStorage: () => {
      const snap = loadFromStorage();
      if (snap) set(() => snap as any);
    }
  };
});
