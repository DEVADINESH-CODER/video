import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneMarker } from "../episode";
import { COLORS, FONT_MONO } from "../theme";

export const alpha = (hex: string, a: number) => {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

type StageProps = {
  accent: string;
  children: ReactNode;
  intensity?: number;
  grid?: boolean;
};

/**
 * One continuous dark world. Each scene only changes the light that sits in
 * it, so cuts feel like camera moves inside the same film, not slides.
 */
export const Stage: React.FC<StageProps> = ({
  accent,
  children,
  intensity = 1,
  grid = true,
}) => {
  const frame = useCurrentFrame();
  const driftX = Math.sin(frame * 0.011) * 60;
  const driftY = Math.cos(frame * 0.008) * 34;
  const scan = (frame * 0.55) % 2100;

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bg, overflow: "hidden", color: COLORS.ink }}
    >
      {/* deep base */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, #080B12 0%, ${COLORS.bgDeep} 55%, #07090F 100%)`,
        }}
      />

      {/* accent bloom, breathing */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(85% 52% at ${50 + driftX * 0.18}% ${22 + driftY * 0.2}%, ${alpha(accent, 0.34)} 0%, ${alpha(accent, 0.09)} 42%, transparent 72%)`,
          opacity: intensity,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 40% at ${40 + driftX * 0.25}% ${92 + driftY * 0.1}%, ${alpha(accent, 0.16)} 0%, transparent 70%)`,
          opacity: intensity * 0.9,
        }}
      />

      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${alpha(accent, 0.1)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(accent, 0.1)} 1px, transparent 1px)`,
            backgroundSize: "90px 90px",
            backgroundPosition: `${driftX}px ${driftY}px`,
            maskImage:
              "radial-gradient(75% 65% at 50% 50%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 62%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(75% 65% at 50% 50%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 62%, transparent 100%)",
            opacity: 0.5,
          }}
        />
      ) : null}

      {/* slow scan sweep */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scan - 260,
            height: 260,
            background: `linear-gradient(180deg, transparent 0%, ${alpha(accent, 0.07)} 75%, ${alpha(accent, 0.16)} 100%)`,
          }}
        />
      </AbsoluteFill>

      {children}
    </AbsoluteFill>
  );
};

type ChromeProps = {
  /** Scene windows of the episode being rendered. */
  scenes: readonly SceneMarker[];
  durationInFrames: number;
  /** Corner mark, e.g. "EP.02". */
  label?: string;
};

/** Episode-level chrome: grain, vignette, progress, episode mark. */
export const Chrome: React.FC<ChromeProps> = ({
  scenes,
  durationInFrames,
  label = "EP.01",
}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / Math.max(1, durationInFrames - 1));
  const active =
    scenes.find(
      (scene) => frame >= scene.from && frame < scene.from + scene.duration,
    ) ?? scenes[scenes.length - 1];
  const accent = active.accent;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* film grain — static and deterministic */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.07,
          mixBlendMode: "overlay",
        }}
      >
        <filter id="episode-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            seed="17"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#episode-grain)" />
      </svg>

      {/* vignette */}
      <AbsoluteFill
        style={{ boxShadow: "inset 0 0 320px 90px rgba(0,0,0,0.78)" }}
      />

      {/* episode mark + timecode */}
      <div
        style={{
          position: "absolute",
          top: 54,
          left: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: FONT_MONO,
          fontSize: 24,
          letterSpacing: 4,
          color: alpha(COLORS.ink, 0.62),
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 9,
            background: accent,
            boxShadow: `0 0 14px ${alpha(accent, 0.9)}`,
          }}
        />
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          top: 54,
          right: 56,
          fontFamily: FONT_MONO,
          fontSize: 24,
          letterSpacing: 3,
          color: alpha(COLORS.ink, 0.42),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(Math.floor(frame / 30)).padStart(2, "0")}s
      </div>

      {/* progress hairline */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: alpha(COLORS.ink, 0.08),
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: accent,
            boxShadow: `0 0 18px ${alpha(accent, 0.8)}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

type KickerProps = {
  children: ReactNode;
  color?: string;
  style?: React.CSSProperties;
};

/** Small world label — the only metadata a scene is allowed. */
export const Kicker: React.FC<KickerProps> = ({
  children,
  color = COLORS.cyan,
  style,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontFamily: FONT_MONO,
        fontSize: 26,
        letterSpacing: 6,
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      <span
        style={{
          width: 34,
          height: 2,
          background: color,
          boxShadow: `0 0 12px ${alpha(color, 0.8)}`,
        }}
      />
      {children}
    </div>
  );
};
