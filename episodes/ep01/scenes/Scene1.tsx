import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../../../src/theme";
import { alpha } from "../../../src/components/Stage";
import { ExplorerAvatar } from "../../../src/components/ExplorerAvatar";

/**
 * Scene 1 · 0 – 120
 * A warm doorway opens on pitch black; he walks out of the light, away from us.
 */
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const door = spring({ frame, fps, config: { damping: 30, stiffness: 34, mass: 1 } });
  const walk = interpolate(frame, [0, 120], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const title = spring({ frame: frame - 52, fps, config: { damping: 20, stiffness: 110 } });
  const titleOpacity = interpolate(frame, [52, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bodyIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0D12", overflow: "hidden" }}>
      {/* amber air around the door */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 46% at 50% 62%, ${alpha(COLORS.amber, 0.3 * door)} 0%, ${alpha(COLORS.amber, 0.08 * door)} 46%, transparent 76%)`,
        }}
      />

      {/* doorway */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 150,
          width: 430,
          height: 780,
          transform: `translateX(-50%) scaleY(${0.04 + door * 0.96})`,
          transformOrigin: "50% 100%",
          borderRadius: "215px 215px 0 0",
          border: `5px solid ${alpha(COLORS.amber, 0.55)}`,
          background: `linear-gradient(180deg, ${alpha("#FFF3D0", 0.55)} 0%, ${alpha(COLORS.amber, 0.38)} 42%, ${alpha(COLORS.amber, 0.16)} 100%)`,
          boxShadow: `0 0 140px 30px ${alpha(COLORS.amber, 0.5)}, inset 0 0 90px ${alpha("#FFF1C4", 0.5)}`,
          opacity: 0.2 + door * 0.8,
        }}
      />
      {/* door inner darkness at the threshold */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 150,
          width: 360,
          height: 640,
          transform: "translateX(-50%)",
          borderRadius: "180px 180px 0 0",
          background: `linear-gradient(180deg, ${alpha("#0B0D12", 0.55)} 0%, ${alpha("#0B0D12", 0.08)} 70%, transparent 100%)`,
          opacity: door,
        }}
      />
      {/* light spilling toward camera */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: 1100,
          height: 1000,
          transform: "translateX(-50%)",
          clipPath: "polygon(41% 0, 59% 0, 100% 100%, 0% 100%)",
          background: `linear-gradient(180deg, ${alpha(COLORS.amber, 0.26 * door)} 0%, ${alpha(COLORS.amber, 0.05 * door)} 62%, transparent 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 90,
          width: 760,
          height: 120,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: `radial-gradient(50% 50% at 50% 50%, ${alpha(COLORS.amber, 0.4 * door)} 0%, transparent 72%)`,
        }}
      />

      {/* he walks away from us */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 40,
          width: 650,
          height: 900,
          transform: `translateX(-50%) translateY(${-walk * 26}px) scale(${1.03 - walk * 0.13})`,
          opacity: bodyIn,
        }}
      >
        <ExplorerAvatar cameraAngle="back_walk" outfit="school_uniform" rim={COLORS.amber} />
      </div>

      {/* title */}
      <div
        style={{
          position: "absolute",
          top: 196,
          left: 56,
          right: 56,
          opacity: titleOpacity,
          transform: `translateY(${(1 - title) * 58}px) scale(${0.94 + title * 0.06})`,
          transformOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 30,
            letterSpacing: 10,
            color: alpha(COLORS.amber, 0.78),
            marginBottom: 18,
          }}
        >
          THE FIRST MORNING
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 168,
            lineHeight: 0.92,
            letterSpacing: -2,
            color: COLORS.amber,
            textShadow: `0 0 46px ${alpha(COLORS.amber, 0.45)}`,
          }}
        >
          21 DAYS
        </div>
        <div
          style={{
            marginTop: 26,
            width: 320,
            height: 5,
            background: `linear-gradient(90deg, ${COLORS.amber} 0%, ${alpha(COLORS.amber, 0)} 100%)`,
            boxShadow: `0 0 22px ${alpha(COLORS.amber, 0.6)}`,
          }}
        />
      </div>

      {/* floor darkness swallowing the light */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, transparent 52%, rgba(2,3,7,0.72) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
