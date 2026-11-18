import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_MONO } from "../../../src/theme";
import { alpha } from "../../../src/components/Stage";
import { ExplorerAvatar } from "../../../src/components/ExplorerAvatar";

/**
 * Scene 2 · 120 – 330
 * A school corridor: repeating doors, a cyan floor strip, and a soft female
 * silhouette behind frosted glass. He walks past without stopping.
 */

type WallPoint = { x: number; y: number };

const wallPoint = (t: number, h: number, side: "left" | "right"): WallPoint => {
  const x = side === "left" ? 540 * t : 1080 - 540 * t;
  const yTop = 900 * t;
  const yBottom = 1920 - 1020 * t;
  return { x, y: yTop + (yBottom - yTop) * h };
};

const quad = (points: WallPoint[]) => points.map((p) => `${p.x},${p.y}`).join(" ");

const DOORS: Array<[number, number]> = [
  [0.03, 0.13],
  [0.22, 0.32],
  [0.45, 0.55],
  [0.72, 0.82],
];

const WINDOW_QUAD = quad([
  wallPoint(0.3, 0.1, "right"),
  wallPoint(0.72, 0.1, "right"),
  wallPoint(0.72, 0.7, "right"),
  wallPoint(0.3, 0.7, "right"),
]);

const Corridor: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="corridor-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0A0E15" />
          <stop offset="100%" stopColor="#111722" />
        </linearGradient>
        <linearGradient id="corridor-right" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#0A0E15" />
          <stop offset="100%" stopColor="#121926" />
        </linearGradient>
        <linearGradient id="corridor-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0C1119" />
          <stop offset="100%" stopColor="#05070B" />
        </linearGradient>
        <linearGradient id="frosted-glass" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#BFE9F2" stopOpacity="0.16" />
          <stop offset="60%" stopColor="#8FD8E6" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#0C1119" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* ceiling + walls + floor */}
      <polygon points="0,0 1080,0 540,900" fill="#070A10" />
      <polygon points="0,0 0,1920 540,900" fill="url(#corridor-left)" />
      <polygon points="1080,0 1080,1920 540,900" fill="url(#corridor-right)" />
      <polygon points="0,1920 1080,1920 540,900" fill="url(#corridor-floor)" />

      {/* perspective seams */}
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t) => (
        <line
          key={t}
          x1={540 * t}
          y1={900 * t}
          x2={1080 - 540 * t}
          y2={900 * t}
          stroke="#1B2432"
          strokeWidth={1.4}
          opacity={0.7}
        />
      ))}

      {/* doors on both walls */}
      {DOORS.map(([t1, t2]) =>
        (["left", "right"] as const).map((side) => {
          const door = quad([
            wallPoint(t1, 0.1, side),
            wallPoint(t2, 0.1, side),
            wallPoint(t2, 0.93, side),
            wallPoint(t1, 0.93, side),
          ]);
          const panel = quad([
            wallPoint(t1, 0.14, side),
            wallPoint(t2, 0.14, side),
            wallPoint(t2, 0.58, side),
            wallPoint(t1, 0.58, side),
          ]);
          return (
            <g key={`${side}-${t1}`}>
              <polygon points={door} fill="#0C1118" stroke="#232C3A" strokeWidth={2.4} />
              <polygon points={panel} fill="#10161F" stroke="#2C3646" strokeWidth={1.6} opacity={0.9} />
              <polygon
                points={quad([
                  wallPoint(t1, 0.62, side),
                  wallPoint(t2, 0.62, side),
                  wallPoint(t2, 0.9, side),
                  wallPoint(t1, 0.9, side),
                ])}
                fill="#090D13"
                opacity={0.8}
              />
            </g>
          );
        }),
      )}

      {/* frosted classroom window on the right wall */}
      <defs>
        <clipPath id="mother-window">
          <polygon points={WINDOW_QUAD} />
        </clipPath>
      </defs>
      <polygon points={WINDOW_QUAD} fill="#0B121A" stroke="#2B3A4A" strokeWidth={3} />
      <g clipPath="url(#mother-window)" opacity={0.92}>
        {/* mother: a dark human silhouette rimmed by the doorway light */}
        <ellipse cx={800} cy={1000} rx={110} ry={230} fill="#FFD37A" opacity={0.1} />
        <g>
          {/* hair with a low bun, head, neck */}
          <path d="M748 876 C740 830 766 802 800 802 C834 802 860 830 852 876 C840 852 822 842 800 842 C778 842 760 852 748 876 Z" fill="#080A0F" />
          <circle cx={758} cy={848} r={17} fill="#080A0F" />
          <ellipse cx={800} cy={884} rx={37} ry={43} fill="#080A0F" />
          <path d="M782 918 L780 960 L820 960 L818 918 Z" fill="#080A0F" />
          {/* shoulders narrow to a teacher's frame, arms held in front */}
          <path d="M796 954 C832 960 852 986 860 1024 L874 1210 L726 1210 L740 1024 C748 986 768 960 804 954 Z" fill="#080A0F" />
          <path d="M746 1034 C728 1084 724 1142 736 1184" stroke="#080A0F" strokeWidth={22} strokeLinecap="round" fill="none" />
          <path d="M854 1034 C868 1080 872 1136 862 1180" stroke="#080A0F" strokeWidth={22} strokeLinecap="round" fill="none" />
          {/* amber edge from the window */}
          <path d="M764 842 C750 862 748 894 760 914" stroke={COLORS.amber} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.65} />
          <path d="M742 1034 C730 1080 728 1136 738 1180" stroke={COLORS.amber} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.35} />
          <path d="M800 806 C826 808 846 826 852 850" stroke={COLORS.amber} strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.3} />
        </g>
        {/* a stack of books held at the hip */}
        <g opacity={0.6}>
          <path d="M848 1090 L910 1090 L910 1106 L848 1106 Z" fill="#2A1608" stroke={COLORS.amber} strokeWidth={1.2} />
          <path d="M850 1072 L908 1072 L908 1088 L850 1088 Z" fill="#2A1608" stroke={COLORS.amber} strokeWidth={1.2} />
          <path d="M852 1054 L906 1054 L906 1070 L852 1070 Z" fill="#2A1608" stroke={COLORS.amber} strokeWidth={1.2} />
        </g>
      </g>
      <polygon points={WINDOW_QUAD} fill="url(#frosted-glass)" />
      {/* window mullions */}
      {[0.46, 0.59].map((t) => (
        <line
          key={t}
          x1={wallPoint(t, 0.1, "right").x}
          y1={wallPoint(t, 0.1, "right").y}
          x2={wallPoint(t, 0.7, "right").x}
          y2={wallPoint(t, 0.7, "right").y}
          stroke="#3A4A5C"
          strokeWidth={2}
          opacity={0.8}
        />
      ))}
      <line
        x1={wallPoint(0.3, 0.38, "right").x}
        y1={wallPoint(0.3, 0.38, "right").y}
        x2={wallPoint(0.72, 0.38, "right").x}
        y2={wallPoint(0.72, 0.38, "right").y}
        stroke="#3A4A5C"
        strokeWidth={2}
        opacity={0.8}
      />

      {/* cyan floor strip — the school's only colour */}
      {[
        { t: 0.42, w: 9, o: 0.95 },
        { t: 0.62, w: 4, o: 0.55 },
        { t: 0.78, w: 2.5, o: 0.35 },
      ].map((strip) => {
        const a = wallPoint(strip.t, 1, "left");
        const b = wallPoint(strip.t, 1, "right");
        return (
          <g key={strip.t}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={COLORS.cyan} strokeWidth={strip.w * 3} opacity={strip.o * 0.12} />
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={COLORS.cyan} strokeWidth={strip.w} opacity={strip.o} />
          </g>
        );
      })}
      {/* reflected strip in the polished floor */}
      <polygon
        points="210,1560 870,1560 760,1700 320,1700"
        fill={`url(#corridor-floor)`}
        opacity={0.5}
      />
      <line x1={260} y1={1585} x2={820} y2={1585} stroke={COLORS.cyan} strokeWidth={3} opacity={0.2 + Math.sin(frame / 20) * 0.05} />

      {/* ceiling lamps receding */}
      {[0.18, 0.34, 0.52, 0.72].map((t) => {
        const a = wallPoint(t, 0.06, "left");
        const b = wallPoint(t, 0.06, "right");
        return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#DDF4FF" strokeWidth={2.6} opacity={0.18 + t * 0.2} />;
      })}
    </svg>
  );
};

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const walkX = interpolate(frame, [6, 210], [-280, 820], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const caption = interpolate(frame, [80, 98], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#070A10", overflow: "hidden" }}>
      <Corridor />

      <div
        style={{
          position: "absolute",
          left: walkX,
          bottom: 180,
          width: 670,
          height: 931,
          opacity: interpolate(frame, [6, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <ExplorerAvatar cameraAngle="side_profile" outfit="school_uniform" rim={COLORS.cyan} />
      </div>

      {/* floor shadow follows him */}
      <div
        style={{
          position: "absolute",
          left: walkX + 40,
          bottom: 184,
          width: 520,
          height: 50,
          borderRadius: "50%",
          background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.72) 0%, transparent 74%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 58,
          bottom: 158,
          opacity: caption,
          transform: `translateY(${(1 - caption) * 16}px)`,
          fontFamily: FONT_MONO,
          fontSize: 34,
          letterSpacing: 1,
          color: alpha(COLORS.ink, 0.85),
          textShadow: "0 2px 18px rgba(0,0,0,0.9)",
        }}
      >
        my mother taught here.
      </div>

      {/* warm classroom spill on the floor */}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 300,
          width: 480,
          height: 700,
          background: `radial-gradient(60% 50% at 70% 50%, ${alpha(COLORS.amber, 0.12)} 0%, transparent 72%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
