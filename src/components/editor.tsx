"use client";

import {useEffect, useMemo, useRef, useState, useCallback} from 'react';
import {Stage, Layer as KonvaLayer, Rect, Image as KonvaImage, Text as KonvaText, Line, Transformer} from 'react-konva';
import {useTranslations} from 'next-intl';
import {useImagesStore} from '@/stores/images';
import {Button} from '@/components/ui/button';
import {PRESETS, THEME_COLORS, THEME_FONTS, useCanvasStore, type LayerText, type PresetId} from '@/stores/canvas';
import {CanvasEditor} from '@/components/canvas-editor';
import {useEditorStore} from '@/stores/editor';
        
function useHtmlImage(url?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = url;
    return () => {
      setImage(null);
    };
  }, [url]);
  return image;
}


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

  const selected = images.find((i) => i.id === selectedId);

  const presetId = useCanvasStore((s) => s.presetId);
  const layers = useCanvasStore((s) => s.layers);
  const select = useCanvasStore((s) => s.select);
  const addText = useCanvasStore((s) => s.addText);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected);
  const updateSelected = useCanvasStore((s) => s.updateSelected);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const bringToFront = useCanvasStore((s) => s.bringToFront);
  const sendToBack = useCanvasStore((s) => s.sendToBack);
  const showGuides = useCanvasStore((s) => s.showGuides);
  const setShowGuides = useCanvasStore((s) => s.setShowGuides);
  const showSafeMargin = useCanvasStore((s) => s.showSafeMargin);
  const setShowSafeMargin = useCanvasStore((s) => s.setShowSafeMargin);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const setPreset = useCanvasStore((s) => s.setPreset);
  const liveGuides = useCanvasStore((s) => s.liveGuides);
  const setLiveGuides = useCanvasStore((s) => s.setLiveGuides);
  const clearLiveGuides = useCanvasStore((s) => s.clearLiveGuides);
  const selectedLayerId = useCanvasStore((s) => s.selectedId);

  const preset = useMemo(() => PRESETS.find((p) => p.id === presetId)!, [presetId]);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [stageScale, setStageScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleResize() {
      const padding = 24; // px
      const maxW = el.clientWidth - padding;
      const scale = Math.min(1, maxW / preset.width);
      setStageScale(scale);
    }
    handleResize();
    const obs = new ResizeObserver(handleResize);
    obs.observe(el);
    return () => obs.disconnect();
  }, [preset.width]);

  // background image
  const bgImage = useHtmlImage(selected ? selected.croppedUrl ?? selected.src : undefined);

  // keyboard shortcuts
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (cmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if (cmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        if (!selectedLayerId) return;
        const l = layers.find((x) => x.id === selectedLayerId);
        if (!l) return;
        const patch: Partial<LayerText> = {};
        if (e.key === 'ArrowLeft') patch.x = l.x - delta;
        if (e.key === 'ArrowRight') patch.x = l.x + delta;
        if (e.key === 'ArrowUp') patch.y = l.y - delta;
        if (e.key === 'ArrowDown') patch.y = l.y + delta;
        updateSelected(patch);
      }
    },
    [deleteSelected, duplicateSelected, layers, redo, selectedLayerId, undo, updateSelected]
  );

  const fontOptions = THEME_FONTS;
  const colorOptions = THEME_COLORS;

  const selectedLayer = useMemo(() => layers.find((l) => l.id === selectedLayerId), [layers, selectedLayerId]);

  // selection transformer
  const trRef = useRef<any>(null);
  const nodeRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    if (selectedLayerId && nodeRefs.current[selectedLayerId]) {
      tr.nodes([nodeRefs.current[selectedLayerId]]);
      tr.getLayer()?.batchDraw();
    } else {
      tr.nodes([]);
    }
  }, [selectedLayerId, layers]);

  // Compute safe margin rectangle
  const safe = useMemo(() => {
    const m = Math.round(Math.min(preset.width, preset.height) * preset.safeMarginRatio);
    return {x: m, y: m, width: preset.width - m * 2, height: preset.height - m * 2};
  }, [preset]);

  // helpers for snapping
  function gatherGuides() {
    const v = [0, preset.width / 2, preset.width, safe.x, safe.x + safe.width];
    const h = [0, preset.height / 2, preset.height, safe.y, safe.y + safe.height];
    return {vertical: v, horizontal: h};
  }

  function handleDragMove(e: any, id: string) {
    if (!showGuides) return;
    const node = e.target;
    const rect = node.getClientRect();
    const guides = gatherGuides();
    const threshold = 6 / stageScale; // adjust for scale

    const edgesX = [rect.x, rect.x + rect.width / 2, rect.x + rect.width];
    const edgesY = [rect.y, rect.y + rect.height / 2, rect.y + rect.height];

    let dx = 0;
    let dy = 0;
    let vSnap: number | null = null;
    let hSnap: number | null = null;

    let minVDist = Infinity;
    for (const gx of guides.vertical) {
      for (const ex of edgesX) {
        const d = Math.abs(gx - ex);
        if (d < minVDist && d <= threshold) {
          minVDist = d;
          vSnap = gx;
          dx = gx - ex;
        }
      }
    }

    let minHDist = Infinity;
    for (const gy of guides.horizontal) {
      for (const ey of edgesY) {
        const d = Math.abs(gy - ey);
        if (d < minHDist && d <= threshold) {
          minHDist = d;
          hSnap = gy;
          dy = gy - ey;
        }
      }
    }

    if (vSnap !== null || hSnap !== null) {
      setLiveGuides({vertical: vSnap !== null ? [vSnap] : [], horizontal: hSnap !== null ? [hSnap] : []});
      // convert dx/dy from absolute rect space to node position deltas
      node.x(node.x() + dx);
      node.y(node.y() + dy);
    } else {
      clearLiveGuides();
    }
  }

  function handleDragEnd(e: any, id: string) {
    clearLiveGuides();
    const node = e.target;
    const x = node.x();
    const y = node.y();
    updateSelected({x, y});
  }

  function handleTransformEnd(id: string) {
    const node = nodeRefs.current[id];
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    const x = node.x();
    const y = node.y();
    updateSelected({scaleX, scaleY, rotation, x, y});
  }

  // ensure selection cleared when clicking empty space
  const onStageMouseDown = (e: any) => {
    // clicked on empty area - deselect
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      select(undefined);
    }
  };

  // Properties panel controlled inputs
  const onPropChange = <K extends keyof LayerText,>(key: K, value: LayerText[K]) => {
    updateSelected({[key]: value} as Partial<LayerText>);
  };

  return (
    <div className="mt-8 space-y-4" ref={containerRef} tabIndex={0} onKeyDown={onKeyDown} aria-label="Éditeur de canevas">
      <h2 className="text-xl font-semibold">{t('editorTitle')}</h2>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-muted-foreground">Préréglage</label>
        <select
          className="border rounded-md px-2 py-1 text-sm bg-background"
          value={presetId}
          onChange={(e) => setPreset(e.target.value as PresetId)}
          aria-label="Sélection du préréglage"
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="h-6 w-px bg-border mx-1" />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
          Guides d'alignement
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showSafeMargin} onChange={(e) => setShowSafeMargin(e.target.checked)} />
          Marge de sécurité
        </label>
        <div className="h-6 w-px bg-border mx-1" />
        <Button size="sm" variant="outline" onClick={undo} aria-label="Annuler (Ctrl/Cmd+Z)">
          Annuler
        </Button>
        <Button size="sm" variant="outline" onClick={redo} aria-label="Rétablir (Ctrl/Cmd+Y)">
          Rétablir
        </Button>
        <div className="ml-auto" />
        <Button size="sm" onClick={() => openCropModal()} disabled={!selected} aria-label="Modifier l'image de fond">
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

      {/* Canvas + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="relative rounded-lg border bg-muted flex items-center justify-center p-3">
          <div className="relative" style={{width: preset.width * stageScale, height: preset.height * stageScale}}>
            <Stage
              ref={stageRef}
              width={preset.width}
              height={preset.height}
              scaleX={stageScale}
              scaleY={stageScale}
              className="bg-black"
              onMouseDown={onStageMouseDown}
            >
              <KonvaLayer>
                {/* Background image */}
                {bgImage && (
                  <KonvaImage
                    image={bgImage}
                    x={0}
                    y={0}
                    width={preset.width}
                    height={preset.height}
                    listening={false}
                  />
                )}

                {/* Safe margin overlay */}
                {showSafeMargin && (
                  <Rect
                    x={safe.x}
                    y={safe.y}
                    width={safe.width}
                    height={safe.height}
                    stroke={"#22c55e"}
                    dash={[8, 8]}
                    listening={false}
                  />
                )}

                {/* Render text layers */}
                {layers.map((l) => (
                  <KonvaText
                    key={l.id}
                    ref={(ref) => {
                      if (ref) nodeRefs.current[l.id] = ref;
                    }}
                    text={l.text}
                    x={l.x}
                    y={l.y}
                    offsetX={0}
                    offsetY={0}
                    rotation={l.rotation}
                    scaleX={l.scaleX}
                    scaleY={l.scaleY}
                    fontFamily={l.fontFamily}
                    fontSize={l.fontSize}
                    fill={l.fill}
                    align={l.align}
                    draggable
                    onClick={() => select(l.id)}
                    onTap={() => select(l.id)}
                    onDragMove={(e) => handleDragMove(e, l.id)}
                    onDragEnd={(e) => handleDragEnd(e, l.id)}
                    onTransformEnd={() => handleTransformEnd(l.id)}
                  />
                ))}

                {/* Transformer */}
                <Transformer ref={trRef} rotateEnabled={true} boundBoxFunc={(oldBox, newBox) => newBox} />

                {/* Alignment guides overlay */}
                {showGuides && liveGuides.vertical.map((x) => (
                  <Line key={`v-${x}`} points={[x, 0, x, preset.height]} stroke="#60a5fa" strokeWidth={1} dash={[4, 4]} listening={false} />
                ))}
                {showGuides && liveGuides.horizontal.map((y) => (
                  <Line key={`h-${y}`} points={[0, y, preset.width, y]} stroke="#60a5fa" strokeWidth={1} dash={[4, 4]} listening={false} />
                ))}
              </KonvaLayer>
            </Stage>
          </div>
        </div>

        {/* Side properties panel */}
        <div className="rounded-lg border p-3 space-y-3">
          <div className="space-y-2">
            <div className="font-medium">Calques de texte</div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => addText('title')} aria-label="Ajouter un titre">
                + Titre
              </Button>
              <Button size="sm" onClick={() => addText('subtitle')} aria-label="Ajouter un sous-titre">
                + Sous-titre
              </Button>
              <Button size="sm" onClick={() => addText('cta')} aria-label="Ajouter un CTA">
                + CTA
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Actions</div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={duplicateSelected} disabled={!selectedLayer} aria-label="Dupliquer">
                Dupliquer
              </Button>
              <Button size="sm" variant="destructive" onClick={deleteSelected} disabled={!selectedLayer} aria-label="Supprimer">
                Supprimer
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Ordre</div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="secondary" onClick={sendBackward} disabled={!selectedLayer} aria-label="Descendre">
                Descendre
              </Button>
              <Button size="sm" variant="secondary" onClick={bringForward} disabled={!selectedLayer} aria-label="Monter">
                Monter
              </Button>
              <Button size="sm" variant="secondary" onClick={sendToBack} disabled={!selectedLayer} aria-label="Tout derrière">
                Derrière
              </Button>
              <Button size="sm" variant="secondary" onClick={bringToFront} disabled={!selectedLayer} aria-label="Tout devant">
                Devant
              </Button>
            </div>
          </div>

          {/* Properties of selected layer */}
          <div className="space-y-2">
            <div className="font-medium">Propriétés</div>
            {selectedLayer ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                  <label>Texte</label>
                  <input
                    className="border rounded-md px-2 py-1 bg-background"
                    value={selectedLayer.text}
                    onChange={(e) => onPropChange('text', e.target.value)}
                    aria-label="Texte"
                  />
                </div>
                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                  <label>Police</label>
                  <select
                    className="border rounded-md px-2 py-1 bg-background"
                    value={selectedLayer.fontFamily}
                    onChange={(e) => onPropChange('fontFamily', e.target.value)}
                    aria-label="Police"
                  >
                    {fontOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                  <label>Couleur</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        title={c}
                        onClick={() => onPropChange('fill', c)}
                        className={`w-6 h-6 rounded border ${selectedLayer.fill === c ? 'ring-2 ring-primary' : ''}`}
                        style={{backgroundColor: c}}
                        aria-label={`Couleur ${c}`}
                      />)
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                  <label>Taille</label>
                  <input
                    type="number"
                    className="border rounded-md px-2 py-1 bg-background"
                    value={selectedLayer.fontSize}
                    min={8}
                    max={400}
                    onChange={(e) => onPropChange('fontSize', Number(e.target.value))}
                    aria-label="Taille de police"
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Sélectionnez un calque pour le modifier.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
