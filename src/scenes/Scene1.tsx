import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { InkStroke } from "../components/InkStroke";
import { SketchCanvas } from "../components/SketchCanvas";
import { SketchGroup } from "../components/SketchGroup";
import { AMBER, FONT_SERIF, INK, alpha, bowed, roughRect } from "../sketch";
import { BACK } from "./figures";
import { Figure } from "./Figure";

/**
 * Scene 1 · 0 – 120
 * The doorway draws itself in amber marker, then the boy is sketched from
 * behind, stepping out. Nothing walks: the pen does all the moving.
 */
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const title = interpolate(frame, [56, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const markers = [
    { d: "M286 1608 C356 1380 436 1118 538 820", start: 12, dur: 17, w: 18 },
    { d: "M338 1628 C410 1390 492 1132 594 830", start: 16, dur: 17, w: 12 },
    { d: "M396 1630 C470 1400 552 1148 650 846", start: 20, dur: 17, w: 16 },
    { d: "M452 1636 C524 1414 604 1166 704 862", start: 24, dur: 17, w: 10 },
    { d: "M514 1640 C584 1428 662 1184 762 880", start: 27, dur: 16, w: 15 },
    { d: "M576 1638 C642 1434 716 1196 814 896", start: 30, dur: 16, w: 9 },
    { d: "M330 1520 C420 1300 520 1060 640 760", start: 34, dur: 14, w: 8 },
    { d: "M470 1580 C560 1360 650 1130 760 840", start: 37, dur: 14, w: 7 },
  ];

  return (
    <AbsoluteFill>
      <SketchCanvas tone="paper">
        <defs>
          <clipPath id="scene1-door">
            <rect x={252} y={566} width={576} height={1038} />
          </clipPath>
        </defs>

        {/* warm light inside the opening */}
        <rect x={252} y={566} width={576} height={1038} fill={AMBER} opacity={0.07} />
        <g clipPath="url(#scene1-door)">
          {markers.map((m, i) => (
            <InkStroke
              key={i}
              d={m.d}
              startFrame={m.start}
              durationFrames={m.dur}
              stroke={AMBER}
              width={m.w}
              opacity={0.55}
              ease="out"
            />
          ))}
        </g>

        {/* hand-drawn door frame */}
        <InkStroke
          d={roughRect(220, 528, 640, 1088, 2.2)}
          startFrame={0}
          durationFrames={24}
          width={5.5}
          double
        />
        <InkStroke
          d={bowed({ x: 252, y: 566 }, { x: 252, y: 1604 }, 1.4)}
          startFrame={8}
          durationFrames={18}
          width={3}
        />
        <InkStroke
          d={bowed({ x: 828, y: 566 }, { x: 828, y: 1604 }, -1.4)}
          startFrame={8}
          durationFrames={18}
          width={3}
        />
        <InkStroke
          d={bowed({ x: 252, y: 566 }, { x: 828, y: 566 }, 1.6)}
          startFrame={10}
          durationFrames={14}
          width={3}
        />
        <InkStroke
          d="M206 1610 C380 1604 700 1604 874 1610"
          startFrame={20}
          durationFrames={14}
          width={5}
          double
        />
        <InkStroke
          d="M206 1642 C390 1638 690 1638 874 1642"
          startFrame={24}
          durationFrames={10}
          width={2.4}
          opacity={0.4}
        />

        {/* the boy, drawn from behind */}
        <Figure
          strokes={BACK}
          baseWidth={500}
          baseHeight={1000}
          cx={540}
          top={714}
          height={1072}
          base={24}
          accent={AMBER}
        />

        {/* the threshold and a little floor hatch */}
        <SketchGroup
          base={62}
          accent={AMBER}
          strokes={[
            { d: "M320 1788 C420 1782 620 1782 742 1790", start: 0, dur: 9, width: 3, tone: "soft" },
            { d: "M360 1812 C450 1808 590 1808 690 1814", start: 3, dur: 9, width: 2, tone: "hatch" },
            { d: "M260 1818 C370 1814 450 1814 520 1818", start: 5, dur: 8, width: 2, tone: "hatch" },
          ]}
        />
      </SketchCanvas>

      <div
        style={{
          position: "absolute",
          top: 196,
          left: 62,
          right: 62,
          opacity: title,
          transform: `translateY(${(1 - title) * 22}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 154,
            lineHeight: 0.86,
            letterSpacing: -4,
            color: INK,
            fontWeight: 400,
          }}
        >
          21 DAYS
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 31,
            letterSpacing: 0.4,
            color: alpha(INK, 0.66),
          }}
        >
          the first morning
        </div>
      </div>
    </AbsoluteFill>
  );
};
