import { useId } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

/**
 * ExplorerAvatar — hand-inked graphic-novel character.
 *
 * Everything anatomical (silhouettes, hair locks, collar folds, limbs, hands)
 * is built from tapered cubic/quadratic Bezier ribbons and closed paths with
 * round caps/joins. No rect primitives, no floating thumbs, no beard patches:
 * the jaw is suggested by a single soft stroke.
 *
 * Cel shading uses hard-stop linear gradients (two-tone), and rim light is
 * painted with gradient strokes instead of blur filters, so swangle stays fast.
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
  /** Rim-light colour. Cyan by default, amber in the doorway, crimson at the gate. */
  rim?: string;
  style?: React.CSSProperties;
};

const INK = "#080A0F";

type Pt = { x: number; y: number };

const n = (value: number) => Math.round(value * 10) / 10;

/**
 * A tapered ribbon through anchor points, using Catmull-Rom control points.
 * Both edges are real cubic Beziers, so limbs and hair locks read as ink.
 */
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

const PALETTE: Record<
  AvatarOutfit,
  {
    coat: string;
    coatLight: string;
    coatDeep: string;
    shirt: string;
    shirtShade: string;
    trim: string;
    pants: string;
  }
> = {
  school_uniform: {
    coat: "#171B25",
    coatLight: "#2A3040",
    coatDeep: "#0C0F16",
    shirt: "#EEF3FA",
    shirtShade: "#C3CEDD",
    trim: "#00F0FF",
    pants: "#10131B",
  },
  travel_backpack: {
    coat: "#242C26",
    coatLight: "#3A463B",
    coatDeep: "#12160F",
    shirt: "#DCE4D7",
    shirtShade: "#AFB8A5",
    trim: "#FFB800",
    pants: "#171A14",
  },
  tech_hoodie: {
    coat: "#0E1117",
    coatLight: "#1E2531",
    coatDeep: "#06080C",
    shirt: "#131720",
    shirtShade: "#0B0E14",
    trim: "#00F0FF",
    pants: "#0A0D13",
  },
};

const EXPR: Record<
  AvatarExpression,
  { browLift: number; browTilt: number; eyeOpen: number; mouth: number; jaw: number }
> = {
  neutral: { browLift: 0, browTilt: 0, eyeOpen: 1, mouth: 0, jaw: 0 },
  determined: { browLift: -4, browTilt: 5, eyeOpen: 0.86, mouth: -2, jaw: 3 },
  hurt: { browLift: -1, browTilt: -6, eyeOpen: 0.72, mouth: 4, jaw: -2 },
};

const blinkAmount = (frame: number, offset: number) => {
  const t = (frame + offset) % 90;
  if (t < 84) return 0;
  return Math.sin(((t - 84) / 6) * Math.PI) * 0.94;
};

const useMicroMotion = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 120, mass: 0.9 } });
  return {
    frame,
    enter,
    breathe: Math.sin(frame / 38) * 2.2,
    headSway: Math.sin(frame / 52 + 0.7) * 1.15,
    bobY: Math.sin(frame / 44) * 1.6,
  };
};

type GradientProps = { id: string; palette: (typeof PALETTE)[AvatarOutfit]; rim: string };

const Defs: React.FC<GradientProps> = ({ id, palette, rim }) => (
  <defs>
    {/* Cel-shaded skin: hard two-tone break at 52%. */}
    <linearGradient id={`${id}-skin`} x1="0" y1="0.1" x2="1" y2="0.9">
      <stop offset="0%" stopColor="#EDBD95" />
      <stop offset="30%" stopColor="#DC9F76" />
      <stop offset="52%" stopColor="#C58A60" />
      <stop offset="52.4%" stopColor="#A76F4A" />
      <stop offset="82%" stopColor="#8C5A39" />
      <stop offset="100%" stopColor="#71452B" />
    </linearGradient>
    <linearGradient id={`${id}-skinSoft`} x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stopColor="#F3C69D" />
      <stop offset="60%" stopColor="#D79B71" />
      <stop offset="100%" stopColor="#A46C47" />
    </linearGradient>
    <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stopColor="#2C3446" />
      <stop offset="34%" stopColor="#171C27" />
      <stop offset="62%" stopColor="#0D1119" />
      <stop offset="63%" stopColor="#0A0D13" />
      <stop offset="100%" stopColor="#05070B" />
    </linearGradient>
    <linearGradient id={`${id}-coat`} gradientUnits="userSpaceOnUse" x1="190" y1="330" x2="540" y2="700">
      <stop offset="0%" stopColor={palette.coatLight} />
      <stop offset="36%" stopColor={palette.coat} />
      <stop offset="72%" stopColor={palette.coat} />
      <stop offset="72.5%" stopColor={palette.coatDeep} />
      <stop offset="100%" stopColor="#05070A" />
    </linearGradient>
    <linearGradient id={`${id}-shirt`} x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="46%" stopColor={palette.shirt} />
      <stop offset="46.5%" stopColor={palette.shirtShade} />
      <stop offset="100%" stopColor={palette.shirtShade} />
    </linearGradient>
    <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0%" stopColor={rim} stopOpacity="0.95" />
      <stop offset="55%" stopColor={rim} stopOpacity="0.35" />
      <stop offset="100%" stopColor={rim} stopOpacity="0" />
    </linearGradient>
    <linearGradient id={`${id}-rimV`} x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stopColor={rim} stopOpacity="0.8" />
      <stop offset="70%" stopColor={rim} stopOpacity="0.18" />
      <stop offset="100%" stopColor={rim} stopOpacity="0" />
    </linearGradient>
    <radialGradient id={`${id}-eye`} cx="0.4" cy="0.32" r="0.8">
      <stop offset="0%" stopColor="#3B2A20" />
      <stop offset="42%" stopColor="#1C1712" />
      <stop offset="100%" stopColor="#0A0908" />
    </radialGradient>
  </defs>
);

type EyeProps = {
  id: string;
  x: number;
  y: number;
  open: number;
  tilt: number;
  flip?: boolean;
};

