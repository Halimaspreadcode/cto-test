"use client";

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {Button} from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const pathname = usePathname();

  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const href = pathname ? pathname.replace(/^\/(fr|en)/, `/${otherLocale}`) : `/${otherLocale}`;

  return (
    <Link href={href} prefetch className="inline-flex">
      <Button variant="ghost" size="sm" aria-label={t('language')}>
        {otherLocale.toUpperCase()}
      </Button>
    </Link>
  );
}
