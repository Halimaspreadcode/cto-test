import {getTranslations} from 'next-intl/server';
import {Button} from '@/components/ui/button';
import {Counter} from '@/components/counter';

export default async function HomePage() {
  const t = await getTranslations('Home');

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground max-w-prose">{t('description')}</p>
      </div>

      <div className="flex items-center gap-4">
        <Counter label={t('counter')} />
        <div className="flex gap-2">
          <Button variant="default" size="sm" data-testid="primary-btn">
            Primary
          </Button>
          <Button variant="secondary" size="sm">
            Secondary
          </Button>
          <Button variant="outline" size="sm">
            Outline
          </Button>
        </div>
      </div>
    </section>
  );
}