const AlmondEye: React.FC<EyeProps> = ({ id, x, y, open, tilt }) => {
  const h = 15.5 * open;
  const clip = `${id}-clip-${Math.round(x)}`;
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <clipPath id={clip}>
        <path
          d={`M${x - 31} ${y + 1} C${x - 15} ${y - h} ${x + 15} ${y - h} ${x + 31} ${y} C${x + 13} ${y + h * 0.86} ${x - 15} ${y + h * 0.8} ${x - 31} ${y + 1} Z`}
        />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <path
          d={`M${x - 32} ${y - 26} L${x + 32} ${y - 26} L${x + 32} ${y + 26} L${x - 32} ${y + 26} Z`}
          fill="#F4E7DC"
        />
        <ellipse cx={x + 1} cy={y + 2} rx={10.6} ry={12.6} fill={`url(#${id}-eye)`} />
        <ellipse cx={x + 1} cy={y + 2} rx={5.4} ry={6.6} fill="#070707" />
        <circle cx={x + 5} cy={y - 3.5} r={3.6} fill="#FFFFFF" opacity={0.96} />
        <circle cx={x - 4} cy={y + 7} r={2.1} fill="#8FE9F2" opacity={0.6} />
        <path d={`M${x - 32} ${y - 26} L${x + 32} ${y - 26} L${x + 32} ${y - 10} C${x + 6} ${y - 18} ${x - 10} ${y - 16} ${x - 32} ${y - 7} Z`} fill="#3A2418" opacity={0.28} />
      </g>
      {/* upper lash — heavy ink line */}
      <path
        d={`M${x - 33} ${y + 1} C${x - 16} ${y - h - 2} ${x + 16} ${y - h - 2} ${x + 33} ${y - 1}`}
        stroke={INK}
        strokeWidth={5.4}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${x + 14} ${y - h * 0.72} C${x + 23} ${y - h * 0.58} ${x + 29} ${y - h * 0.3} ${x + 33} ${y - 2}`}
        stroke={INK}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${x + 30} ${y + 1} l7 -4`}
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M${x - 26} ${y + h * 0.78} C${x - 10} ${y + h * 0.98} ${x + 10} ${y + h * 0.92} ${x + 24} ${y + h * 0.6}`}
        stroke={INK}
        strokeWidth={1.7}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
    </g>
  );
};

type FaceProps = {
  id: string;
  frame: number;
  expression: AvatarExpression;
  threeQuarter?: boolean;
};

/** Front / three-quarter chest-up head. */
const Face: React.FC<FaceProps> = ({ id, frame, expression, threeQuarter }) => {
  const ex = EXPR[expression];
  const blink = blinkAmount(frame, threeQuarter ? 22 : 6);
  const open = Math.max(0.06, ex.eyeOpen * (1 - blink));
  const fx = threeQuarter ? -14 : 0;
  return (
    <g transform={`translate(${fx} 0)`}>
      {/* ears */}
      <path
        d="M262 190 C244 180 236 200 240 220 C244 242 256 254 270 250 C264 232 262 210 262 190 Z"
        fill={`url(#${id}-skinSoft)`}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d="M458 190 C476 180 484 200 480 220 C476 242 464 254 450 250 C456 232 458 210 458 190 Z"
        fill={`url(#${id}-skinSoft)`}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* neck, trapezius */}
      <path
        d="M316 286 L314 344 C313 362 300 374 282 382 L438 382 C420 374 407 362 406 344 L404 286 C382 306 338 306 316 286 Z"
        fill={`url(#${id}-skin)`}
        stroke={INK}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      <path
        d="M316 300 C330 322 390 322 404 300 L404 330 C388 348 332 348 316 330 Z"
        fill="#7E4C30"
        opacity={0.32}
      />
      {/* skull */}
      <path
        d="M360 74 C298 74 264 120 262 176 C260 216 268 248 288 272 C308 298 334 314 360 316 C386 314 412 298 432 272 C452 248 460 216 458 176 C456 120 422 74 360 74 Z"
        fill={`url(#${id}-skin)`}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* cheekbone + temple cel shading */}
      <path
        d="M434 196 C444 224 438 254 424 274 C410 294 388 308 366 314 C394 292 410 262 414 230 C416 214 422 204 434 196 Z"
        fill="#8A5738"
        opacity={0.34}
      />
      <path
        d="M292 202 C286 226 288 246 296 262 C282 250 274 226 276 204 Z"
        fill="#F0C39A"
        opacity={0.28}
      />
      {/* brow shadow band */}
      <path
        d="M288 160 C308 140 338 136 352 150 C330 150 306 160 294 174 Z"
        fill="#8C5A3B"
        opacity={0.18}
      />
      {/* eyebrows — brush strokes */}
      <path
        d={`M${288} ${172 + ex.browLift} C302 ${160 + ex.browLift - ex.browTilt} 326 ${157 + ex.browLift - ex.browTilt} 342 ${166 + ex.browLift}`}
        stroke="#12151C"
        strokeWidth={7.6}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${432} ${172 + ex.browLift} C418 ${160 + ex.browLift - ex.browTilt} 394 ${157 + ex.browLift - ex.browTilt} 378 ${166 + ex.browLift}`}
        stroke="#12151C"
        strokeWidth={7.6}
        strokeLinecap="round"
        fill="none"
      />
      {/* eyes */}
      <AlmondEye id={id} x={312} y={206} open={open} tilt={-2} />
      <AlmondEye id={id} x={408} y={206} open={open} tilt={2} />
      {/* nose bridge + tip */}
      <path
        d="M360 196 C355 216 352 232 350 244"
        stroke="#8A5738"
        strokeWidth={2.6}
        strokeLinecap="round"
        opacity={0.5}
        fill="none"
      />
      <path
        d="M341 244 C349 251 357 253 365 248"
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M340 245 C336 250 336 254 340 257"
        stroke="#6E4128"
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
      <path
        d="M378 246 C382 251 382 255 378 258"
        stroke="#6E4128"
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
      {/* mouth — one clean line, no heavy upper-lip shadow */}
      <path
        d={`M332 ${282 + ex.mouth} C344 ${277 + ex.mouth} 354 ${277 + ex.mouth} 360 ${281 + ex.mouth} C366 ${277 + ex.mouth} 376 ${277 + ex.mouth} 388 ${282 + ex.mouth}`}
        stroke="#6E4130"
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M342 ${290 + ex.mouth} C352 ${295 + ex.mouth} 368 ${295 + ex.mouth} 378 ${290 + ex.mouth}`}
        stroke="#D99A86"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={0.35}
      />
      {/* single-stroke jaw shadow — no beard patch */}
      <path
        d="M296 250 C304 284 330 310 362 316"
        stroke="#6B3F28"
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        opacity={0.09}
      />
      {/* hair: cap, part, windswept locks */}
      <path
        d="M360 52 C300 52 262 96 258 156 C256 172 258 186 262 198 C258 168 268 146 282 140 C280 118 296 104 314 112 C322 92 344 86 360 100 C376 86 400 90 408 110 C428 102 444 118 442 140 C458 150 466 170 460 198 C466 184 468 166 464 150 C460 96 424 52 360 52 Z"
        fill={`url(#${id}-hair)`}
        stroke={INK}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      <path
        d="M300 118 C284 140 278 170 282 200 C286 226 296 248 306 258 C298 232 294 204 296 178 C298 152 306 132 318 120 Z"
        fill="#1A2030"
        opacity={0.85}
      />
      <path
        d={ribbon(
          [
            { x: 380, y: 92 },
            { x: 404, y: 118 },
            { x: 430, y: 150 },
            { x: 438, y: 186 },
          ],
          [34, 26, 14, 3],
        )}
        fill={`url(#${id}-hair)`}
        stroke={INK}
        strokeWidth={2.4}
      />
      <path
        d={ribbon(
          [
            { x: 350, y: 96 },
            { x: 372, y: 120 },
            { x: 392, y: 154 },
            { x: 386, y: 186 },
          ],
          [26, 20, 11, 2],
        )}
        fill="#1C2331"
        stroke={INK}
        strokeWidth={2}
      />
      <path
        d={ribbon(
          [
            { x: 326, y: 108 },
            { x: 300, y: 132 },
            { x: 292, y: 164 },
            { x: 298, y: 194 },
          ],
          [22, 16, 9, 2],
        )}
        fill="#161C28"
        stroke={INK}
        strokeWidth={2}
      />
      <path
        d={ribbon(
          [
            { x: 412, y: 104 },
            { x: 438, y: 126 },
            { x: 454, y: 164 },
            { x: 446, y: 206 },
          ],
          [20, 15, 8, 2],
        )}
        fill="#101520"
        stroke={INK}
        strokeWidth={2}
      />
      {/* temple strands over the forehead */}
      <path
        d={ribbon(
          [
            { x: 332, y: 132 },
            { x: 312, y: 148 },
            { x: 300, y: 170 },
          ],
          [14, 8, 1.5],
        )}
        fill="#121722"
      />
      <path
        d={ribbon(
          [
            { x: 396, y: 128 },
            { x: 416, y: 144 },
            { x: 424, y: 168 },
          ],
          [12, 7, 1.5],
        )}
        fill="#121722"
      />
      {/* rim light along the crown / cheek */}
      <path
        d="M262 168 C264 132 276 104 296 86"
        stroke={`url(#${id}-rim)`}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M452 210 C456 238 446 266 428 286"
        stroke={`url(#${id}-rimV)`}
        strokeWidth={4.4}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};

