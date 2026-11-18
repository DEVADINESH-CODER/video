import { useId } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SPRING_CAMERA } from "../theme";

/**
 * ExplorerAvatar — the film's one character, drawn as ink and cel shade.
 *
 * Anatomy rules used throughout:
 * - adult proportions (head ≈ 1/7 of standing height), shoulders ≈ 2 head widths
 * - every limb is a tapered ribbon that overlaps its joint; no tubes, no rects
 * - hands have a palm, five attached fingers, nails and knuckle creases
 * - hair is a closed cap with overlapped strands, so no scalp gaps appear
 * - motion comes from a solved stride plus one damped spring per entrance
 */

export type AvatarCameraAngle =
  | "back_walk"
  | "side_profile"
  | "hands_closeup"
  | "chest_up_3_4"
  | "front_centered";

export type AvatarOutfit = "school_uniform" | "travel_backpack" | "tech_hoodie";

export type AvatarExpression = "neutral" | "determined" | "hurt";

export type ExplorerAvatarProps = {
  cameraAngle: AvatarCameraAngle;
  outfit?: AvatarOutfit;
  expression?: AvatarExpression;
  rim?: string;
  style?: React.CSSProperties;
};

const INK = "#080A0F";

type Pt = { x: number; y: number };

const n = (value: number) => Math.round(value * 10) / 10;

