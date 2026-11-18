import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS } from "../../../src/theme";
import { alpha } from "../../../src/components/Stage";
import { ExplorerAvatar } from "../../../src/components/ExplorerAvatar";

/**
 * Scene 6 · 1140 – 1350
 * The glitch dies. He turns out of profile and into a clean cyan rim light,
 * then holds still for the first time in the episode.
 */
export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  const turn = interpolate(frame, [24, 122], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const crimsonOut = interpolate(frame, [0, 78], [0.38, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const profileFade = interpolate(turn, [0.16, 0.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frontFade = interpolate(turn, [0.26, 0.62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rim = interpolate(frame, [70, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glitchLines = interpolate(frame, [0, 42], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#04060A", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 52% at 52% 46%, rgba(12,16,24,0.9) 0%, #04060A 74%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 55% at 50% 52%, ${alpha(COLORS.crimson, crimsonOut)} 0%, transparent 70%)`,
        }}
      />

      {/* dying glitch rows */}
      {Array.from({ length: 11 }, (_, i) => {
        const y = 120 + i * 158;
        const shift = Math.sin(frame * 1.7 + i) * 26;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: shift,
              right: -shift,
              top: y,
              height: 2 + (i % 3),
              background: i % 2 === 0 ? alpha(COLORS.crimson, 0.4) : alpha(COLORS.cyan, 0.3),
              opacity: glitchLines * (0.35 + (i % 4) * 0.12),
            }}
          />
        );
      })}

      {/* cyan glow behind him */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 720,
          width: 700,
          height: 780,
          transform: "translateX(-50%)",
          background: `radial-gradient(50% 50% at 50% 50%, ${alpha(COLORS.cyan, 0.22)} 0%, transparent 70%)`,
          opacity: frontFade,
        }}
      />
      {/* cyan source behind him */}
      <div
        style={{
          position: "absolute",
          top: 430,
          right: 60,
          width: 260,
          height: 1080,
          background: `linear-gradient(180deg, transparent 0%, ${alpha(COLORS.cyan, 0.32)} 40%, ${alpha(COLORS.cyan, 0.08)} 100%)`,
          filter: "none",
          opacity: rim,
          transform: "skewX(-6deg)",
        }}
      />

      {/* profile, dissolving */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 110,
          width: 900,
          height: 950,
          transform: `translateX(-50%) scaleX(${1 - turn * 0.16})`,
          opacity: profileFade,
        }}
      >
        <ExplorerAvatar cameraAngle="chest_up_3_4" outfit="school_uniform" expression="determined" rim={COLORS.crimson} />
      </div>

      {/* forward, arriving */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 100,
          width: 920,
          height: 971,
          transform: `translateX(-50%) translateY(${(1 - turn) * 22}px) scale(${0.97 + turn * 0.03})`,
          opacity: frontFade,
        }}
      >
        <ExplorerAvatar cameraAngle="front_centered" outfit="school_uniform" expression="determined" rim={COLORS.cyan} />
      </div>

      {/* turn streaks */}
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 780,
          width: 820,
          height: 4,
          background: `linear-gradient(90deg, transparent 0%, ${alpha(COLORS.cyan, 0.5)} 50%, transparent 100%)`,
          opacity: Math.sin(turn * Math.PI) * 0.6,
        }}
      />

      {/* cyan rim wash */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(100deg, transparent 42%, ${alpha(COLORS.cyan, 0.16)} 78%, ${alpha(COLORS.cyan, 0.3)} 100%)`,
          opacity: rim,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(80% 70% at 50% 50%, transparent 46%, rgba(2,3,7,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