const ChestBody: React.FC<{
  id: string;
  palette: (typeof PALETTE)[AvatarOutfit];
  outfit: AvatarOutfit;
  rim: string;
}> = ({ id, palette, outfit, rim }) => (
  <g>
    {/* torso */}
    <path
      d="M300 322 C252 334 214 358 198 400 C182 444 174 512 172 594 L172 760 L548 760 L548 594 C546 512 538 444 522 400 C506 358 468 334 420 322 C408 344 384 356 360 356 C336 356 312 344 300 322 Z"
      fill={`url(#${id}-coat)`}
      stroke={INK}
      strokeWidth={4}
      strokeLinejoin="round"
    />

    {/* open shirt front, visible through the jacket */}
    {outfit === "school_uniform" ? (
      <g>
        <path
          d="M318 344 C326 392 342 430 360 456 C378 430 394 392 402 344 L410 760 L310 760 Z"
          fill={`url(#${id}-shirt)`}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M360 456 L360 760" stroke="#A7B4C6" strokeWidth={2.6} />
        {[520, 604, 688].map((y) => (
          <circle key={y} cx={360} cy={y} r={9} fill="#E8EEF6" stroke="#8E9AAE" strokeWidth={2.2} />
        ))}
        <path d="M320 340 L360 402 L334 424 L298 366 Z" fill="#FFFFFF" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
        <path d="M400 340 L360 402 L386 424 L422 366 Z" fill={palette.shirt} stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
        <path d="M320 340 L360 402" stroke={palette.trim} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
        <path d="M322 342 C338 360 382 360 398 342" stroke="#8E9AAE" strokeWidth={2.2} fill="none" opacity={0.8} />
        {/* jacket lapels folded back over the shirt */}
        <path
          d="M306 324 C296 370 298 420 316 464 L344 442 C328 408 322 366 326 336 Z"
          fill={palette.coatLight}
          stroke={INK}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
        <path
          d="M414 324 C424 370 422 420 404 464 L376 442 C392 408 398 366 394 336 Z"
          fill={palette.coatLight}
          stroke={INK}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
        <path d="M310 344 C302 386 304 424 318 456" stroke={palette.trim} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.45} />
      </g>
    ) : null}

    {/* sleeves, inked off the torso */}
    <path
      d="M206 396 C188 444 178 512 176 594 L176 760 L262 760 C254 640 238 520 246 412 Z"
      fill={palette.coatDeep}
      stroke={INK}
      strokeWidth={3.4}
      strokeLinejoin="round"
    />
    <path
      d="M514 396 C532 444 542 512 544 594 L544 760 L458 760 C466 640 482 520 474 412 Z"
      fill={palette.coatDeep}
      stroke={INK}
      strokeWidth={3.4}
      strokeLinejoin="round"
    />
    <path d="M238 470 C230 530 226 600 228 664" stroke="#05070B" strokeWidth={2.2} opacity={0.5} fill="none" />
    <path d="M482 470 C490 530 494 600 492 664" stroke="#05070B" strokeWidth={2.2} opacity={0.35} fill="none" />

    {/* hoodie hood + drawstrings */}
    {outfit === "tech_hoodie" ? (
      <g>
        <path
          d="M306 326 C292 362 294 400 312 424 C330 444 390 444 408 424 C426 400 428 362 414 326 C402 350 382 362 360 362 C338 362 318 350 306 326 Z"
          fill={palette.coatLight}
          stroke={INK}
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
        <path d="M340 410 C338 470 336 520 340 566" stroke={palette.trim} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.85} />
        <path d="M380 410 C382 470 384 520 380 566" stroke={palette.trim} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.55} />
        <circle cx={340} cy={572} r={5.5} fill={palette.trim} opacity={0.9} />
        <circle cx={380} cy={572} r={5.5} fill={palette.trim} opacity={0.6} />
        <path d="M306 404 C318 420 348 430 360 430" stroke={rim} strokeWidth={2.6} fill="none" opacity={0.4} strokeLinecap="round" />
      </g>
    ) : null}

    {/* backpack straps */}
    {outfit === "travel_backpack" ? (
      <g>
        <path
          d="M300 320 C286 380 288 470 300 560 L336 552 C326 466 326 382 338 336 Z"
          fill="#7A5A2E"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path
          d="M420 320 C436 380 434 470 422 560 L386 552 C396 466 396 382 382 336 Z"
          fill="#6B4E27"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M306 400 L332 396 M310 430 L334 426" stroke="#FFB800" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
        <path d="M414 400 L388 396 M410 430 L386 426" stroke="#FFB800" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      </g>
    ) : null}

    {/* folds and seams */}
    <path d="M206 700 C280 716 440 716 514 700" stroke="#05070B" strokeWidth={3} fill="none" opacity={0.4} />
    <path d="M240 470 C252 512 252 560 244 606" stroke="#05070B" strokeWidth={2} fill="none" opacity={0.32} />
    <path d="M480 470 C468 512 468 560 476 606" stroke="#05070B" strokeWidth={2} fill="none" opacity={0.32} />
    <path d="M300 322 C282 366 280 416 296 470" stroke="#05070B" strokeWidth={2.4} fill="none" opacity={0.45} />
    <path d="M420 322 C438 366 440 416 424 470" stroke="#05070B" strokeWidth={2.4} fill="none" opacity={0.3} />

    {/* rim light */}
    <path
      d="M300 322 C252 334 214 358 198 400 C182 444 174 512 172 594"
      stroke={`url(#${id}-rim)`}
      strokeWidth={6}
      strokeLinecap="round"
      fill="none"
      opacity={0.9}
    />
    <path d="M420 322 C468 334 506 358 522 400" stroke={rim} strokeWidth={2.8} strokeLinecap="round" fill="none" opacity={0.35} />
  </g>
);