/** Tapered ink ribbon through anchor points (Catmull-Rom control points). */
export const ribbon = (points: Pt[], widths: number[]): string => {
  if (points.length < 2) return "";
  const tangents = points.map((_, i) => {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    return { x: next.x - prev.x, y: next.y - prev.y };
  });
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  points.forEach((p, i) => {
    const len = Math.hypot(tangents[i].x, tangents[i].y) || 1;
    const nx = -tangents[i].y / len;
    const ny = tangents[i].x / len;
    const w = widths[i] / 2;
    outer.push({ x: p.x + nx * w, y: p.y + ny * w });
    inner.push({ x: p.x - nx * w, y: p.y - ny * w });
  });

  const curve = (pts: Pt[]) => {
    let d = `M${n(pts[0].x)} ${n(pts[0].y)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      d += ` C${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(p2.x)} ${n(p2.y)}`;
    }
    return d;
  };

  const back = [...inner].reverse();
  return `${curve(outer)} L${n(back[0].x)} ${n(back[0].y)} ${curve(back).slice(1)} Z`;
};

type Palette = {
  coat: string;
  coatLight: string;
  coatDeep: string;
  shirt: string;
  shirtShade: string;
  trim: string;
  pants: string;
  tie: string;
  pack: string;
  packDark: string;
  packTrim: string;
};

const PALETTE: Record<AvatarOutfit, Palette> = {
  school_uniform: {
    coat: "#232B3D",
    coatLight: "#38435A",
    coatDeep: "#101520",
    shirt: "#E9EFF7",
    shirtShade: "#BCC8D7",
    trim: "#00F0FF",
    pants: "#1A2030",
    tie: "#15233A",
    pack: "#3A3324",
    packDark: "#241F15",
    packTrim: "#FFB800",
  },
  travel_backpack: {
    coat: "#26302B",
    coatLight: "#3B473C",
    coatDeep: "#12160F",
    shirt: "#DCE4D7",
    shirtShade: "#AEB8A5",
    trim: "#FFB800",
    pants: "#191E16",
    tie: "#2A3024",
    pack: "#7A5A2E",
    packDark: "#4E3A1D",
    packTrim: "#FFB800",
  },
  tech_hoodie: {
    coat: "#181B23",
    coatLight: "#2B3240",
    coatDeep: "#0A0C12",
    shirt: "#0E141B",
    shirtShade: "#080D12",
    trim: "#00F0FF",
    pants: "#0A0D13",
    tie: "#101720",
    pack: "#1B2230",
    packDark: "#0E131C",
    packTrim: "#00F0FF",
  },
};

const EXPR: Record<
  AvatarExpression,
  { browLift: number; browTilt: number; eyeOpen: number; mouth: number; gaze: number }
> = {
  neutral: { browLift: 0, browTilt: 0, eyeOpen: 1, mouth: 0, gaze: 0 },
  determined: { browLift: -3, browTilt: 4, eyeOpen: 1.22, mouth: -1.5, gaze: 1 },
  hurt: { browLift: -1, browTilt: -5, eyeOpen: 0.76, mouth: 3, gaze: -1 },
};

/** A blink every ~96 frames — slightly slower than real life, reads cleanly. */
const blinkAmount = (frame: number, offset: number) => {
  const t = (frame + offset) % 96;
  if (t < 90) return 0;
  return Math.sin(((t - 90) / 6) * Math.PI) * 0.96;
};

const useMicroMotion = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: SPRING_CAMERA });
  // Round to half pixels: sub-pixel breathing shimmers on the vertical jaw line.
  const breathe = Math.round(Math.sin(frame * 0.08) * 4.4) / 2;
  const headSway = Math.round(Math.sin(frame * 0.045 + 0.7) * 3.2) / 2;
  return { frame, enter, breathe, headSway };
};

const Defs: React.FC<{ id: string; palette: Palette; rim: string }> = ({
  id,
  palette,
  rim,
}) => (
  <defs>
    <linearGradient id={`${id}-skin`} x1="0.16" y1="0" x2="0.86" y2="1">
      <stop offset="0%" stopColor="#EFBE97" />
      <stop offset="34%" stopColor="#DDA077" />
      <stop offset="55%" stopColor="#C88C62" />
      <stop offset="76%" stopColor="#AC7049" />
      <stop offset="100%" stopColor="#925A38" />
      <stop offset="100%" stopColor="#784728" />
    </linearGradient>
    <linearGradient id={`${id}-skinSoft`} x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stopColor="#F6C9A1" />
      <stop offset="58%" stopColor="#D99D73" />
      <stop offset="100%" stopColor="#AA7049" />
    </linearGradient>
    <linearGradient id={`${id}-hair`} x1="0.15" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stopColor="#39435A" />
      <stop offset="26%" stopColor="#1B2230" />
      <stop offset="58%" stopColor="#101521" />
      <stop offset="100%" stopColor="#070910" />
    </linearGradient>
    <linearGradient id={`${id}-coat`} x1="0.1" y1="0" x2="0.95" y2="1">
      <stop offset="0%" stopColor={palette.coatLight} />
      <stop offset="34%" stopColor={palette.coat} />
      <stop offset="76%" stopColor={palette.coat} />
      <stop offset="76.5%" stopColor={palette.coatDeep} />
      <stop offset="100%" stopColor="#06080D" />
    </linearGradient>
    <linearGradient id={`${id}-shirt`} x1="0" y1="0" x2="1" y2="0.7">
      <stop offset="0%" stopColor={palette.shirt} />
      <stop offset="48%" stopColor={palette.shirt} />
      <stop offset="48.5%" stopColor={palette.shirtShade} />
      <stop offset="100%" stopColor={palette.shirtShade} />
    </linearGradient>
    <linearGradient id={`${id}-rim`} x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stopColor={rim} stopOpacity="0.95" />
      <stop offset="55%" stopColor={rim} stopOpacity="0.32" />
      <stop offset="100%" stopColor={rim} stopOpacity="0" />
    </linearGradient>
    <linearGradient id={`${id}-rimV`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={rim} stopOpacity="0" />
      <stop offset="42%" stopColor={rim} stopOpacity="0.28" />
      <stop offset="100%" stopColor={rim} stopOpacity="0.85" />
    </linearGradient>
    <radialGradient id={`${id}-eye`} cx="0.38" cy="0.3" r="0.8">
      <stop offset="0%" stopColor="#5C3E2A" />
      <stop offset="45%" stopColor="#2A1C12" />
      <stop offset="100%" stopColor="#0A0908" />
    </radialGradient>
    <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#05070B" />
      <stop offset="100%" stopColor="#05070B" stopOpacity="0" />
    </linearGradient>
  </defs>
);

/* ------------------------------------------------------------------ face */

type EyeProps = {
  id: string;
  x: number;
  y: number;
  open: number;
  tilt: number;
  gaze?: number;
};

const AlmondEye: React.FC<EyeProps> = ({ id, x, y, open, tilt, gaze = 0 }) => {
  const h = Math.max(1.6, 15.5 * open);
  const clip = `${id}-eye-${Math.round(x)}`;
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <clipPath id={clip}>
        <path
          d={`M${x - 25} ${y + 1} C${x - 12} ${y - h} ${x + 12} ${y - h} ${x + 25} ${y} C${x + 11} ${y + h * 0.82} ${x - 12} ${y + h * 0.78} ${x - 25} ${y + 1} Z`}
        />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <path
          d={`M${x - 26} ${y - 22} L${x + 26} ${y - 22} L${x + 26} ${y + 22} L${x - 26} ${y + 22} Z`}
          fill="#F6ECE2"
        />
        <ellipse cx={x + gaze} cy={y + 1.5} rx={8} ry={9.8} fill={`url(#${id}-eye)`} />
        <ellipse cx={x + gaze} cy={y + 1.5} rx={4} ry={5} fill="#070707" />
        <circle cx={x + gaze + 3.4} cy={y - 3} r={3} fill="#FFFFFF" opacity={0.95} />
        <circle cx={x + gaze - 3.4} cy={y + 6} r={1.7} fill="#8FE9F2" opacity={0.55} />
        <path
          d={`M${x - 26} ${y - 22} L${x + 26} ${y - 22} L${x + 26} ${y - 8} C${x + 6} ${y - 15} ${x - 8} ${y - 13} ${x - 26} ${y - 5} Z`}
          fill="#3A2418"
          opacity={0.26}
        />
      </g>
      <path
        d={`M${x - 27} ${y + 1} C${x - 13} ${y - h - 1.5} ${x + 13} ${y - h - 1.5} ${x + 27} ${y - 1}`}
        stroke={INK}
        strokeWidth={3.4}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${x + 12} ${y - h * 0.74} C${x + 19} ${y - h * 0.58} ${x + 24} ${y - h * 0.3} ${x + 27} ${y - 2}`}
        stroke={INK}
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${x + 24} ${y + 1} l6 -3.4`}
        stroke={INK}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <path
        d={`M${x - 20} ${y + h * 0.8} C${x - 8} ${y + h * 0.96} ${x + 8} ${y + h * 0.9} ${x + 18} ${y + h * 0.62}`}
        stroke={INK}
        strokeWidth={1.5}
        opacity={0.55}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};

const ProfileEye: React.FC<{ id: string; x: number; y: number; blink: number }> = ({
  id,
  x,
  y,
  blink,
}) => {
  const h = 11 * (1 - blink);
  return (
    <g>
      <path
        d={`M${x - 18} ${y + 1} C${x - 6} ${y - h} ${x + 10} ${y - h} ${x + 18} ${y - 1} C${x + 8} ${y + h * 0.7} ${x - 6} ${y + h * 0.7} ${x - 18} ${y + 1} Z`}
        fill="#F2E6DA"
      />
      <ellipse cx={x + 9} cy={y} rx={4.2} ry={5.6 * (1 - blink * 0.8)} fill={`url(#${id}-eye)`} />
      <circle cx={x + 11} cy={y - 2} r={1.7} fill="#FFFFFF" opacity={0.9} />
      <path
        d={`M${x - 19} ${y + 1} C${x - 7} ${y - h - 1} ${x + 11} ${y - h - 1} ${x + 19} ${y - 1}`}
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <path d={`M${x + 16} ${y} l5 -3`} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
};

type FaceProps = {
  id: string;
  frame: number;
  expression: AvatarExpression;
  threeQuarter?: boolean;
};

const Face: React.FC<FaceProps> = ({ id, frame, expression, threeQuarter }) => {
  const ex = EXPR[expression];
  const blink = blinkAmount(frame, threeQuarter ? 32 : 40);
  const open = Math.max(0.05, ex.eyeOpen * (1 - blink));
  const gaze = ex.gaze + (threeQuarter ? 2 : 0);
  const fx = threeQuarter ? -13 : 0;
  return (
    <g transform={`translate(${fx} 0)`}>
      {/* ears, behind the jaw */}
      <path
        d="M266 190 C250 178 240 198 244 222 C248 246 260 258 274 252 C268 232 265 210 266 190 Z"
        fill={`url(#${id}-skinSoft)`}
        stroke={INK}
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      <path
        d="M454 190 C470 178 480 198 476 222 C472 246 460 258 446 252 C452 232 455 210 454 190 Z"
        fill={`url(#${id}-skinSoft)`}
        stroke={INK}
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      <path d="M252 204 C256 216 260 228 266 234" stroke="#8E5A3A" strokeWidth={2} fill="none" opacity={0.55} />

      {/* neck with a natural trapezius slope */}
      <path
        d="M330 286 L329 334 C329 344 322 350 316 354 L404 354 C398 350 391 344 391 334 L390 286 C378 302 342 302 330 286 Z"
        fill={`url(#${id}-skin)`}
        stroke={INK}
        strokeWidth={3.2}
        strokeLinejoin="round"
      />
      <path d="M334 306 C344 322 376 322 386 306 L386 330 C376 344 344 344 334 330 Z" fill="#7C4A2E" opacity={0.1} />
      <path d="M338 314 L332 346" stroke="#8A5536" strokeWidth={1.6} opacity={0.32} />
      <path d="M382 314 L388 346" stroke="#8A5536" strokeWidth={1.6} opacity={0.24} />

      {/* skull */}
      <path
        d="M360 62 C300 62 264 106 262 164 C260 204 270 242 290 268 C310 294 334 308 360 310 C386 308 410 294 430 268 C450 242 460 204 458 164 C456 106 420 62 360 62 Z"
        fill={`url(#${id}-skin)`}
        stroke={INK}
        strokeWidth={3.6}
        strokeLinejoin="round"
      />

      {/* cel shading: cool temple, warm cheekbone, hard break at the jaw */}
      <path
        d="M434 198 C444 226 438 256 424 276 C410 296 388 308 366 312 C394 290 410 260 414 228 C416 212 422 204 434 198 Z"
        fill="#805034"
        opacity={0.3}
      />
      <path
        d="M288 200 C282 226 284 248 292 264 C278 252 270 226 272 202 Z"
        fill="#F6CCA4"
        opacity={0.22}
      />
      <path
        d="M288 160 C308 140 338 136 352 150 C330 150 306 160 294 174 Z"
        fill="#7C4A2E"
        opacity={0.16}
      />

      {/* brows: tapered brush strokes */}
      <path
        d={`M290 ${176 + ex.browLift} C304 ${162 + ex.browLift - ex.browTilt} 328 ${159 + ex.browLift - ex.browTilt} 346 ${169 + ex.browLift}`}
        stroke="#12151C"
        strokeWidth={6.4}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M430 ${176 + ex.browLift} C416 ${162 + ex.browLift - ex.browTilt} 392 ${159 + ex.browLift - ex.browTilt} 374 ${169 + ex.browLift}`}
        stroke="#12151C"
        strokeWidth={6.4}
        strokeLinecap="round"
        fill="none"
      />

      <AlmondEye id={id} x={312} y={204} open={open} tilt={-2} gaze={gaze} />
      <AlmondEye id={id} x={408} y={204} open={open} tilt={2} gaze={gaze} />

      {/* nose: bridge plane, tip, nostrils */}
      <path d="M358 198 C354 218 351 236 348 247" stroke="#8A5738" strokeWidth={2.2} strokeLinecap="round" opacity={0.45} fill="none" />
      <path d="M342 249 C350 257 368 257 376 250" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <path d="M340 250 C336 255 337 260 342 262" stroke="#6E4128" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.7} />
      <path d="M380 250 C384 255 383 260 378 262" stroke="#6E4128" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.7} />

      {/* mouth: upper line, lower lip highlight, corner shadows */}
      <path
        d={`M334 ${282 + ex.mouth} C346 ${276 + ex.mouth} 354 ${276 + ex.mouth} 360 ${280 + ex.mouth} C366 ${276 + ex.mouth} 374 ${276 + ex.mouth} 386 ${282 + ex.mouth}`}
        stroke="#6B3E2C"
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M342 ${291 + ex.mouth} C352 ${297 + ex.mouth} 368 ${297 + ex.mouth} 378 ${291 + ex.mouth}`}
        stroke="#DE9E8B"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={0.32}
      />
      <path d={`M330 ${284 + ex.mouth} l-4 3`} stroke="#6B3E2C" strokeWidth={1.6} opacity={0.35} strokeLinecap="round" />
      <path d={`M390 ${284 + ex.mouth} l4 3`} stroke="#6B3E2C" strokeWidth={1.6} opacity={0.3} strokeLinecap="round" />

      {/* jaw shadow and stubble texture, never a solid patch */}
      <path d="M294 246 C304 282 330 304 360 310" stroke="#6B3F28" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.1} />
      <path
        d="M302 258 C314 290 336 305 360 310"
        stroke="#3E2718"
        strokeWidth={2.4}
        strokeDasharray="1 7"
        strokeLinecap="round"
        fill="none"
        opacity={0.16}
      />
      <path d="M346 270 C352 273 358 273 364 270" stroke="#3E2718" strokeWidth={2} strokeDasharray="1 6" opacity={0.12} />

      {/* hair: closed cap, forehead forelocks, sideburns, rim light */}
      <path
        d="M360 54 C296 54 258 94 254 154 C251 188 257 216 268 236 C272 206 284 180 304 162 C320 148 340 142 360 142 C380 142 400 148 416 162 C436 180 448 206 452 236 C463 216 469 188 466 154 C462 94 424 54 360 54 Z"
        fill={`url(#${id}-hair)`}
        stroke={INK}
        strokeWidth={3.2}
        strokeLinejoin="round"
      />
      <path
        d={ribbon([{ x: 344, y: 96 }, { x: 320, y: 138 }, { x: 300, y: 182 }], [26, 16, 4])}
        fill="#1A2130"
        stroke={INK}
        strokeWidth={2}
      />
      <path
        d={ribbon([{ x: 372, y: 92 }, { x: 390, y: 136 }, { x: 418, y: 168 }], [24, 15, 3])}
        fill="#131926"
        stroke={INK}
        strokeWidth={2}
      />
      <path
        d={ribbon([{ x: 358, y: 88 }, { x: 356, y: 128 }, { x: 344, y: 160 }], [17, 11, 2])}
        fill="#202838"
        stroke={INK}
        strokeWidth={1.8}
      />
      <path
        d={ribbon([{ x: 410, y: 108 }, { x: 432, y: 140 }, { x: 440, y: 184 }], [18, 11, 3])}
        fill="#0F141F"
        stroke={INK}
        strokeWidth={1.7}
      />
      <path d="M266 172 C260 196 261 220 269 240" stroke="#11161F" strokeWidth={9} strokeLinecap="round" fill="none" />
      <path d="M454 172 C460 196 459 220 451 240" stroke="#11161F" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d="M300 132 C318 114 340 108 358 112" stroke="#2C3648" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.4} />
      <path d="M380 98 C404 106 424 124 436 146" stroke="#232C3E" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.7} />

      <path
        d="M256 164 C260 118 284 84 320 68"
        stroke={`url(#${id}-rim)`}
        strokeWidth={5.5}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M452 208 C456 238 446 266 428 286"
        stroke={`url(#${id}-rimV)`}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
    </g>
  );
};

