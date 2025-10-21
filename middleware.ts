import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Locale config
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  // Force locale prefix in paths to keep routing consistent
  localePrefix: 'always'
});

export const config = {
  // Skip public files and Next internals
  matcher: [
    '/',
    '/(fr|en)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
