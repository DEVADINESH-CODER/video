/**
 * Shared vocabulary for the hand-drawn episode.
 *
 * Everything here is deterministic: the same frame always produces the same
 * line. The wobble lives in the authored path bends and the canvas filter, not
 * in Math.random().
 */

export const PAPER = "#EAE6DF";
export const PAPER_LIGHT = "#F3EFE7";
export const PAPER_DEEP = "#DCE3E6";
export const CHARCOAL = "#121417";
export const CHARCOAL_LIGHT = "#1A1D22";
export const INK = "#181A1F";
export const CHALK = "#F3F0E8";
export const AMBER = "#E59A10";
export const CRIMSON = "#D92B4B";
export const HOT_CRIMSON = "#FF2A5F";
export const TEAL = "#0E9AA7";
export const CYAN = "#00D2E0";

export const FONT_SERIF =
  "Georgia,'Times New Roman','DejaVu Serif',serif";

export const alpha = (hex: string, a: number) => {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export type Pt = { x: number; y: number };

/** A softly bowed line. `bow` pushes the midpoint sideways in px. */
export const bowed = (a: Pt, b: Pt, bow = 1.2): string => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return `M${a.x} ${a.y} Q${mx + (-dy / len) * bow} ${my + (dx / len) * bow} ${b.x} ${b.y}`;
};

/** Hand-drawn rectangle: four bowed edges meeting at slightly uneven corners. */
export const roughRect = (x: number, y: number, w: number, h: number, bow = 1.4): string => {
  return [
    `M${x} ${y}`,
    `Q${x + w / 2} ${y - bow} ${x + w} ${y}`,
    `Q${x + w + bow} ${y + h / 2} ${x + w} ${y + h}`,
    `Q${x + w / 2} ${y + h + bow} ${x} ${y + h}`,
    `Q${x - bow} ${y + h / 2} ${x} ${y}`,
    "Z",
  ].join(" ");
};

/** An ellipse built from eight uneven control points — never a perfect circle. */
export const roughOval = (cx: number, cy: number, rx: number, ry: number, wobble = 1.8): string => {
  const w = wobble;
  return [
    `M${cx} ${cy - ry}`,
    `C${cx + rx * 0.55} ${cy - ry - w} ${cx + rx + w} ${cy - ry * 0.45} ${cx + rx} ${cy}`,
    `C${cx + rx - w} ${cy + ry * 0.5} ${cx + rx * 0.5} ${cy + ry + w} ${cx} ${cy + ry}`,
    `C${cx - rx * 0.5} ${cy + ry - w} ${cx - rx - w} ${cy + ry * 0.5} ${cx - rx} ${cy}`,
    `C${cx - rx + w} ${cy - ry * 0.5} ${cx - rx * 0.5} ${cy - ry + w} ${cx} ${cy - ry}`,
    "Z",
  ].join(" ");
};

/**
 * Short parallel shading strokes scattered through a box. The hash reads as
 * cross-hatch at a distance without filling anything solid.
 */
export const hatch = (
  x: number,
  y: number,
  w: number,
  h: number,
  count: number,
  angle = -38,
  length = 26,
): string[] => {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const cx = x + w * t + Math.sin(i * 1.7) * 2;
    const cy = y + h * ((i * 0.37) % 1) + Math.cos(i * 1.3) * 2;
    const len = length * (0.72 + ((i * 7) % 5) * 0.07);
    return bowed(
      { x: cx - dx * len * 0.5, y: cy - dy * len * 0.5 },
      { x: cx + dx * len * 0.5, y: cy + dy * len * 0.5 },
      i % 2 === 0 ? 1.1 : -0.9,
    );
  });
};

/** A nearly closed ring of short ticks, for city dots and buttons. */
export const tickRing = (cx: number, cy: number, r: number, count = 7): string[] =>
  Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + 0.3;
    return bowed(
      { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r },
      { x: cx + Math.cos(a + 0.32) * r, y: cy + Math.sin(a + 0.32) * r },
      1,
    );
  });
