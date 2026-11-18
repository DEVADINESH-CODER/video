import { AbsoluteFill, Sequence } from "remotion";
import { Chrome } from "../../src/components/Stage";
import { Voiceover } from "../../src/components/Voiceover";
import { COLORS } from "../../src/theme";
import { EPISODE } from "./config";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";
import { Scene7 } from "./scenes/Scene7";

/**
 * Episode 01 — "Worthless"
 * 1080 x 1920 · 30 fps · 1740 frames · 58 seconds.
 *
 * The character stays on screen through every chapter; only the world, the
 * light and what he is carrying changes. Scene windows come from config.ts, so
 * re-timing an episode never means editing this file.
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

if (SCENE_COMPONENTS.length !== EPISODE.scenes.length) {
  throw new Error(
    `episodes/${EPISODE.slug}: config.ts has ${EPISODE.scenes.length} scenes but Episode1.tsx mounts ${SCENE_COMPONENTS.length}.`,
  );
}

export const Episode1: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep }}>
      {/*
       * Voiceover is optional: <Voiceover> plays public/audio/ep01_voice.wav
       * when the file exists and stays silent when it does not, so a fresh
       * clone still renders. To force a track, use the commented form:
       * <Audio src={staticFile("audio/ep01_voice.wav")} />
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

      <Chrome
        scenes={EPISODE.scenes}
        durationInFrames={EPISODE.durationInFrames}
        label={EPISODE.label}
      />
    </AbsoluteFill>
  );
};