type FullBodyProps = {
  id: string;
  palette: (typeof PALETTE)[AvatarOutfit];
  outfit: AvatarOutfit;
  frame: number;
  rim: string;
  profile?: boolean;
};

/** Full-body back view, walking away, with hip/shoulder counter-rotation. */
const FullBodyBack: React.FC<FullBodyProps> = ({ id, palette, outfit, frame, rim }) => {
  const stride = Math.sin(frame * 0.22);
  const bob = Math.abs(Math.cos(frame * 0.22)) * 3.4;
  const hem = Math.sin(frame * 0.22 + 0.9) * 8;
  const shoulderRot = stride * 2.4;
  const hipRot = -stride * 3.1;

  const leg = (side: -1 | 1, swing: number) => {
    const hip = { x: 360 + side * 38, y: 600 };
    const knee = { x: hip.x + swing * 18 + side * 6, y: 770 - Math.abs(swing) * 8 };
    const ankle = { x: hip.x + swing * 46, y: 912 - Math.max(0, swing) * 24 };
    const toe = { x: ankle.x + 26 * side + swing * 8, y: ankle.y + 28 - Math.max(0, swing) * 10 };
    return (
      <g key={side}>
        <path
          d={ribbon([hip, knee, ankle, toe], [82, 62, 44, 30])}
          fill={side === 1 ? palette.pants : "#07090D"}
          stroke={INK}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        <path
          d={`M${ankle.x + 16 * side} ${ankle.y - 4} C${ankle.x + 34 * side} ${ankle.y + 6} ${ankle.x + 54 * side} ${ankle.y + 18} ${ankle.x + 44 * side} ${ankle.y + 38} C${ankle.x + 22 * side} ${ankle.y + 48} ${ankle.x - 22 * side} ${ankle.y + 46} ${ankle.x - 26 * side} ${ankle.y + 30} C${ankle.x - 26 * side} ${ankle.y + 14} ${ankle.x - 2 * side} ${ankle.y + 2} ${ankle.x + 16 * side} ${ankle.y - 4} Z`}
          fill="#0B0E14"
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path
          d={`M${ankle.x - 20 * side} ${ankle.y + 26} C${ankle.x} ${ankle.y + 34} ${ankle.x + 24 * side} ${ankle.y + 34} ${ankle.x + 42 * side} ${ankle.y + 20}`}
          stroke={side === 1 ? rim : "#2A3242"}
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
        <path
          d={`M${knee.x - 20} ${knee.y - 2} C${knee.x - 6} ${knee.y + 10} ${knee.x + 8} ${knee.y + 10} ${knee.x + 22} ${knee.y - 4}`}
          stroke="#05070B"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.7}
        />
        <path
          d={`M${hip.x - 22} ${hip.y + 40} C${hip.x - 8} ${hip.y + 52} ${knee.x} ${knee.y - 24} ${knee.x + 12} ${knee.y - 30}`}
          stroke="#05070B"
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
          opacity={0.4}
        />
      </g>
    );
  };

  const arm = (side: -1 | 1, swing: number) => {
    const shoulder = { x: 360 + side * 150, y: 398 };
    const elbow = { x: 360 + side * 164 + swing * 8, y: 536 };
    const wrist = { x: 360 + side * 152 - swing * 18, y: 668 };
    const hand = { x: wrist.x - side * 3, y: wrist.y + 42 };
    return (
      <g key={side}>
        <path
          d={ribbon([shoulder, elbow, wrist], [58, 47, 37])}
          fill={`url(#${id}-coat)`}
        />
        {/* armhole seam */}
        {/* cuff */}
        <path
          d={`M${wrist.x - 22} ${wrist.y - 8} C${wrist.x - 6} ${wrist.y + 2} ${wrist.x + 12} ${wrist.y} ${wrist.x + 22} ${wrist.y - 12}`}
          stroke={side === 1 ? rim : "#3A4354"}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
        <path
          d={ribbon([{ x: wrist.x, y: wrist.y + 2 }, { x: hand.x, y: hand.y - 6 }], [34, 24])}
          fill={`url(#${id}-skinSoft)`}
          stroke={INK}
          strokeWidth={2.8}
        />
        <path
          d={ribbon([{ x: wrist.x - 8, y: wrist.y + 18 }, { x: wrist.x - 4, y: wrist.y + 48 }], [11, 3])}
          fill={`url(#${id}-skinSoft)`}
          stroke={INK}
          strokeWidth={2}
        />
        <path
          d={`M${wrist.x - 20} ${wrist.y + 26} C${wrist.x - 6} ${wrist.y + 34} ${wrist.x + 8} ${wrist.y + 34} ${wrist.x + 20} ${wrist.y + 24}`}
          stroke="#7A4A2E"
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
        />
      </g>
    );
  };

  return (
    <g transform={`translate(0 ${bob})`}>
      <ellipse cx={360} cy={946} rx={172} ry={22} fill="#000000" opacity={0.55} />
      <g transform={`rotate(${hipRot} 360 660)`}>
        {leg(-1, Math.sin(frame * 0.22 + Math.PI) * 0.9)}
        {leg(1, stride * 0.9)}
      </g>

      <g transform={`rotate(${shoulderRot} 360 360)`}>
        {/* coat */}
        <path
          d={`M312 334 C286 336 246 344 220 362 C200 376 190 404 186 440 C182 488 186 540 192 580 C196 606 200 616 ${206 + hem * 0.4} 632 C244 648 476 648 ${514 + hem * 0.4} 632 C520 616 524 606 528 580 C534 540 538 488 534 440 C530 404 520 376 500 362 C474 344 434 336 408 334 C400 350 382 358 360 358 C338 358 320 350 312 334 Z`}
          fill={`url(#${id}-coat)`}
          stroke={INK}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* waist and hem structure */}
        <path d="M360 360 L360 636" stroke="#05070B" strokeWidth={2.4} opacity={0.5} />
        <path d={`M${310 + hem} 628 C346 ${638 + hem * 0.4} 386 ${638 + hem * 0.4} ${414 + hem} 626`} stroke="#05070B" strokeWidth={2.6} opacity={0.55} fill="none" />
        <path d="M232 430 C222 480 220 540 226 592" stroke="#05070B" strokeWidth={2.2} opacity={0.32} fill="none" />
        <path d="M488 430 C498 480 500 540 494 592" stroke="#05070B" strokeWidth={2.2} opacity={0.32} fill="none" />
        <path d="M288 372 C280 404 276 436 282 468" stroke="#05070B" strokeWidth={2} opacity={0.28} fill="none" />
        <path
          d={`M312 334 C286 336 246 344 220 362 C200 376 190 404 186 440 C182 488 186 540 192 580 C196 606 200 616 ${206 + hem * 0.4} 632`}
          stroke={`url(#${id}-rim)`}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
        />
        <path d="M408 334 C474 344 520 376 534 440" stroke={rim} strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.35} />

        {outfit === "travel_backpack" ? (
          <g>
            <path d="M244 344 C228 404 230 490 244 580" stroke="#7A5A2E" strokeWidth={30} strokeLinecap="round" fill="none" />
            <path d="M476 344 C492 404 490 490 476 580" stroke="#6B4E27" strokeWidth={30} strokeLinecap="round" fill="none" />
            <path d="M244 344 C228 404 230 490 244 580" stroke={INK} strokeWidth={3.6} strokeLinecap="round" fill="none" opacity={0.7} />
            <path d="M476 344 C492 404 490 490 476 580" stroke={INK} strokeWidth={3.6} strokeLinecap="round" fill="none" opacity={0.7} />
            <path d="M252 430 L280 426 M256 456 L282 452" stroke="#FFB800" strokeWidth={3} strokeLinecap="round" opacity={0.65} />
          </g>
        ) : null}

        {arm(-1, stride)}
        {arm(1, -stride)}

        {/* neck */}
        <path
          d="M322 266 L320 316 C320 336 336 344 360 344 C384 344 400 336 400 316 L398 266 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3.2}
        />
        <path d="M322 280 C338 300 384 300 398 280 L398 308 C382 324 338 324 322 308 Z" fill="#7E4C30" opacity={0.4} />

        {/* hair mass, full coverage from behind */}
        <g transform="translate(360 182) scale(0.76) translate(-360 -200)">
        <path
          d="M360 76 C294 76 252 124 248 188 C244 234 256 276 280 298 C300 314 330 320 360 320 C390 320 420 314 440 298 C464 276 476 234 472 188 C468 124 426 76 360 76 Z"
          fill={`url(#${id}-hair)`}
          stroke={INK}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* strand ink, painted on top — never gaps */}
        <path
          d={ribbon(
            [
              { x: 352, y: 120 },
              { x: 330, y: 178 },
              { x: 334, y: 244 },
              { x: 352, y: 306 },
            ],
            [16, 12, 8, 2],
          )}
          fill="#1C2331"
          opacity={0.85}
        />
        <path
          d={ribbon(
            [
              { x: 386, y: 112 },
              { x: 410, y: 174 },
              { x: 404, y: 242 },
              { x: 384, y: 304 },
            ],
            [14, 11, 7, 2],
          )}
          fill="#141A26"
          opacity={0.8}
        />
        <path
          d={ribbon(
            [
              { x: 306, y: 168 },
              { x: 288, y: 224 },
              { x: 296, y: 282 },
            ],
            [12, 8, 2],
          )}
          fill="#0F141E"
        />
        <path
          d={ribbon(
            [
              { x: 428, y: 156 },
              { x: 444, y: 216 },
              { x: 434, y: 280 },
            ],
            [11, 7, 2],
          )}
          fill="#0F141E"
        />
        <path
          d="M256 182 C258 136 288 100 330 88"
          stroke={`url(#${id}-rim)`}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
        />
        </g>
        {/* nape shading */}
        <path d="M318 292 C340 308 380 308 402 292 C394 318 326 318 318 292 Z" fill="#05070B" opacity={0.55} />
      </g>
    </g>
  );
};

