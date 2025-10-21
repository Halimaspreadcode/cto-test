"use client";

import Cropper, {Area} from 'react-easy-crop';
import {useCallback, useMemo} from 'react';
import {useTranslations} from 'next-intl';
import {useImagesStore} from '@/stores/images';
import {Button} from '@/components/ui/button';
import {cropImageToBlob} from '@/lib/cropImage';
import {PRESETS, useEditorStore} from '@/stores/editor';

export function CropModal() {
  const t = useTranslations('Editor');
  const isOpen = useImagesStore((s) => s.cropModalOpen);
  const close = useImagesStore((s) => s.closeCropModal);
  const images = useImagesStore((s) => s.images);
  const selectedId = useImagesStore((s) => s.selectedId);
  const updateCrop = useImagesStore((s) => s.updateCrop);
  const updateZoom = useImagesStore((s) => s.updateZoom);
  const setArea = useImagesStore((s) => s.setCropAreaPixels);
  const applyCroppedUrl = useImagesStore((s) => s.applyCroppedUrl);

  const selected = useMemo(() => images.find((i) => i.id === selectedId), [images, selectedId]);

  const presetId = useEditorStore((s) => s.presetId);
  const aspectLocked = useEditorStore((s) => s.aspectLocked);
  const preset = PRESETS[presetId];
  const aspect = aspectLocked ? preset.width / preset.height : undefined;

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setArea({
        x: Math.round(croppedAreaPixels.x),
        y: Math.round(croppedAreaPixels.y),
        width: Math.round(croppedAreaPixels.width),
        height: Math.round(croppedAreaPixels.height)
      });
    },
    [setArea]
  );

  const onApply = useCallback(async () => {
    if (!selected || !selected.cropAreaPixels) return;
    const blob = await cropImageToBlob(selected.src, selected.cropAreaPixels, selected.file.type);
    const url = URL.createObjectURL(blob);
    // Revoke previous cropped url if exists
    if (selected.croppedUrl) URL.revokeObjectURL(selected.croppedUrl);
    applyCroppedUrl(url);
  }, [applyCroppedUrl, selected]);

  if (!isOpen || !selected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <div className="relative bg-background rounded-lg shadow-lg w-[90vw] max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        <div className="p-3 border-b">
          <h3 className="font-medium">{t('editorTitle')}</h3>
        </div>
        <div className="relative flex-1">
          <Cropper
            image={selected.src}
            crop={selected.crop ?? {x: 0, y: 0}}
            zoom={selected.zoom ?? 1}
            aspect={aspect}
            onCropChange={updateCrop}
            onZoomChange={updateZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="p-3 border-t space-y-3">
          <div className="flex items-center gap-3">
            <label htmlFor="zoom" className="text-sm text-muted-foreground w-24">
              {t('zoom')}
            </label>
            <input
              id="zoom"
              className="w-full"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={selected.zoom ?? 1}
              onChange={(e) => updateZoom(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={close}>
              {t('cancel')}
            </Button>
            <Button onClick={onApply}>{t('apply')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
