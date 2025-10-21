import type {Metadata} from 'next';
import {Poppins, Raleway} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import '../../styles/globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import {SiteHeader} from '@/components/site-header';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans'
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-heading'
});

export const metadata: Metadata = {
  title: {
    default: 'Next 14 • i18n • Tailwind • shadcn • Themes',
    template: '%s | Starter'
  },
  description: 'Next.js 14 starter with i18n, Tailwind, shadcn/ui, theming and CI baseline.'
};

import type {ReactNode} from 'react';

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html lang={params.locale} suppressHydrationWarning className={`${poppins.variable} ${raleway.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages} locale={params.locale}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SiteHeader />
            <main className="container py-10">{children}</main>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
