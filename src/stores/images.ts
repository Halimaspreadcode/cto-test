"use client";

import {create} from 'zustand';

export type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropPosition = {x: number; y: number};

export type ImageItem = {
  id: string;
  file: File;
  src: string; // object URL for original
  croppedUrl?: string; // object URL for cropped result
  crop?: CropPosition;
  zoom?: number;
  cropAreaPixels?: CropAreaPixels;
};

export type ImagesState = {
  images: ImageItem[];
  selectedId?: string;
  cropModalOpen: boolean;
  errors: string[];

  addFiles: (files: File[]) => void;
  removeImage: (id: string) => void;
  selectImage: (id?: string) => void;
  openCropModal: (id?: string) => void;
  closeCropModal: () => void;

  updateCrop: (crop: CropPosition) => void;
  updateZoom: (zoom: number) => void;
  setCropAreaPixels: (area: CropAreaPixels) => void;
  applyCroppedUrl: (url: string) => void;

  clearErrors: () => void;
  addError: (msg: string) => void;
};

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useImagesStore = create<ImagesState>((set, get) => ({
  images: [],
  selectedId: undefined,
  cropModalOpen: false,
  errors: [],

  addFiles: (files) => {
    const validTypes = new Set(["image/jpeg", "image/jpg", "image/png"]);
    const newItems: ImageItem[] = [];

    files.forEach((file) => {
      if (!validTypes.has(file.type)) {
        set((s) => ({errors: [...s.errors, `Fichier non valide: ${file.name}. Seuls les fichiers PNG et JPG sont acceptés.`]}));
        return;
      }
      const src = URL.createObjectURL(file);
      newItems.push({
        id: generateId(),
        file,
        src,
        crop: {x: 0, y: 0},
        zoom: 1
      });
    });

    if (newItems.length > 0) {
      set((s) => ({
        images: [...s.images, ...newItems],
        // auto-select the first added image if none selected
        selectedId: s.selectedId ?? newItems[0]?.id
      }));
    }
  },

  removeImage: (id) => {
    const img = get().images.find((i) => i.id === id);
    if (img) {
      try {
        URL.revokeObjectURL(img.src);
        if (img.croppedUrl) URL.revokeObjectURL(img.croppedUrl);
      } catch {}
    }
    set((s) => ({
      images: s.images.filter((i) => i.id !== id),
      selectedId: s.selectedId === id ? undefined : s.selectedId
    }));
  },

  selectImage: (id) => set({selectedId: id}),

  openCropModal: (id) => set((s) => ({cropModalOpen: true, selectedId: id ?? s.selectedId})),
  closeCropModal: () => set({cropModalOpen: false}),

  updateCrop: (crop) => set((s) => ({
    images: s.images.map((img) => (img.id === s.selectedId ? {...img, crop} : img))
  })),

  updateZoom: (zoom) => set((s) => ({
    images: s.images.map((img) => (img.id === s.selectedId ? {...img, zoom} : img))
  })),

  setCropAreaPixels: (area) => set((s) => ({
    images: s.images.map((img) => (img.id === s.selectedId ? {...img, cropAreaPixels: area} : img))
  })),

  applyCroppedUrl: (url) => set((s) => ({
    images: s.images.map((img) => (img.id === s.selectedId ? {...img, croppedUrl: url} : img)),
    cropModalOpen: false
  })),

  clearErrors: () => set({errors: []}),
  addError: (msg) => set((s) => ({errors: [...s.errors, msg]}))
}));
