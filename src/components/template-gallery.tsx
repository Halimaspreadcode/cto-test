"use client";

import {useMemo} from 'react';
import {useTranslations} from 'next-intl';
import {useThemePreset} from '@/components/theme-provider';
import {Button} from '@/components/ui/button';
import {useEditorStore} from '@/stores/editor';
import {TEMPLATES} from '@/templates';
import {renderDesignThumbnail} from '@/lib/thumbnail';

export function TemplateGallery() {
  const t = useTranslations('Templates');
  const presetId = useEditorStore((s) => s.presetId);
  const setTextLayers = useEditorStore((s) => s.setTextLayers);
  const {theme} = useThemePreset();

  const items = TEMPLATES[presetId];
  const thumbs = useMemo(
    () =>
      items.map((tpl) =>
        renderDesignThumbnail({
          design: {presetId, textLayers: tpl.textLayers},
          theme,
          width: 220
        })
      ),
    [items, presetId, theme]
  );

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">{t('title')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((tpl, idx) => (
          <div key={tpl.id} className="rounded-md border overflow-hidden bg-muted/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbs[idx]} alt={tpl.name} className="w-full aspect-[4/3] object-cover" />
            <div className="p-2 flex items-center justify-between gap-2">
              <div className="text-sm font-medium truncate" title={tpl.name}>
                {tpl.name}
              </div>
              <Button size="sm" variant="secondary" onClick={() => setTextLayers(tpl.textLayers)}>
                {t('use')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
