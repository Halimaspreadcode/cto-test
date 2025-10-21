"use client";

import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {useEditorStore} from '@/stores/editor';
import {useDesignsStore} from '@/stores/designs';
import {useThemePreset} from '@/components/theme-provider';
import {renderDesignThumbnail} from '@/lib/thumbnail';

export function SavedDesigns() {
  const t = useTranslations('Saved');
  const presetId = useEditorStore((s) => s.presetId);
  const textLayers = useEditorStore((s) => s.textLayers);
  const setPreset = useEditorStore((s) => s.setPreset);
  const setTextLayers = useEditorStore((s) => s.setTextLayers);

  const {theme, setTheme} = useThemePreset();

  const saved = useDesignsStore((s) => s.saved);
  const addSaved = useDesignsStore((s) => s.addSaved);
  const removeSaved = useDesignsStore((s) => s.removeSaved);

  const saveSnapshot = () => {
    const thumb = renderDesignThumbnail({
      design: {presetId, textLayers},
      theme,
      width: 320
    });
    const title = textLayers.find((t) => t.id === 'title')?.text || t('untitled');
    addSaved({name: title, presetId, themeId: theme.id, textLayers, thumbnail: thumb});
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('title')}</h3>
        <Button size="sm" onClick={saveSnapshot}>
          {t('save')}
        </Button>
      </div>
      {saved.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {saved.map((item) => (
            <div key={item.id} className="rounded-md border overflow-hidden bg-muted/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumbnail} alt={item.name} className="w-full aspect-[4/3] object-cover" />
              <div className="p-2 space-y-2">
                <div className="text-sm font-medium truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setPreset(item.presetId);
                      setTextLayers(item.textLayers);
                      setTheme(item.themeId);
                    }}
                  >
                    {t('load')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => removeSaved(item.id)}>
                    {t('delete')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
