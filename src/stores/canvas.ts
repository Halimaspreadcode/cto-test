"use client";

import {create} from 'zustand';

export type PresetId = 'square' | 'story' | 'banner';

export type Preset = {id: PresetId; name: string; width: number; height: number; safeMarginRatio: number};

export const PRESETS: Preset[] = [
  {id: 'square', name: 'Carré (1080×1080)', width: 1080, height: 1080, safeMarginRatio: 0.05},
  {id: 'story', name: 'Story (1080×1920)', width: 1080, height: 1920, safeMarginRatio: 0.05},
  {id: 'banner', name: 'Bannière (1200×628)', width: 1200, height: 628, safeMarginRatio: 0.05}
];

export type TextKind = 'title' | 'subtitle' | 'cta';

export type LayerText = {
  id: string;
  type: 'text';
  kind: TextKind;
  text: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  fontFamily: string;
  fontSize: number;
  fill: string;
  align: 'left' | 'center' | 'right';
};

export type Layer = LayerText; // extend later for shapes/images if needed

export type EditorSnapshot = {
  layers: Layer[];
  selectedId?: string;
};

export type GuidesState = {
  vertical: number[]; // x positions
  horizontal: number[]; // y positions
};

export type CanvasState = {
  presetId: PresetId;
  layers: Layer[];
  selectedId?: string;
  showGuides: boolean;
  showSafeMargin: boolean;
  history: {
    past: EditorSnapshot[];
    future: EditorSnapshot[];
  };

  // UI state
  liveGuides: GuidesState;

  // actions
  select: (id?: string) => void;
  addText: (kind: TextKind) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  updateSelected: (patch: Partial<LayerText>) => void;
  setPreset: (id: PresetId) => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  setShowGuides: (show: boolean) => void;
  setShowSafeMargin: (show: boolean) => void;
  setLiveGuides: (guides: GuidesState) => void;
  clearLiveGuides: () => void;

  undo: () => void;
  redo: () => void;
};

const ALLOWED_FONTS = ['Poppins', 'Raleway', 'system-ui', 'Arial', 'sans-serif'];
export const THEME_FONTS = ALLOWED_FONTS;
export const THEME_COLORS = ['#111827', '#1f2937', '#ffffff', '#2563eb', '#16a34a', '#f59e0b', '#e11d48'];

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getPreset(id: PresetId): Preset {
  const p = PRESETS.find((p) => p.id === id)!;
  return p;
}

function snapshotOf(state: Pick<CanvasState, 'layers' | 'selectedId'>): EditorSnapshot {
  // deep copy layers
  return {
    layers: state.layers.map((l) => ({...l})),
    selectedId: state.selectedId
  };
}

const MAX_HISTORY = 20;

function pushHistory(set: any, get: () => CanvasState) {
  const present = snapshotOf(get());
  set((s: CanvasState) => {
    const nextPast = [...s.history.past, present];
    if (nextPast.length > MAX_HISTORY) nextPast.shift();
    return {history: {past: nextPast, future: []}};
  });
}

function applySnapshot(set: any, snap: EditorSnapshot) {
  set({layers: snap.layers.map((l) => ({...l})), selectedId: snap.selectedId});
}

