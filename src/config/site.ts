export const siteConfig = {
  name: 'Next Starter',
  description: 'Next.js 14 starter with i18n, Tailwind, shadcn/ui, theming and CI baseline.',
  locales: ['fr', 'en'] as const,
  defaultLocale: 'fr' as const
};

export type SiteConfig = typeof siteConfig;
