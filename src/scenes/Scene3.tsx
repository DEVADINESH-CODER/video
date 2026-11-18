import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../theme";
import { alpha, Kicker, Stage } from "../components/Stage";
import { ExplorerAvatar } from "../components/ExplorerAvatar";

type Token = { text: string; color: string };

const CODE_LINES: Token[][] = [
  [
    { text: "def ", color: COLORS.cyan },
    { text: "build_truth", color: COLORS.ink },
    { text: "(problem):", color: COLORS.muted },
  ],
  [
    { text: "    model", color: COLORS.ink },
    { text: " = ", color: COLORS.muted },
    { text: "connect", color: COLORS.cyan },
    { text: "(problem)", color: COLORS.muted },
  ],
  [
    { text: "    for ", color: COLORS.cyan },
    { text: "edge", color: COLORS.ink },
    { text: " in ", color: COLORS.cyan },
    { text: "model.graph:", color: COLORS.ink },
  ],
  [
    { text: "        prove", color: COLORS.cyan },
    { text: "(edge)  ", color: COLORS.muted },
    { text: "# not memory", color: COLORS.dim },
  ],
  [
    { text: "    return ", color: COLORS.cyan },
    { text: "model.observe", color: COLORS.ink },
    { text: "()", color: COLORS.muted },
  ],
  [],
  [
    { text: "me", color: COLORS.ink },
    { text: " = ", color: COLORS.muted },
    { text: "Explorer", color: COLORS.cyan },
    { text: "(age=", color: COLORS.muted },
    { text: "21", color: COLORS.amber },
    { text: ")", color: COLORS.muted },
  ],
  [
    { text: "me.method", color: COLORS.ink },
    { text: " = ", color: COLORS.muted },
    { text: '"first principles"', color: COLORS.green },
  ],
];

const ROTE_LINES = [
  "Reproduce chapter 4, word for word",
  "Memorise the answer key",
  "Copy the method, never ask why",
  "Score first. Understand later",
];

const TOTAL_CHARS = CODE_LINES.reduce(
  (sum, line) => sum + line.reduce((s, token) => s + token.text.length, 0) + 1,
  0,
);