/* ------------------------------------------------------------- chest body */

const ChestBody: React.FC<{
  id: string;
  palette: Palette;
  outfit: AvatarOutfit;
  rim: string;
}> = ({ id, palette, outfit, rim }) => (
  <g>
    {/* upper arms, outside the torso so the silhouette is not a box */}
    <path
      d="M306 334 C252 340 208 358 182 392 C158 426 148 486 146 556 L144 760 L244 760 C240 636 236 496 256 404 C262 376 282 350 308 340 Z"
      fill={palette.coatDeep}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <path
      d="M414 334 C468 340 512 358 538 392 C562 426 572 486 574 556 L576 760 L476 760 C480 636 484 496 464 404 C458 376 438 350 412 340 Z"
      fill={palette.coatDeep}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <path d="M182 430 C172 500 170 580 172 660" stroke="#05070B" strokeWidth={2.2} opacity={0.45} fill="none" />
    <path d="M538 430 C548 500 550 580 548 660" stroke="#05070B" strokeWidth={2.2} opacity={0.3} fill="none" />

    {/* torso: shoulder slope, suppressed waist, open hem */}
    <path
      d="M312 330 C282 334 242 342 212 358 C182 376 168 410 162 452 C152 512 150 574 150 640 L150 760 L570 760 L570 640 C570 574 568 512 558 452 C552 410 538 376 508 358 C478 342 438 334 408 330 C398 350 382 360 360 360 C338 360 322 350 312 330 Z"
      fill={`url(#${id}-coat)`}
      stroke={INK}
      strokeWidth={3.6}
      strokeLinejoin="round"
    />

    {/* shirt opening */}
    <path
      d="M318 340 C326 388 342 424 360 452 C378 424 394 388 402 340 L426 760 L294 760 Z"
      fill={`url(#${id}-shirt)`}
      stroke={INK}
      strokeWidth={2.8}
      strokeLinejoin="round"
    />
    <path d="M360 452 L360 760" stroke="#A9B5C6" strokeWidth={2} opacity={0.75} />
    <path d="M334 470 C340 540 340 640 338 750" stroke="#BCC8D8" strokeWidth={1.6} fill="none" opacity={0.55} />
    <path d="M388 470 C382 540 382 640 384 750" stroke="#AEBACA" strokeWidth={1.6} fill="none" opacity={0.45} />

    {/* collar stand and wings, only on the buttoned shirt uniforms */}
    {outfit !== "tech_hoodie" ? (
      <g>
        <path d="M318 338 C334 356 386 356 402 338 L406 364 C384 386 336 386 314 364 Z" fill="#FFFFFF" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M318 350 C324 384 334 408 346 430 L316 448 C304 416 300 382 302 356 Z" fill="#FFFFFF" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M402 350 C396 384 386 408 374 430 L404 448 C416 416 420 382 418 356 Z" fill={palette.shirt} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M320 360 C326 386 334 406 344 424" stroke="#AEBACA" strokeWidth={2} opacity={0.8} fill="none" />
        <path d="M400 360 C394 386 386 406 376 424" stroke="#BCC8D8" strokeWidth={2} opacity={0.7} fill="none" />
        <path d="M328 346 C342 362 378 362 392 346" stroke="#7E8A9C" strokeWidth={2} fill="none" opacity={0.5} />
      </g>
    ) : null}

    {outfit === "school_uniform" ? (
      <g>
        {/* tie: knot below the collar, blade down the placket */}
        <path d="M360 408 L342 392 L378 392 L386 412 L360 428 L334 412 Z" fill={palette.tie} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
        <path d="M346 422 L374 422 L382 574 L360 600 L338 574 Z" fill={palette.tie} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M352 428 L368 428 L374 568 L360 586 L346 568 Z" fill="#233A5C" opacity={0.7} />
        <path d="M350 436 C346 496 346 542 352 570" stroke={palette.trim} strokeWidth={1.4} opacity={0.22} fill="none" />
        {/* jacket lapels sit outside the collar and tie */}
        <path d="M306 334 C292 376 288 420 298 462 L326 440 C316 406 312 372 316 342 Z" fill={palette.coatLight} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M414 334 C428 376 432 420 422 462 L394 440 C404 406 408 372 404 342 Z" fill={palette.coatLight} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M222 612 C256 626 290 628 312 620" stroke="#05070B" strokeWidth={2.4} fill="none" opacity={0.5} />
        <path d="M498 612 C464 626 430 628 408 620" stroke="#05070B" strokeWidth={2.4} fill="none" opacity={0.4} />
      </g>
    ) : null}

    {outfit === "tech_hoodie" ? (
      <g>
        {/* hood resting behind the neck */}
        <path
          d="M306 330 C292 366 296 402 318 422 C338 440 382 440 402 422 C424 402 428 366 414 330 C400 352 382 362 360 362 C338 362 320 352 306 330 Z"
          fill={palette.coat}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M326 356 C342 378 378 378 394 356 L398 374 C382 394 338 394 322 374 Z" fill={palette.shirt} opacity={0.32} />
        <path d="M326 356 C342 378 378 378 394 356" stroke={palette.trim} strokeWidth={2.4} fill="none" opacity={0.45} />
        <path d="M342 410 C339 452 338 482 340 510" stroke="#7E93A1" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.7} />
        <path d="M378 410 C381 452 382 482 380 510" stroke="#7E93A1" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.45} />
        <circle cx={340} cy={516} r={3.4} fill="#5C6E7A" opacity={0.9} />
        <circle cx={380} cy={516} r={3.4} fill="#5C6E7A" opacity={0.6} />
        <path d="M232 592 C280 610 440 610 488 592 L496 760 L224 760 Z" fill={palette.coatDeep} opacity={0.75} />
        <path d="M232 592 C280 610 440 610 488 592" stroke={INK} strokeWidth={2.4} fill="none" opacity={0.7} />
        <path d="M306 404 C318 420 348 430 360 430" stroke={rim} strokeWidth={2.2} fill="none" opacity={0.35} strokeLinecap="round" />
      </g>
    ) : null}

    {outfit === "travel_backpack" ? (
      <g>
        <path d="M300 332 C286 382 286 462 296 524 L332 516 C324 452 324 384 334 344 Z" fill={palette.pack} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
        <path d="M420 332 C434 382 434 462 424 524 L388 516 C396 452 396 384 386 344 Z" fill={palette.packDark} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
        <path d="M302 404 L330 400 M304 432 L332 428" stroke={palette.packTrim} strokeWidth={2.6} strokeLinecap="round" opacity={0.7} />
        <path d="M418 404 L390 400 M416 432 L388 428" stroke={palette.packTrim} strokeWidth={2.6} strokeLinecap="round" opacity={0.55} />
        <path d="M360 452 L360 760" stroke="#A9B5C6" strokeWidth={2} opacity={0.65} />
      </g>
    ) : null}

    {/* fabric folds and seams */}
    <path d="M186 690 C272 708 448 708 534 690" stroke="#05070B" strokeWidth={2.8} fill="none" opacity={0.38} />
    <path d="M228 442 C244 496 244 552 232 608" stroke="#05070B" strokeWidth={2} fill="none" opacity={0.32} />
    <path d="M492 442 C476 496 476 552 488 608" stroke="#05070B" strokeWidth={2} fill="none" opacity={0.28} />
    <path d="M224 372 C248 392 258 420 256 452" stroke="#05070B" strokeWidth={2.2} fill="none" opacity={0.42} />
    <path d="M496 372 C472 392 462 420 464 452" stroke="#05070B" strokeWidth={2.2} fill="none" opacity={0.3} />
    <path d="M192 420 C206 470 208 530 200 584" stroke="#05070B" strokeWidth={1.8} fill="none" opacity={0.35} />

    {/* rim light on the left shoulder and sleeve */}
    <path d="M312 330 C282 334 242 342 212 358 C182 376 168 410 162 452 C152 512 150 574 150 640" stroke={`url(#${id}-rim)`} strokeWidth={5} strokeLinecap="round" fill="none" />
    <path d="M408 330 C450 338 492 354 518 378" stroke={rim} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.3} />
    <path d="M182 392 C160 428 150 488 148 556" stroke={rim} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.3} />
  </g>
);

