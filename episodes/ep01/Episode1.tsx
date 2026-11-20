import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { EditorialChrome } from "../../src/components/EditorialChrome";
import { Voiceover } from "../../src/components/Voiceover";
import { PAPER } from "../../src/sketch";
import { EPISODE } from "./config";
import { Scene1 } from "../../src/scenes/Scene1";
import { Scene2 } from "../../src/scenes/Scene2";
import { Scene3 } from "../../src/scenes/Scene3";
import { Scene4 } from "../../src/scenes/Scene4";
import { Scene5 } from "../../src/scenes/Scene5";
import { Scene6 } from "../../src/scenes/Scene6";
import { Scene7 } from "../../src/scenes/Scene7";

/**
 * Episode 01 — "Worthless"
 * 1080 × 1920 · 30 fps · 1740 frames · 58 seconds.
 *
 * A continuous ink drawing. Every scene is a sheet of paper or charcoal; the
 * character is never a puppet, only a set of strokes being finished.
 */

const SCENE_COMPONENTS: React.FC[] = [
  Scene1,
  Scene2,
  Scene3,
  Scene4,
  Scene5,
  Scene6,
  Scene7,
];

const DARK_SCENES = new Set([3, 4, 5]);

if (SCENE_COMPONENTS.length !== EPISODE.scenes.length) {
  throw new Error(
    `episodes/${EPISODE.slug}: config.ts has ${EPISODE.scenes.length} scenes but Episode1.tsx mounts ${SCENE_COMPONENTS.length}.`,
  );
}

export const Episode1: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.max(
    0,
    EPISODE.scenes.findIndex(
      (scene) => frame >= scene.from && frame < scene.from + scene.duration,
    ),
  );
  const tone = DARK_SCENES.has(active) ? "charcoal" : "paper";

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      {/*
       * The voice track is optional. When public/ep1_voice.wav exists it plays;
       * when it does not, the film stays silent and a fresh clone still renders.
       * To force a track, use the commented form:
       * <Audio src={staticFile("ep1_voice.wav")} />
       */}
      <Voiceover src={EPISODE.voiceover} />

      {EPISODE.scenes.map((scene, index) => {
        const Scene = SCENE_COMPONENTS[index];
        return (
          <Sequence
            key={scene.name}
            from={scene.from}
            durationInFrames={scene.duration}
            name={scene.name}
          >
            <Scene />
          </Sequence>
        );
      })}

      <EditorialChrome
        scenes={EPISODE.scenes}
        durationInFrames={EPISODE.durationInFrames}
        label={EPISODE.label}
        tone={tone}
      />
    </AbsoluteFill>
  );
};
