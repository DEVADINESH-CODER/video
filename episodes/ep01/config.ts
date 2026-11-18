/**
 * Episode 01 — "Worthless"
 *
 * Everything that makes this episode itself lives here: its composition id, its
 * runtime, its seven scene windows and the voiceover it expects. Copy this file
 * into episodes/ep02/ as a starting point for the next one and change `id`,
 * `slug`, `label` and `voiceover`.
 *
 * Keep `id` as `Episode<number>`: .github/workflows/render-video.yml derives it
 * from the folder name (ep02 → Episode2) when it renders out/<slug>.mp4.
 */

import type { EpisodeConfig } from "../../src/episode";
import { COLORS, FPS } from "../../src/theme";

export const EPISODE: EpisodeConfig = {
  id: "Episode1",
  slug: "ep01",
  title: "Worthless",
  width: 1080,
  height: 1920,
  fps: FPS,
  durationInFrames: 1740,
  scenes: [
    { from: 0, duration: 120, name: "01 · The doorway", accent: COLORS.amber },
    { from: 120, duration: 210, name: "02 · The corridor", accent: COLORS.cyan },
    { from: 330, duration: 330, name: "03 · The train", accent: COLORS.cyan },
    { from: 660, duration: 240, name: "04 · The gate", accent: COLORS.crimson },
    { from: 900, duration: 240, name: "05 · Worthless", accent: COLORS.crimson },
    { from: 1140, duration: 210, name: "06 · The turn", accent: COLORS.cyan },
    { from: 1350, duration: 390, name: "07 · The proof", accent: COLORS.cyan },
  ],
  voiceover: "audio/ep01_voice.wav",
  label: "EP.01",
};
