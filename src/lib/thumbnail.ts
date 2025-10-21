import type {TextLayer, PresetId} from '@/stores/editor';
import {PRESETS} from '@/stores/editor';
import type {Theme} from '@/themes/schema';

// Draw wrapped text within a max width
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign
) {
  const words = text.split(/\s+/);
  let line = '';
  const lines: string[] = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line ? line + ' ' + words[n] : words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n];
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);

  const baselineY = y;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    const ly = baselineY + i * lineHeight;
    ctx.fillText(lines[i], x, ly);
  }
}

export type Design = {
  presetId: PresetId;
  textLayers: TextLayer[];
};

export function renderDesignThumbnail({
  design,
  theme,
  width = 320
}: {
  design: Design;
  theme: Theme;
  width?: number;
}): string {
  const preset = PRESETS[design.presetId];
  const aspect = preset.height / preset.width;
  const height = Math.round(width * aspect);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = `hsl(${theme.colors.secondary})`;
  ctx.fillRect(0, 0, width, height);

  // Draw a subtle overlay block to hint the safe area
  ctx.strokeStyle = `hsla(${theme.colors.ring} / 0.6)`;
  ctx.lineWidth = 2;
  const margin = Math.round(Math.min(width, height) * 0.06);
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  ctx.setLineDash([]);

  // Text layers
  design.textLayers.forEach((tl) => {
    const x = tl.xFrac * width;
    const y = tl.yFrac * height;
    const maxW = tl.widthFrac * width;
    const fontPx = Math.max(10, Math.floor(tl.fontScale * height));
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fontPx}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"`;

    const align: CanvasTextAlign = tl.align ?? 'left';
    let drawX = x;
    if (align === 'center') drawX = x + maxW / 2;
    if (align === 'right') drawX = x + maxW;

    drawWrappedText(ctx, tl.text, drawX, y, maxW, Math.round(fontPx * 1.25), align);
  });

  return canvas.toDataURL('image/png');
}
