"use client";

import {useTranslations} from 'next-intl';
import {useImagesStore} from '@/stores/images';
import {Button} from '@/components/ui/button';

export function ImageEditor() {
  const t = useTranslations('Editor');
  const selectedId = useImagesStore((s) => s.selectedId);
  const images = useImagesStore((s) => s.images);
  const openCropModal = useImagesStore((s) => s.openCropModal);

  const selected = images.find((i) => i.id === selectedId);

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">{t('editorTitle')}</h2>
      <div className="relative bg-muted rounded-lg border overflow-hidden h-72 flex items-center justify-center">
        {selected ? (
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${selected.croppedUrl ?? selected.src})`
            }}
          />
        ) : (
          <span className="text-muted-foreground text-sm">{t('noSelection')}</span>
        )}
      </div>
      <div>
        <Button onClick={() => openCropModal()} disabled={!selected}>
          {t('editImage')}
        </Button>
      </div>
    </div>
  );
}
