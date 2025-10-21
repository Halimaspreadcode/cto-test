"use client";

import * as React from 'react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import {themePresets, getThemeById} from '@/themes/presets';
import type {Theme} from '@/themes/schema';
import {useThemePresetStore} from '@/stores/theme-preset';

type ThemePresetContextValue = {
  theme: Theme;
  setTheme: (id: string) => void;
  presets: Theme[];
};

const ThemePresetContext = React.createContext<ThemePresetContextValue | null>(null);

function applyThemeVariables(theme: Theme) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--${key}`, value);
  }
  root.style.setProperty('--font-sans', `var(${theme.fonts.sansVar})`);
  root.style.setProperty('--font-heading', `var(${theme.fonts.headingVar})`);
}

function ThemePresetProvider({children}: {children: React.ReactNode}) {
  const activeId = useThemePresetStore((s) => s.activeId);
  const setActiveId = useThemePresetStore((s) => s.setActiveId);
  const theme = React.useMemo(() => getThemeById(activeId), [activeId]);

  React.useEffect(() => {
    applyThemeVariables(theme);
  }, [theme]);

  const value = React.useMemo<ThemePresetContextValue>(
    () => ({theme, setTheme: setActiveId, presets: themePresets}),
    [theme, setActiveId]
  );

  return <ThemePresetContext.Provider value={value}>{children}</ThemePresetContext.Provider>;
}

export function useThemePreset() {
  const ctx = React.useContext(ThemePresetContext);
  if (!ctx) throw new Error('useThemePreset must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({children, ...props}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemePresetProvider>{children}</ThemePresetProvider>
    </NextThemesProvider>
  );
}
