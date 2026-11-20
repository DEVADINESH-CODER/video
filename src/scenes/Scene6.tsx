import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { InkStroke } from "../components/InkStroke";
import { InkWord } from "../components/InkWord";
import { SketchCanvas } from "../components/SketchCanvas";
import { CYAN, CHALK, CRIMSON, HOT_CRIMSON, TEAL, alpha } from "../sketch";
import { PORTRAIT, PORTRAIT_MASK } from "./figures";
import { Figure } from "./Figure";

const BORDER_LEFT =
  "M36 376 L66 436 L38 494 L68 556 L34 620 L64 684 L32 748 L62 814 L30 880 L58 946 L28 1014";
const BORDER_RIGHT =
  "M1044 402 L1012 462 L1042 522 L1010 586 L1044 650 L1012 716 L1046 780 L1014 846 L1048 910 L1016 976 L1050 1042";
const BORDER_TOP =
  "M118 194 L210 210 L294 188 L382 208 L470 186 L558 208 L646 186 L734 210 L822 188 L910 208 L994 190";

/**
 * Scene 6 · 1140 – 1350
 * The crimson word and border scratches retract; the old white sketch lifts;
 * the same face is drawn again, cleanly, in teal.
 */
export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  const wordErase = 1 - interpolate(frame, [0, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const borderErase = 1 - interpolate(frame, [0, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const whiteFade = interpolate(frame, [56, 124], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tealWash = interpolate(frame, [24, 126], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SketchCanvas
        tone="charcoal"
        wash={
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(60% 46% at 50% 48%, ${alpha(TEAL, 0.17 * tealWash)} 0%, transparent 74%)`,
              pointerEvents: "none",
            }}
          />
        }
      >
        {/* the white sketch left over from the last scene */}
        <g opacity={whiteFade}>
          <Figure
            strokes={PORTRAIT}
            baseWidth={720}
            baseHeight={900}
            cx={540}
            top={690}
            height={1150}
            mask={PORTRAIT_MASK}
            maskStart={0}
            progress={1}
            forceColor={CHALK}
          />
        </g>

        {/* the crimson tension leaves, word first */}
        <InkStroke
          d={BORDER_LEFT}
          startFrame={0}
          durationFrames={1}
          progress={borderErase}
          stroke={CRIMSON}
          width={4.4}
        />
        <InkStroke
          d={BORDER_RIGHT}
          startFrame={0}
          durationFrames={1}
          progress={borderErase}
          stroke={CRIMSON}
          width={4}
        />
        <InkStroke
          d={BORDER_TOP}
          startFrame={0}
          durationFrames={1}
          progress={borderErase}
          stroke={CRIMSON}
          width={2.6}
          opacity={0.55}
        />
        <InkWord
          word="WORTHLESS"
          x={540}
          y={344}
          height={132}
          startFrame={0}
          durationFrames={1}
          color={HOT_CRIMSON}
          progress={wordErase}
        />

        {/* the same portrait, redrawn in one clean teal ink */}
        <Figure
          strokes={PORTRAIT}
          baseWidth={720}
          baseHeight={900}
          cx={540}
          top={690}
          height={1150}
          mask={PORTRAIT_MASK}
          maskStart={0}
          base={44}
          accent={CYAN}
          forceColor={TEAL}
        />

        {/* a few clean cyan resolution strokes over the teal */}
        <InkStroke
          d="M246 274 C230 218 248 160 286 124"
          startFrame={144}
          durationFrames={16}
          stroke={CYAN}
          width={4.6}
          opacity={0.9}
        />
        <InkStroke
          d="M282 542 C218 558 166 596 138 648"
          startFrame={150}
          durationFrames={16}
          stroke={CYAN}
          width={3.6}
          opacity={0.75}
        />
        <InkStroke
          d="M246 858 C360 876 540 880 690 860"
          startFrame={156}
          durationFrames={18}
          stroke={TEAL}
          width={3.4}
          opacity={0.8}
        />
        <InkStroke
          d="M278 892 C390 906 540 908 670 892"
          startFrame={164}
          durationFrames={14}
          stroke={CYAN}
          width={1.8}
          opacity={0.5}
        />
      </SketchCanvas>
    </AbsoluteFill>
  );
};
