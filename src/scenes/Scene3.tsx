import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONT_MONO } from "../theme";
import { alpha } from "../components/Stage";
import { ExplorerAvatar } from "../components/ExplorerAvatar";

/**
 * Scene 3 · 330 – 660
 * A train at speed. Diagonal light sweeps past the window while a hard wipe
 * moves him from school uniform to travel backpack, and line-art vignettes
 * sketch the method he actually used.
 */

const Tiffin: React.FC<{ frame: number }> = ({ frame }) => (
  <svg viewBox="0 0 300 320" style={{ width: "100%", height: "100%", overflow: "visible" }}>
    <g fill="none" stroke={COLORS.amber} strokeLinecap="round" strokeLinejoin="round">
      <path d="M62 214 C62 200 74 192 90 192 L210 192 C226 192 238 200 238 214 L238 268 C238 284 226 292 210 292 L90 292 C74 292 62 284 62 268 Z" strokeWidth={3.2} />
      <path d="M66 232 L234 232" strokeWidth={2} opacity={0.5} />
      <path d="M84 192 C84 176 96 166 112 166 L188 166 C204 166 216 176 216 192" strokeWidth={3} />
      <path d="M126 166 C126 152 136 144 150 144 C164 144 174 152 174 166" strokeWidth={3} />
      <path d="M104 150 L104 166 M196 150 L196 166" strokeWidth={2.4} opacity={0.7} />
      <path d="M54 206 C46 206 42 214 42 224 C42 240 50 248 62 250" strokeWidth={2.6} opacity={0.8} />
      <path d="M246 206 C254 206 258 214 258 224 C258 240 250 248 238 250" strokeWidth={2.6} opacity={0.8} />
      <path d="M110 260 C118 254 132 254 140 260" strokeWidth={2} opacity={0.5} />
    </g>
    {/* steam */}
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M${118 + i * 32} 132 C${104 + i * 32} 112 ${132 + i * 32} 96 ${118 + i * 32} 74 C${108 + i * 32} 56 ${126 + i * 32} 44 ${118 + i * 32} 28`}
        fill="none"
        stroke={alpha(COLORS.ink, 0.55)}
        strokeWidth={2.6}
        strokeLinecap="round"
        opacity={0.35 + Math.sin(frame / 9 + i * 1.4) * 0.25}
      />
    ))}
  </svg>
);

const CITIES = [
  { name: "CHENNAI", x: 54, y: 330 },
  { name: "VELLORE", x: 108, y: 276 },
  { name: "BENGALURU", x: 96, y: 210 },
  { name: "PUNE", x: 216, y: 232 },
  { name: "NAGPUR", x: 268, y: 158 },
  { name: "DELHI", x: 296, y: 58 },
];

const RailwayMap: React.FC<{ frame: number }> = ({ frame }) => {
  const route =
    "M54 330 C78 318 92 300 108 276 C116 262 88 238 96 210 C104 184 150 214 180 226 C204 236 204 240 216 232 C238 218 252 190 268 158 C284 126 288 88 296 58";
  const draw = Math.min(1, Math.max(0, (frame - 190) / 60));
  return (
    <svg viewBox="0 0 320 380" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <path d={route} fill="none" stroke={alpha(COLORS.cyan, 0.22)} strokeWidth={2} strokeDasharray="3 9" strokeLinecap="round" />
      <path
        d={route}
        fill="none"
        stroke={COLORS.cyan}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="600"
        strokeDashoffset={600 * (1 - draw)}
        opacity={0.85}
      />
      {CITIES.map((city, i) => (
        <g key={city.name} opacity={draw > i / CITIES.length ? 1 : 0.25}>
          <circle cx={city.x} cy={city.y} r={4.4} fill={COLORS.cyan} />
          <circle cx={city.x} cy={city.y} r={4.4 + (1 + Math.sin(frame / 14 + i)) * 3} fill="none" stroke={COLORS.cyan} strokeWidth={1} opacity={0.35} />
          <text x={city.x + 12} y={city.y + 5} fill={alpha(COLORS.ink, 0.62)} fontSize={13} fontFamily={FONT_MONO} letterSpacing={2}>
            {city.name}
          </text>
        </g>
      ))}
    </svg>
  );
};

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [78, 208], [-28, 118], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wiping = wipe > -20 && wipe < 116;
  const caption = interpolate(frame, [244, 264], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const beams = Array.from({ length: 7 }, (_, i) => {
    const x = ((frame * (10 + (i % 3) * 3) + i * 300) % 1900) - 500;
    return { i, x, amber: i % 3 === 0, width: 130 + (i % 4) * 60 };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#090B11", overflow: "hidden" }}>
      {/* carriage wall */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, #0C1018 0%, #070A10 58%, #05070B 100%)",
        }}
      />
      {/* overhead light rail */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 236,
          height: 6,
          background: `linear-gradient(90deg, transparent 0%, ${alpha(COLORS.ink, 0.35)} 30%, ${alpha(COLORS.ink, 0.5)} 70%, transparent 100%)`,
          boxShadow: `0 0 34px ${alpha(COLORS.cyan, 0.25)}`,
        }}
      />

      {/* window */}
      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 300,
          height: 720,
          borderRadius: 32,
          border: "9px solid #161C26",
          background: "linear-gradient(180deg, #05080D 0%, #0A1420 58%, #05080C 100%)",
          overflow: "hidden",
        }}
      >
        {/* diagonal light beams sweeping past */}
        {beams.map((beam) => (
          <div
            key={beam.i}
            style={{
              position: "absolute",
              top: -240,
              left: beam.x,
              width: beam.width,
              height: 1400,
              transform: "rotate(26deg)",
              background: `linear-gradient(90deg, transparent 0%, ${alpha(beam.amber ? COLORS.amber : COLORS.cyan, 0.16)} 45%, ${alpha(beam.amber ? COLORS.amber : COLORS.cyan, 0.04)} 100%)`,
            }}
          />
        ))}
        {/* distant city lights */}
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: ((i * 97 + frame * (0.6 + (i % 3) * 0.4)) % 1100) - 40,
              top: 380 + ((i * 53) % 260),
              width: 3,
              height: 3,
              borderRadius: 3,
              background: alpha(COLORS.ink, 0.4),
            }}
          />
        ))}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 8, background: "#101620" }} />
        {/* window glass reflection */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(125deg, ${alpha(COLORS.cyan, 0.09)} 0%, transparent 42%, ${alpha(COLORS.amber, 0.08)} 100%)`,
          }}
        />
      </div>

      {/* seat backs */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: -40,
            left: -60 + i * 380,
            width: 360,
            height: 300,
            borderRadius: "60px 60px 0 0",
            background: "linear-gradient(180deg, #141A24 0%, #0A0E15 100%)",
            borderTop: `2px solid ${alpha(COLORS.ink, 0.12)}`,
          }}
        />
      ))}

      {/* avatar: uniform on the left of the wipe, backpack on the right */}
            <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 280,
          width: 660,
          height: 697,
        }}
      >
        <ExplorerAvatar cameraAngle="chest_up_3_4" outfit="school_uniform" expression="determined" rim={COLORS.cyan} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 280,
          width: 660,
          height: 697,
          clipPath: `polygon(${wipe + 20}% 0, 100% 0, 100% 100%, ${wipe - 14}% 100%)`,
        }}
      >
        <ExplorerAvatar cameraAngle="chest_up_3_4" outfit="travel_backpack" expression="determined" rim={COLORS.amber} />
      </div>

      {/* the wipe edge itself */}
      <div
        style={{
          position: "absolute",
          left: `${wipe}%`,
          top: 0,
          bottom: 0,
          width: 64,
          transform: "translateX(-50%) skewX(-9deg)",
          background: `linear-gradient(90deg, transparent 0%, ${alpha(COLORS.cyan, 0.5)} 42%, ${alpha(COLORS.ink, 0.85)} 50%, ${alpha(COLORS.amber, 0.4)} 58%, transparent 100%)`,
          opacity: wiping ? 0.55 : 0,
          pointerEvents: "none",
        }}
      />

      {/* line-art vignettes */}
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 560,
          width: 280,
          height: 300,
          opacity: interpolate(frame, [196, 224], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: "rotate(-4deg)",
        }}
      >
        <Tiffin frame={frame} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 930,
          width: 300,
          height: 390,
          opacity: interpolate(frame, [176, 206], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <RailwayMap frame={frame} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 58,
          bottom: 168,
          opacity: caption,
          transform: `translateY(${(1 - caption) * 18}px)`,
          fontFamily: FONT_MONO,
          fontSize: 34,
          color: alpha(COLORS.ink, 0.58),
        }}
      >
        nobody was teaching this.
      </div>

      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, transparent 56%, rgba(2,3,7,0.82) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
