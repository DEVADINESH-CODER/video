import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../../../src/theme";
import { alpha } from "../../../src/components/Stage";
import { ExplorerAvatar } from "../../../src/components/ExplorerAvatar";

/**
 * Scene 5 · 900 – 1140
 * Two warm silhouettes behind him. The word arrives hard — four frames of RGB
 * split and sliced rows — then holds completely still.
 */

const Parents: React.FC = () => (
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <defs>
      <radialGradient id="parent-glow" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0%" stopColor={COLORS.amber} stopOpacity="0.22" />
        <stop offset="100%" stopColor={COLORS.amber} stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx={300} cy={980} rx={340} ry={430} fill="url(#parent-glow)" />
    <ellipse cx={800} cy={1010} rx={320} ry={410} fill="url(#parent-glow)" />
    {[
      { x: 250, s: 1, o: 0.2 },
      { x: 790, s: 1.06, o: 0.16 },
    ].map((parent, i) => (
      <g key={parent.x} transform={`translate(${parent.x} 1050) scale(${parent.s})`} opacity={parent.o}>
        <ellipse cx={0} cy={-150} rx={64} ry={72} fill={COLORS.amber} />
        <path d="M-104 300 C-110 150 -98 40 -66 -6 C-46 -36 -22 -48 0 -48 C22 -48 46 -36 66 -6 C98 40 110 150 104 300 Z" fill={COLORS.amber} />
        <path d="M-104 300 C-110 150 -98 40 -66 -6" fill="none" stroke={alpha(COLORS.amber, 0.4)} strokeWidth={4} />
        {i === 1 ? <path d="M-70 40 C-20 70 40 70 80 30" fill="none" stroke={alpha("#2A1608", 0.3)} strokeWidth={5} /> : null}
      </g>
    ))}
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

  return (
    <AbsoluteFill style={{ backgroundColor: "#07070C", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(90% 70% at 50% 44%, ${alpha(COLORS.crimson, 0.2)} 0%, ${alpha("#07070C", 0.9)} 62%, #05050A 100%)`,
        }}
      />
      <Parents />

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 130,
          width: 960,
          height: 1013,
          transform: "translateX(-50%)",
        }}
      >
        <ExplorerAvatar cameraAngle="chest_up_3_4" outfit="school_uniform" expression="determined" rim={COLORS.crimson} />
      </div>

      {/* the word */}
      <div
        style={{
          position: "absolute",
          top: 600,
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
                  fontSize: 152,
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
              const shift = Math.sin(frame * 2.4 + i * 1.7) * 40;
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
                      fontSize: 152,
                      letterSpacing: -2,
                      color: COLORS.ink,
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
              fontSize: 152,
              letterSpacing: -2,
              color: COLORS.ink,
              WebkitTextStroke: `2px ${COLORS.crimson}`,
              textShadow: `0 0 70px ${alpha(COLORS.crimson, 0.55)}`,
            }}
          >
            WORTHLESS
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: 536,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_MONO,
          fontSize: 28,
          letterSpacing: 10,
          color: alpha(COLORS.ink, 0.42),
          opacity: visible,
        }}
      >
        THE WORD THAT FOLLOWED HIM
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
