"use client";

import {useTranslations} from 'next-intl';
import {useImagesStore} from '@/stores/images';
import {Button} from '@/components/ui/button';
import {CanvasEditor} from '@/components/canvas-editor';
import {useEditorStore} from '@/stores/editor';
import {SlidesNavigator} from '@/components/slides-navigator';
import {useSlidesStore} from '@/stores/slides';

export function ImageEditor() {
  const t = useTranslations('Editor');

  // Images store for background selection and cropping
  const images = useImagesStore((s) => s.images);
  const imageSelectedId = useImagesStore((s) => s.selectedId);
  const openCropModal = useImagesStore((s) => s.openCropModal);

  // Global editor defaults (bulk actions)
  const presetId = useEditorStore((s) => s.presetId);
  const setPreset = useEditorStore((s) => s.setPreset);
  const aspectLocked = useEditorStore((s) => s.aspectLocked);
  const setAspectLocked = useEditorStore((s) => s.setAspectLocked);
  const fitModeDefault = useEditorStore((s) => s.fitMode);
  const setFitModeDefault = useEditorStore((s) => s.setFitMode);
  const showSafeMargins = useEditorStore((s) => s.showSafeMargins);
  const setShowSafeMargins = useEditorStore((s) => s.setShowSafeMargins);

  // Slides store
  const selectedSlide = useSlidesStore((s) => s.getSelectedSlide());
  const setSlideBackground = useSlidesStore((s) => s.setBackgroundForSelected);
  const setSlidePresetOverride = useSlidesStore((s) => s.setPresetOverrideForSelected);
  const setSlideFitOverride = useSlidesStore((s) => s.setFitModeOverrideForSelected);

  const selectedBackground = images.find((i) => i.id === selectedSlide?.backgroundImageId);

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold">{t('editorTitle')}</h2>

      <SlidesNavigator />

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
              variant={fitModeDefault === 'cover' ? 'default' : 'outline'}
              onClick={() => setFitModeDefault('cover')}
            >
              {t('cover')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={fitModeDefault === 'contain' ? 'default' : 'outline'}
              onClick={() => setFitModeDefault('contain')}
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

      {selectedSlide && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('slidePresetOverride')}</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={selectedSlide.presetOverride ? 'outline' : 'default'} onClick={() => setSlidePresetOverride(undefined)}>
                {t('default')}
              </Button>
              <Button type="button" size="sm" variant={selectedSlide.presetOverride === 'instagram-square' ? 'default' : 'outline'} onClick={() => setSlidePresetOverride('instagram-square')}>
                {t('instagramSquare')}
              </Button>
              <Button type="button" size="sm" variant={selectedSlide.presetOverride === 'linkedin-landscape' ? 'default' : 'outline'} onClick={() => setSlidePresetOverride('linkedin-landscape')}>
                {t('linkedinLandscape')}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('slideFitOverride')}</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={selectedSlide.fitModeOverride ? 'outline' : 'default'} onClick={() => setSlideFitOverride(undefined)}>
                {t('default')}
              </Button>
              <Button type="button" size="sm" variant={selectedSlide.fitModeOverride === 'cover' ? 'default' : 'outline'} onClick={() => setSlideFitOverride('cover')}>
                {t('cover')}
              </Button>
              <Button type="button" size="sm" variant={selectedSlide.fitModeOverride === 'contain' ? 'default' : 'outline'} onClick={() => setSlideFitOverride('contain')}>
                {t('contain')}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSlideBackground(imageSelectedId)} disabled={!imageSelectedId}>
              {t('useSelectedAsBackground')}
            </Button>
          </div>
        </div>
      )}

      <div className="relative bg-muted rounded-lg border overflow-hidden min-h-72">
        {selectedSlide ? (
          <CanvasEditor />
        ) : (
          <div className="h-72 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{t('noSlide')}</span>
          </div>
        )}
      </div>

      <div>
        <Button onClick={() => openCropModal(selectedSlide?.backgroundImageId)} disabled={!selectedBackground}>
          {t('editImage')}
        </Button>
      </div>
    </div>
  );
}
