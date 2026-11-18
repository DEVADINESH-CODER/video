import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../theme";
import { alpha, Kicker, Stage } from "../components/Stage";
import { ExplorerAvatar } from "../components/ExplorerAvatar";
import { Ammu } from "../components/Ammu";

const RING_SIZE = 760;
const CENTER = RING_SIZE / 2;
const RING_RADIUS = 326;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const TICKS = Array.from({ length: 72 }, (_, i) => i);

const BARS = 64;

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drain = interpolate(frame, [0, 450], [0.94, 0.88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tick = spring({
    frame: frame - 396,
    fps,
    config: { damping: 12, stiffness: 160, mass: 0.7 },
  });
  const daysLeft = frame >= 396 ? 364 : 365;

  const dust = Array.from({ length: 26 }, (_, i) => {
    const speed = 0.5 + (i % 5) * 0.14;
    const y = 1860 - ((frame * speed + i * 83) % 1600);
    const x = 80 + ((i * 137) % 920) + Math.sin(frame * 0.02 + i) * 22;
    return { i, x, y, size: 2 + (i % 3) * 1.6 };
  });

  return (
    <Stage accent={COLORS.amber} intensity={1.1} grid={false}>
      <AbsoluteFill>
        <Kicker color={COLORS.amber} style={{ position: "absolute", top: 148, left: 58 }}>
          The reason
        </Kicker>

        {/* warm chamber light */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(58% 42% at 50% 34%, ${alpha(COLORS.amber, 0.22)} 0%, transparent 70%)`,
          }}
        />

        {/* countdown ring */}
        <div
          style={{
            position: "absolute",
            top: 244,
            left: "50%",
            width: RING_SIZE,
            height: RING_SIZE,
            transform: "translateX(-50%)",
          }}
        >
          <svg
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            width="100%"
            height="100%"
          >
            <defs>
              <filter id="ring-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* tick ring */}
            {TICKS.map((index) => {
              const angle = (index / TICKS.length) * Math.PI * 2 - Math.PI / 2;
              const major = index % 6 === 0;
              const inner = RING_RADIUS + (major ? 22 : 26);
              const outer = RING_RADIUS + 38;
              const passed = index / TICKS.length <= drain;
              return (
                <line
                  key={index}
                  x1={CENTER + Math.cos(angle) * inner}
                  y1={CENTER + Math.sin(angle) * inner}
                  x2={CENTER + Math.cos(angle) * outer}
                  y2={CENTER + Math.sin(angle) * outer}
                  stroke={alpha(COLORS.amber, passed ? (major ? 0.75 : 0.4) : 0.16)}
                  strokeWidth={major ? 2.4 : 1.4}
                />
              );
            })}

            {/* faint full ring */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={alpha(COLORS.amber, 0.14)}
              strokeWidth="9"
            />
            {/* remaining-time arc */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={COLORS.amber}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - drain)}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              filter="url(#ring-glow)"
            />
            {/* inner hairlines */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS - 34}
              fill="none"
              stroke={alpha(COLORS.amber, 0.22)}
              strokeWidth="1.4"
              strokeDasharray="2 10"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS - 58}
              fill="none"
              stroke={alpha(COLORS.amber, 0.08)}
              strokeWidth="42"
            />
          </svg>

          {/* countdown readout */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${1 + Math.sin(tick * Math.PI) * 0.03})`,
            }}
          >
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 190,
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: -6,
                color: COLORS.amber,
                textShadow: `0 0 70px ${alpha(COLORS.amber, 0.35)}`,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {daysLeft}
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: FONT_MONO,
                fontSize: 30,
                letterSpacing: 12,
                color: alpha(COLORS.amber, 0.85),
                textTransform: "uppercase",
              }}
            >
              Days left
            </div>
            <div
              style={{
                marginTop: 26,
                width: 120,
                height: 1,
                background: alpha(COLORS.amber, 0.35),
              }}
            />
          </div>
        </div>

        {/* light falling from the ring to the two of them */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 980,
            width: 560,
            height: 720,
            transform: "translateX(-50%)",
            background: `linear-gradient(180deg, ${alpha(COLORS.amber, 0.12)} 0%, ${alpha(COLORS.amber, 0.03)} 55%, transparent 100%)`,
            clipPath: "polygon(34% 0, 66% 0, 100% 100%, 0 100%)",
          }}
        />

        {/* floor glow */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 128,
            width: 860,
            height: 210,
            transform: "translateX(-50%)",
            background: `radial-gradient(50% 50% at 50% 50%, ${alpha(COLORS.amber, 0.24)} 0%, transparent 72%)`,
          }}
        />

        {/* the two of them */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 158,
            width: 300,
            height: 550,
            transform: "translateX(-80%)",
          }}
        >
          <ExplorerAvatar pose="together" expression="hopeful" isSpeaking={false} />
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 158,
            width: 280,
            height: 500,
            transform: "translateX(-14%)",
          }}
        >
          <Ammu />
        </div>

        {/* floor line */}
        <div
          style={{
            position: "absolute",
            left: 96,
            right: 96,
            bottom: 152,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${alpha(COLORS.amber, 0.55)}, transparent)`,
          }}
        />

        {/* rising dust, amber */}
        {dust.map((mote) => (
          <div
            key={mote.i}
            style={{
              position: "absolute",
              left: mote.x,
              top: mote.y,
              width: mote.size,
              height: mote.size,
              borderRadius: mote.size,
              background: COLORS.amber,
              opacity: 0.12 + (mote.i % 4) * 0.05,
              boxShadow: `0 0 10px ${alpha(COLORS.amber, 0.5)}`,
            }}
          />
        ))}

        {/* waveform */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 52,
            height: 96,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 9,
          }}
        >
          {Array.from({ length: BARS }, (_, index) => {
            const envelope = 0.3 + 0.7 * Math.sin((Math.PI * index) / (BARS - 1));
            const wave =
              Math.abs(Math.sin(frame * 0.1 + index * 0.44)) * 46 +
              Math.abs(Math.sin(frame * 0.23 + index * 0.19)) * 26;
            const height = 8 + wave * envelope;
            const centerDistance = Math.abs(index - (BARS - 1) / 2) / (BARS / 2);
            return (
              <div
                key={index}
                style={{
                  width: 5,
                  height,
                  borderRadius: 3,
                  background:
                    index % 7 === 0 ? COLORS.amber : alpha(COLORS.amber, 0.72),
                  opacity: 1 - centerDistance * 0.45,
                  boxShadow: `0 0 12px ${alpha(COLORS.amber, 0.45)}`,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            bottom: 47,
            height: 1,
            background: alpha(COLORS.amber, 0.22),
          }}
        />
      </AbsoluteFill>
    </Stage>
  );
};
