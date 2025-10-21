"use client";

import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {PresetId, TextLayer} from '@/stores/editor';

export type SavedDesign = {
  id: string;
  name: string;
  presetId: PresetId;
  themeId: string;
  textLayers: TextLayer[];
  createdAt: number;
  thumbnail: string; // data URL
};

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type DesignsState = {
  saved: SavedDesign[];
  addSaved: (payload: Omit<SavedDesign, 'id' | 'createdAt'> & {id?: string; createdAt?: number}) => void;
  removeSaved: (id: string) => void;
};

export const useDesignsStore = create<DesignsState>()(
  persist(
    (set) => ({
      saved: [],
      addSaved: (payload) =>
        set((s) => ({
          saved: [
            {id: payload.id ?? generateId(), createdAt: payload.createdAt ?? Date.now(), ...payload},
            ...s.saved
          ]
        })),
      removeSaved: (id) => set((s) => ({saved: s.saved.filter((d) => d.id !== id)}))
    }),
    {name: 'saved-designs-v1'}
  )
);