/* --------------------------------------------------------------- back view */

const BackHand: React.FC<{ id: string; x: number; y: number }> = ({ id, x, y }) => (
  <g>
    <path d={ribbon([{ x, y: y - 4 }, { x: x + 2, y: y + 40 }], [36, 32])} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.2} />
    {[-14, -5, 4, 12].map((dx, i) => (
      <path
        key={dx}
        d={ribbon([{ x: x + dx, y: y + 30 }, { x: x + dx + i * 0.8, y: y + 50 + (i === 1 || i === 2 ? 4 : 0) }], [10, 7])}
        fill={`url(#${id}-skinSoft)`}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    ))}
    <path d={ribbon([{ x: x - 15, y: y + 6 }, { x: x - 25, y: y + 26 }], [12, 8])} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={1.6} />
  </g>
);

const BackFigure: React.FC<{
  id: string;
  palette: Palette;
  outfit: AvatarOutfit;
  frame: number;
  rim: string;
}> = ({ id, palette, outfit, frame, rim }) => {
  const phase = frame * 0.19;
  const stride = Math.sin(phase);
  const bob = Math.abs(Math.sin(phase)) * 5;
  const shoulderRot = stride * 1.8;
  const hipRot = -stride * 2.2;
  const hem = Math.sin(phase + 0.9) * 7;

  const leg = (side: -1 | 1, swing: number) => {
    const hip = { x: 360 + side * 38, y: 510 };
    const lift = Math.max(0, swing) * 30;
    const knee = { x: 360 + side * 42 + swing * 7, y: 700 - lift * 0.35 };
    const ankle = { x: 360 + side * 44 + swing * 12, y: 882 - lift };
    const toe = { x: ankle.x + side * 16, y: 922 - lift * 0.5 };
    return (
      <g key={side} opacity={side === -1 ? 0.94 : 1}>
        <path
          d={ribbon([hip, knee, ankle, toe], [58, 48, 38, 26])}
          fill={side === -1 ? palette.pants : "#232B3D"}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path
          d={`M${hip.x + side * 20} ${hip.y + 8} C${knee.x + side * 16} ${knee.y - 10} ${ankle.x + side * 13} ${ankle.y - 20} ${ankle.x + side * 10} ${ankle.y - 6}`}
          stroke={rim}
          strokeWidth={2.2}
          fill="none"
          opacity={0.34}
          strokeLinecap="round"
        />
        <path d={`M${hip.x - 18 * side} ${hip.y + 10} C${knee.x - 14} ${knee.y - 40} ${ankle.x - 8} ${ankle.y - 24} ${ankle.x} ${ankle.y - 8}`} stroke="#05070B" strokeWidth={2} fill="none" opacity={0.45} />
        <path d={`M${knee.x - 16} ${knee.y - 4} C${knee.x - 4} ${knee.y + 8} ${knee.x + 8} ${knee.y + 8} ${knee.x + 18} ${knee.y - 4}`} stroke="#05070B" strokeWidth={2.4} fill="none" opacity={0.5} />
        {/* heel, sole and toe of a low leather shoe */}
        <path
          d={`M${ankle.x - 29} ${ankle.y - 2} C${ankle.x - 33} ${ankle.y + 18} ${ankle.x - 24} ${ankle.y + 36} ${ankle.x - 2} ${ankle.y + 38} L${ankle.x + 27} ${ankle.y + 35} C${ankle.x + 34} ${ankle.y + 20} ${ankle.x + 29} ${ankle.y + 2} ${ankle.x + 19} ${ankle.y - 4} Z`}
          fill="#0B0E14"
          stroke={INK}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
        <path d={`M${ankle.x - 23} ${ankle.y + 27} L${ankle.x + 22} ${ankle.y + 25}`} stroke={rim} strokeWidth={2} opacity={0.42} strokeLinecap="round" />
        <path d={`M${ankle.x - 24} ${ankle.y + 12} L${ankle.x - 10} ${ankle.y + 13}`} stroke="#05070B" strokeWidth={4} opacity={0.7} strokeLinecap="round" />
      </g>
    );
  };

  const arm = (side: -1 | 1, swing: number) => {
    const shoulder = { x: 360 + side * 118, y: 300 };
    const elbow = { x: 360 + side * 142 + swing * 5, y: 438 };
    const wrist = { x: 360 + side * 136 - swing * 12, y: 590 };
    const hand = { x: wrist.x - side * 2, y: wrist.y + 8 };
    return (
      <g key={side}>
        <path d={ribbon([shoulder, elbow, wrist], [54, 45, 35])} fill={`url(#${id}-coat)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M${shoulder.x} ${shoulder.y + 8} C${elbow.x + side * 4} ${elbow.y} ${wrist.x + side * 2} ${wrist.y - 14} ${wrist.x} ${wrist.y - 6}`} stroke="#05070B" strokeWidth={2} fill="none" opacity={0.4} />
        <path d={`M${wrist.x - 18} ${wrist.y - 8} C${wrist.x - 4} ${wrist.y + 2} ${wrist.x + 10} ${wrist.y} ${wrist.x + 18} ${wrist.y - 10}`} stroke={side === -1 ? rim : "#3A4354"} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.75} />
        <BackHand id={id} x={hand.x} y={hand.y} />
      </g>
    );
  };

  return (
    <g transform={`translate(0 ${bob})`}>
      <ellipse cx={360} cy={940} rx={150} ry={18} fill="#000000" opacity={0.5} />
      <g transform={`rotate(${hipRot} 360 580)`}>
        {leg(-1, -stride)}
        {leg(1, stride)}
      </g>

      <g transform={`rotate(${shoulderRot} 360 400)`}>
        {arm(-1, -stride)}
        {arm(1, stride)}

        {/* coat from behind: tapered waist, vented hem */}
        <path
          d={`M312 264 C284 266 248 276 226 294 C208 310 198 334 194 364 C190 392 196 420 208 442 C216 458 228 480 ${244 + hem * 0.3} 502 C282 516 438 516 ${476 + hem * 0.3} 502 C492 480 504 458 512 442 C524 420 530 392 526 364 C522 334 512 310 494 294 C472 276 436 266 408 264 C398 280 382 288 360 288 C338 288 322 280 312 264 Z`}
          fill={`url(#${id}-coat)`}
          stroke={INK}
          strokeWidth={3.6}
          strokeLinejoin="round"
        />
        <path d="M360 290 L360 510" stroke="#05070B" strokeWidth={2.2} opacity={0.5} />
        <path d={`M${318 + hem} 496 C346 ${506 + hem * 0.3} 386 ${506 + hem * 0.3} ${414 + hem} 494`} stroke="#05070B" strokeWidth={2.4} opacity={0.55} fill="none" />
        <path d="M238 382 C224 420 220 460 226 494" stroke="#05070B" strokeWidth={2.2} opacity={0.35} fill="none" />
        <path d="M482 382 C496 420 500 460 494 494" stroke="#05070B" strokeWidth={2.2} opacity={0.28} fill="none" />
        <path d="M296 300 C286 340 284 384 292 424" stroke="#05070B" strokeWidth={2} opacity={0.3} fill="none" />
        <path d="M424 300 C434 340 436 384 428 424" stroke="#05070B" strokeWidth={2} opacity={0.25} fill="none" />
        <path d="M230 332 C220 384 220 450 228 504" stroke={`url(#${id}-rim)`} strokeWidth={5.5} strokeLinecap="round" fill="none" />
        <path d="M408 264 C458 272 498 292 518 324" stroke={rim} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.3} />

        {outfit === "travel_backpack" ? (
          <g>
            {/* pack body sits over the coat, with real pockets and a zip */}
            <path
              d="M244 292 C236 356 236 458 246 530 C286 550 434 550 474 530 C484 458 484 356 476 292 C436 272 284 272 244 292 Z"
              fill={palette.pack}
              stroke={INK}
              strokeWidth={3.2}
              strokeLinejoin="round"
            />
            <path d="M252 304 C300 292 420 292 468 304 L468 340 C420 330 300 330 252 340 Z" fill={palette.packDark} opacity={0.75} />
            <path d="M330 276 C340 258 380 258 390 276" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d="M300 300 C292 370 292 460 300 522" stroke={palette.packDark} strokeWidth={3} fill="none" />
            <path d="M420 300 C428 370 428 460 420 522" stroke={palette.packDark} strokeWidth={3} fill="none" />
            <path d="M360 330 L360 520" stroke={palette.packDark} strokeWidth={4} />
            {[356, 388, 420, 452].map((y) => (
              <path key={y} d={`M348 ${y} L372 ${y}`} stroke={palette.packTrim} strokeWidth={3.4} strokeLinecap="round" opacity={0.7} />
            ))}
            <path d="M266 380 C258 408 258 442 264 470" stroke={palette.packTrim} strokeWidth={3} fill="none" opacity={0.55} />
            <path d="M454 380 C462 408 462 442 456 470" stroke={palette.packTrim} strokeWidth={3} fill="none" opacity={0.45} />
            <path d="M248 336 C244 384 244 460 250 522" stroke={rim} strokeWidth={2.6} fill="none" opacity={0.35} />
          </g>
        ) : null}

      </g>

      <g transform={`rotate(${-shoulderRot * 0.6} 360 250) translate(360 300) scale(0.88) translate(-360 -300)`}>
        {/* neck */}
                <path d="M330 216 L326 300 C326 316 342 324 360 324 C378 324 394 316 394 300 L390 216 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3}
        />
        <path d="M330 234 C342 256 378 256 390 234 L390 254 C378 272 342 272 330 254 Z" fill="#7C4A2E" opacity={0.32} />
        <path d="M336 286 C346 298 374 298 384 286" stroke="#8A5536" strokeWidth={1.6} fill="none" opacity={0.4} />
        {/* ears */}
        <path d="M286 168 C274 164 270 182 276 198 C282 214 292 218 300 210 C294 196 290 180 286 168 Z" fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.4} />
        <path d="M434 168 C446 164 450 182 444 198 C438 214 428 218 420 210 C426 196 430 180 434 168 Z" fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.4} />
        {/* hair mass from behind, no face */}
        <path
          d="M360 96 C312 96 284 126 280 164 C278 190 286 214 300 230 C316 244 338 250 360 250 C382 250 404 244 420 230 C434 214 442 190 440 164 C436 126 408 96 360 96 Z"
          fill={`url(#${id}-hair)`}
          stroke={INK}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        <path d="M340 112 C350 128 358 150 362 174" stroke="#313C52" strokeWidth={2.4} fill="none" opacity={0.55} />
        <path d={ribbon([{ x: 352, y: 126 }, { x: 334, y: 172 }, { x: 338, y: 232 }, { x: 352, y: 266 }], [17, 13, 8, 2])} fill="#1F2738" opacity={0.9} />
        <path d={ribbon([{ x: 384, y: 120 }, { x: 406, y: 170 }, { x: 400, y: 232 }, { x: 382, y: 266 }], [15, 12, 7, 2])} fill="#141A26" opacity={0.9} />
        <path d={ribbon([{ x: 312, y: 158 }, { x: 296, y: 204 }, { x: 304, y: 248 }], [12, 8, 2])} fill="#0F141E" />
        <path d={ribbon([{ x: 420, y: 150 }, { x: 434, y: 200 }, { x: 424, y: 246 }], [11, 7, 2])} fill="#0F141E" />
        <path d="M284 170 C288 132 310 108 342 102" stroke={`url(#${id}-rim)`} strokeWidth={5.5} strokeLinecap="round" fill="none" />
        <path d="M330 112 C346 118 358 130 366 146" stroke="#4A5770" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.55} />
        <path d="M300 150 C306 178 312 208 324 232" stroke="#2A3446" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.75} />
        <path d="M410 132 C416 160 414 196 404 226" stroke="#202838" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.65} />
        <path d="M330 260 C344 274 376 274 390 260" stroke="#05070B" strokeWidth={5} fill="none" opacity={0.35} strokeLinecap="round" />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------ side profile */

