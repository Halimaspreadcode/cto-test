import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale();

  // Supported locales
  const locales = ['fr', 'en'] as const;

  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = 'fr';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
