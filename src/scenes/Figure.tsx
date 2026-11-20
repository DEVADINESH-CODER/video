import { interpolate, useCurrentFrame } from "remotion";
import type { SketchStroke } from "../components/SketchGroup";
import { StrokeList } from "../components/SketchGroup";
import { useInk } from "../components/SketchCanvas";
import { CHARCOAL, PAPER } from "../sketch";

type FigureProps = {
  strokes: readonly SketchStroke[];
  /** Local x size of the drawing. */
  baseWidth: number;
  /** Local y size of the drawing. */
  baseHeight: number;
  /** Centre x on the 1080 canvas. */
  cx: number;
  /** Top y on the 1920 canvas. */
  top: number;
  /** Drawn height on the canvas. */
  height: number;
  mask?: string;
  maskStart?: number;
  base?: number;
  accent?: string;
  forceColor?: string;
  progress?: number;
};

/**
 * Places one drawing on the page. A tight paper/charcoal silhouette can be
 * painted immediately before the ink; on paper it is only used where the local
 * sheet is close to flat, otherwise the doorway light is allowed to pass over
 * the figure as a deliberate backlight.
 */
export const Figure: React.FC<FigureProps> = ({
  strokes,
  baseWidth,
  baseHeight,
  cx,
  top,
  height,
  mask,
  maskStart = 0,
  base = 0,
  accent,
  forceColor,
  progress,
}) => {
  const frame = useCurrentFrame();
  const { tone } = useInk();
  const scale = height / baseHeight;
  const left = cx - (baseWidth * scale) / 2;
  const maskOpacity = interpolate(frame, [maskStart, maskStart + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fill = tone === "paper" ? PAPER : CHARCOAL;

  return (
    <g transform={`translate(${left} ${top}) scale(${scale})`}>
      {mask ? <polygon points={mask} fill={fill} opacity={maskOpacity} /> : null}
      <StrokeList
        strokes={strokes}
        base={base}
        accent={accent}
        forceColor={forceColor}
        progress={progress}
      />
    </g>
  );
};