const ProfileFigure: React.FC<{
  id: string;
  palette: Palette;
  outfit: AvatarOutfit;
  frame: number;
  rim: string;
}> = ({ id, palette, outfit, frame, rim }) => {
  const phase = frame * 0.19 + 0.6;
  const stride = Math.sin(phase);
  const bob = Math.abs(Math.sin(phase)) * 5;
  const hairLag = Math.sin(phase) * 5;

  const leg = (swing: number, far: boolean) => {
    const forward = swing * 58;
    const lift = Math.max(0, swing) * 30;
    const hip = { x: 370, y: 584 };
    const knee = { x: 372 + forward * 0.42, y: 732 - lift * 0.4 };
    const ankle = { x: 374 + forward * 0.92, y: 890 - lift };
    const toe = { x: ankle.x + 34, y: ankle.y + 22 };
    return (
      <g opacity={far ? 0.9 : 1}>
        <path d={ribbon([hip, knee, ankle], [56, 43, 33])} fill={far ? "#0C0E13" : palette.pants} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M${hip.x - 12} ${hip.y + 4} C${knee.x - 10} ${knee.y - 20} ${ankle.x - 6} ${ankle.y - 30} ${ankle.x - 2} ${ankle.y - 8}`} stroke="#05070B" strokeWidth={2} fill="none" opacity={0.35} />
        <path d={`M${knee.x - 12} ${knee.y} C${knee.x} ${knee.y + 10} ${knee.x + 12} ${knee.y + 8} ${knee.x + 18} ${knee.y - 6}`} stroke="#05070B" strokeWidth={2.2} fill="none" opacity={0.4} />
        {/* shoe in profile: heel block, sole, toe cap */}
        <path
          d={`M${ankle.x - 20} ${ankle.y - 2} C${ankle.x - 24} ${ankle.y + 14} ${ankle.x - 16} ${ankle.y + 28} ${ankle.x + 4} ${ankle.y + 28} L${toe.x} ${toe.y + 8} C${toe.x + 5} ${toe.y - 5} ${toe.x - 8} ${toe.y - 12} ${toe.x - 18} ${toe.y - 12} L${ankle.x + 6} ${ankle.y - 2} Z`}
          fill="#0B0E14"
          stroke={INK}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
        <path d={`M${ankle.x - 18} ${ankle.y + 22} L${toe.x} ${toe.y + 6}`} stroke={far ? "#2C3444" : rim} strokeWidth={2.2} opacity={0.5} strokeLinecap="round" />
        <path d={`M${ankle.x - 20} ${ankle.y + 10} L${ankle.x - 4} ${ankle.y + 12}`} stroke="#05070B" strokeWidth={4} opacity={0.7} strokeLinecap="round" />
      </g>
    );
  };

  const arm = (swing: number, far: boolean) => {
    const shoulder = { x: 388, y: 300 };
    const elbow = { x: 386 + swing * 26, y: 422 };
    const wrist = { x: 400 + swing * 44, y: 522 };
    return (
      <g opacity={far ? 0.8 : 1}>
        <path d={ribbon([shoulder, elbow, wrist], [54, 45, 35])} fill={`url(#${id}-coat)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M${shoulder.x + 10} ${shoulder.y + 16} C${elbow.x + 8} ${elbow.y} ${wrist.x + 4} ${wrist.y - 20} ${wrist.x} ${wrist.y - 6}`} stroke="#05070B" strokeWidth={2} fill="none" opacity={0.38} />
        <path
          d={ribbon([{ x: wrist.x, y: wrist.y - 4 }, { x: wrist.x + 6, y: wrist.y + 26 }], [28, 24])}
          fill={`url(#${id}-skinSoft)`}
          stroke={INK}
          strokeWidth={2.2}
        />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={ribbon([{ x: wrist.x - 6 + i * 5, y: wrist.y + 22 }, { x: wrist.x - 4 + i * 5, y: wrist.y + 40 }], [7, 5])}
            fill={`url(#${id}-skinSoft)`}
            stroke={INK}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}
        <path d={ribbon([{ x: wrist.x - 11, y: wrist.y + 2 }, { x: wrist.x - 19, y: wrist.y + 20 }], [9, 6])} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={1.5} />
      </g>
    );
  };

  return (
    <g transform={`translate(0 ${bob})`}>
      <ellipse cx={392} cy={920} rx={152} ry={18} fill="#000000" opacity={0.5} />
      {leg(-stride, true)}
      {arm(-stride, true)}

      {/* backpack rides behind the shoulder in profile */}
      {outfit === "travel_backpack" ? (
        <g>
          <path
            d="M300 302 C270 318 260 356 264 412 C268 466 280 512 298 546 C314 552 336 548 346 536 C332 494 326 442 330 392 C334 348 342 318 354 302 Z"
            fill={palette.pack}
            stroke={INK}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d="M300 320 C284 340 280 380 284 420" stroke={palette.packDark} strokeWidth={3} fill="none" />
          <path d="M300 470 C292 486 292 512 300 528" stroke={palette.packTrim} strokeWidth={3} fill="none" opacity={0.6} />
          <path d="M338 310 C352 344 354 390 348 430" stroke={palette.packTrim} strokeWidth={2.4} fill="none" opacity={0.45} />
          <path d="M266 326 C262 360 264 410 270 450" stroke={rim} strokeWidth={2.4} fill="none" opacity={0.3} />
        </g>
      ) : null}

      {/* torso in profile: chest forward, back curve, coat vent */}
      <path
        d="M322 272 C300 290 290 322 288 356 C286 396 290 442 296 484 C300 514 304 540 308 564 C334 578 424 580 454 564 C464 536 468 498 466 458 C464 418 458 372 446 340 C434 306 410 284 384 272 Z"
        fill={`url(#${id}-coat)`}
        stroke={INK}
        strokeWidth={3.6}
        strokeLinejoin="round"
      />
      <path d="M430 292 C440 334 444 390 442 444 C440 490 434 532 426 560" stroke="#05070B" strokeWidth={2.6} fill="none" opacity={0.55} />
      <path d="M300 300 C314 334 322 366 322 400" stroke={INK} strokeWidth={2.2} fill="none" opacity={0.55} />
      <path d="M320 470 C324 506 326 534 330 556" stroke="#05070B" strokeWidth={2} fill="none" opacity={0.35} />
      <path d="M448 400 C454 444 454 496 448 534" stroke="#05070B" strokeWidth={2} fill="none" opacity={0.3} />
      <path d="M294 512 C340 528 424 528 472 512" stroke="#05070B" strokeWidth={2.6} fill="none" opacity={0.4} />
      <path d="M322 272 C300 290 290 322 288 356 C286 396 290 442 296 484" stroke={`url(#${id}-rim)`} strokeWidth={5} strokeLinecap="round" fill="none" />
      {outfit === "tech_hoodie" ? (
        <path d="M352 286 C396 290 426 310 442 342 C424 322 400 310 372 308 Z" fill={palette.coatLight} stroke={INK} strokeWidth={2.6} />
      ) : null}

      {leg(stride, false)}

      {/* head in profile */}
      <g transform={`rotate(-2 372 180) translate(0 ${hairLag * 0.15})`}>
        <path
          d="M340 224 L336 264 C336 280 350 288 372 288 C394 288 406 280 406 264 L402 224 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3}
        />
        <path d="M340 236 C352 258 392 258 402 236 L402 260 C390 278 352 278 340 260 Z" fill="#7C4A2E" opacity={0.32} />
        <path
          d="M330 128 C342 104 368 94 392 102 C416 110 428 130 432 152 C436 158 442 168 442 178 C442 186 436 190 430 192 C436 198 432 206 422 210 C416 216 408 220 400 222 C392 234 376 240 360 236 C340 230 326 212 322 192 C318 172 320 146 330 128 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        <path d="M326 184 C334 172 344 170 352 176 C342 180 334 186 330 194 Z" fill="#805034" opacity={0.22} />
        <path d="M382 196 C390 202 398 204 406 200 C412 196 414 188 412 180" stroke="#8A5738" strokeWidth={2} fill="none" opacity={0.38} />
        <path
          d="M344 172 C336 172 334 186 340 198 C346 208 354 210 358 202 C352 192 348 182 344 172 Z"
          fill={`url(#${id}-skinSoft)`}
          stroke={INK}
          strokeWidth={2.4}
        />
        <path d="M345 178 C341 182 341 190 345 196" stroke="#7A4A2E" strokeWidth={1.6} fill="none" opacity={0.6} />
        <path d="M388 148 C400 138 418 140 428 150" stroke="#12151C" strokeWidth={6.2} strokeLinecap="round" fill="none" />
        <path d="M428 152 C434 160 437 170 439 178" stroke="#8A5738" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.5} />
        <ProfileEye id={id} x={400} y={166} blink={blinkAmount(frame, 34)} />
        <path d="M430 170 C436 176 438 182 434 186" stroke="#8A5738" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.5} />
        <path d="M434 182 C438 186 436 192 430 194" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <path d="M432 186 C435 188 435 192 431 194" stroke="#5E3320" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <path d="M420 206 C426 206 430 203 432 199" stroke="#5E3320" strokeWidth={2.6} strokeLinecap="round" fill="none" />
        <path d="M412 216 C420 220 426 218 430 214" stroke="#8A4A38" strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.6} />
        <path d="M354 214 C374 224 402 226 420 220" stroke="#6B3F28" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.22} />
        <path d="M326 192 C336 214 354 226 380 228" stroke="#6B3F28" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.14} />
        <path d="M356 226 C360 229 366 230 370 228" stroke="#3E2718" strokeWidth={2.4} strokeDasharray="2 5" opacity={0.2} />
        {/* swept-back hair with trailing strands */}
        <path
          d="M430 132 C424 102 400 86 370 88 C334 90 310 116 304 152 C298 188 304 218 320 240 C312 210 316 180 330 160 C342 144 362 138 382 140 C402 142 416 150 424 164 Z"
          fill={`url(#${id}-hair)`}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d={ribbon([{ x: 360, y: 100 }, { x: 322, y: 120 }, { x: 294, y: 158 }, { x: 288, y: 206 }], [26, 19, 11, 2])} fill="#1B2230" stroke={INK} strokeWidth={2} />
        <path d={ribbon([{ x: 384, y: 104 }, { x: 348, y: 118 }, { x: 318, y: 144 }, { x: 306, y: 188 }], [20, 14, 8, 2])} fill="#121824" stroke={INK} strokeWidth={1.8} />
        <path d={ribbon([{ x: 410, y: 112 }, { x: 384, y: 124 }, { x: 366, y: 146 }], [16, 10, 2])} fill="#0E131E" />
        <path d="M422 164 C426 150 422 138 414 132" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        <path d="M410 136 C410 112 398 94 380 88" stroke={`url(#${id}-rim)`} strokeWidth={5.5} strokeLinecap="round" fill="none" />
        <path d="M306 180 C302 160 306 140 318 126" stroke={rim} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.35} />
      </g>

      {arm(stride, false)}
    </g>
  );
};

