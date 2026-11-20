import { Easing, interpolate, useCurrentFrame } from "remotion";
import { evolvePath } from "@remotion/paths";
import { useInk } from "./SketchCanvas";

type EaseName = "linear" | "out" | "inOut";

type InkStrokeProps = {
  /** Valid SVG path geometry. */
  d: string;
  /** Frame (relative to the scene) when this stroke starts drawing. */
  startFrame: number;
  /** How many frames the pen takes to trace the path. */
  durationFrames: number;
  stroke?: string;
  width?: number;
  opacity?: number;
  /** Retracts from the end back to the start instead of drawing. */
  reverse?: boolean;
  /** Parent-driven progress, used when a whole figure erases/redraws at once. */
  progress?: number;
  /** A second, lighter pass offset by a pixel — a sketchbook double-strike. */
  double?: boolean;
  ease?: EaseName;
};

const EASES: Record<EaseName, (n: number) => number> = {
  linear: (n) => n,
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.sin),
};

/**
 * One pen stroke.
 *
 * The dash values come from @remotion/paths' evolvePath(), which measures the
 * real path length, so a long contour and a 2 mm tick both finish exactly on
 * the last frame. Once a stroke is complete we render a plain path: no dash
 * measurement, and no per-frame cost for the hundreds of finished lines.
 */
export const InkStroke: React.FC<InkStrokeProps> = ({
  d,
  startFrame,
  durationFrames,
  stroke,
  width = 4,
  opacity = 1,
  reverse = false,
  progress,
  double = false,
  ease = "inOut",
}) => {
  const frame = useCurrentFrame();
  const { ink } = useInk();

  if (!d) return null;

  const span = Math.max(1, durationFrames);
  const raw =
    progress ??
    interpolate(frame, [startFrame, startFrame + span], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASES[ease],
    });
  const p = Math.max(0, Math.min(1, reverse ? 1 - raw : raw));

  if (p <= 0.002) return null;

  const color = stroke ?? ink;
  const common = {
    d,
    fill: "none",
    stroke: color,
    strokeWidth: width,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    opacity,
  };

  if (p >= 0.998) {
    if (!double) return <path {...common} />;
    return (
      <g>
        <path {...common} />
        <path {...common} transform="translate(1.2 1.5)" opacity={opacity * 0.18} />
      </g>
    );
  }

  const evolution = evolvePath(p, d);

  if (!double) {
    return (
      <path
        {...common}
        strokeDasharray={evolution.strokeDasharray}
        strokeDashoffset={evolution.strokeDashoffset}
      />
    );
  }

  return (
    <g>
      <path
        {...common}
        strokeDasharray={evolution.strokeDasharray}
        strokeDashoffset={evolution.strokeDashoffset}
      />
      <path
        {...common}
        transform="translate(1.2 1.5)"
        opacity={opacity * 0.18}
        strokeDasharray={evolution.strokeDasharray}
        strokeDashoffset={evolution.strokeDashoffset}
      />
    </g>
  );
};
