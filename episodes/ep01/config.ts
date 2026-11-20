/**
 * Episode 01 — "Worthless"
 *
 * The composition contract stays in this file so Root.tsx can register the
 * episode without knowing anything about its scenes.
 */

import type { EpisodeConfig } from "../../src/episode";
import { FPS } from "../../src/theme";
import { AMBER, CRIMSON, CYAN, HOT_CRIMSON, TEAL } from "../../src/sketch";

export const EPISODE: EpisodeConfig = {
  id: "Episode1",
  slug: "ep01",
  title: "Worthless",
  width: 1080,
  height: 1920,
  fps: FPS,
  durationInFrames: 1740,
  scenes: [
    { from: 0, duration: 120, name: "01 · The doorway", accent: AMBER },
    { from: 120, duration: 210, name: "02 · The corridor", accent: TEAL },
    { from: 330, duration: 330, name: "03 · The method", accent: TEAL },
    { from: 660, duration: 240, name: "04 · The gate", accent: CRIMSON },
    { from: 900, duration: 240, name: "05 · Worthless", accent: HOT_CRIMSON },
    { from: 1140, duration: 210, name: "06 · The turn", accent: CYAN },
    { from: 1350, duration: 390, name: "07 · The proof", accent: TEAL },
  ],
  voiceover: "ep1_voice.wav",
  label: "EP. 01",
};
