"use client";

import {useEffect, useMemo, useState} from 'react';
import {Stage, Layer, Image as KImage, Text as KText, Group} from 'react-konva';
import {useSlidesStore} from '@/stores/slides';
import {useImagesStore} from '@/stores/images';
import {PRESETS, useEditorStore} from '@/stores/editor';
import {Button} from '@/components/ui/button';

function useHtmlImage(url?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = url;
  }, [url]);
  return image;
}

function SlideThumbnail({slideId, width}: {slideId: string; width: number}) {
  const slide = useSlidesStore((s) => s.slides.find((sl) => sl.id === slideId));
  const images = useImagesStore((s) => s.images);
  const presetDefaultId = useEditorStore((s) => s.presetId);
  const defaultTextLayers = useEditorStore((s) => s.textLayers);
  const fitModeDefault = useEditorStore((s) => s.fitMode);

  const effectivePreset = PRESETS[slide?.presetOverride ?? presetDefaultId];
  const height = Math.max(60, Math.round((width * effectivePreset.height) / effectivePreset.width));

  const bgUrl = useMemo(() => {
    if (!slide?.backgroundImageId) return undefined;
    const img = images.find((i) => i.id === slide.backgroundImageId);
    return img?.croppedUrl ?? img?.src;
  }, [images, slide?.backgroundImageId]);
  const image = useHtmlImage(bgUrl);

  const fitMode = slide?.fitModeOverride ?? fitModeDefault;

  const fit = useMemo(() => {
    if (!image) return null;
    const iw = image.width;
    const ih = image.height;
    const scale = fitMode === 'cover' ? Math.max(width / iw, height / ih) : Math.min(width / iw, height / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = (width - w) / 2;
    const y = (height - h) / 2;
    return {x, y, w, h};
  }, [image, fitMode, width, height]);

  const layers = slide?.textLayers ?? defaultTextLayers;

  return (
    <Stage width={width} height={height} className="bg-muted rounded-md border overflow-hidden">
      <Layer>
        {image && fit && <KImage image={image} x={fit.x} y={fit.y} width={fit.w} height={fit.h} listening={false} />}
        <Group>
          {layers.map((tl) => {
            const x = tl.xFrac * width;
            const y = tl.yFrac * height;
            const w = tl.widthFrac * width;
            const fontSize = Math.max(8, tl.fontScale * height);
            return (
              <KText
                key={tl.id}
                text={tl.text}
                x={x}
                y={y}
                width={w}
                fontSize={fontSize}
                fill="#fff"
                fontStyle="bold"
                align={tl.align ?? 'left'}
                listening={false}
              />
            );
          })}
        </Group>
      </Layer>
    </Stage>
  );
}

export function SlidesNavigator() {
  const slides = useSlidesStore((s) => s.slides);
  const selectedId = useSlidesStore((s) => s.selectedId);
  const addSlide = useSlidesStore((s) => s.addSlide);
  const duplicate = useSlidesStore((s) => s.duplicateSelected);
  const remove = useSlidesStore((s) => s.deleteSelected);
  const select = useSlidesStore((s) => s.selectSlide);
  const moveLeft = useSlidesStore((s) => s.moveSelectedLeft);
  const moveRight = useSlidesStore((s) => s.moveSelectedRight);

  const imagesSelectedId = useImagesStore((s) => s.selectedId);

  // Keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveRight();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        remove();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moveLeft, moveRight, remove]);

  // Guard against data loss when navigating away
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (slides.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [slides.length]);

  const onAdd = () => {
    addSlide({backgroundImageId: imagesSelectedId});
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Slides</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onAdd}>Add</Button>
          <Button size="sm" variant="outline" onClick={duplicate} disabled={!selectedId}>Duplicate</Button>
          <Button size="sm" variant="destructive" onClick={remove} disabled={!selectedId}>Delete</Button>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto py-1">
        {slides.map((sl) => (
          <button
            key={sl.id}
            onClick={() => select(sl.id)}
            className={`flex-shrink-0 rounded-md border p-1 ${selectedId === sl.id ? 'ring-2 ring-primary' : ''}`}
          >
            <SlideThumbnail slideId={sl.id} width={144} />
            <div className="mt-1 text-xs text-center text-muted-foreground truncate w-[144px]">{sl.title}</div>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={moveLeft} disabled={!selectedId}>◀ Move left</Button>
        <Button size="sm" variant="secondary" onClick={moveRight} disabled={!selectedId}>Move right ▶</Button>
      </div>
    </div>
  );
}
