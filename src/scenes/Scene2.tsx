import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { InkStroke } from "../components/InkStroke";
import { SketchCanvas } from "../components/SketchCanvas";
import { SketchGroup } from "../components/SketchGroup";
import { FONT_SERIF, INK, PAPER, TEAL, alpha, bowed, roughRect } from "../sketch";
import { MOTHER, MOTHER_MASK, PROFILE, PROFILE_MASK } from "./figures";
import { Figure } from "./Figure";

/**
 * Scene 2 · 120 – 330
 * Corridor perspective is ruled in first, the frosted classroom window opens on
 * the left, and his profile is drawn past it without ever becoming a puppet.
 */
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const caption = interpolate(frame, [88, 106], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(frame, [10, 208], [34, -44], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const door = (points: string) => points;

  return (
    <AbsoluteFill>
      <SketchCanvas tone="paper">
        <defs>
          <clipPath id="scene2-window">
            <rect x={84} y={330} width={334} height={846} />
          </clipPath>
        </defs>

        {/* ceiling / floor seams */}
        <SketchGroup
          base={8}
          strokes={[
            { d: "M0 1210 C180 1190 380 1185 520 1190", start: 0, dur: 12, width: 2.4, tone: "soft" },
            { d: "M960 1195 C1000 1196 1040 1200 1080 1206", start: 1, dur: 12, width: 2.4, tone: "soft" },
            { d: "M0 1420 C190 1390 390 1385 530 1388", start: 2, dur: 12, width: 2.4, tone: "soft" },
            { d: "M960 1392 C1000 1394 1040 1400 1080 1408", start: 3, dur: 12, width: 2.4, tone: "soft" },
            { d: "M0 1660 C200 1620 400 1610 540 1612", start: 4, dur: 12, width: 2.4, tone: "soft" },
            { d: "M960 1616 C1000 1620 1040 1632 1080 1646", start: 5, dur: 12, width: 2.4, tone: "soft" },
            { d: "M0 470 C180 458 380 455 520 456", start: 1, dur: 12, width: 2.2, tone: "soft" },
            { d: "M960 458 C1000 460 1040 464 1080 468", start: 2, dur: 12, width: 2.2, tone: "soft" },
          ]}
        />

        {/* doors receding on both walls */}
        <SketchGroup
          base={8}
          strokes={[
            {
              d: door("M36 520 L188 614 L188 1470 L36 1686 Z"),
              start: 2,
              dur: 18,
              width: 3.8,
            },
            {
              d: door("M58 568 L168 634 L168 1436 L58 1614 Z"),
              start: 7,
              dur: 14,
              width: 2.4,
            },
            {
              d: door("M226 700 L306 754 L306 1322 L226 1408 Z"),
              start: 5,
              dur: 16,
              width: 3,
            },
            {
              d: door("M892 614 L1044 520 L1044 1686 L892 1470 Z"),
              start: 3,
              dur: 18,
              width: 3.8,
            },
            {
              d: door("M912 634 L1022 568 L1022 1614 L912 1436 Z"),
              start: 8,
              dur: 14,
              width: 2.4,
            },
            {
              d: door("M774 754 L854 700 L854 1408 L774 1322 Z"),
              start: 6,
              dur: 16,
              width: 3,
            },
          ]}
        />

        {/* frosted classroom window, left wall */}
        <rect x={84} y={330} width={334} height={846} fill={PAPER} />
        <rect x={84} y={330} width={334} height={846} fill={PAPER} />
        <rect x={84} y={330} width={334} height={846} fill={TEAL} opacity={0.055} />
        <g clipPath="url(#scene2-window)">
          <Figure
            strokes={MOTHER}
            baseWidth={420}
            baseHeight={640}
            cx={250}
            top={468}
            height={584}
            mask={MOTHER_MASK}
            maskStart={18}
            base={18}
            accent={TEAL}
          />
          {/* frost: diagonal strokes over the glass */}
          <SketchGroup
            base={42}
            strokes={Array.from({ length: 9 }, (_, i) => ({
              d: bowed(
                { x: 94 + i * 22, y: 340 },
                { x: 126 + i * 22, y: 1160 },
                i % 2 === 0 ? 2 : -2,
              ),
              start: i * 1.2,
              dur: 12,
              width: 2.6,
              tone: "soft" as const,
            }))}
          />
        </g>
        <InkStroke
          d={roughRect(72, 318, 358, 870, 2)}
          startFrame={16}
          durationFrames={18}
          width={4.6}
          double
        />
        <InkStroke
          d={roughRect(96, 342, 310, 820, 1.4)}
          startFrame={22}
          durationFrames={15}
          width={2.6}
        />
        <InkStroke
          d={bowed({ x: 250, y: 342 }, { x: 250, y: 1162 }, 0.8)}
          startFrame={28}
          durationFrames={12}
          width={3}
        />
        <InkStroke
          d="M66 1200 C150 1206 300 1206 444 1198"
          startFrame={31}
          durationFrames={10}
          width={4.4}
        />

        {/* the boy's profile, drawn in front and drifting past */}
        <g transform={`translate(${drift} 0)`}>
          <Figure
            strokes={PROFILE}
            baseWidth={520}
            baseHeight={1016}
            cx={788}
            top={552}
            height={1200}
            mask={PROFILE_MASK}
            maskStart={30}
            base={30}
            accent={TEAL}
          />
        </g>

        {/* speed ticks behind his trailing foot */}
        <SketchGroup
          base={70}
          strokes={[
            { d: "M456 1616 L392 1614", start: 0, dur: 7, width: 2.6, tone: "soft" },
            { d: "M472 1680 L386 1674", start: 2, dur: 7, width: 2.2, tone: "soft" },
            { d: "M462 1740 L404 1736", start: 4, dur: 7, width: 2, tone: "soft" },
          ]}
        />
      </SketchCanvas>

      <div
        style={{
          position: "absolute",
          left: 62,
          bottom: 150,
          opacity: caption,
          transform: `translateY(${(1 - caption) * 14}px)`,
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 35,
          lineHeight: 1.3,
          color: alpha(INK, 0.78),
        }}
      >
        my mother taught here.
      </div>
    </AbsoluteFill>
  );
};
