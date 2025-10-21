"use client";

import {useTranslations} from 'next-intl';
import {useCounterStore} from '@/stores/counter';
import {Button} from '@/components/ui/button';

export function Counter({label}: {label?: string}) {
  const t = useTranslations('Home');
  const {count, increment, decrement} = useCounterStore();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {(label ?? t('counter')) + ': '}
      </span>
      <span className="font-medium" data-testid="counter-value">{count}</span>
      <Button onClick={increment} variant="secondary" size="sm">
        {t('increment')}
      </Button>
      <Button onClick={decrement} variant="outline" size="sm">
        {t('decrement')}
      </Button>
    </div>
  );
}
