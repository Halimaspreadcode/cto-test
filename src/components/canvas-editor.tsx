"use client";

import {useEffect, useMemo, useRef, useState} from 'react';
import {Stage, Layer, Rect, Image as KImage, Text as KText, Group} from 'react-konva';
import {useImagesStore} from '@/stores/images';
import {PRESETS, useEditorStore} from '@/stores/editor';

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
  const selectedId = useImagesStore((s) => s.selectedId);
  const images = useImagesStore((s) => s.images);
  const selected = useMemo(() => images.find((i) => i.id === selectedId), [images, selectedId]);
  const imageUrl = selected?.croppedUrl ?? selected?.src;

  const presetId = useEditorStore((s) => s.presetId);
  const fitMode = useEditorStore((s) => s.fitMode);
  const safeMarginRatio = useEditorStore((s) => s.safeMarginRatio);
  const showSafeMargins = useEditorStore((s) => s.showSafeMargins);
  const textLayers = useEditorStore((s) => s.textLayers);
  const updateTextPosition = useEditorStore((s) => s.updateTextPosition);

  const preset = PRESETS[presetId];

  const {ref, width: containerW} = useContainerSize<HTMLDivElement>();

  const stageW = Math.max(200, Math.floor(containerW));
  const stageH = Math.floor(stageW * (preset.height / preset.width));

  const image = useHtmlImage(imageUrl);

  const marginPx = Math.round(safeMarginRatio * Math.min(stageW, stageH));

  // Clamp text layers into safe area when preset changes or container size changes
  useEffect(() => {
    textLayers.forEach((layer) => {
      const x = layer.xFrac * stageW;
      const y = layer.yFrac * stageH;
      const xClamped = Math.min(Math.max(x, marginPx), stageW - marginPx);
      const yClamped = Math.min(Math.max(y, marginPx), stageH - marginPx);
      if (x !== xClamped || y !== yClamped) {
        updateTextPosition(layer.id, xClamped, yClamped, stageW, stageH);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId, stageW, stageH, marginPx]);

  const fit = useMemo(() => {
    if (!image) return null;
    const iw = image.width;
    const ih = image.height;
    const scale = fitMode === 'cover' ? Math.max(stageW / iw, stageH / ih) : Math.min(stageW / iw, stageH / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = (stageW - w) / 2;
    const y = (stageH - h) / 2;
    return {x, y, w, h};
  }, [image, fitMode, stageW, stageH]);

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
              {textLayers.map((tl) => {
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
                      updateTextPosition(tl.id, node.x(), node.y(), stageW, stageH);
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
