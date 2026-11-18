import { AbsoluteFill, Sequence } from "remotion";
// Voiceover arrives later. Once public/ep1_voice.wav exists, uncomment this
// import and the <Audio> line below — the whole episode is already timed to 58s.
// import { Audio, staticFile } from "remotion";
import { COLORS } from "../theme";
import { Chrome } from "../components/Stage";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";
import { Scene6 } from "./Scene6";
import { Scene7 } from "./Scene7";

/**
 * Episode 01 — "Worthless"
 * 1080 x 1920 · 30 fps · 1740 frames · 58 seconds.
 *
 * The character stays on screen through every chapter; only the world, the
 * light and what he is carrying changes.
 */
export const Episode1: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep }}>
      {/* Voiceover placeholder — drop your recording at public/ep1_voice.wav */}
      {/* <Audio src={staticFile('ep1_voice.wav')} /> */}

      <Sequence from={0} durationInFrames={120} name="01 · The doorway">
        <Scene1 />
      </Sequence>
      <Sequence from={120} durationInFrames={210} name="02 · The corridor">
        <Scene2 />
      </Sequence>
      <Sequence from={330} durationInFrames={330} name="03 · The train">
        <Scene3 />
      </Sequence>
      <Sequence from={660} durationInFrames={240} name="04 · The gate">
        <Scene4 />
      </Sequence>
      <Sequence from={900} durationInFrames={240} name="05 · Worthless">
        <Scene5 />
      </Sequence>
      <Sequence from={1140} durationInFrames={210} name="06 · The turn">
        <Scene6 />
      </Sequence>
      <Sequence from={1350} durationInFrames={390} name="07 · The proof">
        <Scene7 />
      </Sequence>

      <Chrome />
    </AbsoluteFill>
  );
};