/** Side profile, walking; ribcage leans forward, hair trails. */
const FullBodyProfile: React.FC<FullBodyProps> = ({ id, palette, outfit, frame, rim }) => {
  const stride = Math.sin(frame * 0.22);
  const bob = Math.abs(Math.cos(frame * 0.22)) * 3.4;
  const coatLift = Math.sin(frame * 0.22 + 0.4) * 5;

  const leg = (swing: number, far: boolean) => {
    const hip = { x: 372, y: 610 };
    const knee = { x: hip.x + swing * 28 + 8, y: 740 - Math.max(0, swing) * 14 };
    const ankle = { x: hip.x + swing * 62 + 22, y: 870 - Math.max(0, swing) * 30 };
    const toe = { x: ankle.x + 38, y: ankle.y + 26 - Math.max(0, swing) * 10 };
    return (
      <g opacity={far ? 0.85 : 1}>
        <path
          d={ribbon([hip, knee, ankle, toe], [58, 42, 30, 22])}
          fill={far ? "#080A0E" : palette.pants}
          stroke={INK}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        <path
          d={ribbon([ankle, { x: toe.x + 6, y: toe.y + 2 }], [34, 18])}
          fill="#0B0E14"
          stroke={INK}
          strokeWidth={2.8}
        />
        <path
          d={`M${ankle.x - 10} ${ankle.y + 6} C${ankle.x + 12} ${ankle.y} ${toe.x} ${toe.y - 4} ${toe.x + 6} ${toe.y + 2}`}
          stroke={far ? "#2C3444" : rim}
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
      </g>
    );
  };

  const arm = (swing: number, far: boolean) => {
    const shoulder = { x: 384, y: 356 };
    const elbow = { x: 384 + swing * 34, y: 474 };
    const wrist = { x: 400 + swing * 58, y: 584 };
    return (
      <g opacity={far ? 0.75 : 1}>
        <path
          d={ribbon([shoulder, elbow, wrist], [70, 52, 38])}
          fill={`url(#${id}-coat)`}
          stroke={INK}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        <path
          d={ribbon([wrist, { x: wrist.x + 18, y: wrist.y + 34 }], [34, 24])}
          fill={`url(#${id}-skinSoft)`}
          stroke={INK}
          strokeWidth={2.6}
        />
        <path
          d={ribbon([{ x: wrist.x + 4, y: wrist.y + 12 }, { x: wrist.x + 12, y: wrist.y + 40 }], [10, 4])}
          fill={`url(#${id}-skinSoft)`}
          stroke={INK}
          strokeWidth={2}
        />
        <path
          d={`M${wrist.x - 18} ${wrist.y} C${wrist.x - 4} ${wrist.y + 8} ${wrist.x + 12} ${wrist.y + 6} ${wrist.x + 22} ${wrist.y - 4}`}
          stroke={far ? "#202635" : rim}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
      </g>
    );
  };

  return (
    <g transform={`translate(0 ${bob})`}>
      <ellipse cx={392} cy={926} rx={176} ry={24} fill="#000000" opacity={0.5} />
      {leg(-stride, true)}
      {/* torso in profile */}
      <path
        d={`M322 296 C292 314 280 348 278 392 C276 430 280 478 286 522 C290 556 294 590 ${300 + coatLift} 620 C326 634 404 642 444 624 C458 604 462 566 464 522 C468 470 464 412 454 372 C444 334 420 306 388 296 Z`}
        fill={`url(#${id}-coat)`}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* coat opening / collar folds */}
      <path d="M386 316 C398 352 402 404 396 452 C392 490 388 522 386 556" stroke="#05070B" strokeWidth={2.6} fill="none" opacity={0.6} />
      <path d="M330 300 C348 330 360 352 362 382" stroke={INK} strokeWidth={2.8} fill="none" opacity={0.7} />
      <path d="M448 370 C456 404 460 452 456 500" stroke="#05070B" strokeWidth={2.2} fill="none" opacity={0.4} />
      <path
        d={`M330 300 C300 316 288 348 286 392 C284 430 286 478 292 522`}
        stroke={`url(#${id}-rim)`}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      {outfit === "travel_backpack" ? (
        <g>
          <path d="M352 322 C412 330 444 372 448 440 C452 488 444 528 432 560" stroke="#7A5A2E" strokeWidth={30} strokeLinecap="round" fill="none" />
          <path d="M352 322 C412 330 444 372 448 440" stroke="#FFB800" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.5} />
          <path d="M406 388 C390 420 388 452 396 486" stroke="#3B2E19" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
        </g>
      ) : null}
      {outfit === "tech_hoodie" ? (
        <path d="M352 300 C400 302 430 328 442 366 C424 348 400 336 372 334 Z" fill={palette.coatLight} stroke={INK} strokeWidth={3} />
      ) : null}
      {/* head in profile */}
      <g transform="rotate(-2 380 190) translate(380 180) scale(1.12) translate(-380 -180)">
        {/* neck */}
        <path
          d="M326 220 L324 258 C324 274 338 282 360 282 C382 282 394 274 394 258 L392 220 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3.2}
        />
        <path d="M326 234 C340 252 380 252 392 234 L392 258 C380 274 340 274 326 258 Z" fill="#7E4C30" opacity={0.35} />
        {/* face */}
        <path
          d="M306 132 C316 106 342 94 370 98 C398 102 418 122 424 148 C430 154 436 164 438 174 C440 182 434 188 428 192 C434 198 432 206 422 210 C412 216 406 222 396 224 C382 240 358 242 340 232 C320 221 308 198 306 172 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3.8}
          strokeLinejoin="round"
        />
        <path d="M310 170 C318 158 330 156 340 162 C330 166 322 174 318 184 Z" fill="#8A5738" opacity={0.22} />
        {/* ear */}
        <path
          d="M334 158 C322 158 318 176 324 190 C330 202 342 204 348 196 C342 184 338 170 334 158 Z"
          fill={`url(#${id}-skinSoft)`}
          stroke={INK}
          strokeWidth={2.6}
        />
        <path d="M334 166 C329 170 329 180 334 186" stroke="#7A4A2E" strokeWidth={1.8} fill="none" opacity={0.7} />
        {/* brow + eye */}
        <path d="M366 146 C378 134 396 134 406 144" stroke="#12151C" strokeWidth={7.2} strokeLinecap="round" fill="none" />
        <AlmondEye id={id} x={390} y={168} open={0.95} tilt={-3} />
        {/* nose, lips, chin */}
        <path d="M424 160 C432 168 436 178 434 186" stroke="#8A5738" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.5} />
        <path d="M424 190 C432 194 430 202 420 204" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        <path d="M400 212 C410 212 418 210 424 204" stroke="#5E3320" strokeWidth={3} strokeLinecap="round" fill="none" />
        <path d="M402 220 C410 224 418 222 424 216" stroke="#8A4A38" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.65} />
        <path d="M312 190 C326 216 352 228 386 226" stroke="#6B3F28" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.16} />
        {/* windswept hair */}
        <path
          d="M412 138 C418 106 398 82 366 80 C324 78 294 102 288 142 C282 178 288 214 306 238 C298 204 302 170 318 148 C332 130 352 120 374 120 C392 120 406 128 412 140 Z"
          fill={`url(#${id}-hair)`}
          stroke={INK}
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
        <path
          d="M410 132 C404 146 408 158 420 166"
          fill="none"
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path d={ribbon([{ x: 386, y: 96 }, { x: 338, y: 104 }, { x: 300, y: 132 }, { x: 286, y: 178 }], [32, 25, 15, 3])} fill={`url(#${id}-hair)`} stroke={INK} strokeWidth={2.2} />
        <path d={ribbon([{ x: 366, y: 108 }, { x: 328, y: 122 }, { x: 300, y: 154 }, { x: 290, y: 198 }], [22, 16, 9, 2])} fill="#1B2130" stroke={INK} strokeWidth={2} />
        <path d={ribbon([{ x: 400, y: 110 }, { x: 366, y: 120 }, { x: 346, y: 144 }], [18, 10, 2])} fill="#101520" />
        <path d="M410 136 C410 112 398 94 380 88" stroke={`url(#${id}-rim)`} strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M302 178 C298 160 302 140 314 126" stroke={rim} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.35} />
      </g>
      {arm(-stride, true)}
      {leg(stride, false)}
      {arm(stride, false)}
    </g>
  );
};

