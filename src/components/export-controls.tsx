"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {useImagesStore} from "@/stores/images";
import {Button} from "@/components/ui/button";
import Konva from "konva";
import * as htmlToImage from "html-to-image";
import html2canvas from "html2canvas";
import {saveAs} from "file-saver";

// Social presets
const PRESETS = {
  ig: {key: "ig", labelKey: "preset.instagram", width: 1080, height: 1080},
  li: {key: "li", labelKey: "preset.linkedin", width: 1200, height: 627}
} as const;

type PresetKey = keyof typeof PRESETS;

type Format = "png" | "jpeg";

type StageBundle = {
  stage: Konva.Stage;
  layer: Konva.Layer;
  bgRect: Konva.Rect;
  imgNode: Konva.Image;
};

function formatDateYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_\-]+/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function ExportControls() {
  const t = useTranslations("Exporter");
  const images = useImagesStore((s) => s.images);
  const selectedId = useImagesStore((s) => s.selectedId);

  const selected = useMemo(() => images.find((i) => i.id === selectedId), [images, selectedId]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const stageBundleRef = useRef<StageBundle | null>(null);

  const [preset, setPreset] = useState<PresetKey>("ig");
  const [format, setFormat] = useState<Format>("png");
  const [scale, setScale] = useState<1 | 2>(1);
  const [transparentBg, setTransparentBg] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);

  const baseW = PRESETS[preset].width;
  const baseH = PRESETS[preset].height;

  // Ensure transparent option only for PNG
  useEffect(() => {
    if (format === "jpeg") {
      setTransparentBg(false);
    }
  }, [format]);

  // Initialize or update Konva stage
  useEffect(() => {
    const container = stageContainerRef.current;
    if (!container) return;

    const existing = stageBundleRef.current;
    if (!existing) {
      // Create stage once
      const stage = new Konva.Stage({container, width: baseW, height: baseH});
      const layer = new Konva.Layer();
      stage.add(layer);

      const bgRect = new Konva.Rect({x: 0, y: 0, width: baseW, height: baseH, fill: "#ffffff"});
      layer.add(bgRect);

      const imgNode = new Konva.Image({x: 0, y: 0});
      layer.add(imgNode);

      stageBundleRef.current = {stage, layer, bgRect, imgNode};
    } else {
      // Update dimensions when preset changes
      existing.stage.size({width: baseW, height: baseH});
      existing.bgRect.size({width: baseW, height: baseH});
    }
  }, [baseW, baseH]);

  // Load or update image into Konva
  useEffect(() => {
    const bundle = stageBundleRef.current;
    if (!bundle) return;

    const src = selected?.croppedUrl ?? selected?.src;
    if (!src) {
      // Clear image
      bundle.imgNode.image(null as any);
      bundle.layer.draw();
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const stage = bundle.stage;
      const sw = stage.width();
      const sh = stage.height();

      // Cover fit
      const scale = Math.max(sw / img.width, sh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (sw - dw) / 2;
      const dy = (sh - dh) / 2;

      bundle.imgNode.setAttrs({image: img, x: dx, y: dy, width: dw, height: dh});

      // Background visibility based on transparency
      bundle.bgRect.visible(!(format === "png" && transparentBg));

      bundle.layer.draw();
    };
    img.onerror = () => {
      setError(t("imageLoadError"));
    };
    img.src = src;
  }, [selected?.croppedUrl, selected?.src, format, transparentBg, t]);

  // Keep preview scaled to fit container width
  useEffect(() => {
    function recomputeScale() {
      const host = containerRef.current;
      if (!host) return;
      const maxWidth = host.clientWidth || baseW;
      const s = Math.min(1, maxWidth / baseW);
      setPreviewScale(s);
    }
    recomputeScale();
    window.addEventListener("resize", recomputeScale);
    return () => window.removeEventListener("resize", recomputeScale);
  }, [baseW]);

  const exportWithFallback = async (): Promise<string> => {
    const bundle = stageBundleRef.current;
    if (!bundle) throw new Error("Stage not ready");

    // Ensure bg visibility per current transparent setting
    bundle.bgRect.visible(!(format === "png" && transparentBg));
    bundle.layer.draw();

    const mime = format === "png" ? "image/png" : "image/jpeg";

    try {
      const dataUrl = bundle.stage.toDataURL({
        mimeType: mime,
        quality: format === "jpeg" ? 0.92 : undefined,
        pixelRatio: scale
      } as any);
      if (dataUrl && dataUrl.startsWith("data:")) {
        return dataUrl;
      }
    } catch (e) {
      // ignore and try fallback
    }

    try {
      const node = bundle.stage.container();
      if (!node) throw new Error("container-not-found");
      if (format === "png") {
        const dataUrl = await htmlToImage.toPng(node, {
          pixelRatio: scale,
          backgroundColor: transparentBg ? undefined : "#ffffff",
          cacheBust: true
        });
        return dataUrl;
      } else {
        const dataUrl = await htmlToImage.toJpeg(node, {
          pixelRatio: scale,
          quality: 0.92,
          backgroundColor: "#ffffff",
          cacheBust: true
        });
        return dataUrl;
      }
    } catch (e) {
      // ignore and try html2canvas
    }

    const node = bundle.stage.container();
    if (!node) throw new Error("container-not-found");
    const canvas = await html2canvas(node, {
      scale,
      backgroundColor: format === "png" && transparentBg ? null : "#ffffff",
      useCORS: true,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high"
    });
    const dataUrl = canvas.toDataURL(mime, format === "jpeg" ? 0.92 : undefined);
    return dataUrl;
  };

  async function handleExport() {
    setError(null);
    if (!selected) {
      setError(t("noImageError"));
      return;
    }

    try {
      const dataUrl = await exportWithFallback();
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const d = new Date();
      const dateStr = formatDateYYYYMMDD(d);
      const key = preset === "ig" ? "ig" : "li";
      const titleSlug = slugify(title || t("defaultTitle"));
      const filename = `${key}_${dateStr}_${titleSlug}.${format === "png" ? "png" : "jpg"}`;

      saveAs(blob, filename);
    } catch (e) {
      console.error(e);
      setError(t("exportError"));
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">{t("title")}</h2>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="preset" className="text-sm text-muted-foreground">
            {t("presetLabel")}
          </label>
          <select
            id="preset"
            className="border rounded-md px-2 py-1 bg-background"
            value={preset}
            onChange={(e) => setPreset(e.target.value as PresetKey)}
          >
            <option value="ig">{t(PRESETS.ig.labelKey)}</option>
            <option value="li">{t(PRESETS.li.labelKey)}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="format" className="text-sm text-muted-foreground">
            {t("formatLabel")}
          </label>
          <select
            id="format"
            className="border rounded-md px-2 py-1 bg-background"
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
          >
            <option value="png">{t("format.png")}</option>
            <option value="jpeg">{t("format.jpeg")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="scale" className="text-sm text-muted-foreground">
            {t("resolutionLabel")}
          </label>
          <select
            id="scale"
            className="border rounded-md px-2 py-1 bg-background"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value) as 1 | 2)}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1">
          <input
            id="transparent"
            type="checkbox"
            className="h-4 w-4"
            checked={transparentBg}
            onChange={(e) => setTransparentBg(e.target.checked)}
            disabled={format === "jpeg"}
          />
          <label htmlFor="transparent" className="text-sm text-muted-foreground">
            {t("transparentBg")}
          </label>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-2">
            <label htmlFor="title" className="text-sm text-muted-foreground">
              {t("titleLabel")}
            </label>
            <input
              id="title"
              type="text"
              className="border rounded-md px-2 py-1 bg-background"
              placeholder={t("titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {t("previewLabel", {size: `${baseW}×${baseH}`, scale: `${scale}x`})}
        </div>
        <div ref={containerRef} className="w-full border rounded-md bg-muted/30 p-3 overflow-auto">
          <div
            style={{
              width: baseW,
              height: baseH,
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
              background: "transparent"
            }}
          >
            <div ref={stageContainerRef} />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleExport} disabled={!selected}>
          {t("exportButton")}
        </Button>
      </div>
    </div>
  );
}
