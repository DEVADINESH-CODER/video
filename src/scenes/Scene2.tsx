import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../theme";
import { alpha, Kicker, Stage } from "../components/Stage";
import { ExplorerAvatar } from "../components/ExplorerAvatar";
import { buildRoute, type Pt } from "../lib/route";

const CITIES: Array<{ name: string; code: string; point: Pt }> = [
  { name: "CHENNAI", code: "01", point: { x: 132, y: 720 } },
  { name: "VELLORE", code: "02", point: { x: 306, y: 646 } },
  { name: "BENGALURU", code: "03", point: { x: 232, y: 496 } },
  { name: "PUNE", code: "04", point: { x: 486, y: 540 } },
  { name: "NAGPUR", code: "05", point: { x: 662, y: 376 } },
  { name: "DELHI", code: "06", point: { x: 812, y: 172 } },
];

const ROUTE = buildRoute(CITIES.map((city) => city.point));

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const travel = interpolate(frame, [24, 336], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const day = Math.min(21, 1 + Math.floor(travel * 20));
  const dot = ROUTE.at(travel);
  const trail = ROUTE.at(Math.max(0, travel - 0.012));
  const trail2 = ROUTE.at(Math.max(0, travel - 0.024));

  const speedLines = Array.from({ length: 12 }, (_, i) => ({
    y: 70 + ((i * 137) % 420),
    offset: (frame * (9 + (i % 4)) + i * 181) % 1400,
    width: 90 + (i % 4) * 60,
    opacity: 0.05 + (i % 3) * 0.03,
  }));

  return (
    <Stage accent={COLORS.cyan} intensity={1}>
      <AbsoluteFill>
        <Kicker style={{ position: "absolute", top: 148, left: 58 }}>
          The escape
        </Kicker>

        {/* day counter */}
        <div
          style={{
            position: "absolute",
            top: 214,
            left: 58,
            right: 58,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 30,
                letterSpacing: 8,
                color: alpha(COLORS.ink, 0.52),
                paddingBottom: 18,
              }}
            >
              DAY
            </span>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 140,
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: -4,
                color: COLORS.ink,
                fontVariantNumeric: "tabular-nums",
                textShadow: `0 0 40px ${alpha(COLORS.cyan, 0.35)}`,
              }}
            >
              {String(day).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 30,
                letterSpacing: 2,
                color: alpha(COLORS.ink, 0.4),
                paddingBottom: 18,
              }}
            >
              / 21
            </span>
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 26,
              letterSpacing: 4,
              color: alpha(COLORS.cyan, 0.9),
              paddingBottom: 20,
              textTransform: "uppercase",
            }}
          >
            {day >= 21 ? "TERMINUS" : "UNRESERVED"}
          </div>
        </div>

        {/* day ticks */}
        <div
          style={{
            position: "absolute",
            top: 372,
            left: 58,
            right: 58,
            display: "flex",
            gap: 6,
          }}
        >
          {Array.from({ length: 21 }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: i + 1 === day ? 14 : 7,
                background:
                  i + 1 <= day ? COLORS.cyan : alpha(COLORS.ink, 0.12),
                boxShadow:
                  i + 1 === day ? `0 0 16px ${COLORS.cyan}` : undefined,
                transition: "none",
              }}
            />
          ))}
        </div>

        {/* railway map */}
        <div
          style={{
            position: "absolute",
            top: 434,
            left: 60,
            width: 960,
            height: 700,
            borderRadius: 30,
            border: `1.5px solid ${alpha(COLORS.cyan, 0.32)}`,
            background:
              "linear-gradient(160deg, rgba(8,16,22,0.92) 0%, rgba(5,10,15,0.96) 100%)",
            boxShadow: `0 40px 90px rgba(0,0,0,0.55), inset 0 0 70px ${alpha(COLORS.cyan, 0.05)}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `radial-gradient(${alpha(COLORS.cyan, 0.3)} 1.4px, transparent 1.4px)`,
              backgroundSize: "34px 34px",
              opacity: 0.35,
            }}
          />

          <svg
            viewBox="0 0 920 790"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
          >
            <defs>
              <filter id="route-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* faint topographic contours */}
            <g
              stroke={alpha(COLORS.cyan, 0.09)}
              fill="none"
              strokeWidth="1.4"
            >
              <path d="M-20 250 C120 180 210 280 330 220 C450 160 520 250 700 190 C800 155 880 180 960 210" />
              <path d="M-20 330 C110 260 230 360 340 300 C470 230 540 330 720 270 C820 235 900 260 960 290" />
              <path d="M-20 560 C140 500 240 600 380 540 C520 480 600 570 760 510 C840 480 900 500 960 520" />
              <path d="M-20 650 C120 590 260 690 400 630 C540 570 640 660 800 600 C870 575 920 590 960 610" />
            </g>

            {/* route */}
            <path
              d={ROUTE.d}
              fill="none"
              stroke={alpha(COLORS.cyan, 0.18)}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d={ROUTE.d}
              fill="none"
              stroke={alpha(COLORS.ink, 0.25)}
              strokeWidth="2.4"
              strokeDasharray="2 14"
              strokeLinecap="round"
            />
            <path
              d={ROUTE.d}
              fill="none"
              stroke={COLORS.cyan}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={ROUTE.length}
              strokeDashoffset={ROUTE.length * (1 - travel)}
              filter="url(#route-glow)"
            />

            {/* cities */}
            {CITIES.map((city) => {
              const fraction = ROUTE.fractionOf(city.point);
              const reached = travel >= fraction - 0.004;
              const arrivalFrame = 24 + fraction * 312;
              const pop = spring({
                frame: frame - arrivalFrame,
                fps,
                config: { damping: 9, stiffness: 220, mass: 0.5 },
              });
              const anchorEnd = city.point.x > 560;
              return (
                <g key={city.name}>
                  <circle
                    cx={city.point.x}
                    cy={city.point.y}
                    r={reached ? 22 : 15}
                    fill={alpha(COLORS.cyan, reached ? 0.14 : 0.04)}
                    stroke={alpha(COLORS.cyan, reached ? 0.7 : 0.25)}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={city.point.x}
                    cy={city.point.y}
                    r={reached ? 6.5 : 4.5}
                    fill={reached ? COLORS.cyan : alpha(COLORS.ink, 0.4)}
                    filter={reached ? "url(#route-glow)" : undefined}
                  />
                  {reached ? (
                    <circle
                      cx={city.point.x}
                      cy={city.point.y}
                      r={22 + pop * 18}
                      fill="none"
                      stroke={alpha(COLORS.cyan, 0.4 * (1 - pop))}
                      strokeWidth="2"
                    />
                  ) : null}
                  <text
                    x={anchorEnd ? city.point.x - 26 : city.point.x + 26}
                    y={city.point.y + 2}
                    textAnchor={anchorEnd ? "end" : "start"}
                    fontFamily={FONT_MONO}
                    fontSize="27"
                    letterSpacing="3"
                    fill={reached ? COLORS.ink : alpha(COLORS.ink, 0.45)}
                  >
                    {city.name}
                  </text>
                  <text
                    x={anchorEnd ? city.point.x - 26 : city.point.x + 26}
                    y={city.point.y + 30}
                    textAnchor={anchorEnd ? "end" : "start"}
                    fontFamily={FONT_MONO}
                    fontSize="20"
                    letterSpacing="3"
                    fill={alpha(COLORS.cyan, reached ? 0.85 : 0.3)}
                  >
                    STN {city.code}
                  </text>
                </g>
              );
            })}

            {/* trailing glow + moving dot */}
            <circle cx={trail2.x} cy={trail2.y} r="12" fill={alpha(COLORS.cyan, 0.12)} />
            <circle cx={trail.x} cy={trail.y} r="15" fill={alpha(COLORS.cyan, 0.28)} />
            <circle
              cx={dot.x}
              cy={dot.y}
              r="26"
              fill={alpha(COLORS.cyan, 0.18)}
              filter="url(#route-glow)"
            />
            <circle cx={dot.x} cy={dot.y} r="9" fill={COLORS.ink} />
            <circle cx={dot.x} cy={dot.y} r="5.5" fill={COLORS.cyan} />

            {/* compass + scale bar */}
            <g opacity="0.65">
              <circle
                cx="840"
                cy="690"
                r="28"
                fill="none"
                stroke={alpha(COLORS.cyan, 0.35)}
                strokeWidth="1.4"
              />
              <path
                d="M840 664 L848 692 L840 685 L832 692 Z"
                fill={alpha(COLORS.cyan, 0.7)}
              />
              <text
                x="840"
                y="738"
                textAnchor="middle"
                fontFamily={FONT_MONO}
                fontSize="18"
                letterSpacing="3"
                fill={alpha(COLORS.ink, 0.5)}
              >
                N
              </text>
              <path
                d="M70 720 L190 720 M70 712 L70 728 M190 712 L190 728"
                stroke={alpha(COLORS.ink, 0.42)}
                strokeWidth="1.6"
              />
              <text
                x="70"
                y="752"
                fontFamily={FONT_MONO}
                fontSize="18"
                letterSpacing="2"
                fill={alpha(COLORS.ink, 0.45)}
              >
                0 — 500 KM
              </text>
            </g>

            {/* map header */}
            <text
              x="34"
              y="52"
              fontFamily={FONT_MONO}
              fontSize="21"
              letterSpacing="5"
              fill={alpha(COLORS.cyan, 0.8)}
            >
              ROUTE LOG · 21 DAYS
            </text>
            <text
              x="886"
              y="52"
              textAnchor="end"
              fontFamily={FONT_MONO}
              fontSize="21"
              letterSpacing="4"
              fill={alpha(COLORS.ink, 0.35)}
            >
              SECTOR 01—06
            </text>
          </svg>
        </div>

        {/* train floor speed lines */}
        <AbsoluteFill style={{ top: 1200, overflow: "hidden" }}>
          {speedLines.map((line, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: line.y,
                left: 1120 - line.offset,
                width: line.width,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${alpha(COLORS.cyan, 0.65)}, transparent)`,
                opacity: line.opacity,
              }}
            />
          ))}
        </AbsoluteFill>

        {/* walking character */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            width: 663,
            height: 700,
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 18,
              width: 640,
              height: 360,
              transform: "translateX(-50%)",
              background: `radial-gradient(50% 50% at 50% 50%, ${alpha(COLORS.cyan, 0.18)} 0%, transparent 70%)`,
            }}
          />
          <ExplorerAvatar
            pose="walking_train"
            expression="determined"
            isSpeaking={false}
          />
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
