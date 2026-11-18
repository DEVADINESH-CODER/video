import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO, SPRING_CAMERA } from "../../../src/theme";
import { alpha } from "../../../src/components/Stage";
import { ExplorerAvatar } from "../../../src/components/ExplorerAvatar";

/**
 * Scene 1 · 0 – 120
 * A warm doorway opens on pitch black; he walks out of the light, away from us.
 */
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const door = spring({ frame, fps, config: SPRING_CAMERA, durationInFrames: 54 });
  const walk = interpolate(frame, [0, 120], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const title = spring({ frame: frame - 52, fps, config: SPRING_CAMERA });
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
          background: `radial-gradient(58% 46% at 50% 62%, ${alpha(COLORS.amber, 0.24 * door)} 0%, ${alpha(COLORS.amber, 0.06 * door)} 46%, transparent 76%)`,
        }}
      />

      {/* doorway */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 150,
          width: 500,
          height: 900,
          transform: `translateX(-50%) scaleY(${0.04 + door * 0.96})`,
          transformOrigin: "50% 100%",
          borderRadius: "215px 215px 0 0",
          border: `5px solid ${alpha(COLORS.amber, 0.55)}`,
          background: `linear-gradient(180deg, ${alpha("#FFF3D0", 0.4)} 0%, ${alpha(COLORS.amber, 0.26)} 42%, ${alpha(COLORS.amber, 0.12)} 100%)`,
          boxShadow: `0 0 120px 22px ${alpha(COLORS.amber, 0.38)}, inset 0 0 80px ${alpha("#FFF1C4", 0.35)}`,
          opacity: 0.2 + door * 0.8,
        }}
      />
      {/* door inner darkness at the threshold */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 150,
          width: 416,
          height: 760,
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
          background: `linear-gradient(180deg, ${alpha(COLORS.amber, 0.19 * door)} 0%, ${alpha(COLORS.amber, 0.04 * door)} 62%, transparent 100%)`,
        }}
      />
      {/* doorframe: lintel and jambs around the opening */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 1032,
          width: 548,
          height: 26,
          transform: "translateX(-50%)",
          background: `linear-gradient(90deg, ${alpha(COLORS.amber, 0.1)} 0%, ${alpha(COLORS.amber, 0.85)} 50%, ${alpha(COLORS.amber, 0.1)} 100%)`,
          boxShadow: `0 0 40px ${alpha(COLORS.amber, 0.55 * door)}`,
          opacity: 0.35 + door * 0.65,
        }}
      />
      {[-1, 1].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            left: `calc(50% + ${side * 252}px)`,
            bottom: 150,
            width: 22,
            height: 902,
            transform: "translateX(-50%)",
            background: `linear-gradient(180deg, ${alpha(COLORS.amber, 0.7)} 0%, ${alpha(COLORS.amber, 0.28)} 62%, ${alpha(COLORS.amber, 0.1)} 100%)`,
            boxShadow: `0 0 26px ${alpha(COLORS.amber, 0.4 * door)}`,
            opacity: 0.3 + door * 0.7,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 90,
          width: 820,
          height: 130,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: `radial-gradient(50% 50% at 50% 50%, ${alpha(COLORS.amber, 0.4 * door)} 0%, transparent 72%)`,
        }}
      />

      {/* he walks out of the doorway, toward the camera */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 16,
          width: 806,
          height: 1119,
          transform: `translateX(-50%) translateY(${walk * 16}px) scale(${0.93 + walk * 0.1})`,
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
