"use client";

import {useTranslations} from 'next-intl';
import {useImagesStore} from '@/stores/images';
import {Button} from '@/components/ui/button';
import {CanvasEditor} from '@/components/canvas-editor';
import {useEditorStore} from '@/stores/editor';
import {TemplateGallery} from '@/components/template-gallery';
import {SavedDesigns} from '@/components/saved-designs';

export function ImageEditor() {
  const t = useTranslations('Editor');
  const selectedId = useImagesStore((s) => s.selectedId);
  const images = useImagesStore((s) => s.images);
  const openCropModal = useImagesStore((s) => s.openCropModal);

  const presetId = useEditorStore((s) => s.presetId);
  const setPreset = useEditorStore((s) => s.setPreset);
  const aspectLocked = useEditorStore((s) => s.aspectLocked);
  const setAspectLocked = useEditorStore((s) => s.setAspectLocked);
  const fitMode = useEditorStore((s) => s.fitMode);
  const setFitMode = useEditorStore((s) => s.setFitMode);
  const showSafeMargins = useEditorStore((s) => s.showSafeMargins);
  const setShowSafeMargins = useEditorStore((s) => s.setShowSafeMargins);
  const textLayers = useEditorStore((s) => s.textLayers);
  const updateText = useEditorStore((s) => s.updateText);

  const selected = images.find((i) => i.id === selectedId);

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">{t('editorTitle')}</h2>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('preset')}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={presetId === 'instagram-square' ? 'default' : 'outline'}
              onClick={() => setPreset('instagram-square')}
            >
              {t('instagramSquare')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={presetId === 'linkedin-landscape' ? 'default' : 'outline'}
              onClick={() => setPreset('linkedin-landscape')}
            >
              {t('linkedinLandscape')}
            </Button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={aspectLocked} onChange={(e) => setAspectLocked(e.target.checked)} />
          {t('aspectLock')}
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('fitMode')}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={fitMode === 'cover' ? 'default' : 'outline'}
              onClick={() => setFitMode('cover')}
            >
              {t('cover')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={fitMode === 'contain' ? 'default' : 'outline'}
              onClick={() => setFitMode('contain')}
            >
              {t('contain')}
            </Button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showSafeMargins} onChange={(e) => setShowSafeMargins(e.target.checked)} />
          {t('safeMargins')}
        </label>
      </div>

      <TemplateGallery />

      <div className="relative bg-muted rounded-lg border overflow-hidden min-h-72">
        {selected ? (
          <CanvasEditor />
        ) : (
          <div className="h-72 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{t('noSelection')}</span>
          </div>
        )}
      </div>

      <div>
        <Button onClick={() => openCropModal()} disabled={!selected}>
          {t('editImage')}
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t('textContent')}</h3>
        <div className="grid gap-3">
          {textLayers.map((tl) => (
            <div key={tl.id} className="grid gap-1">
              <label className="text-xs text-muted-foreground" htmlFor={`tl-${tl.id}`}>
                {tl.id}
              </label>
              <input
                id={`tl-${tl.id}`}
                className="h-9 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={tl.text}
                onChange={(e) => updateText(tl.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <SavedDesigns />
    </div>
  );
}
