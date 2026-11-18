import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, SPRING_CAMERA } from "../../../src/theme";
import { alpha } from "../../../src/components/Stage";
import { ExplorerAvatar, ribbon } from "../../../src/components/ExplorerAvatar";

/**
 * Scene 4 · 660 – 900
 * Fingers finish the last button, then the camera cranes up a gate: three tall
 * figures waiting, and crimson bleeding in from the edges.
 */

const GateFigure: React.FC<{ x: number; y: number; scale: number; bob: number; rim: string }> = ({
  x,
  y,
  scale,
  bob,
  rim,
}) => (
  <g transform={`translate(${x} ${y + bob}) scale(${scale})`}>
    {/* head */}
    <ellipse cx={0} cy={-540} rx={44} ry={54} fill="#140C15" stroke="#FF2A5F" strokeOpacity={0.35} strokeWidth={2} />
    <path d="M-40 -556 C-42 -596 -22 -614 0 -614 C22 -614 42 -596 40 -556 C32 -578 18 -588 0 -588 C-18 -588 -32 -578 -40 -556 Z" fill="#070509" stroke="#FF2A5F" strokeOpacity={0.22} strokeWidth={1.6} />
    <path d="M-22 -494 L-24 -470 L24 -470 L22 -494 Z" fill="#140C15" />
    {/* shoulders and coat */}
    <path
      d="M-84 -470 C-102 -400 -108 -300 -104 -196 C-102 -156 -96 -126 -84 -104 L-30 -104 L-22 -196 L22 -196 L30 -104 L84 -104 C96 -126 102 -156 104 -196 C108 -300 102 -400 84 -470 C50 -492 -50 -492 -84 -470 Z"
      fill="#140C15"
      stroke="#FF2A5F"
      strokeOpacity={0.28}
      strokeWidth={2}
    />
    <path d="M-40 -466 C-22 -486 22 -486 40 -466 L28 -430 L-28 -430 Z" fill="#050409" stroke="#FF2A5F" strokeOpacity={0.2} strokeWidth={1.6} />
    <path d="M84 -470 C102 -400 108 -300 104 -196" stroke="#FF2A5F" strokeOpacity={0.4} strokeWidth={2.4} fill="none" />
    {/* arms */}
    <path d={ribbon([{ x: -78, y: -450 }, { x: -96, y: -300 }, { x: -100, y: -160 }], [30, 24, 18])} fill="#140C15" />
    <path d={ribbon([{ x: 78, y: -450 }, { x: 96, y: -300 }, { x: 100, y: -160 }], [30, 24, 18])} fill="#140C15" />
    {/* legs */}
    <path d={ribbon([{ x: -44, y: -120 }, { x: -50, y: -52 }, { x: -48, y: 0 }], [40, 32, 26])} fill="#140C15" />
    <path d={ribbon([{ x: 44, y: -120 }, { x: 50, y: -52 }, { x: 48, y: 0 }], [40, 32, 26])} fill="#140C15" />
    {/* rim light on the shoulder line */}
    <path d="M-84 -470 C-102 -400 -108 -300 -104 -220" stroke={rim} strokeOpacity={0.3} strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d="M-30 -104 C-10 -128 10 -128 30 -104" stroke="#FF2A5F" strokeOpacity={0.25} strokeWidth={2} fill="none" />
  </g>
);

