import { InkStroke } from "./InkStroke";

/**
 * A tiny single-stroke alphabet, only for the words that must be drawn by the
 * pen rather than typeset. Coordinates are a 64 × 100 capital.
 */
const GLYPHS: Record<string, readonly string[]> = {
  W: ["M2 2 C8 36 14 70 20 98 C26 74 30 56 34 40 C38 58 42 78 48 98 C54 70 60 36 64 2"],
  O: [
    "M32 2 C46 2 60 22 60 50 C60 80 46 98 32 98 C18 98 4 80 4 50 C4 22 18 2 32 2 Z",
    "M12 34 C18 20 28 10 38 10",
  ],
  R: [
    "M2 100 L2 2 L28 2 C48 2 60 14 60 30 C60 48 48 60 28 60 L2 60",
    "M28 60 L61 100",
  ],
  T: ["M0 2 L64 2", "M32 2 L32 100"],
  H: ["M2 2 L2 100", "M62 2 L62 100", "M2 52 L62 52"],
  L: ["M2 2 L2 100 L60 100", "M2 98 L56 98"],
  E: ["M60 2 L2 2 L2 100 L60 100", "M2 52 L48 52"],
  S: [
    "M58 4 C48 -4 18 -2 10 20 C2 42 24 48 36 56 C50 66 54 88 38 96 C24 104 8 96 4 86",
    "M48 10 C36 4 20 6 14 18",
  ],
};

const TILTS = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.9, -1.5, 1.1, -0.6, 1.4, -1.1];

type InkWordProps = {
  word: string;
  /** Centre x of the whole word. */
  x: number;
  /** Top y of the capitals. */
  y: number;
  height: number;
  startFrame: number;
  durationFrames: number;
  color: string;
  gap?: number;
  reverse?: boolean;
  progress?: number;
};

/** Draws a word one letter at a time, in the same ink as the illustration. */
export const InkWord: React.FC<InkWordProps> = ({
  word,
  x,
  y,
  height,
  startFrame,
  durationFrames,
  color,
  gap = 10,
  reverse,
  progress,
}) => {
  const scale = height / 100;
  const step = 64 * scale + gap;
  const total = word.length * step - gap;
  const left = x - total / 2;
  const nudge = Math.max(0.55, durationFrames * 0.055);

  return (
    <>
      {word.split("").map((letter, i) => {
        const paths = GLYPHS[letter] ?? [];
        return (
          <g
            key={`${letter}-${i}`}
            transform={`translate(${left + i * step} ${y}) scale(${scale}) rotate(${
              TILTS[i % TILTS.length]
            } 32 50)`}
          >
            {paths.map((d, j) => (
              <InkStroke
                key={j}
                d={d}
                startFrame={startFrame + i * nudge + j * 2.2}
                durationFrames={durationFrames}
                stroke={color}
                width={9}
                double
                reverse={reverse}
                progress={progress}
              />
            ))}
          </g>
        );
      })}
    </>
  );
};
