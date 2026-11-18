import { AbsoluteFill, Sequence } from "remotion";
// Voiceover arrives later. Once public/ep1_voice.wav exists, uncomment this
// import and the <Audio> line below — the whole episode is already timed to 60s.
// import { Audio, staticFile } from "remotion";
import { COLORS } from "../theme";
import { Chrome } from "../components/Stage";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";

/**
 * Episode 01 — "Worthless"
 * 1080 x 1920 · 30 fps · 1800 frames · 60 seconds.
 *
 * The character stays on screen through every chapter; only the world, the
 * light and what he is carrying changes.
 */
export const Episode1: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep }}>
      {/* Voiceover placeholder — drop your recording at public/ep1_voice.wav */}
      {/* <Audio src={staticFile('ep1_voice.wav')} /> */}

      <Sequence from={0} durationInFrames={180} name="01 · The label">
        <Scene1 />
      </Sequence>
      <Sequence from={180} durationInFrames={360} name="02 · The escape">
        <Scene2 />
      </Sequence>
      <Sequence from={540} durationInFrames={360} name="03 · The method">
        <Scene3 />
      </Sequence>
      <Sequence from={900} durationInFrames={450} name="04 · The scoreboard">
        <Scene4 />
      </Sequence>
      <Sequence from={1350} durationInFrames={450} name="05 · The reason">
        <Scene5 />
      </Sequence>

      <Chrome />
    </AbsoluteFill>
  );
};
