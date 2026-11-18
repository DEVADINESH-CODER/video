/**
 * Shared design tokens for every episode.
 *
 * Palette source: the story's own visual language — a cold, technical world
 * (charcoal + electric cyan), the crimson of public humiliation, the green of
 * the scoreboard, and the warm amber of the one relationship that stayed.
 *
 * Episode-specific things (id, runtime, scene windows, voiceover) live in
 * episodes/<slug>/config.ts so episodes stay independent of each other.
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

/** Every episode is vertical and shot at 30 fps. */
export const FPS = 30;

/**
 * One damped spring for every camera move and entrance.
 *
 * High stiffness with low damping overshoots and shimmers on vertical lines;
 * this setting settles cleanly in roughly half a second and never rings.
 */
export const SPRING_CAMERA = {
  damping: 22,
  stiffness: 110,
  mass: 1,
} as const;
