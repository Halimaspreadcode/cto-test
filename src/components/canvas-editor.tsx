"use client";

import {useEffect, useMemo, useRef, useState} from 'react';
import {Stage, Layer, Rect, Image as KImage, Text as KText, Group} from 'react-konva';
import {useImagesStore} from '@/stores/images';
import {PRESETS, useEditorStore} from '@/stores/editor';
import {useSlidesStore} from '@/stores/slides';

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
    return () => {
      // no revoke here because we don't own the object URL (managed in store)
    };
  }, [url]);

  return image;
}

function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState({width: 0, height: 0});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setRect({width: el.clientWidth, height: el.clientHeight});

    let frame = 0;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRect({width: cr.width, height: cr.height}));
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return {ref, ...rect};
}

export function CanvasEditor() {
  const slides = useSlidesStore((s) => s.slides);
  const selectedSlideId = useSlidesStore((s) => s.selectedId);
  const ensureTextLayersForSelected = useSlidesStore((s) => s.ensureTextLayersForSelected);
  const updateSlideTextPos = useSlidesStore((s) => s.updateTextPosition);

  const images = useImagesStore((s) => s.images);

  const presetDefaultId = useEditorStore((s) => s.presetId);
  const fitModeDefault = useEditorStore((s) => s.fitMode);
  const safeMarginRatio = useEditorStore((s) => s.safeMarginRatio);
  const showSafeMargins = useEditorStore((s) => s.showSafeMargins);
  const defaultTextLayers = useEditorStore((s) => s.textLayers);

  const selectedSlide = useMemo(() => slides.find((sl) => sl.id === selectedSlideId), [slides, selectedSlideId]);

  const backgroundImgUrl = useMemo(() => {
    if (!selectedSlide?.backgroundImageId) return undefined;
    const img = images.find((i) => i.id === selectedSlide.backgroundImageId);
    return img?.croppedUrl ?? img?.src;
  }, [images, selectedSlide?.backgroundImageId]);

  const effectivePresetId = selectedSlide?.presetOverride ?? presetDefaultId;
  const effectiveFitMode = selectedSlide?.fitModeOverride ?? fitModeDefault;
  const effectiveTextLayers = selectedSlide?.textLayers ?? defaultTextLayers;

  const preset = PRESETS[effectivePresetId];

  const {ref, width: containerW} = useContainerSize<HTMLDivElement>();

  const stageW = Math.max(200, Math.floor(containerW));
  const stageH = Math.floor(stageW * (preset.height / preset.width));

  const image = useHtmlImage(backgroundImgUrl);

  const marginPx = Math.round(safeMarginRatio * Math.min(stageW, stageH));

  // Clamp text layers into safe area when preset changes or container size changes
  useEffect(() => {
    if (!selectedSlideId) return;
    if (!selectedSlide?.textLayers) {
      // create slide-local layers from defaults on first interaction
      ensureTextLayersForSelected(defaultTextLayers);
    }
    effectiveTextLayers.forEach((layer) => {
      const x = layer.xFrac * stageW;
      const y = layer.yFrac * stageH;
      const xClamped = Math.min(Math.max(x, marginPx), stageW - marginPx);
      const yClamped = Math.min(Math.max(y, marginPx), stageH - marginPx);
      const xFrac = stageW === 0 ? layer.xFrac : xClamped / stageW;
      const yFrac = stageH === 0 ? layer.yFrac : yClamped / stageH;
      if (xFrac !== layer.xFrac || yFrac !== layer.yFrac) {
        updateSlideTextPos(layer.id, xFrac, yFrac);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectivePresetId, stageW, stageH, marginPx, selectedSlideId]);

  const fit = useMemo(() => {
    if (!image) return null;
    const iw = image.width;
    const ih = image.height;
    const scale = effectiveFitMode === 'cover' ? Math.max(stageW / iw, stageH / ih) : Math.min(stageW / iw, stageH / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = (stageW - w) / 2;
    const y = (stageH - h) / 2;
    return {x, y, w, h};
  }, [image, effectiveFitMode, stageW, stageH]);

  if (!selectedSlide) {
    return (
      <div className="h-72 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No slide selected</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="w-full">
      <div className="relative w-full" style={{height: stageH}}>
        <Stage width={stageW} height={stageH} className="bg-muted rounded-md border overflow-hidden">
          <Layer>
            {/* Background */}
            {image && fit && (
              <KImage image={image} x={fit.x} y={fit.y} width={fit.w} height={fit.h} listening={false} />
            )}

            {/* Safe margins overlay */}
            {showSafeMargins && marginPx > 0 && (
              <Rect
                x={marginPx}
                y={marginPx}
                width={stageW - marginPx * 2}
                height={stageH - marginPx * 2}
                stroke="#ffffffaa"
                dash={[8, 8]}
                strokeWidth={2}
                listening={false}
              />
            )}

            {/* Text layers */}
            <Group>
              {effectiveTextLayers.map((tl) => {
                const x = tl.xFrac * stageW;
                const y = tl.yFrac * stageH;
                const width = tl.widthFrac * stageW;
                const fontSize = tl.fontScale * stageH;
                return (
                  <KText
                    key={tl.id}
                    text={tl.text}
                    x={x}
                    y={y}
                    width={width}
                    fontSize={fontSize}
                    fill="#fff"
                    fontStyle="bold"
                    align={tl.align ?? 'left'}
                    draggable
                    dragBoundFunc={(pos) => {
                      const nx = Math.min(Math.max(pos.x, marginPx), stageW - marginPx);
                      const ny = Math.min(Math.max(pos.y, marginPx), stageH - marginPx);
                      return {x: nx, y: ny};
                    }}
                    onDragEnd={(e) => {
                      const node = e.target;
                      ensureTextLayersForSelected(defaultTextLayers);
                      const xFrac = stageW === 0 ? tl.xFrac : node.x() / stageW;
                      const yFrac = stageH === 0 ? tl.yFrac : node.y() / stageH;
                      updateSlideTextPos(tl.id, xFrac, yFrac);
                    }}
                  />
                );
              })}
            </Group>
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
