import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneMarker } from "../episode";
import { FONT_MONO } from "../theme";
import { CHALK, CHARCOAL, INK, PAPER, alpha } from "../sketch";

type EditorialChromeProps = {
  scenes: readonly SceneMarker[];
  durationInFrames: number;
  label?: string;
  tone: "paper" | "charcoal";
};

/**
 * Editorial furniture, not a HUD. A hairline, an episode mark, a timecode and a
 * progress rule. It inverts with the paper/charcoal scenes and never glows.
 */
export const EditorialChrome: React.FC<EditorialChromeProps> = ({
  scenes,
  durationInFrames,
  label = "EP. 01",
  tone,
}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / Math.max(1, durationInFrames - 1));
  const active =
    scenes.find(
      (scene) => frame >= scene.from && frame < scene.from + scene.duration,
    ) ?? scenes[scenes.length - 1];
  const ink = tone === "paper" ? INK : CHALK;
  const sheet = tone === "paper" ? PAPER : CHARCOAL;
  const seconds = Math.floor(frame / 30);
  const stamp = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 190,
          background: `linear-gradient(180deg, ${alpha(sheet, 0.72)} 0%, ${alpha(
            sheet,
            0.24,
          )} 54%, transparent 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 46,
          left: 54,
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: FONT_MONO,
          fontSize: 18,
          letterSpacing: 5,
          color: alpha(ink, 0.55),
        }}
      >
        <span
          style={{
            width: 30,
            height: 1,
            background: active.accent,
            opacity: 0.85,
          }}
        />
        {label}
      </div>

      <div
        style={{
          position: "absolute",
          top: 46,
          right: 54,
          fontFamily: FONT_MONO,
          fontSize: 18,
          letterSpacing: 3,
          color: alpha(ink, 0.38),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {stamp}
      </div>

      <div
        style={{
          position: "absolute",
          top: 78,
          left: 54,
          right: 54,
          height: 1,
          background: alpha(ink, 0.13),
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: alpha(active.accent, 0.78),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
