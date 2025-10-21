import {Theme} from './schema';

// Curated theme presets — focus on brand tokens only to avoid conflicting with dark mode.
export const themePresets: Theme[] = [
  {
    id: 'classic',
    label: 'Classic',
    fonts: {sansVar: '--font-sans', headingVar: '--font-heading'},
    colors: {
      primary: '221 83% 53%', // blue-600-ish
      'primary-foreground': '210 40% 98%',
      secondary: '210 40% 96.1%',
      'secondary-foreground': '222.2 47.4% 11.2%',
      accent: '199 89% 48%', // sky-500-ish
      'accent-foreground': '210 40% 98%',
      destructive: '0 84% 60%',
      'destructive-foreground': '210 40% 98%',
      ring: '221 83% 53%'
    }
  },
  {
    id: 'violet',
    label: 'Violet',
    fonts: {sansVar: '--font-sans-nunito', headingVar: '--font-heading-playfair'},
    colors: {
      primary: '256 94% 59%',
      'primary-foreground': '210 40% 98%',
      secondary: '268 100% 97%',
      'secondary-foreground': '262 83% 14%',
      accent: '292 84% 61%',
      'accent-foreground': '210 40% 98%',
      destructive: '0 84% 60%',
      'destructive-foreground': '210 40% 98%',
      ring: '256 94% 59%'
    }
  },
  {
    id: 'emerald',
    label: 'Emerald',
    fonts: {sansVar: '--font-sans-inter', headingVar: '--font-heading'},
    colors: {
      primary: '154 60% 41%', // emerald-600-ish
      'primary-foreground': '210 40% 98%',
      secondary: '152 81% 96%',
      'secondary-foreground': '160 84% 16%',
      accent: '160 84% 39%',
      'accent-foreground': '210 40% 98%',
      destructive: '0 84% 60%',
      'destructive-foreground': '210 40% 98%',
      ring: '154 60% 41%'
    }
  },
  {
    id: 'rose',
    label: 'Rose',
    fonts: {sansVar: '--font-sans', headingVar: '--font-heading-playfair'},
    colors: {
      primary: '346 77% 47%',
      'primary-foreground': '210 40% 98%',
      secondary: '351 100% 96%',
      'secondary-foreground': '344 65% 15%',
      accent: '347 77% 55%',
      'accent-foreground': '210 40% 98%',
      destructive: '0 84% 60%',
      'destructive-foreground': '210 40% 98%',
      ring: '346 77% 47%'
    }
  },
  {
    id: 'amber',
    label: 'Amber',
    fonts: {sansVar: '--font-sans-nunito', headingVar: '--font-heading-lora'},
    colors: {
      primary: '38 92% 50%',
      'primary-foreground': '210 40% 98%',
      secondary: '48 96% 89%',
      'secondary-foreground': '26 83% 14%',
      accent: '43 96% 56%',
      'accent-foreground': '210 40% 98%',
      destructive: '0 84% 60%',
      'destructive-foreground': '210 40% 98%',
      ring: '38 92% 50%'
    }
  },
  {
    id: 'ocean',
    label: 'Ocean',
    fonts: {sansVar: '--font-sans-inter', headingVar: '--font-heading-montserrat'},
    colors: {
      primary: '199 89% 48%',
      'primary-foreground': '210 40% 98%',
      secondary: '201 96% 93%',
      'secondary-foreground': '199 89% 18%',
      accent: '198 93% 60%',
      'accent-foreground': '210 40% 98%',
      destructive: '0 84% 60%',
      'destructive-foreground': '210 40% 98%',
      ring: '199 89% 48%'
    }
  }
];

export const defaultThemeId = 'classic';

export const getThemeById = (id: string) => themePresets.find((t) => t.id === id) ?? themePresets[0];
