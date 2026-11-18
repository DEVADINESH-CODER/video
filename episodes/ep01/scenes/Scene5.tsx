import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY } from "../../../src/theme";
import { alpha } from "../../../src/components/Stage";
import { ExplorerAvatar } from "../../../src/components/ExplorerAvatar";

/**
 * Scene 5 · 900 – 1140
 * Two warm silhouettes behind him. The word arrives hard — four frames of RGB
 * split and sliced rows — then holds completely still.
 */

const Parent: React.FC<{ x: number; y: number; scale: number; saree?: boolean; opacity: number }> = ({
  x,
  y,
  scale,
  saree,
  opacity,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    {/* hair, head, neck and shoulders read as a person even in silhouette */}
    <path d="M-46 -94 C-52 -140 -24 -164 0 -164 C24 -164 52 -140 46 -94 C36 -118 20 -128 0 -128 C-20 -128 -36 -118 -46 -94 Z" fill="#A86C10" />
    <ellipse cx={0} cy={-90} rx={41} ry={47} fill={COLORS.amber} />
    <path d="M-14 -52 L-16 -24 L16 -24 L14 -52 Z" fill={COLORS.amber} />
    <path d="M-56 -26 C-76 -8 -86 40 -88 118 L-94 284 L94 284 L88 118 C86 40 76 -8 56 -26 C36 -40 -36 -40 -56 -26 Z" fill={COLORS.amber} />
    <path d="M-58 -22 C-40 -40 -16 -46 0 -46 C16 -46 40 -40 58 -22" fill="none" stroke={alpha("#2A1608", 0.35)} strokeWidth={4} />
    <path d="M-78 30 C-90 92 -88 160 -82 214" stroke={COLORS.amber} strokeWidth={22} strokeLinecap="round" fill="none" />
    <path d="M78 30 C90 92 88 160 82 214" stroke={COLORS.amber} strokeWidth={22} strokeLinecap="round" fill="none" />
    {saree ? (
      <path d="M-64 -18 C-36 20 -4 38 26 30 L86 130 L74 236 L-30 210 Z" fill="#FFD37A" opacity={0.24} />
    ) : null}
    <path d="M-62 -26 C-84 -8 -94 40 -96 118" fill="none" stroke={alpha(COLORS.amber, 0.5)} strokeWidth={3} />
  </g>
);

const Parents: React.FC = () => (
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <defs>
      <radialGradient id="parent-glow" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0%" stopColor={COLORS.amber} stopOpacity="0.2" />
        <stop offset="100%" stopColor={COLORS.amber} stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx={270} cy={1000} rx={340} ry={430} fill="url(#parent-glow)" />
    <ellipse cx={830} cy={1030} rx={320} ry={410} fill="url(#parent-glow)" />
    <Parent x={256} y={1120} scale={1.08} opacity={0.2} />
    <Parent x={824} y={1140} scale={1.14} saree opacity={0.17} />
  </svg>
);

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slam = spring({ frame: frame - 62, fps, config: { damping: 14, stiffness: 210, mass: 0.8 } });
  const scale = interpolate(slam, [0, 1], [2.5, 1]);
  const visible = interpolate(frame, [62, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glitch = frame >= 62 && frame <= 66;
  const rgbX = glitch ? 14 + (frame % 3) * 4 : 0;
  const slices = 8;
  // One 4-frame impact, then completely steady. No continuous sine shake.
  const impact = frame >= 62 && frame <= 66 ? (66 - frame) / 5 : 0;
  const shakeX = impact * (frame % 2 === 0 ? 9 : -9);

  return (
    <AbsoluteFill style={{ backgroundColor: "#07070C", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(90% 70% at 50% 44%, ${alpha(COLORS.crimson, 0.2)} 0%, ${alpha("#07070C", 0.9)} 62%, #05050A 100%)`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${shakeX}px)` }}>
        <Parents />
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 40,
          width: 1080,
          height: 1140,
          transform: `translateX(-50%) translateX(${shakeX}px)`,
        }}
      >
        <ExplorerAvatar cameraAngle="chest_up_3_4" outfit="school_uniform" expression="determined" rim={COLORS.crimson} />
      </div>

      {/* dark pocket keeps the word legible over the silhouettes */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 0,
          right: 0,
          height: 380,
          background: "radial-gradient(58% 50% at 50% 50%, rgba(5,5,10,0.88) 0%, rgba(5,5,10,0.5) 48%, transparent 78%)",
          pointerEvents: "none",
        }}
      />

      {/* the word */}
      <div
        style={{
          position: "absolute",
          top: 430,
          left: 0,
          right: 0,
          height: 240,
          transform: `scale(${scale})`,
          opacity: visible,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {glitch ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {[0, 1].map((copy) => (
              <div
                key={copy}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 900,
                  fontSize: 148,
                  letterSpacing: -2,
                  color: copy === 0 ? COLORS.cyan : COLORS.crimson,
                  transform: `translateX(${copy === 0 ? -rgbX : rgbX}px)`,
                  mixBlendMode: "screen",
                  opacity: 0.85,
                }}
              >
                WORTHLESS
              </div>
            ))}
            {Array.from({ length: slices }, (_, i) => {
              const shift = (i % 2 === 0 ? 1 : -1) * (12 + i * 3) * (frame === 62 ? 1 : frame === 63 ? -1 : frame === 64 ? 0.6 : -0.4);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: `inset(${(i / slices) * 100}% 0 ${100 - ((i + 1) / slices) * 100}% 0)`,
                    transform: `translateX(${shift}px)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 900,
                      fontSize: 148,
                      letterSpacing: -2,
                      color: "#FFFFFF",
                      WebkitTextStroke: `2px ${COLORS.crimson}`,
                    }}
                  >
                    WORTHLESS
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: 148,
              letterSpacing: -2,
              color: "#FFFFFF",
              WebkitTextStroke: `2px ${COLORS.crimson}`,
              textShadow: `0 0 70px ${alpha(COLORS.crimson, 0.55)}`,
            }}
          >
            WORTHLESS
          </div>
        )}
      </div>

      {/* edge crimson */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, ${alpha(COLORS.crimson, 0.2)} 0%, transparent 18%, transparent 82%, ${alpha(COLORS.crimson, 0.2)} 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
