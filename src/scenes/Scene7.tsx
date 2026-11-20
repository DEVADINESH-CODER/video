import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { InkStroke } from "../components/InkStroke";
import { SketchCanvas } from "../components/SketchCanvas";
import { FONT_MONO } from "../theme";
import { TEAL, alpha, FONT_SERIF, INK, roughRect } from "../sketch";
import { PORTRAIT } from "./figures";
import { Figure } from "./Figure";

const CARDS = [
  { value: "71", label: "GOVT EXAMS", top: 166, rot: -0.8, at: 8, targetX: 132 },
  { value: "4", label: "CLIENT PROJECTS", top: 350, rot: 0.7, at: 30, targetX: 408 },
  { value: "1", label: "REGISTERED COMPANY", top: 534, rot: -0.5, at: 52, targetX: 684 },
];

/**
 * Scene 7 · 1350 – 1740
 * Back on paper. Three cards are drawn, then settle into a single bar above a
 * small ink waveform. He stays in the middle, drawn in the same ink as always.
 */
export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();

  const settle = interpolate(frame, [168, 224], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const bar = interpolate(frame, [206, 226], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade = interpolate(frame, [360, 390], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SketchCanvas tone="paper">
        {/* the three cards, one drawn after the other */}
        {CARDS.map((card, i) => {
          const text = interpolate(frame, [card.at + 10, card.at + 23], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = 190 + (card.targetX - 190) * settle;
          const y = card.top + (1600 - card.top) * settle;

          return (
            <g
              key={card.label}
              transform={`translate(${x} ${y}) rotate(${card.rot} 350 75) scale(${
                1 - settle * 0.72
              } ${1 - settle * 0.965})`}
              opacity={1 - settle}
            >
              <InkStroke
                d={roughRect(0, 0, 700, 150, 1.6)}
                startFrame={card.at}
                durationFrames={15}
                width={4.2}
                double
              />
              <InkStroke
                d="M304 -13 L392 -11 L390 13 L302 11 Z"
                startFrame={card.at + 8}
                durationFrames={8}
                stroke={TEAL}
                width={2.6}
                opacity={0.42}
              />
              <InkStroke
                d="M24 116 C220 112 480 112 676 118"
                startFrame={card.at + 12}
                durationFrames={9}
                width={1.8}
                opacity={0.4}
              />
              <text
                x={36}
                y={104}
                fontFamily={FONT_SERIF}
                fontSize={78}
                fill={INK}
                opacity={text}
              >
                {card.value}
              </text>
              <text
                x={188}
                y={98}
                fontFamily={FONT_MONO}
                fontSize={24}
                letterSpacing={4}
                fill={alpha(INK, 0.8)}
                opacity={text}
              >
                {card.label}
              </text>
              <text
                x={642}
                y={42}
                fontFamily={FONT_MONO}
                fontSize={17}
                letterSpacing={2}
                fill={TEAL}
                opacity={text}
              >
                0{i + 1}
              </text>
            </g>
          );
        })}

        {/* him, centre, drawn on the same sheet */}
        <Figure
          strokes={PORTRAIT}
          baseWidth={720}
          baseHeight={900}
          cx={540}
          top={742}
          height={786}
          base={30}
          accent={TEAL}
        />

        {/* waveform */}
        <InkStroke
          d="M108 1588 C360 1584 720 1584 972 1588"
          startFrame={232}
          durationFrames={12}
          width={2.4}
          opacity={0.45}
        />
        {Array.from({ length: 44 }, (_, i) => {
          const h =
            8 +
            (Math.abs(Math.sin(i * 0.51 + frame * 0.19)) * 0.55 +
              Math.abs(Math.sin(i * 0.13 - frame * 0.08)) * 0.45) *
              38;
          const x = 110 + i * 19.6;
          return (
            <InkStroke
              key={i}
              d={`M${x} 1586 L${x} ${1586 - h}`}
              startFrame={196 + i * 0.5}
              durationFrames={6}
              stroke={TEAL}
              width={3}
              opacity={0.78}
            />
          );
        })}

        {/* the bar the cards settle into */}
        <g opacity={bar}>
          <InkStroke
            d="M78 1602 C360 1598 720 1598 1002 1602"
            startFrame={206}
            durationFrames={14}
            width={4.2}
            double
          />
          <InkStroke
            d="M78 1712 C360 1708 720 1708 1002 1712"
            startFrame={210}
            durationFrames={14}
            width={2.4}
            opacity={0.6}
          />
          <InkStroke
            d="M78 1712 L78 1602 M360 1708 L360 1602 M666 1708 L666 1602 M1002 1712 L1002 1602"
            startFrame={216}
            durationFrames={10}
            width={1.4}
            opacity={0.28}
          />
        </g>

        <g opacity={bar}>
          {[
            { x: 104, value: "71", label: "EXAMS" },
            { x: 386, value: "4", label: "CLIENT PROJECTS" },
            { x: 692, value: "1", label: "REGISTERED COMPANY" },
          ].map((stat) => (
            <g key={stat.label}>
              <text
                x={stat.x}
                y={1682}
                fontFamily={FONT_SERIF}
                fontSize={48}
                fill={INK}
              >
                {stat.value}
              </text>
              <text
                x={stat.x + 62}
                y={1676}
                fontFamily={FONT_MONO}
                fontSize={18}
                letterSpacing={3}
                fill={alpha(INK, 0.72)}
              >
                {stat.label}
              </text>
            </g>
          ))}
        </g>

      </SketchCanvas>

      <AbsoluteFill
        style={{
          background: "#000000",
          opacity: fade,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
