import type {TextLayer, PresetId} from '@/stores/editor';

export type TemplateSpec = {
  id: string;
  name: string;
  textLayers: TextLayer[];
};

function tl(
  id: string,
  text: string,
  xFrac: number,
  yFrac: number,
  widthFrac: number,
  fontScale: number,
  align: 'left' | 'center' | 'right' = 'left'
): TextLayer {
  return {id, text, xFrac, yFrac, widthFrac, fontScale, align};
}

const COMMON_TEMPLATES: TemplateSpec[] = [
  {
    id: 'classic-top-left',
    name: 'Classic Top Left',
    textLayers: [
      tl('title', 'Your Headline', 0.08, 0.1, 0.84, 0.075, 'left'),
      tl('subtitle', 'Supporting text goes here', 0.08, 0.23, 0.7, 0.038, 'left')
    ]
  },
  {
    id: 'center-bold',
    name: 'Centered Bold',
    textLayers: [
      tl('title', 'Big Center Title', 0.1, 0.35, 0.8, 0.09, 'center'),
      tl('subtitle', 'Optional subtitle text', 0.15, 0.48, 0.7, 0.04, 'center')
    ]
  },
  {
    id: 'bottom-banner',
    name: 'Bottom Banner',
    textLayers: [
      tl('title', 'Catchy headline across the bottom', 0.07, 0.75, 0.86, 0.07, 'center')
    ]
  },
  {
    id: 'top-banner',
    name: 'Top Banner',
    textLayers: [tl('title', 'Announcement at the top', 0.07, 0.08, 0.86, 0.065, 'center')]
  },
  {
    id: 'left-stacked',
    name: 'Left Stacked',
    textLayers: [
      tl('title', 'Stacked Title', 0.08, 0.2, 0.6, 0.08, 'left'),
      tl('subtitle', 'Descriptive copy aligned left to match the title.', 0.08, 0.34, 0.6, 0.035, 'left')
    ]
  },
  {
    id: 'right-stacked',
    name: 'Right Stacked',
    textLayers: [
      tl('title', 'Right Aligned Title', 0.32, 0.2, 0.6, 0.08, 'right'),
      tl('subtitle', 'Complementary text aligned to the right.', 0.32, 0.34, 0.6, 0.035, 'right')
    ]
  },
  {
    id: 'center-quote',
    name: 'Quote',
    textLayers: [
      tl('title', '“Inspiring quote goes here.”', 0.12, 0.32, 0.76, 0.07, 'center'),
      tl('subtitle', '— Author Name', 0.35, 0.48, 0.3, 0.035, 'center')
    ]
  },
  {
    id: 'bottom-left-minimal',
    name: 'Minimal Bottom Left',
    textLayers: [
      tl('title', 'Short title', 0.08, 0.78, 0.6, 0.06, 'left'),
      tl('subtitle', 'Short subtitle', 0.08, 0.86, 0.6, 0.03, 'left')
    ]
  }
];

export const TEMPLATES: Record<PresetId, TemplateSpec[]> = {
  'instagram-square': COMMON_TEMPLATES,
  'linkedin-landscape': COMMON_TEMPLATES
};