const Gate: React.FC<{ frame: number }> = ({ frame }) => {
  const bars = Array.from({ length: 21 }, (_, i) => 70 + i * 46);
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="gate-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#120810" />
          <stop offset="42%" stopColor="#0A070D" />
          <stop offset="100%" stopColor="#050409" />
        </linearGradient>
        <linearGradient id="gate-iron" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4C5568" />
          <stop offset="38%" stopColor="#2E3542" />
          <stop offset="100%" stopColor="#151920" />
        </linearGradient>
        <radialGradient id="gate-crimson" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FF2A5F" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#FF2A5F" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1080" height="1920" fill="url(#gate-sky)" />
      <defs>
        <linearGradient id="gate-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#140912" />
          <stop offset="100%" stopColor="#050409" />
        </linearGradient>
      </defs>
      <path d="M0 1604 L1080 1604 L1080 1920 L0 1920 Z" fill="url(#gate-ground)" />
      <ellipse cx={540} cy={1650} rx={520} ry={80} fill="#FF2A5F" opacity={0.08} />
      {/* the school behind the fence: a dark block with a clock and a few lit windows */}
      <g opacity={0.95}>
        <path d="M0 548 L0 900 L1080 900 L1080 548 C900 524 760 536 540 522 C320 536 180 524 0 548 Z" fill="#0B0910" />
        <path d="M0 548 C180 524 320 536 540 522 C760 536 900 524 1080 548 L1080 566 C900 544 760 556 540 542 C320 556 180 544 0 566 Z" fill="#211826" opacity={0.9} />
        {Array.from({ length: 22 }, (_, i) => {
          const col = i % 11;
          const row = Math.floor(i / 11);
          const x = 70 + col * 92;
          const y = 590 + row * 84;
          const lit = i % 5 === 1 || i % 7 === 3;
          return (
            <path
              key={i}
              d={`M${x} ${y} L${x + 26} ${y} L${x + 26} ${y + 34} L${x} ${y + 34} Z`}
              fill={lit ? "#FFB800" : "#141019"}
              opacity={lit ? 0.2 : 0.9}
            />
          );
        })}
        {/* clock over the entrance */}
        <circle cx={540} cy={560} r={30} fill="#0B0910" stroke="#FF2A5F" strokeOpacity={0.4} strokeWidth={2.4} />
        <path d="M540 560 L540 542 M540 560 L553 566" stroke="#FF2A5F" strokeWidth={2} opacity={0.55} strokeLinecap="round" />
        <path d="M470 702 L610 702" stroke="#FF2A5F" strokeWidth={2} opacity={0.25} />
      </g>

      {/* three waiting silhouettes */}
      <GateFigure x={270} y={1620} scale={1.12} bob={Math.sin(frame / 30) * 2.4} rim="#FF2A5F" />
      <GateFigure x={540} y={1620} scale={1.22} bob={Math.sin(frame / 30 + 1.2) * 2.4} rim="#FF2A5F" />
      <GateFigure x={812} y={1620} scale={1.06} bob={Math.sin(frame / 30 + 2.1) * 2.4} rim="#FF2A5F" />

      {/* stone gate pillars frame the fence */}
      <g>
        <path d="M0 740 L92 740 L92 1640 L0 1640 Z" fill="#120C16" stroke="#2B2233" strokeWidth={2} />
        <path d="M988 740 L1080 740 L1080 1640 L988 1640 Z" fill="#120C16" stroke="#2B2233" strokeWidth={2} />
        <path d="M-8 716 L100 716 L100 744 L-8 744 Z" fill="#1C1422" stroke="#3A2E45" strokeWidth={2} />
        <path d="M980 716 L1088 716 L1088 744 L980 744 Z" fill="#1C1422" stroke="#3A2E45" strokeWidth={2} />
        <path d="M8 786 L84 786 M996 786 L1072 786" stroke="#FF2A5F" strokeOpacity={0.25} strokeWidth={2} />
      </g>

      {/* iron gate */}
      <g>
        {bars.map((x, i) => (
          <g key={x}>
            <line x1={x} y1={800} x2={x} y2={1580} stroke="url(#gate-iron)" strokeWidth={9} />
            <line x1={x - 2.4} y1={806} x2={x - 2.4} y2={1574} stroke="#7A8396" strokeWidth={1.4} opacity={0.3} />
            <path d={`M${x - 12} 806 L${x} 772 L${x + 12} 806 Z`} fill="#4A5264" stroke="#141821" strokeWidth={2} />
            {i % 5 === 2 ? <circle cx={x} cy={900} r={8} fill="none" stroke="#5C6577" strokeWidth={2.6} /> : null}
          </g>
        ))}
        <line x1={0} y1={1040} x2={1080} y2={1040} stroke="#2A303C" strokeWidth={16} />
        <line x1={0} y1={1034} x2={1080} y2={1034} stroke="#5A6374" strokeWidth={2} opacity={0.6} />
        <line x1={0} y1={1580} x2={1080} y2={1580} stroke="#161B23" strokeWidth={22} />

      </g>

      {/* crimson bleeding from the edges */}
      <ellipse cx={0} cy={980} rx={260} ry={860} fill="url(#gate-crimson)" />
      <ellipse cx={1080} cy={1100} rx={260} ry={820} fill="url(#gate-crimson)" />
      <rect width={1080} height={1920} fill="none" stroke="#FF2A5F" strokeOpacity={0.16} strokeWidth={20} />
    </svg>
  );
};

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pan = spring({ frame: frame - 70, fps, config: SPRING_CAMERA, durationInFrames: 110 });
  const crane = interpolate(pan, [0, 1], [0, 1928]);

  const caption = interpolate(frame, [138, 158], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handsIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#05050A", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3840,
          transform: `translateY(${crane - 1920}px)`,
        }}
      >
        {/* gate half */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1920 }}>
          <Gate frame={frame} />
          <div
            style={{
              position: "absolute",
              top: 352,
              left: 0,
              right: 0,
              textAlign: "center",
              opacity: caption,
              transform: `translateY(${(1 - caption) * 24}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 900,
                fontSize: 158,
                lineHeight: 1,
                color: "#FFFFFF",
                textShadow: `0 0 20px rgba(255,255,255,0.4), 0 0 58px ${alpha(COLORS.crimson, 0.8)}`,
              }}
            >
              DAY 21
            </div>
          </div>
        </div>

        {/* hands half */}
        <div
          style={{
            position: "absolute",
            top: 1920,
            left: 0,
            right: 0,
            height: 1920,
            background: "linear-gradient(180deg, #0A0B10 0%, #07080C 100%)",
            opacity: handsIn,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1080,
              height: 1920,
            }}
          >
            <ExplorerAvatar cameraAngle="hands_closeup" outfit="school_uniform" rim={COLORS.amber} />
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};
