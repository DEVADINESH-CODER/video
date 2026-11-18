/**
 * Shared design tokens for Episode 01.
 *
 * Palette source: the story's own visual language — a cold, technical world
 * (charcoal + electric cyan), the crimson of public humiliation, the green of
 * the scoreboard, and the warm amber of the one relationship that stayed.
 */

export const COLORS = {
  bg: "#05070B",
  bgDeep: "#020307",
  panel: "#0B0F15",
  panelLine: "#1D2531",
  ink: "#EEF3FA",
  muted: "#7C8798",
  dim: "#4C5666",
  charcoal: "#14161D",
  charcoalLight: "#232733",
  cyan: "#00F0FF",
  crimson: "#FF2A5F",
  green: "#3BE58B",
  amber: "#FFB800",
  skin: "#C08A62",
  skinShade: "#9C6A46",
  hair: "#0D0F14",
  pants: "#0E1016",
} as const;

export const FONT_DISPLAY =
  "'Inter Tight','Archivo','Helvetica Neue',Helvetica,'Liberation Sans',Arial,sans-serif";

export const FONT_MONO =
  "'JetBrains Mono','SFMono-Regular',Menlo,'DejaVu Sans Mono',monospace";

/** Episode timing — 30 fps, 60 seconds, vertical. */
export const FPS = 30;
export const EPISODE_FRAMES = 1800;
export const SCENES = [
  {from: 0, duration: 180, name: "The label"},
  {from: 180, duration: 360, name: "The escape"},
  {from: 540, duration: 360, name: "The method"},
  {from: 900, duration: 450, name: "The scoreboard"},
  {from: 1350, duration: 450, name: "The reason"},
] as const;
