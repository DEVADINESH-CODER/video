import { InkStroke } from "./InkStroke";
import { useInk } from "./SketchCanvas";

export type StrokeTone = "ink" | "soft" | "hatch" | "accent" | "accentSoft";

export type SketchStroke = {
  /** Path geometry in the figure's own coordinate space. */
  d: string;
  /** Frames after the figure's base frame. */
  start: number;
  /** Frames spent tracing this path. */
  dur: number;
  width?: number;
  tone?: StrokeTone;
  opacity?: number;
  double?: boolean;
};

type StrokeListProps = {
  strokes: readonly SketchStroke[];
  /** Closed silhouettes painted under the strokes, e.g. the hands' skin. */
  fills?: readonly string[];
  fillColor?: string;
  base?: number;
  accent?: string;
  /** Force every line to one colour — used by the crimson retraction pass. */
  forceColor?: string;
  /** Coordinated progress for a whole-figure erase or redraw. */
  progress?: number;
  reverse?: boolean;
};

/** Maps a semantic stroke tone onto the canvas's ink and the scene's accent. */
export const StrokeList: React.FC<StrokeListProps> = ({
  strokes,
  fills,
  fillColor,
  base = 0,
  accent = "#D92B4B",
  forceColor,
  progress,
  reverse,
}) => {
  const { ink } = useInk();

  return (
    <>
      {fills && fillColor
        ? fills.map((d, i) => <path key={`fill-${i}`} d={d} fill={fillColor} />)
        : null}
      {strokes.map((s, i) => {
        const tone = s.tone ?? "ink";
        const stroke =
          forceColor ??
          (tone === "accent" || tone === "accentSoft"
            ? accent
            : ink);
        const opacity =
          (s.opacity ?? 1) *
          (tone === "soft" ? 0.45 : tone === "hatch" ? 0.22 : tone === "accentSoft" ? 0.5 : 1);

        return (
          <InkStroke
            key={`${i}-${s.d.slice(0, 12)}`}
            d={s.d}
            startFrame={base + s.start}
            durationFrames={s.dur}
            stroke={stroke}
            width={s.width ?? (tone === "hatch" ? 2.2 : 4)}
            opacity={opacity}
            double={s.double}
            progress={progress}
            reverse={reverse}
          />
        );
      })}
    </>
  );
};

/** Alias used by scene files that render a one-off array of strokes. */
export const SketchGroup = StrokeList;
