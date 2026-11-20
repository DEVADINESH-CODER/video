import { createContext, useContext, useId } from "react";
import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { CHALK, CHARCOAL, CHARCOAL_LIGHT, INK, PAPER, PAPER_LIGHT, alpha } from "../sketch";

export type SketchTone = "paper" | "charcoal";

type InkContextValue = {
  ink: string;
  paper: string;
  tone: SketchTone;
};

const InkContext = createContext<InkContextValue>({
  ink: INK,
  paper: PAPER,
  tone: "paper",
});

/** The default ink for the current canvas. */
export const useInk = () => useContext(InkContext);

type SketchCanvasProps = {
  tone?: SketchTone;
  children: ReactNode;
  /** Optional wash behind the drawing, e.g. a scene-specific light. */
  wash?: ReactNode;
};

/**
 * A sheet of paper or a slab of charcoal.
 *
 * The drawing itself is one SVG at 1080 × 1920. A very light displacement
 * filter gives the ink a living edge; the paper grain is a separate static
 * layer so it never fights the line work.
 */
export const SketchCanvas: React.FC<SketchCanvasProps> = ({
  tone = "paper",
  children,
  wash,
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const ink = tone === "paper" ? INK : CHALK;
  const sheet = `url(#${id}-sheet)`;

  return (
    <InkContext.Provider value={{ ink, paper: sheet, tone }}>
      <AbsoluteFill style={{ backgroundColor: tone === "paper" ? PAPER : CHARCOAL, overflow: "hidden" }}>
        <AbsoluteFill
          style={{
            background:
              tone === "paper"
                ? `radial-gradient(90% 80% at 50% 38%, ${PAPER_LIGHT} 0%, ${PAPER} 58%, #DED9CF 100%)`
                : `radial-gradient(85% 75% at 50% 42%, ${CHARCOAL_LIGHT} 0%, ${CHARCOAL} 62%, #0B0D10 100%)`,
          }}
        />

        {wash}

        <svg
          viewBox="0 0 1080 1920"
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          fill="none"
        >
          <defs>
            <radialGradient
              id={`${id}-sheet`}
              gradientUnits="userSpaceOnUse"
              cx={540}
              cy={760}
              r={1500}
            >
              {tone === "paper" ? (
                <>
                  <stop offset="0%" stopColor={PAPER_LIGHT} />
                  <stop offset="58%" stopColor={PAPER} />
                  <stop offset="100%" stopColor="#DED9CF" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor={CHARCOAL_LIGHT} />
                  <stop offset="62%" stopColor={CHARCOAL} />
                  <stop offset="100%" stopColor="#0B0D10" />
                </>
              )}
            </radialGradient>
            <filter id={`${id}-ink-edge`} x="-8%" y="-8%" width="116%" height="116%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.014 0.021"
                numOctaves={2}
                seed={13}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={1.5}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={3} seed={9} />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <radialGradient id={`${id}-edge`} cx="0.5" cy="0.5" r="0.72">
              <stop offset="55%" stopColor="#000000" stopOpacity="0" />
              <stop
                offset="100%"
                stopColor="#000000"
                stopOpacity={tone === "paper" ? 0.12 : 0.5}
              />
            </radialGradient>
          </defs>

          <rect width="1080" height="1920" fill={sheet} />
          <g filter={`url(#${id}-ink-edge)`}>{children}</g>

          <rect
            width="1080"
            height="1920"
            filter={`url(#${id}-grain)`}
            opacity={tone === "paper" ? 0.055 : 0.08}
            style={{ mixBlendMode: tone === "paper" ? "multiply" : "screen" }}
            pointerEvents="none"
          />
          <rect width="1080" height="1920" fill={`url(#${id}-edge)`} pointerEvents="none" />
        </svg>

        {/* A faint deckle edge keeps the sheet from reading as a flat div. */}
        <AbsoluteFill
          style={{
            border: `1px solid ${alpha(ink, tone === "paper" ? 0.08 : 0.06)}`,
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    </InkContext.Provider>
  );
};
