import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../theme";
import { alpha } from "../components/Stage";
import { ExplorerAvatar } from "../components/ExplorerAvatar";

/**
 * Scene 7 · 1350 – 1740
 * The receipts, in cyan: three cards snap in, collapse into one line, and the
 * episode fades on him facing us with the waveform still moving.
 */

const CARDS = [
  { value: "71", label: "GOVT EXAMS", at: 18 },
  { value: "4", label: "CLIENT PROJECTS", at: 50 },
  { value: "1", label: "REGISTERED COMPANY", at: 82 },
];

const Waveform: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => {
  const bars = 52;
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        bottom: 118,
        height: 120,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 7,
        opacity,
      }}
    >
      {Array.from({ length: bars }, (_, i) => {
        const center = Math.abs(i - bars / 2) / (bars / 2);
        const envelope = 0.4 + 0.6 * (1 - center * center);
        const wave =
          Math.abs(Math.sin(i * 0.47 + frame * 0.19)) * 0.6 +
          Math.abs(Math.sin(i * 0.11 - frame * 0.07)) * 0.4;
        const height = 8 + wave * envelope * 92;
        return (
          <div
            key={i}
            style={{
              width: 8,
              height,
              borderRadius: 4,
              background: `linear-gradient(180deg, ${COLORS.cyan} 0%, ${alpha(COLORS.cyan, 0.25)} 100%)`,
              boxShadow: `0 0 10px ${alpha(COLORS.cyan, 0.5)}`,
            }}
          />
        );
      })}
    </div>
  );
};

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const collapse = spring({ frame: frame - 222, fps, config: { damping: 18, stiffness: 72, mass: 0.9 } });
  const lineWidth = interpolate(collapse, [0, 1], [0, 920]);
  const fade = interpolate(frame, [360, 390], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const waveOpacity = interpolate(frame, [96, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#04060A", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(74% 52% at 50% 58%, ${alpha(COLORS.cyan, 0.14)} 0%, rgba(6,10,16,0.9) 62%, #04060A 100%)`,
        }}
      />

      {/* the line the cards become */}
      <div
        style={{
          position: "absolute",
          top: 712,
          left: "50%",
          width: lineWidth,
          height: 6,
          transform: "translateX(-50%)",
          borderRadius: 6,
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.cyan} 18%, #EAFDFF 50%, ${COLORS.cyan} 82%, transparent 100%)`,
          boxShadow: `0 0 ${30 + collapse * 50}px ${alpha(COLORS.cyan, 0.8)}`,
          opacity: collapse > 0 ? 1 : 0,
        }}
      />

      {/* HUD cards */}
      {CARDS.map((card, i) => {
        const snap = spring({ frame: frame - card.at, fps, config: { damping: 16, stiffness: 180, mass: 0.7 } });
        const top = 356 + i * 150;
        const collapseY = 712 - (top + 60);
        return (
          <div
            key={card.label}
            style={{
              position: "absolute",
              left: "50%",
              top,
              width: 760,
              height: 120,
              transform: `translateX(-50%) translateY(${(1 - snap) * 46 + collapse * collapseY}px) scaleX(${(0.94 + snap * 0.06) * (1 - collapse)}) scaleY(${1 - collapse * 0.96})`,
              opacity: snap * (1 - collapse),
              border: `2px solid ${alpha(COLORS.cyan, 0.75)}`,
              background: `linear-gradient(90deg, ${alpha(COLORS.cyan, 0.14)} 0%, ${alpha(COLORS.cyan, 0.03)} 62%, ${alpha(COLORS.cyan, 0.12)} 100%)`,
              boxShadow: `0 0 34px ${alpha(COLORS.cyan, 0.22)}, inset 0 0 26px ${alpha(COLORS.cyan, 0.08)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 34px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 900,
                  fontSize: 66,
                  lineHeight: 1,
                  color: COLORS.cyan,
                  textShadow: `0 0 26px ${alpha(COLORS.cyan, 0.65)}`,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {card.value}
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 30,
                  letterSpacing: 5,
                  color: alpha(COLORS.ink, 0.82),
                }}
              >
                {card.label}
              </span>
            </div>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 22,
                letterSpacing: 2,
                color: alpha(COLORS.cyan, 0.55),
              }}
            >
              0{i + 1}
            </span>
            {/* corner ticks */}
            <span style={{ position: "absolute", top: -2, left: -2, width: 22, height: 3, background: COLORS.cyan }} />
            <span style={{ position: "absolute", top: -2, left: -2, width: 3, height: 22, background: COLORS.cyan }} />
            <span style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 3, background: COLORS.cyan }} />
            <span style={{ position: "absolute", bottom: -2, right: -2, width: 3, height: 22, background: COLORS.cyan }} />
          </div>
        );
      })}

      {/* him, facing us */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 150,
          width: 840,
          height: 887,
          transform: "translateX(-50%)",
        }}
      >
        <ExplorerAvatar cameraAngle="front_centered" outfit="tech_hoodie" expression="determined" rim={COLORS.cyan} />
      </div>

      <Waveform frame={frame} opacity={waveOpacity * (1 - fade * 0.5)} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 62,
          textAlign: "center",
          fontFamily: FONT_MONO,
          fontSize: 22,
          letterSpacing: 8,
          color: alpha(COLORS.ink, 0.34),
          opacity: waveOpacity,
        }}
      >
        STILL HERE
      </div>

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
