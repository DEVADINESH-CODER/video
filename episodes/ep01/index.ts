import type { EpisodeDefinition } from "../../src/episode";
import { EPISODE } from "./config";
import { Episode1 } from "./Episode1";

/** Picked up automatically by src/Root.tsx → <Composition id={EPISODE.id} />. */
export const episode: EpisodeDefinition = {
  config: EPISODE,
  Component: Episode1,
};
