"use client";

import Link from 'next-intl/link';
import {useTranslations} from 'next-intl';
import {ThemeToggle} from '@/components/theme-toggle';
import {LanguageSwitcher} from '@/components/language-switcher';

export function SiteHeader() {
  const t = useTranslations('Nav');

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold hover:underline">
            {t('home')}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