const lineLength = (line: Token[]) =>
  line.reduce((sum, token) => sum + token.text.length, 0);

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typed = Math.floor(
    interpolate(frame, [46, 306], [0, TOTAL_CHARS], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const prepared: Array<{ parts: Token[]; caret: boolean }> = [];
  let remaining = typed;
  CODE_LINES.forEach((line) => {
    const length = lineLength(line);
    const visible = Math.min(Math.max(remaining, 0), length);
    const caret = remaining >= 0 && remaining < length;
    const parts: Token[] = [];
    let budget = visible;
    line.forEach((token) => {
      if (budget <= 0) return;
      const slice = token.text.slice(0, budget);
      if (slice.length > 0) parts.push({ text: slice, color: token.color });
      budget -= slice.length;
    });
    prepared.push({ parts, caret });
    remaining -= length + 1;
  });

  const reject = spring({
    frame: frame - 74,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.6 },
  });

  const cross = interpolate(frame, [28, 74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cursorOn = Math.sin(frame * 0.5) > -0.2;
  const caretLine = prepared.findIndex((line) => line.caret);

  return (
    <Stage accent={COLORS.cyan} intensity={0.9}>
      <AbsoluteFill>
        <Kicker style={{ position: "absolute", top: 148, left: 58 }}>
          The method
        </Kicker>

        {/* ── static panel ─────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: 224,
            left: 60,
            width: 960,
            height: 372,
            borderRadius: 24,
            border: `1.5px solid ${alpha(COLORS.crimson, 0.4)}`,
            background:
              "linear-gradient(155deg, rgba(26,10,16,0.92), rgba(10,7,10,0.96))",
            boxShadow: `0 30px 70px rgba(0,0,0,0.5), inset 0 0 60px ${alpha(COLORS.crimson, 0.07)}`,
            overflow: "hidden",
            opacity: 0.92,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "20px 28px",
              borderBottom: `1px solid ${alpha(COLORS.crimson, 0.22)}`,
            }}
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 11,
                  background: alpha(COLORS.crimson, 0.45),
                }}
              />
            ))}
            <span
              style={{
                marginLeft: 12,
                fontFamily: FONT_MONO,
                fontSize: 27,
                letterSpacing: 3,
                color: alpha(COLORS.ink, 0.62),
              }}
            >
              ROTE_MEMORY.txt
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: FONT_MONO,
                fontSize: 22,
                letterSpacing: 4,
                color: COLORS.crimson,
                border: `1.5px solid ${alpha(COLORS.crimson, 0.5)}`,
                padding: "3px 10px",
              }}
            >
              STATIC
            </span>
          </div>

          <div style={{ padding: "24px 30px" }}>
            {ROTE_LINES.map((line, index) => {
              const strike = interpolate(
                frame,
                [18 + index * 9, 34 + index * 9],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              return (
                <div
                  key={line}
                  style={{
                    position: "relative",
                    fontFamily: FONT_MONO,
                    fontSize: 31,
                    letterSpacing: 1,
                    color: alpha(COLORS.ink, 0.44),
                    padding: "11px 0 11px 34px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      width: 14,
                      height: 2,
                      background: alpha(COLORS.crimson, 0.7),
                    }}
                  />
                  {line}
                  <span
                    style={{
                      position: "absolute",
                      left: 34,
                      top: "54%",
                      height: 3,
                      width: "78%",
                      background: COLORS.crimson,
                      transform: `scaleX(${strike})`,
                      transformOrigin: "0 50%",
                      boxShadow: `0 0 10px ${alpha(COLORS.crimson, 0.8)}`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* hand-drawn crossed-out X */}
          <svg
            viewBox="0 0 960 372"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <path
              d="M120 92 L836 336"
              stroke={alpha(COLORS.crimson, 0.85)}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="760"
              strokeDashoffset={760 * (1 - cross)}
            />
            <path
              d="M842 88 L134 342"
              stroke={alpha(COLORS.crimson, 0.85)}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="770"
              strokeDashoffset={770 * (1 - Math.max(0, cross - 0.25) / 0.75)}
            />
          </svg>

          <div
            style={{
              position: "absolute",
              right: 34,
              bottom: 22,
              fontFamily: FONT_MONO,
              fontSize: 22,
              letterSpacing: 3,
              color: alpha(COLORS.crimson, 0.7),
              transform: `rotate(-3deg) scale(${interpolate(reject, [0, 1], [1.6, 1])})`,
              opacity: interpolate(reject, [0, 0.4], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            NOT ENOUGH
          </div>
        </div>

        {/* rewrite bridge */}
        <div
          style={{
            position: "absolute",
            top: 612,
            left: 60,
            right: 60,
            height: 52,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{ flex: 1, height: 1, background: alpha(COLORS.cyan, 0.3) }}
          />
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 25,
              letterSpacing: 6,
              color: COLORS.cyan,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ color: alpha(COLORS.ink, 0.45) }}>REWRITE</span>
            <span style={{ fontSize: 32 }}>→</span>
          </div>
          <div
            style={{ flex: 1, height: 1, background: alpha(COLORS.cyan, 0.3) }}
          />
        </div>

        {/* ── live panel ───────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: 676,
            left: 60,
            width: 960,
            height: 424,
            borderRadius: 24,
            border: `1.5px solid ${alpha(COLORS.cyan, 0.55)}`,
            background:
              "linear-gradient(155deg, rgba(5,20,25,0.94), rgba(4,9,13,0.97))",
            boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 60px ${alpha(COLORS.cyan, 0.1)}, inset 0 0 70px ${alpha(COLORS.cyan, 0.05)}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "18px 28px",
              borderBottom: `1px solid ${alpha(COLORS.cyan, 0.22)}`,
            }}
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 11,
                  background: alpha(COLORS.cyan, 0.4),
                }}
              />
            ))}
            <span
              style={{
                marginLeft: 12,
                fontFamily: FONT_MONO,
                fontSize: 27,
                letterSpacing: 3,
                color: COLORS.ink,
              }}
            >
              SYSTEM_LOGIC.py
            </span>
            <span
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontFamily: FONT_MONO,
                fontSize: 22,
                letterSpacing: 4,
                color: COLORS.cyan,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 9,
                  background: COLORS.cyan,
                  opacity: Math.sin(frame * 0.35) > 0 ? 1 : 0.25,
                  boxShadow: `0 0 10px ${COLORS.cyan}`,
                }}
              />
              LIVE
            </span>
          </div>

          <div style={{ padding: "18px 26px" }}>
            {prepared.map((line, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 36,
                  fontFamily: FONT_MONO,
                  fontSize: 26,
                  whiteSpace: "pre",
                }}
              >
                <span
                  style={{
                    width: 44,
                    flexShrink: 0,
                    color: alpha(COLORS.ink, 0.24),
                    fontSize: 20,
                    textAlign: "right",
                    paddingRight: 18,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  {line.parts.map((part, partIndex) => (
                    <span key={partIndex} style={{ color: part.color }}>
                      {part.text}
                    </span>
                  ))}
                  {line.caret && cursorOn ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 24,
                        background: COLORS.cyan,
                        transform: "translateY(4px)",
                        boxShadow: `0 0 10px ${COLORS.cyan}`,
                      }}
                    />
                  ) : null}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              left: 26,
              right: 26,
              bottom: 14,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONT_MONO,
              fontSize: 20,
              letterSpacing: 3,
              color: alpha(COLORS.ink, 0.32),
            }}
          >
            <span>PYTHON · UTF-8</span>
            <span>
              LN {caretLine === -1 ? CODE_LINES.length : caretLine + 1}
            </span>
          </div>
        </div>

        {/* character at the desk */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 1130,
            width: 334,
            height: 612,
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 540,
              height: 380,
              transform: "translateX(-50%)",
              background: `radial-gradient(50% 50% at 50% 45%, ${alpha(COLORS.cyan, 0.16)} 0%, transparent 70%)`,
            }}
          />
          <ExplorerAvatar pose="coding" expression="determined" isSpeaking={false} />
        </div>

        {/* desk */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1532,
            bottom: 0,
            background:
              "linear-gradient(180deg, #11151C 0%, #0A0D12 26%, #05070A 100%)",
            borderTop: `2px solid ${alpha(COLORS.cyan, 0.35)}`,
            boxShadow: `0 -20px 60px ${alpha(COLORS.cyan, 0.1)}`,
          }}
        >
          {/* laptop lid, back to camera */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -150,
              width: 340,
              height: 150,
              transform: "translateX(-50%) perspective(600px) rotateX(6deg)",
              borderRadius: "12px 12px 3px 3px",
              background: "linear-gradient(180deg, #1B2A31, #0D151B)",
              border: `1.5px solid ${alpha(COLORS.cyan, 0.4)}`,
              boxShadow: `0 0 40px ${alpha(COLORS.cyan, 0.16)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                border: `2px solid ${alpha(COLORS.cyan, 0.55)}`,
                boxShadow: `0 0 24px ${alpha(COLORS.cyan, 0.25)}`,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 420,
              height: 16,
              transform: "translateX(-50%)",
              background: "linear-gradient(180deg, #1C232D, #10151C)",
              borderRadius: 4,
              border: `1px solid ${alpha(COLORS.cyan, 0.18)}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 72,
              top: 64,
              fontFamily: FONT_MONO,
              fontSize: 21,
              letterSpacing: 4,
              color: alpha(COLORS.ink, 0.25),
            }}
          >
            WORKBENCH / 02:14 AM
          </div>
          <div
            style={{
              position: "absolute",
              right: 72,
              top: 64,
              fontFamily: FONT_DISPLAY,
              fontSize: 22,
              fontStyle: "italic",
              color: alpha(COLORS.cyan, 0.4),
            }}
          >
            no rote allowed
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
