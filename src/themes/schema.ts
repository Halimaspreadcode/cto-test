import {z} from 'zod';

export const ThemeColorsSchema = z.object({
  'primary': z.string(),
  'primary-foreground': z.string(),
  'secondary': z.string(),
  'secondary-foreground': z.string(),
  'accent': z.string(),
  'accent-foreground': z.string(),
  'destructive': z.string(),
  'destructive-foreground': z.string(),
  'ring': z.string()
});

export const ThemeSchema = z.object({
  id: z.string(),
  label: z.string(),
  fonts: z.object({
    sansVar: z.string().startsWith('--'),
    headingVar: z.string().startsWith('--')
  }),
  colors: ThemeColorsSchema
});

export type Theme = z.infer<typeof ThemeSchema>;
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export const isTheme = (value: unknown): value is Theme => ThemeSchema.safeParse(value).success;
