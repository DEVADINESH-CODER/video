import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../theme";
import { alpha, Kicker, Stage } from "../components/Stage";
import { ExplorerAvatar } from "../components/ExplorerAvatar";

const TAKEOVER = 206;
const SWITCH = 228;

const BADGES = [
  { label: "JEE 89%", top: 286, offset: 0, rotate: -2.2 },
  { label: "SIH FINALIST", top: 410, offset: 66, rotate: 1.6 },
  { label: "DEV @ 20", top: 534, offset: -44, rotate: -1.2 },
];

const CELL_HEIGHT = 268;
const DIGIT_STRIP = Array.from({ length: 40 }, (_, i) => i % 10);

const OdometerDigit: React.FC<{ value: number; tint: string }> = ({
  value,
  tint,
}) => {
  const offset = (value % 10) * CELL_HEIGHT;
  return (
    <div
      style={{
        position: "relative",
        width: 188,
        height: CELL_HEIGHT,
        overflow: "hidden",
        border: `2px solid ${alpha(tint, 0.55)}`,
        borderRadius: 12,
        background: "linear-gradient(180deg, #15070C 0%, #090407 55%, #15070C 100%)",
        boxShadow: `0 0 40px ${alpha(tint, 0.22)}, inset 0 0 30px ${alpha(tint, 0.12)}`,
      }}
    >
      <div
        style={{
          transform: `translateY(${-offset}px)`,
        }}
      >
        {DIGIT_STRIP.map((digit, index) => (
          <div
            key={index}
            style={{
              height: CELL_HEIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 214,
              lineHeight: `${CELL_HEIGHT}px`,
              color: COLORS.crimson,
              textShadow: `0 0 34px ${alpha(COLORS.crimson, 0.55)}`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {digit}
          </div>
        ))}
      </div>
      {/* drum seam */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 1,
          background: alpha(tint, 0.35),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </div>
  );
};

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shake = interpolate(frame, [TAKEOVER, TAKEOVER + 54], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const shakeX =
    Math.sin(frame * 2.1) * shake + Math.sin(frame * 6.3) * shake * 0.28;
  const shakeY = Math.cos(frame * 2.7) * shake * 0.5;

  const flash = interpolate(
    frame,
    [TAKEOVER, TAKEOVER + 6, TAKEOVER + 40],
    [0, 0.9, 0.14],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const badgeFade = interpolate(frame, [TAKEOVER, TAKEOVER + 26], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const switchFlash = interpolate(frame, [SWITCH, SWITCH + 4, SWITCH + 14], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const counterValue = interpolate(frame, [252, 386], [1, 70], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const active = frame >= SWITCH;

  return (
    <Stage
      accent={frame < TAKEOVER ? COLORS.green : COLORS.crimson}
      intensity={frame < TAKEOVER ? 0.85 : 1.15}
    >
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        <Kicker
          color={active ? COLORS.crimson : COLORS.green}
          style={{ position: "absolute", top: 148, left: 58 }}
        >
          The scoreboard
        </Kicker>

        {/* the wins, for a moment */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            opacity: badgeFade,
          }}
        >
          {BADGES.map((badge, index) => {
            const pop = spring({
              frame: frame - (20 + index * 26),
              fps,
              config: { damping: 10, stiffness: 190, mass: 0.6 },
            });
            const jitter = frame > TAKEOVER ? Math.sin(frame * 3.7 + index) * 6 : 0;
            return (
              <div
                key={badge.label}
                style={{
                  position: "absolute",
                  top: badge.top,
                  left: "50%",
                  width: "fit-content",
                  transform: `translateX(calc(-50% + ${badge.offset + jitter}px)) scale(${interpolate(pop, [0, 1], [0.7, 1])}) rotate(${badge.rotate}deg)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "20px 38px",
                  border: `2px solid ${alpha(COLORS.green, 0.7)}`,
                  borderRadius: 14,
                  background: alpha(COLORS.green, 0.08),
                  boxShadow: `0 0 44px ${alpha(COLORS.green, 0.2)}, inset 0 0 24px ${alpha(COLORS.green, 0.07)}`,
                  opacity: interpolate(pop, [0, 0.2], [0, 1], {
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <circle
                    cx="15"
                    cy="15"
                    r="13"
                    fill="none"
                    stroke={COLORS.green}
                    strokeWidth="2"
                  />
                  <path
                    d="M9 15.5 L13 19.5 L21 10.5"
                    fill="none"
                    stroke={COLORS.green}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 56,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: COLORS.ink,
                    whiteSpace: "nowrap",
                  }}
                >
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* mechanical counter */}
        <div
          style={{
            position: "absolute",
            top: 700,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: interpolate(frame, [SWITCH - 6, SWITCH + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 24,
              letterSpacing: 8,
              color: alpha(COLORS.crimson, 0.8),
              marginBottom: 18,
            }}
          >
            ATTEMPTS LOG
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <OdometerDigit value={counterValue / 10} tint={COLORS.crimson} />
            <OdometerDigit value={counterValue} tint={COLORS.crimson} />
          </div>
          <div
            style={{
              marginTop: 22,
              fontFamily: FONT_MONO,
              fontSize: 38,
              letterSpacing: 7,
              color: COLORS.crimson,
              textTransform: "uppercase",
              textAlign: "center",
              textShadow: `0 0 30px ${alpha(COLORS.crimson, 0.45)}`,
            }}
          >
            Govt exams failed
          </div>
          <div
            style={{
              marginTop: 10,
              width: 520,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${alpha(COLORS.crimson, 0.7)}, transparent)`,
            }}
          />
        </div>

        {/* the character, waist-up under the red light */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 1096,
            width: 778,
            height: 824,
            transform: `translateX(-50%) scale(${1 + switchFlash * 0.012})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 40,
              width: 620,
              height: 520,
              transform: "translateX(-50%)",
              background: `radial-gradient(50% 50% at 50% 50%, ${alpha(active ? COLORS.crimson : COLORS.green, 0.16)} 0%, transparent 70%)`,
            }}
          />
          <ExplorerAvatar
            pose={active ? "stressed_desk" : "standing"}
            expression={active ? "hurt" : "determined"}
            isSpeaking={false}
          />
        </div>

        {/* crimson takeover */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(70% 55% at 50% 45%, transparent 20%, ${alpha(COLORS.crimson, 0.55)} 100%)`,
            opacity: frame > TAKEOVER ? 0.75 : 0,
            mixBlendMode: "screen",
          }}
        />
        <AbsoluteFill
          style={{
            background: COLORS.crimson,
            opacity: flash,
            mixBlendMode: "screen",
          }}
        />
        <AbsoluteFill
          style={{
            background: COLORS.crimson,
            opacity: switchFlash * 0.5,
            mixBlendMode: "screen",
          }}
        />
      </AbsoluteFill>
    </Stage>
  );
};