/* ------------------------------------------------------------- hands close */

const Finger: React.FC<{
  id: string;
  points: Pt[];
  widths: number[];
  nail?: boolean;
}> = ({ id, points, widths, nail = true }) => {
  const tip = points[points.length - 1];
  const prev = points[points.length - 2];
  const angle = (Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180) / Math.PI;
  const mid = points[Math.floor(points.length / 2)];
  return (
    <g>
      <path
        d={ribbon(points, widths)}
        fill={`url(#${id}-skinSoft)`}
        stroke={INK}
        strokeWidth={2.3}
        strokeLinejoin="round"
      />
      {nail ? (
        <ellipse
          cx={tip.x - Math.cos((angle * Math.PI) / 180) * 4}
          cy={tip.y - Math.sin((angle * Math.PI) / 180) * 4}
          rx={4.4}
          ry={6.6}
          transform={`rotate(${angle + 90} ${tip.x} ${tip.y})`}
          fill="#E9C6B0"
          stroke="#A9785C"
          strokeWidth={1.2}
          opacity={0.95}
        />
      ) : null}
      <path
        d={`M${mid.x - 5} ${mid.y - 2} C${mid.x - 1} ${mid.y + 2} ${mid.x + 3} ${mid.y + 2} ${mid.x + 6} ${mid.y - 1}`}
        stroke="#8A5638"
        strokeWidth={1.4}
        fill="none"
        opacity={0.42}
        strokeLinecap="round"
      />
    </g>
  );
};

