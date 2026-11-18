import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../../../src/theme";
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
    <ellipse cx={0} cy={-540} rx={44} ry={54} fill="#05060A" stroke="#FF2A5F" strokeOpacity={0.32} strokeWidth={2} />
    <path d="M-22 -494 L-24 -470 L24 -470 L22 -494 Z" fill="#05060A" />
    {/* shoulders and coat */}
    <path
      d="M-84 -470 C-102 -400 -108 -300 -104 -196 C-102 -156 -96 -126 -84 -104 L-30 -104 L-22 -196 L22 -196 L30 -104 L84 -104 C96 -126 102 -156 104 -196 C108 -300 102 -400 84 -470 C50 -492 -50 -492 -84 -470 Z"
      fill="#05060A"
      stroke="#FF2A5F"
      strokeOpacity={0.22}
      strokeWidth={2}
    />
    {/* arms */}
    <path d={ribbon([{ x: -78, y: -450 }, { x: -96, y: -300 }, { x: -100, y: -160 }], [30, 24, 18])} fill="#05060A" />
    <path d={ribbon([{ x: 78, y: -450 }, { x: 96, y: -300 }, { x: 100, y: -160 }], [30, 24, 18])} fill="#05060A" />
    {/* legs */}
    <path d={ribbon([{ x: -44, y: -120 }, { x: -50, y: -52 }, { x: -48, y: 0 }], [40, 32, 26])} fill="#05060A" />
    <path d={ribbon([{ x: 44, y: -120 }, { x: 50, y: -52 }, { x: 48, y: 0 }], [40, 32, 26])} fill="#05060A" />
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
          <stop offset="0%" stopColor="#6A7284" />
          <stop offset="38%" stopColor="#3C4352" />
          <stop offset="100%" stopColor="#1B2029" />
        </linearGradient>
        <radialGradient id="gate-crimson" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FF2A5F" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#FF2A5F" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1080" height="1920" fill="url(#gate-sky)" />
      {/* school block far behind */}
      <path d="M0 860 C220 848 400 852 540 858 C700 852 880 848 1080 860 L1080 930 L0 930 Z" fill="#0C0A12" />

      {/* three waiting silhouettes */}
      <GateFigure x={280} y={1600} scale={0.98} bob={Math.sin(frame / 24) * 3} rim="#FF2A5F" />
      <GateFigure x={540} y={1600} scale={1.06} bob={Math.sin(frame / 24 + 1.2) * 3} rim="#FF2A5F" />
      <GateFigure x={800} y={1600} scale={0.94} bob={Math.sin(frame / 24 + 2.1) * 3} rim="#FF2A5F" />

      {/* iron gate */}
      <g>
        {bars.map((x, i) => (
          <g key={x}>
            <line x1={x} y1={800} x2={x} y2={1580} stroke="url(#gate-iron)" strokeWidth={9} />
            <line x1={x - 2.4} y1={806} x2={x - 2.4} y2={1574} stroke="#8A93A6" strokeWidth={1.6} opacity={0.55} />
            <path d={`M${x - 12} 806 L${x} 772 L${x + 12} 806 Z`} fill="#4A5264" stroke="#141821" strokeWidth={2} />
            {i % 5 === 2 ? <circle cx={x} cy={900} r={8} fill="none" stroke="#5C6577" strokeWidth={2.6} /> : null}
          </g>
        ))}
        <line x1={0} y1={1040} x2={1080} y2={1040} stroke="#2A303C" strokeWidth={16} />
        <line x1={0} y1={1034} x2={1080} y2={1034} stroke="#5A6374" strokeWidth={2} opacity={0.6} />
        <line x1={0} y1={1580} x2={1080} y2={1580} stroke="#161B23" strokeWidth={22} />
        <line x1={536} y1={800} x2={536} y2={1580} stroke="#596174" strokeWidth={15} />
      </g>

      {/* crimson bleeding from the edges */}
      <ellipse cx={0} cy={980} rx={300} ry={880} fill="url(#gate-crimson)" />
      <ellipse cx={1080} cy={1100} rx={300} ry={820} fill="url(#gate-crimson)" />
    </svg>
  );
};

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pan = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 46, mass: 1 } });
  const crane = interpolate(pan, [0, 1], [0, 1920]);

  const caption = interpolate(frame, [170, 192], [0, 1], {
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
              top: 186,
              left: 58,
              right: 58,
              opacity: caption,
              transform: `translateY(${(1 - caption) * 24}px)`,
            }}
          >
            <div style={{ fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 8, color: alpha(COLORS.crimson, 0.85) }}>
              THE GATE
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 900,
                fontSize: 154,
                lineHeight: 1,
                color: COLORS.ink,
                textShadow: `0 0 18px rgba(255,255,255,0.35), 0 0 54px ${alpha(COLORS.crimson, 0.75)}`,
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
              top: 270,
              left: 0,
              width: 1080,
              height: 1350,
            }}
          >
            <ExplorerAvatar cameraAngle="hands_closeup" outfit="school_uniform" rim={COLORS.amber} />
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};
