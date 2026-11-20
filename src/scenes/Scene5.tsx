import { AbsoluteFill, useCurrentFrame } from "remotion";
import { InkStroke } from "../components/InkStroke";
import { InkWord } from "../components/InkWord";
import { SketchCanvas } from "../components/SketchCanvas";
import { StrokeList } from "../components/SketchGroup";
import {
  CHALK,
  CRIMSON,
  CYAN,
  HOT_CRIMSON,
  alpha,
} from "../sketch";
import { PARENT, PORTRAIT, PORTRAIT_MASK } from "./figures";
import { Figure } from "./Figure";

/**
 * Scene 5 · 900 – 1140
 * The portrait is drawn first, then the word is carved over it in crimson.
 * Three frames of horizontal slicing, then the page is completely still.
 */
export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const glitch = frame >= 92 && frame <= 94;
  const glitchX = 16 * Math.sin((frame - 91) * 2.1);

  return (
    <AbsoluteFill>
      <SketchCanvas
        tone="charcoal"
        wash={
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(56% 40% at 50% 34%, ${alpha(CRIMSON, 0.16)} 0%, transparent 72%)`,
              pointerEvents: "none",
            }}
          />
        }
      >
        <defs>
          <clipPath id="scene5-slice-a">
            <rect x={0} y={322} width={1080} height={54} />
          </clipPath>
          <clipPath id="scene5-slice-b">
            <rect x={0} y={374} width={1080} height={56} />
          </clipPath>
          <clipPath id="scene5-slice-c">
            <rect x={0} y={428} width={1080} height={62} />
          </clipPath>
        </defs>

        {/* parents, held back in soft white ink */}
        <g transform="translate(250 1124) scale(1.05)" opacity={0.22}>
          <StrokeList strokes={PARENT} base={0} accent={CRIMSON} />
        </g>
        <g transform="translate(832 1144) scale(1.1)" opacity={0.19}>
          <StrokeList strokes={PARENT} base={4} accent={CRIMSON} />
        </g>

        {/* the boy, chest-up, calm and set */}
        <Figure
          strokes={PORTRAIT}
          baseWidth={720}
          baseHeight={900}
          cx={540}
          top={690}
          height={1150}
          mask={PORTRAIT_MASK}
          maskStart={14}
          base={18}
          accent={HOT_CRIMSON}
        />

        {/* crimson border scratches */}
        <g opacity={0.9}>
          <InkStroke
            d="M40 382 C64 410 36 438 60 468 C84 498 34 520 56 552 C80 584 32 606 54 638 C78 670 32 692 52 724 C76 756 30 778 50 810 C74 842 28 864 48 896 C72 928 26 950 46 982 C66 1010 34 1030 48 1054"
            startFrame={70}
            durationFrames={24}
            stroke={CRIMSON}
            width={4.4}
          />
          <InkStroke
            d="M60 468 C82 458 88 480 68 492 M54 638 C32 628 26 650 46 662 M52 724 C74 716 80 736 60 748 M46 982 C68 974 74 994 54 1006"
            startFrame={74}
            durationFrames={20}
            stroke={CRIMSON}
            width={2.4}
            opacity={0.75}
          />
          <InkStroke
            d="M1040 408 C1016 438 1044 466 1020 496 C996 526 1046 548 1024 580 C1000 612 1048 634 1026 666 C1002 698 1048 720 1028 752 C1004 784 1050 806 1030 838 C1006 870 1052 892 1032 924 C1008 956 1054 978 1034 1010 C1010 1042 1042 1062 1028 1082"
            startFrame={74}
            durationFrames={24}
            stroke={CRIMSON}
            width={4}
          />
          <InkStroke
            d="M1020 496 C998 486 992 508 1012 520 M1026 666 C1004 656 998 678 1018 690 M1030 838 C1008 828 1002 850 1022 862"
            startFrame={78}
            durationFrames={20}
            stroke={CRIMSON}
            width={2.2}
            opacity={0.7}
          />
          <InkStroke
            d="M110 196 C170 184 214 206 268 194 C320 182 360 204 412 192 C466 180 510 204 562 192 C616 180 660 204 712 194 C764 184 808 206 860 194 C910 182 946 198 992 192"
            startFrame={78}
            durationFrames={18}
            stroke={CRIMSON}
            width={2.6}
            opacity={0.55}
          />
          <InkStroke
            d="M126 204 C184 194 226 214 280 202 C332 190 372 210 424 198 C478 186 522 208 574 196 C628 184 672 206 724 196 C776 186 820 206 872 196 C920 186 954 200 996 196"
            startFrame={80}
            durationFrames={16}
            stroke={CRIMSON}
            width={1.6}
            opacity={0.35}
          />
        </g>

        <g transform="translate(5 4)" opacity={0.32}>
          <InkWord
            word="WORTHLESS"
            x={540}
            y={344}
            height={132}
            startFrame={56}
            durationFrames={12}
            color={CRIMSON}
            gap={10}
          />
        </g>
        <InkWord
          word="WORTHLESS"
          x={540}
          y={344}
          height={132}
          startFrame={56}
          durationFrames={12}
          color={HOT_CRIMSON}
          gap={10}
        />

        {glitch ? (
          <g style={{ mixBlendMode: "screen" }} opacity={0.82}>
            <g clipPath="url(#scene5-slice-a)" transform={`translate(${glitchX} 0)`}>
              <InkWord
                word="WORTHLESS"
                x={540}
                y={344}
                height={132}
                startFrame={0}
                durationFrames={1}
                color={CHALK}
                progress={1}
              />
            </g>
            <g clipPath="url(#scene5-slice-b)" transform={`translate(${-glitchX * 0.8} 0)`}>
              <InkWord
                word="WORTHLESS"
                x={540}
                y={344}
                height={132}
                startFrame={0}
                durationFrames={1}
                color={CYAN}
                progress={1}
              />
            </g>
            <g clipPath="url(#scene5-slice-c)" transform={`translate(${glitchX * 0.5} 0)`}>
              <InkWord
                word="WORTHLESS"
                x={540}
                y={344}
                height={132}
                startFrame={0}
                durationFrames={1}
                color={HOT_CRIMSON}
                progress={1}
              />
            </g>
          </g>
        ) : null}

        <InkStroke
          d="M176 392 L244 366 M306 414 L366 386 M430 420 L498 390 M560 408 L628 378 M704 418 L762 392"
          startFrame={72}
          durationFrames={10}
          stroke={HOT_CRIMSON}
          width={2.4}
          opacity={0.42}
        />
        <InkStroke
          d="M320 522 L360 514 L402 524 L448 512 L492 526 L540 514 L588 526 L634 512 L680 524 L724 514 L760 522"
          startFrame={84}
          durationFrames={12}
          stroke={CRIMSON}
          width={3}
          opacity={0.55}
        />
        <InkStroke
          d="M354 532 L404 524 L456 534 L510 522 L560 534 L610 522 L660 532 L704 524"
          startFrame={87}
          durationFrames={10}
          stroke={CRIMSON}
          width={1.6}
          opacity={0.35}
        />
      </SketchCanvas>
    </AbsoluteFill>
  );
};
