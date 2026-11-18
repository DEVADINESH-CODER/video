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

const SLAM = 26;
const SHATTER = 108;

const BADGES = ["AGE: 21", "TECH TRAINER", "AI STARTUP"];

const StampFace: React.FC = () => {
  return (
    <div
      style={{
        width: 960,
        height: 222,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 132,
          fontWeight: 900,
          letterSpacing: 2,
          lineHeight: 1,
          color: COLORS.crimson,
          border: `6px solid ${COLORS.crimson}`,
          borderRadius: 12,
          padding: "8px 30px 20px",
          background: alpha(COLORS.crimson, 0.08),
          boxShadow: `0 0 60px ${alpha(COLORS.crimson, 0.4)}, inset 0 0 34px ${alpha(COLORS.crimson, 0.16)}`,
          whiteSpace: "nowrap",
        }}
      >
        WORTHLESS
      </div>
    </div>
  );
};

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slamSpring = spring({
    frame: frame - SLAM,
    fps,
    config: { damping: 13, stiffness: 180, mass: 0.8 },
  });
  const stampScale = interpolate(slamSpring, [0, 1], [2.35, 1]);
  const stampOpacity = interpolate(frame, [SLAM, SLAM + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shake = interpolate(frame, [SLAM, SLAM + 34], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const shakeX = Math.sin(frame * 1.9) * shake + Math.sin(frame * 5.1) * shake * 0.3;
  const shakeY = Math.cos(frame * 2.3) * shake * 0.45;

  const shatter = interpolate(frame, [SHATTER, SHATTER + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const glitchOn = frame > SLAM && Math.sin(frame * 0.42) > 0.9;
  const glitchX = Math.sin(frame * 2.7) * 14;

  const slices = Array.from({ length: 8 }, (_, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    return {
      i,
      dx: dir * (110 + i * 26) * shatter,
      dy: (i - 3.5) * 30 * shatter,
      rot: dir * (4 + i * 2.4) * shatter,
      opacity: 1 - shatter * 0.92,
    };
  });

  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2 + 0.4;
    return {
      i,
      x: Math.cos(angle) * (240 + (i % 4) * 90) * shatter,
      y: Math.sin(angle) * (150 + (i % 3) * 80) * shatter,
      size: 4 + (i % 4) * 2,
      color: i % 3 === 0 ? COLORS.crimson : COLORS.cyan,
    };
  });

  return (
    <Stage accent={COLORS.crimson} intensity={1.1} grid={false}>
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        <Kicker color={COLORS.crimson} style={{ position: "absolute", top: 148, left: 58 }}>
          The label
        </Kicker>

        {/* the word */}
        <div
          style={{
            position: "absolute",
            top: 452,
            left: 60,
            width: 960,
            height: 222,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: stampOpacity,
            transform: `scale(${stampScale})`,
          }}
        >
          {/* impact flash + ring */}
          {frame >= SLAM && frame < SLAM + 26 ? (
            <>
              <div
                style={{
                  position: "absolute",
                  width: 760,
                  height: 180,
                  borderRadius: "50%",
                  border: `3px solid ${COLORS.crimson}`,
                  transform: `scale(${interpolate(frame, [SLAM, SLAM + 26], [0.4, 2.5], { extrapolateRight: "clamp" })})`,
                  opacity: interpolate(frame, [SLAM, SLAM + 26], [0.8, 0], {
                    extrapolateRight: "clamp",
                  }),
                  boxShadow: `0 0 60px ${alpha(COLORS.crimson, 0.7)}`,
                }}
              />
              <AbsoluteFill
                style={{
                  background: alpha(COLORS.crimson, 0.32),
                  opacity: interpolate(frame, [SLAM, SLAM + 12], [0.85, 0], {
                    extrapolateRight: "clamp",
                  }),
                  mixBlendMode: "screen",
                }}
              />
            </>
          ) : null}

          {frame < SHATTER ? (
            <>
              {glitchOn ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      transform: `translate(${glitchX}px, -3px)`,
                      opacity: 0.75,
                      mixBlendMode: "screen",
                      filter: "blur(0.4px)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 132,
                        fontWeight: 900,
                        letterSpacing: 2,
                        color: COLORS.cyan,
                        whiteSpace: "nowrap",
                        lineHeight: 1,
                      }}
                    >
                      WORTHLESS
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      transform: `translate(${-glitchX * 0.6}px, 2px)`,
                      opacity: 0.5,
                      mixBlendMode: "screen",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 132,
                        fontWeight: 900,
                        letterSpacing: 2,
                        color: "#FFFFFF",
                        whiteSpace: "nowrap",
                        lineHeight: 1,
                      }}
                    >
                      WORTHLESS
                    </div>
                  </div>
                </>
              ) : null}
              <StampFace />
            </>
          ) : (
            <div style={{ position: "relative", width: 960, height: 222 }}>
              {slices.map((slice) => (
                <div
                  key={slice.i}
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: `inset(${slice.i * 12.5}% 0 ${100 - (slice.i + 1) * 12.5}% 0)`,
                    transform: `translate(${slice.dx}px, ${slice.dy}px) rotate(${slice.rot}deg)`,
                    opacity: slice.opacity,
                  }}
                >
                  <StampFace />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* crimson shards turning cyan */}
        {frame >= SHATTER
          ? particles.map((particle) => (
              <div
                key={particle.i}
                style={{
                  position: "absolute",
                  left: 540 + particle.x,
                  top: 562 + particle.y,
                  width: particle.size,
                  height: particle.size * 2.2,
                  background: particle.color,
                  opacity: 1 - shatter,
                  transform: `rotate(${particle.i * 37}deg)`,
                  boxShadow: `0 0 14px ${alpha(particle.color, 0.8)}`,
                }}
              />
            ))
          : null}

        {/* the words that replaced the label */}
        <div
          style={{
            position: "absolute",
            top: 776,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
          }}
        >
          {BADGES.map((badge, index) => {
            const start = SHATTER + 10 + index * 8;
            const pop = spring({
              frame: frame - start,
              fps,
              config: { damping: 11, stiffness: 190, mass: 0.55 },
            });
            const drift = Math.sin((frame - start) * 0.05 + index) * 3;
            return (
              <div
                key={badge}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "18px 34px",
                  border: `2px solid ${alpha(COLORS.cyan, 0.75)}`,
                  background: alpha(COLORS.cyan, 0.08),
                  boxShadow: `0 0 34px ${alpha(COLORS.cyan, 0.18)}, inset 0 0 22px ${alpha(COLORS.cyan, 0.08)}`,
                  clipPath:
                    "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)",
                  fontFamily: FONT_MONO,
                  fontSize: 38,
                  letterSpacing: 4,
                  color: COLORS.ink,
                  textTransform: "uppercase",
                  opacity: interpolate(pop, [0, 0.25], [0, 1], {
                    extrapolateRight: "clamp",
                  }),
                  transform: `translate(${index === 1 ? 42 : index === 2 ? -30 : 0}px, ${drift}px) scale(${interpolate(pop, [0, 1], [0.72, 1])}) rotate(${index === 1 ? 1.6 : index === 2 ? -1.4 : 0}deg)`,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    background: COLORS.cyan,
                    boxShadow: `0 0 14px ${COLORS.cyan}`,
                  }}
                />
                {badge}
              </div>
            );
          })}
        </div>

        {/* the character under the label */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 96,
            width: 424,
            height: 778,
            transform: `translateX(-50%) scale(${1 + frame * 0.00008})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 30,
              width: 560,
              height: 380,
              transform: "translateX(-50%)",
              background: `radial-gradient(50% 50% at 50% 50%, ${alpha(COLORS.crimson, 0.22)} 0%, transparent 70%)`,
            }}
          />
          <ExplorerAvatar pose="standing" expression="intense" isSpeaking={false} />
        </div>

        {/* floor */}
        <div
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            bottom: 118,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${alpha(COLORS.crimson, 0.5)}, transparent)`,
          }}
        />
      </AbsoluteFill>
    </Stage>
  );
};
