"use client";

import {useThemePreset} from '@/components/theme-provider';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export function ThemePicker() {
  const {theme, presets, setTheme} = useThemePreset();

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-2">
        <div
          className="h-5 w-5 rounded-full border"
          style={{
            backgroundColor: `hsl(${theme.colors.primary})`,
            borderColor: `hsl(${theme.colors.ring})`
          }}
          aria-hidden
        />
      </div>
      <select
        aria-label="Select theme preset"
        className={cn(
          'h-9 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        value={theme.id}
        onChange={(e) => setTheme(e.target.value)}
        data-testid="theme-picker"
      >
        {presets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