function defaultText(kind: TextKind, preset: Preset): Omit<LayerText, 'id' | 'type'> {
  const centerX = preset.width / 2;
  const centerY = preset.height / 2;
  if (kind === 'title')
    return {
      kind,
      text: 'Titre',
      x: centerX,
      y: centerY - 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      fontFamily: 'Poppins',
      fontSize: 80,
      fill: '#ffffff',
      align: 'center'
    };
  if (kind === 'subtitle')
    return {
      kind,
      text: 'Sous-titre',
      x: centerX,
      y: centerY,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      fontFamily: 'Raleway',
      fontSize: 48,
      fill: '#ffffff',
      align: 'center'
    };
  return {
    kind,
    text: 'Appel à l’action',
    x: centerX,
    y: centerY + 120,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    fontFamily: 'Poppins',
    fontSize: 42,
    fill: '#111827',
    align: 'center'
  };
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  presetId: 'square',
  layers: [],
  selectedId: undefined,
  showGuides: true,
  showSafeMargin: true,
  history: {past: [], future: []},
  liveGuides: {vertical: [], horizontal: []},

  select: (id) => set({selectedId: id}),

  addText: (kind) => {
    const preset = getPreset(get().presetId);
    pushHistory(set, get);
    const l: LayerText = {id: generateId(), type: 'text', ...defaultText(kind, preset)};
    set((s) => ({layers: [...s.layers, l], selectedId: l.id}));
  },

  deleteSelected: () => {
    const id = get().selectedId;
    if (!id) return;
    pushHistory(set, get);
    set((s) => ({layers: s.layers.filter((l) => l.id !== id), selectedId: undefined}));
  },

  duplicateSelected: () => {
    const id = get().selectedId;
    const l = get().layers.find((x) => x.id === id);
    if (!id || !l) return;
    pushHistory(set, get);
    const dup: Layer = {...l, id: generateId(), x: l.x + 20, y: l.y + 20};
    set((s) => ({layers: [...s.layers, dup], selectedId: dup.id}));
  },

  updateSelected: (patch) => {
    const id = get().selectedId;
    if (!id) return;
    pushHistory(set, get);
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? {...l, ...patch} : l))
    }));
  },

  setPreset: (id) => {
    if (id === get().presetId) return;
    pushHistory(set, get);
    set({presetId: id});
  },

  bringForward: () => {
    const id = get().selectedId;
    if (!id) return;
    const idx = get().layers.findIndex((l) => l.id === id);
    if (idx === -1 || idx === get().layers.length - 1) return;
    pushHistory(set, get);
    set((s) => {
      const arr = [...s.layers];
      const [item] = arr.splice(idx, 1);
      arr.splice(idx + 1, 0, item);
      return {layers: arr};
    });
  },

  sendBackward: () => {
    const id = get().selectedId;
    if (!id) return;
    const idx = get().layers.findIndex((l) => l.id === id);
    if (idx <= 0) return;
    pushHistory(set, get);
    set((s) => {
      const arr = [...s.layers];
      const [item] = arr.splice(idx, 1);
      arr.splice(idx - 1, 0, item);
      return {layers: arr};
    });
  },

  bringToFront: () => {
    const id = get().selectedId;
    if (!id) return;
    const idx = get().layers.findIndex((l) => l.id === id);
    if (idx === -1 || idx === get().layers.length - 1) return;
    pushHistory(set, get);
    set((s) => {
      const arr = [...s.layers];
      const [item] = arr.splice(idx, 1);
      arr.push(item);
      return {layers: arr};
    });
  },

  sendToBack: () => {
    const id = get().selectedId;
    if (!id) return;
    const idx = get().layers.findIndex((l) => l.id === id);
    if (idx <= 0) return;
    pushHistory(set, get);
    set((s) => {
      const arr = [...s.layers];
      const [item] = arr.splice(idx, 1);
      arr.unshift(item);
      return {layers: arr};
    });
  },

  setShowGuides: (show) => set({showGuides: show}),
  setShowSafeMargin: (show) => set({showSafeMargin: show}),
  setLiveGuides: (guides) => set({liveGuides: guides}),
  clearLiveGuides: () => set({liveGuides: {vertical: [], horizontal: []}}),

  undo: () => {
    const past = get().history.past;
    if (past.length === 0) return;
    const last = past[past.length - 1];
    set((s) => ({history: {past: s.history.past.slice(0, -1), future: [snapshotOf(s), ...s.history.future]}}));
    applySnapshot(set, last);
  },
  redo: () => {
    const future = get().history.future;
    if (future.length === 0) return;
    const [next, ...rest] = future;
    set((s) => ({history: {past: [...s.history.past, snapshotOf(s)], future: rest}}));
    applySnapshot(set, next);
  }
}));