/** Tight close-up: fingers fastening a crisp white school shirt button. */
const HandsCloseup: React.FC<{ id: string; palette: (typeof PALETTE)[AvatarOutfit]; frame: number; rim: string }> = ({
  id,
  palette,
  frame,
}) => {
  const press = Math.sin(frame * 0.1) * 3;
  const buttonY = 516;
  return (
    <g>
      {/* ambient */}
      <ellipse cx={210} cy={240} rx={420} ry={320} fill="#FFB800" opacity={0.1} />
      <ellipse cx={560} cy={720} rx={380} ry={300} fill={palette.trim} opacity={0.1} />
      {/* shirt chest */}
      <path
        d="M120 230 C210 196 510 196 600 230 L640 900 L80 900 Z"
        fill={`url(#${id}-shirt)`}
        stroke={INK}
        strokeWidth={4}
      />
      {/* collar wings */}
      <path d="M300 214 C326 262 344 300 356 336 L268 356 C282 302 290 256 300 214 Z" fill="#FFFFFF" stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M420 214 C394 262 376 300 364 336 L452 356 C438 302 430 256 420 214 Z" fill={palette.shirt} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M300 220 C314 260 330 296 344 328 L320 336 C310 298 304 260 300 220 Z" fill={palette.shirtShade} opacity={0.55} />
      <path d="M330 340 C344 350 356 352 366 344" stroke="#8E9AAE" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      {/* placket */}
      <path d="M330 336 L390 336 L398 900 L322 900 Z" fill="#FFFFFF" opacity={0.55} />
      <path d="M330 340 L330 900" stroke="#A7B4C6" strokeWidth={3} />
      <path d="M390 340 L390 900" stroke="#A7B4C6" strokeWidth={3} />
      <path d="M336 340 L336 900" stroke="#DCE4EF" strokeWidth={2} opacity={0.9} />
      {/* chest folds */}
      <path d="M170 300 C190 400 180 520 150 640" stroke="#B9C5D6" strokeWidth={3.4} fill="none" opacity={0.8} strokeLinecap="round" />
      <path d="M540 300 C520 420 532 540 566 650" stroke="#B9C5D6" strokeWidth={3.4} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M210 560 C260 590 300 600 330 596" stroke="#C6D1DF" strokeWidth={2.6} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M520 620 C480 650 430 660 400 656" stroke="#C6D1DF" strokeWidth={2.6} fill="none" opacity={0.6} strokeLinecap="round" />
      {/* buttons */}
      {[600, 690, 780].map((y) => (
        <g key={y}>
          <circle cx={360} cy={y} r={15} fill="#E8EEF6" stroke="#8E9AAE" strokeWidth={2.6} />
          <circle cx={354} cy={y - 4} r={2.6} fill="#7C8798" />
          <circle cx={366} cy={y - 4} r={2.6} fill="#7C8798" />
          <circle cx={354} cy={y + 5} r={2.6} fill="#7C8798" />
          <circle cx={366} cy={y + 5} r={2.6} fill="#7C8798" />
        </g>
      ))}
      {/* collar rim light */}
      <path d="M420 214 C394 262 376 300 364 336" stroke={palette.trim} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.55} />

      {/* left hand, holding the placket */}
      <g transform={`translate(${16 + press * 0.3} ${-10 + press * 0.4})`}>
        <path
          d="M116 872 C158 838 196 780 220 728 C238 690 224 656 192 646 C160 636 132 660 124 696 C114 742 96 800 78 840 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        <path d={ribbon([{ x: 192, y: 664 }, { x: 250, y: 640 }, { x: 306, y: 626 }], [32, 28, 22])} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={ribbon([{ x: 180, y: 700 }, { x: 238, y: 676 }, { x: 292, y: 662 }], [30, 25, 20])} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={ribbon([{ x: 170, y: 736 }, { x: 222, y: 714 }, { x: 270, y: 702 }], [28, 22, 17])} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={ribbon([{ x: 162, y: 770 }, { x: 206, y: 752 }, { x: 246, y: 742 }], [24, 19, 14])} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
        <path d={ribbon([{ x: 170, y: 690 }, { x: 226, y: 672 }, { x: 280, y: 660 }], [38, 30, 20])} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={310} cy={624} r={9} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.4} />
        <circle cx={296} cy={660} r={8} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={2.4} />
        <circle cx={274} cy={700} r={7.5} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.4} />
        <circle cx={250} cy={740} r={7} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={2.4} />
        <circle cx={284} cy={658} r={8} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.4} />
        <path d="M196 684 C212 690 226 692 238 690" stroke="#7A4A2E" strokeWidth={2} fill="none" opacity={0.55} strokeLinecap="round" />
        <path d="M186 720 C200 726 214 728 226 726" stroke="#7A4A2E" strokeWidth={2} fill="none" opacity={0.45} strokeLinecap="round" />
        {/* cuff */}
        <path d="M104 872 C146 850 196 852 232 872 L216 942 C176 928 136 928 96 940 Z" fill={palette.shirt} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
        <path d="M122 888 C158 874 194 876 218 888" stroke="#B9C5D6" strokeWidth={2.2} fill="none" />
      </g>

      {/* right hand, pinching the button */}
      <g transform={`translate(${press - 22} -14)`}>
        <path
          d="M604 852 C560 820 520 760 492 706 C472 668 486 632 520 622 C552 612 580 636 588 672 C598 718 620 780 640 820 Z"
          fill={`url(#${id}-skin)`}
          stroke={INK}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        <path d={ribbon([{ x: 520, y: 640 }, { x: 470, y: 590 }, { x: 420, y: 548 }, { x: 380, y: 522 }], [34, 30, 26, 20])} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={ribbon([{ x: 548, y: 690 }, { x: 480, y: 620 }, { x: 414, y: 556 }], [42, 34, 24])} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={ribbon([{ x: 536, y: 676 }, { x: 492, y: 640 }, { x: 456, y: 628 }], [32, 26, 20])} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={ribbon([{ x: 548, y: 712 }, { x: 508, y: 682 }, { x: 478, y: 672 }], [30, 24, 18])} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={ribbon([{ x: 560, y: 748 }, { x: 526, y: 724 }, { x: 500, y: 714 }], [26, 20, 15])} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
        <circle cx={376} cy={518} r={10} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.4} />
        <circle cx={452} cy={626} r={8} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.4} />
        <circle cx={476} cy={670} r={7.5} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={2.4} />
        <circle cx={498} cy={712} r={7} fill={`url(#${id}-skinSoft)`} stroke={INK} strokeWidth={2.4} />
        <circle cx={410} cy={552} r={9} fill={`url(#${id}-skin)`} stroke={INK} strokeWidth={2.4} />
        <path d="M510 660 C522 668 530 676 532 686" stroke="#7A4A2E" strokeWidth={2} fill="none" opacity={0.55} strokeLinecap="round" />
        <path d="M520 700 C532 708 540 716 542 726" stroke="#7A4A2E" strokeWidth={2} fill="none" opacity={0.45} strokeLinecap="round" />
        {/* cuff */}
        <path d="M616 856 C574 834 524 836 488 856 L504 926 C544 912 584 912 624 924 Z" fill={palette.shirt} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
        <path d="M598 872 C562 858 526 860 502 872" stroke="#B9C5D6" strokeWidth={2.2} fill="none" />
      </g>

      {/* the button being fastened */}
      <g transform={`translate(0 ${press})`}>
        <circle cx={360} cy={buttonY} r={19} fill="#F7FAFE" stroke="#7C8798" strokeWidth={3} />
        <circle cx={353} cy={buttonY - 5} r={3} fill="#6B7688" />
        <circle cx={367} cy={buttonY - 5} r={3} fill="#6B7688" />
        <circle cx={353} cy={buttonY + 6} r={3} fill="#6B7688" />
        <circle cx={367} cy={buttonY + 6} r={3} fill="#6B7688" />
        <path d="M345 396 C352 388 368 388 374 396" stroke={palette.trim} strokeWidth={2.6} fill="none" opacity={0.45} strokeLinecap="round" />
      </g>
      {/* buttonhole */ }
      <path d={`M352 ${buttonY + 40} C360 ${buttonY + 36} 368 ${buttonY + 40} 368 ${buttonY + 46}`} stroke="#8E9AAE" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
};

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
  const { frame, enter, breathe, headSway, bobY } = useMicroMotion();

  if (cameraAngle === "hands_closeup") {
    return (
      <svg viewBox="0 0 720 900" style={{ width: "100%", height: "100%", overflow: "visible", ...style }} aria-hidden>
        <Defs id={id} palette={palette} rim={rim} />
        <HandsCloseup id={id} palette={palette} frame={frame} rim={rim} />
      </svg>
    );
  }

  const isFullBody = cameraAngle === "back_walk" || cameraAngle === "side_profile";
  const viewBox = isFullBody ? "0 0 720 1000" : "0 0 720 760";

  return (
    <svg viewBox={viewBox} style={{ width: "100%", height: "100%", overflow: "visible", ...style }} aria-hidden>
      <Defs id={id} palette={palette} rim={rim} />
      <g transform={`translate(0 ${(1 - enter) * 16 + bobY * 0.3})`}>
        {cameraAngle === "back_walk" ? (
          <FullBodyBack id={id} palette={palette} outfit={outfit} frame={frame} rim={rim} />
        ) : null}
        {cameraAngle === "side_profile" ? (
          <FullBodyProfile id={id} palette={palette} outfit={outfit} frame={frame} rim={rim} />
        ) : null}
        {!isFullBody ? (
          <g transform={`translate(${cameraAngle === "chest_up_3_4" ? 10 : 0} ${breathe * 0.5}) rotate(${headSway} 360 300)`}>
            <Face id={id} frame={frame} expression={expression} threeQuarter={cameraAngle === "chest_up_3_4"} />
            <ChestBody id={id} palette={palette} outfit={outfit} rim={rim} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
