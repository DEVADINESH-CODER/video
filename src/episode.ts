/**
 * The contract every episode folder has to satisfy.
 *
 * `Root.tsx` discovers every `episodes/<slug>/index.ts` file at bundle time and
 * registers one <Composition> per folder, so a new episode only needs:
 *
 *   episodes/ep02/config.ts      → the episode manifest
 *   episodes/ep02/Episode2.tsx   → the film itself
 *   episodes/ep02/scenes/…       → its scenes
 *   episodes/ep02/index.ts       → `export const episode = { config, Component }`
 *
 * Nothing in an episode folder is imported by another episode, and nothing is
 * overwritten when a new one is added.
 */

import type { FC } from "react";

export type SceneMarker = {
  /** First frame of the scene, relative to the episode. */
  from: number;
  /** Length of the scene in frames. */
  duration: number;
  /** Label shown in the Remotion timeline. */
  name: string;
  /** Accent colour used for this scene's light and progress bar. */
  accent: string;
};

export type EpisodeConfig = {
  /** Remotion <Composition> id — must be unique across the project. */
  id: string;
  /** Folder name under episodes/, e.g. "ep01". */
  slug: string;
  /** Human title, shown in the title card and the studio sidebar. */
  title: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  scenes: readonly SceneMarker[];
  /**
   * Voiceover inside public/, e.g. "audio/ep01_voice.wav".
   * The film plays it when the file exists and stays silent when it does not.
   */
  voiceover: string;
  /** Episode mark in the corner chrome, e.g. "EP.01". */
  label: string;
};

export type EpisodeDefinition = {
  config: EpisodeConfig;
  Component: FC;
};
