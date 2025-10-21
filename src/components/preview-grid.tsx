"use client";

import {useTranslations} from 'next-intl';
import {useImagesStore} from '@/stores/images';
import {Button} from '@/components/ui/button';

export function PreviewGrid() {
  const t = useTranslations('Uploader');
  const images = useImagesStore((s) => s.images);
  const selectImage = useImagesStore((s) => s.selectImage);
  const removeImage = useImagesStore((s) => s.removeImage);
  const openCropModal = useImagesStore((s) => s.openCropModal);
  const selectedId = useImagesStore((s) => s.selectedId);

  if (images.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className={`rounded-md border p-2 ${selectedId === img.id ? 'ring-2 ring-primary' : ''}`}>
            <div
              className="relative w-full aspect-square overflow-hidden rounded"
              onClick={() => selectImage(img.id)}
              role="button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.croppedUrl ?? img.src}
                alt="preview"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => openCropModal(img.id)}>
                {t('edit')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => selectImage(img.id)}>
                {t('select')}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => removeImage(img.id)}>
                {t('remove')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
