"use client";

import {useThemePreset} from '@/components/theme-provider';

export function ThemeIndicator() {
  const {theme} = useThemePreset();
  return (
    <div className="text-sm text-muted-foreground">
      Active theme: <span className="font-medium text-foreground">{theme.label}</span>
    </div>
  );
}
