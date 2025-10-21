import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface ThemePresetState {
  activeId: string;
  setActiveId: (id: string) => void;
}

export const useThemePresetStore = create<ThemePresetState>()(
  persist(
    (set) => ({
      activeId: 'classic',
      setActiveId: (id) => set({activeId: id})
    }),
    {name: 'ui-theme-preset'}
  )
);