const HandsCloseup: React.FC<{ id: string; frame: number; rim: string }> = ({
  id,
  frame,
  rim,
}) => {
  const { fps } = useVideoConfig();
  const press = spring({ frame: frame - 6, fps, config: SPRING_CAMERA });
  const buttonY = 372;

  return (
    <g>
      <defs>
        <radialGradient id={`${id}-hand-vignette`} cx="0.5" cy="0.48" r="0.62">
          <stop offset="0%" stopColor="#05070B" stopOpacity="0" />
          <stop offset="64%" stopColor="#05070B" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#05070B" stopOpacity="0.94" />
        </radialGradient>
        <linearGradient id={`${id}-neck-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05070B" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#05070B" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx={180} cy={250} rx={380} ry={300} fill="#FFB800" opacity={0.1} />
      <ellipse cx={560} cy={700} rx={360} ry={280} fill={rim} opacity={0.09} />

      {/* shirt and placket */}
      <path
        d="M80 196 C170 132 278 112 336 108 L384 108 C442 112 550 132 640 196 L704 900 L16 900 Z"
        fill={`url(#${id}-shirt)`}
        stroke={INK}
        strokeWidth={3.4}
      />
      <path d="M330 300 L390 300 L398 900 L322 900 Z" fill="#FFFFFF" opacity={0.42} />
      <path d="M330 304 L330 900" stroke="#A7B4C6" strokeWidth={2.6} />
      <path d="M390 304 L390 900" stroke="#A7B4C6" strokeWidth={2.6} />
      <path d="M338 304 L338 900" stroke="#D4DDE8" strokeWidth={1.8} opacity={0.9} />
      <path d="M150 330 C170 440 158 570 122 700" stroke="#B6C2D2" strokeWidth={3.2} fill="none" opacity={0.8} strokeLinecap="round" />
      <path d="M572 330 C552 450 566 580 602 710" stroke="#B6C2D2" strokeWidth={3.2} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M176 650 C230 682 286 694 326 690" stroke="#C3CEDC" strokeWidth={2.6} fill="none" opacity={0.6} strokeLinecap="round" />
      <path d="M544 710 C496 742 440 754 398 750" stroke="#C3CEDC" strokeWidth={2.6} fill="none" opacity={0.5} strokeLinecap="round" />
      <path d="M92 226 C186 164 534 164 628 226" stroke="#D7E0EB" strokeWidth={2.4} fill="none" opacity={0.9} />

      {/* neck column cropped by the top of the frame */}
      <path
        d="M312 -30 C302 20 298 74 304 120 C316 152 336 170 360 170 C384 170 404 152 416 120 C422 74 418 20 408 -30 Z"
        fill={`url(#${id}-skin)`}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M304 46 C320 78 400 78 416 46 L416 112 C398 138 322 138 304 112 Z" fill="#7C4A2E" opacity={0.26} />
      <path d="M314 64 L308 128" stroke="#8A5536" strokeWidth={1.6} opacity={0.35} />
      <path d="M406 64 L412 128" stroke="#8A5536" strokeWidth={1.6} opacity={0.3} />

      {/* collar stand and wings */}
      <path d="M296 138 C318 168 402 168 424 138 L428 178 C400 204 320 204 292 178 Z" fill="#FFFFFF" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
      <path d="M296 152 C302 190 312 224 326 254 L294 276 C282 242 278 202 282 158 Z" fill="#FFFFFF" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
      <path d="M424 152 C418 190 408 224 394 254 L426 276 C438 242 442 202 438 158 Z" fill="#E9EFF7" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
      <path d="M302 166 C308 198 316 226 328 246" stroke="#AEBACA" strokeWidth={2.2} fill="none" opacity={0.85} />
      <path d="M418 166 C412 198 404 226 392 246" stroke="#C2CDDB" strokeWidth={2.2} fill="none" opacity={0.75} />
      <path d="M306 148 C324 172 396 172 414 148" stroke="#7E8A9C" strokeWidth={2} fill="none" opacity={0.5} />

      {/* top button */}
      <g transform={`translate(0 ${press * 2})`}>
        <circle cx={360} cy={buttonY} r={18} fill="#F8FBFE" stroke="#7C8798" strokeWidth={2.8} />
        <circle cx={353} cy={buttonY - 5} r={3} fill="#6B7688" />
        <circle cx={367} cy={buttonY - 5} r={3} fill="#6B7688" />
        <circle cx={353} cy={buttonY + 6} r={3} fill="#6B7688" />
        <circle cx={367} cy={buttonY + 6} r={3} fill="#6B7688" />
        <path d={`M353 ${buttonY} L367 ${buttonY + 6} M367 ${buttonY} L353 ${buttonY + 6}`} stroke="#8A94A4" strokeWidth={1.2} />
      </g>
      <path d={`M352 ${buttonY + 34} C360 ${buttonY + 30} 368 ${buttonY + 34} 368 ${buttonY + 42}`} stroke="#8E9AAE" strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* LEFT shirt sleeve, cuff and wrist */}
      <path d="M150 930 C170 850 200 770 220 700" stroke="#E6ECF4" strokeWidth={132} fill="none" />
      <path d="M166 742 C190 728 214 730 238 746" stroke="#B7C3D3" strokeWidth={2.4} fill="none" />
      <circle cx={202} cy={738} r={4} fill="#D5DEEA" stroke="#8E9AAE" strokeWidth={1.4} />
      <path d={ribbon([{ x: 224, y: 726 }, { x: 232, y: 662 }], [74, 68])} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={2.4} />

      {/* LEFT hand holding the placket */}
      <g transform={`translate(${press * 1.4} 0)`}>
        <path
          d="M186 668 C182 636 190 602 204 580 C216 560 238 554 258 556 C278 558 292 572 294 596 C296 624 288 652 276 672 C260 698 240 710 222 710 C204 710 192 694 186 668 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M208 692 C226 668 244 642 258 618" stroke="#8A5638" strokeWidth={1.8} fill="none" opacity={0.26} />
        <path d="M222 700 C240 674 258 648 272 624" stroke="#8A5638" strokeWidth={1.6} fill="none" opacity={0.2} />
        {[
          [210, 566],
          [232, 562],
          [254, 564],
          [274, 572],
        ].map(([x, y]) => (
          <path key={x} d={`M${x - 8} ${y} C${x} ${y - 8} ${x + 10} ${y - 6} ${x + 16} ${y + 2}`} stroke="#8A5638" strokeWidth={2} fill="none" opacity={0.4} strokeLinecap="round" />
        ))}
        <Finger id={id} points={[{ x: 212, y: 568 }, { x: 226, y: 526 }, { x: 240, y: 484 }, { x: 250, y: 456 }]} widths={[25, 23, 18, 12]} />
        <Finger id={id} points={[{ x: 234, y: 564 }, { x: 248, y: 518 }, { x: 262, y: 474 }, { x: 272, y: 438 }]} widths={[26, 24, 19, 12]} />
        <Finger id={id} points={[{ x: 256, y: 566 }, { x: 268, y: 524 }, { x: 280, y: 486 }, { x: 288, y: 458 }]} widths={[24, 21, 17, 11]} />
        <Finger id={id} points={[{ x: 276, y: 574 }, { x: 286, y: 540 }, { x: 294, y: 508 }, { x: 300, y: 488 }]} widths={[21, 18, 14, 9]} />
        <Finger id={id} points={[{ x: 286, y: 610 }, { x: 310, y: 590 }, { x: 326, y: 566 }, { x: 334, y: 546 }]} widths={[36, 32, 26, 16]} />
        <ellipse cx={240} cy={576} rx={60} ry={16} fill="#000000" opacity={0.12} />
      </g>

      {/* RIGHT shirt sleeve, cuff and wrist */}
      <path d="M570 930 C550 850 520 770 500 700" stroke="#E6ECF4" strokeWidth={132} fill="none" />
      <path d="M554 742 C530 728 506 730 482 746" stroke="#B7C3D3" strokeWidth={2.4} fill="none" />
      <circle cx={518} cy={738} r={4} fill="#D5DEEA" stroke="#8E9AAE" strokeWidth={1.4} />
      <path d={ribbon([{ x: 496, y: 726 }, { x: 488, y: 662 }], [74, 68])} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={2.4} />

      {/* RIGHT hand pinching the button */}
      <g transform={`translate(${-press * 1.4} ${press * 1.2})`}>
        <path
          d="M534 668 C538 636 530 602 516 580 C504 560 482 554 462 556 C442 558 428 572 426 596 C424 624 432 652 444 672 C460 698 480 710 498 710 C516 710 528 694 534 668 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M512 692 C494 668 476 642 462 618" stroke="#8A5638" strokeWidth={1.8} fill="none" opacity={0.26} />
        <path d="M498 700 C480 674 462 648 448 624" stroke="#8A5638" strokeWidth={1.6} fill="none" opacity={0.2} />
        {[
          [450, 566],
          [472, 562],
          [494, 564],
          [514, 572],
        ].map(([x, y]) => (
          <path key={x} d={`M${x - 8} ${y} C${x} ${y - 8} ${x + 10} ${y - 6} ${x + 16} ${y + 2}`} stroke="#8A5638" strokeWidth={2} fill="none" opacity={0.4} strokeLinecap="round" />
        ))}
        <Finger id={id} points={[{ x: 514, y: 568 }, { x: 492, y: 504 }, { x: 450, y: 440 }, { x: 396, y: 384 }]} widths={[25, 23, 18, 12]} />
        <Finger id={id} points={[{ x: 492, y: 564 }, { x: 478, y: 512 }, { x: 460, y: 462 }, { x: 446, y: 434 }]} widths={[26, 24, 19, 12]} />
        <Finger id={id} points={[{ x: 470, y: 566 }, { x: 460, y: 520 }, { x: 450, y: 480 }, { x: 444, y: 458 }]} widths={[24, 21, 17, 11]} />
        <Finger id={id} points={[{ x: 450, y: 574 }, { x: 444, y: 536 }, { x: 440, y: 504 }, { x: 438, y: 486 }]} widths={[21, 18, 14, 9]} />
        <Finger id={id} points={[{ x: 434, y: 620 }, { x: 412, y: 584 }, { x: 400, y: 500 }, { x: 398, y: 420 }]} widths={[36, 32, 26, 16]} />
        <ellipse cx={480} cy={576} rx={60} ry={16} fill="#000000" opacity={0.12} />
      </g>

      <rect width={720} height={900} fill={`url(#${id}-hand-vignette)`} pointerEvents="none" />
    </g>
  );
};

/* ------------------------------------------------------------------ avatar */

export const ExplorerAvatar: React.FC<ExplorerAvatarProps> = ({
  cameraAngle,
  outfit = "school_uniform",
  expression = "neutral",
  rim = COLORS.cyan,
  style,
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const palette = PALETTE[outfit];
  const { frame, enter, breathe, headSway } = useMicroMotion();

  if (cameraAngle === "hands_closeup") {
    return (
      <svg viewBox="0 0 720 900" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", overflow: "hidden", ...style }} aria-hidden>
        <Defs id={id} palette={palette} rim={rim} />
        <g transform={`translate(0 ${(1 - enter) * 22})`}>
          <HandsCloseup id={id} frame={frame} rim={rim} />
        </g>
      </svg>
    );
  }

  const isFullBody = cameraAngle === "back_walk" || cameraAngle === "side_profile";
  const viewBox = isFullBody ? "0 0 720 1000" : "0 0 720 760";

  return (
    <svg viewBox={viewBox} style={{ width: "100%", height: "100%", overflow: "visible", ...style }} aria-hidden>
      <Defs id={id} palette={palette} rim={rim} />
      <g transform={`translate(0 ${(1 - enter) * 18})`}>
        {cameraAngle === "back_walk" ? (
          <BackFigure id={id} palette={palette} outfit={outfit} frame={frame} rim={rim} />
        ) : null}
        {cameraAngle === "side_profile" ? (
          <ProfileFigure id={id} palette={palette} outfit={outfit} frame={frame} rim={rim} />
        ) : null}
        {!isFullBody ? (
          <g transform={`translate(${cameraAngle === "chest_up_3_4" ? 9 : 0} ${breathe * 0.6}) rotate(${headSway} 360 300)`}>
            <ChestBody id={id} palette={palette} outfit={outfit} rim={rim} />
            <Face id={id} frame={frame} expression={expression} threeQuarter={cameraAngle === "chest_up_3_4"} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
