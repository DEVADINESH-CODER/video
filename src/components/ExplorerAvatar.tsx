import { useId } from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

/**
 * ExplorerAvatar — cinematic waist-up portrait of the series lead.
 *
 * Stylized comic / modern-anime rendering built from layered SVG:
 *  - 7.5-head adult proportions, broad shoulders, articulated neck and hands
 *  - cel-shaded South Asian face: jawline, cheekbones, nose bridge, stubble,
 *    almond eyes with iris gradients and highlights
 *  - layered hoodie fabric with folds, seams, drawstrings and rim light
 *  - pose-specific staging (crossed arms, backpack strap, holo-keyboard,
 *    hand-to-forehead, relaxed profile)
 *  - frame-driven breathing, blinks every ~90 frames, micro head movement and
 *    jaw/lip interpolation for lip-sync
 */

export type AvatarPose =
  | "standing"
  | "walking_train"
  | "coding"
  | "stressed_desk"
  | "together";

export type AvatarExpression = "intense" | "determined" | "hurt" | "hopeful";

export type ExplorerAvatarProps = {
  pose: AvatarPose;
  expression: AvatarExpression;
  isSpeaking: boolean;
};

export const AVATAR_VIEWBOX = { width: 720, height: 760 } as const;

type Pt = { x: number; y: number };

const CX = 360;
const EYE_Y = 194;
const EYE_L = 318;
const EYE_R = 402;

const n = (value: number) => Math.round(value * 10) / 10;

const limb = (a: Pt, b: Pt, wA: number, wB: number, bow = 0) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (a.x + b.x) / 2 + nx * bow;
  const my = (a.y + b.y) / 2 + ny * bow;
  return [
    `M${n(a.x + nx * wA * 0.5)} ${n(a.y + ny * wA * 0.5)}`,
    `Q${n(mx + nx * wA * 0.42)} ${n(my + ny * wA * 0.42)} ${n(b.x + nx * wB * 0.5)} ${n(b.y + ny * wB * 0.5)}`,
    `L${n(b.x - nx * wB * 0.5)} ${n(b.y - ny * wB * 0.5)}`,
    `Q${n(mx - nx * wB * 0.42)} ${n(my - ny * wB * 0.42)} ${n(a.x - nx * wA * 0.5)} ${n(a.y - ny * wA * 0.5)}`,
    "Z",
  ].join(" ");
};

type FaceConfig = {
  browOuterY: number;
  browInnerY: number;
  browLift: number;
  eyeOpen: number;
  cornerY: number;
  centerY: number;
  lipFull: number;
  nostril: number;
};

const FACE: Record<AvatarExpression, FaceConfig> = {
  intense: {
    browOuterY: 160,
    browInnerY: 175,
    browLift: 0,
    eyeOpen: 0.8,
    cornerY: 263,
    centerY: 262,
    lipFull: 0.9,
    nostril: 1,
  },
  determined: {
    browOuterY: 158,
    browInnerY: 169,
    browLift: 0,
    eyeOpen: 1,
    cornerY: 259,
    centerY: 262,
    lipFull: 1,
    nostril: 0.9,
  },
  hurt: {
    browOuterY: 167,
    browInnerY: 157,
    browLift: 0,
    eyeOpen: 0.72,
    cornerY: 267,
    centerY: 259,
    lipFull: 0.9,
    nostril: 0.7,
  },
  hopeful: {
    browOuterY: 155,
    browInnerY: 152,
    browLift: 1,
    eyeOpen: 1.06,
    cornerY: 253,
    centerY: 264,
    lipFull: 1.1,
    nostril: 0.8,
  },
};

type PoseScene = {
  bodySkew: number;
  headTilt: number;
  headX: number;
  headY: number;
  eyeShiftX: number;
  eyeShiftY: number;
  breathAmp: number;
  wind: number;
};

const POSE: Record<AvatarPose, PoseScene> = {
  standing: {
    bodySkew: -1.4,
    headTilt: -2.2,
    headX: -2,
    headY: 0,
    eyeShiftX: 3.2,
    eyeShiftY: 0,
    breathAmp: 2.4,
    wind: 0.15,
  },
  walking_train: {
    bodySkew: 3.4,
    headTilt: -7,
    headX: -7,
    headY: 1,
    eyeShiftX: -5,
    eyeShiftY: 0.5,
    breathAmp: 1.8,
    wind: 1,
  },
  coding: {
    bodySkew: 1.2,
    headTilt: 4.5,
    headX: -2,
    headY: 13,
    eyeShiftX: 0,
    eyeShiftY: 2.6,
    breathAmp: 1.4,
    wind: 0,
  },
  stressed_desk: {
    bodySkew: 1,
    headTilt: -7,
    headX: -2,
    headY: 9,
    eyeShiftX: -1,
    eyeShiftY: 3.4,
    breathAmp: 1.6,
    wind: 0,
  },
  together: {
    bodySkew: 0.8,
    headTilt: 6.5,
    headX: 4,
    headY: 0,
    eyeShiftX: 4.4,
    eyeShiftY: -0.4,
    breathAmp: 2,
    wind: 0.25,
  },
};

const finger = (
  x: number,
  y: number,
  width: number,
  height: number,
  rot: number,
  skin: string,
  line: string,
) => (
  <g transform={`rotate(${rot} ${x + width / 2} ${y})`}>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={width / 2}
      fill={`url(#${skin})`}
      stroke={line}
      strokeWidth="1.3"
      strokeOpacity="0.5"
    />
    <path
      d={`M${x + 2} ${y + height * 0.52} Q${x + width / 2} ${y + height * 0.62} ${x + width - 2} ${y + height * 0.52}`}
      stroke={line}
      strokeWidth="1.1"
      fill="none"
      opacity="0.4"
    />
  </g>
);

export const ExplorerAvatar: React.FC<ExplorerAvatarProps> = ({
  pose,
  expression,
  isSpeaking,
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${name}-${uid}`;

  const scene = POSE[pose];
  const face = FACE[expression];

  /* ── life ─────────────────────────────────────────────────────────── */
  const breath = Math.sin(frame * 0.052) * scene.breathAmp;
  const microX = Math.sin(frame * 0.021 + 0.7) * 2.6;
  const microY = Math.sin(frame * 0.017 + 1.4) * 2;
  const microRot = Math.sin(frame * 0.013 + 0.3) * 0.9;

  const blinkPeriod = 88 + (pose.length % 5) * 4;
  const blinkFrame = (frame + pose.length * 11) % blinkPeriod;
  const blink = blinkFrame < 5 ? Math.sin((blinkFrame / 5) * Math.PI) : 0;
  const eyeOpen = Math.max(0.06, face.eyeOpen * (1 - blink * 0.94));

  const jaw = isSpeaking
    ? 0.15 + 0.85 * Math.abs(Math.sin(frame * 0.62))
    : 0.04 + 0.03 * Math.sin(frame * 0.05);
  const wind = Math.sin(frame * 0.075) * scene.wind;

  const headRot = scene.headTilt + microRot;
  const headTranslate = `translate(${n(scene.headX + microX)} ${n(scene.headY + microY + breath * 0.4)}) rotate(${n(headRot)} ${CX} 300)`;

  const lightMode =
    pose === "stressed_desk"
      ? "crimson"
      : pose === "together"
        ? "amber"
        : "cyan";

  const rimGradient =
    lightMode === "crimson"
      ? id("rimCrimson")
      : lightMode === "amber"
        ? id("rimAmber")
        : id("rimCyan");

  /* ── eyes ─────────────────────────────────────────────────────────── */
  const eyeShiftX = scene.eyeShiftX + Math.sin(frame * 0.016 + 0.9) * 1.2;
  const eyeShiftY = scene.eyeShiftY + Math.sin(frame * 0.011) * 0.6;

  const eyePath = (side: "left" | "right") => {
    const inner = side === "left" ? 347 : 373;
    const outer = side === "left" ? 290 : 430;
    const upperX = side === "left" ? 306 : 414;
    const lowerX = side === "left" ? 330 : 390;
    return [
      `M${inner} ${EYE_Y}`,
      `C${side === "left" ? 334 : 386} ${n(EYE_Y - 14 * eyeOpen)} ${upperX} ${n(EYE_Y - 18 * eyeOpen)} ${outer} ${EYE_Y}`,
      `C${lowerX} ${n(EYE_Y + 11 * eyeOpen)} ${side === "left" ? 302 : 418} ${n(EYE_Y + 13 * eyeOpen)} ${inner} ${EYE_Y}`,
      "Z",
    ].join(" ");
  };

  const drawEye = (side: "left" | "right") => {
    const cx = side === "left" ? EYE_L : EYE_R;
    const clip = id(`eyeClip${side}`);
    const iris = id("iris");
    const sclera = id("sclera");
    const cxPath = eyePath(side);
    const upperLash = [
      `M${side === "left" ? 347 : 373} ${EYE_Y}`,
      `C${side === "left" ? 334 : 386} ${n(EYE_Y - 14 * eyeOpen)} ${side === "left" ? 306 : 414} ${n(EYE_Y - 18 * eyeOpen)} ${side === "left" ? 290 : 430} ${EYE_Y}`,
    ].join(" ");
    return (
      <g key={side}>
        <defs>
          <clipPath id={clip}>
            <path d={cxPath} />
          </clipPath>
        </defs>
        {/* socket + crease */}
        <path
          d={`M${cx - 34} ${EYE_Y - 12} C${cx - 22} ${EYE_Y - 30} ${cx + 20} ${EYE_Y - 31} ${cx + 33} ${EYE_Y - 12}`}
          stroke="#6F422C"
          strokeWidth="10"
          fill="none"
          opacity="0.16"
          strokeLinecap="round"
        />
        <g transform={`translate(0 ${EYE_Y}) scale(1 ${1 - blink * 0.9}) translate(0 ${-EYE_Y})`}>
          <path d={cxPath} fill={`url(#${sclera})`} />
          <g clipPath={`url(#${clip})`}>
            <circle
              cx={cx + eyeShiftX}
              cy={EYE_Y + eyeShiftY}
              r="15"
              fill={`url(#${iris})`}
            />
            <circle
              cx={cx + eyeShiftX}
              cy={EYE_Y + eyeShiftY}
              r="15"
              fill="none"
              stroke="#1A0E09"
              strokeWidth="2.2"
              opacity="0.9"
            />
            <circle
              cx={cx + eyeShiftX}
              cy={EYE_Y + eyeShiftY}
              r="6.4"
              fill="#080506"
            />
            <circle
              cx={cx + eyeShiftX - 5.2}
              cy={EYE_Y + eyeShiftY - 5.4}
              r="4"
              fill="#FFF8F0"
              opacity="0.95"
            />
            <circle
              cx={cx + eyeShiftX + 5}
              cy={EYE_Y + eyeShiftY + 4.4}
              r="2.1"
              fill={COLORS.cyan}
              opacity="0.9"
            />
            <path
              d={`M${cx - 18} ${EYE_Y - 12} Q${cx} ${EYE_Y - 20} ${cx + 18} ${EYE_Y - 12}`}
              stroke="#2A1A12"
              strokeWidth="4"
              opacity="0.18"
              fill="none"
            />
          </g>
        </g>
        {/* upper lash line + wing */}
        <path
          d={upperLash}
          stroke="#120E10"
          strokeWidth="5.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${side === "left" ? 292 : 428} ${EYE_Y - 1} L${side === "left" ? 282 : 438} ${EYE_Y - 7}`}
          stroke="#120E10"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* lower lid light */}
        <path
          d={`M${cx - 28} ${EYE_Y + 9} Q${cx} ${EYE_Y + 17} ${cx + 28} ${EYE_Y + 9}`}
          stroke="#F0C39A"
          strokeWidth="1.8"
          fill="none"
          opacity="0.5"
        />
        {/* crease */}
        <path
          d={`M${cx - 30} ${EYE_Y - 18} Q${cx} ${EYE_Y - 30} ${cx + 28} ${EYE_Y - 17}`}
          stroke="#855034"
          strokeWidth="2.4"
          fill="none"
          opacity="0.55"
        />
        <path
          d={`M${side === "left" ? 296 : 424} ${EYE_Y - 8} Q${side === "left" ? 302 : 418} ${EYE_Y - 4} ${side === "left" ? 300 : 420} ${EYE_Y + 2}`}
          stroke="#6E3F29"
          strokeWidth="2"
          fill="none"
          opacity="0.55"
        />
      </g>
    );
  };

  /* ── brows ────────────────────────────────────────────────────────── */
  const browLift = face.browLift * 1.5 + Math.sin(frame * 0.03) * 1.2;
  const drawBrow = (side: "left" | "right") => {
    const outerX = side === "left" ? 286 : 434;
    const innerX = side === "left" ? 348 : 372;
    const outerY = face.browOuterY - browLift;
    const innerY = face.browInnerY - browLift;
    const arch = side === "left" ? -7 : -7;
    return (
      <g key={side}>
        <path
          d={[
            `M${outerX} ${outerY}`,
            `C${side === "left" ? 306 : 414} ${outerY + arch} ${side === "left" ? 330 : 390} ${innerY + arch} ${innerX} ${innerY}`,
            `L${innerX + (side === "left" ? -2 : 2)} ${innerY + 12}`,
            `C${side === "left" ? 328 : 392} ${innerY + 10} ${side === "left" ? 306 : 414} ${outerY + 12} ${outerX + (side === "left" ? 2 : -2)} ${outerY + 11}`,
            "Z",
          ].join(" ")}
          fill={`url(#${id("hairBase")})`}
        />
        <path
          d={`M${outerX + 6} ${outerY + 4} Q${side === "left" ? 318 : 402} ${outerY + 1} ${innerX - (side === "left" ? 6 : -6)} ${innerY + 3}`}
          stroke="#39404F"
          strokeWidth="1.6"
          fill="none"
          opacity="0.55"
        />
      </g>
    );
  };

  /* ── mouth ────────────────────────────────────────────────────────── */
  const cornerY = face.cornerY + jaw * 3;
  const centerY = face.centerY + jaw * 3;
  const opening = 2 + jaw * 9;

  /* ── hair helpers ─────────────────────────────────────────────────── */
  const windLift = wind * 5;

  return (
    <svg
      viewBox={`0 0 ${AVATAR_VIEWBOX.width} ${AVATAR_VIEWBOX.height}`}
      width="100%"
      height="100%"
      style={{ overflow: "visible", display: "block" }}
      role="img"
      aria-label={`Explorer, ${pose.replace("_", " ")} pose, ${expression} expression`}
    >
      <defs>
        <linearGradient id={id("skin")} x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#EDC29A" />
          <stop offset="38%" stopColor="#D9A379" />
          <stop offset="72%" stopColor="#C0875E" />
          <stop offset="100%" stopColor="#9C6746" />
        </linearGradient>
        <linearGradient id={id("skinNeck")} x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#B97E55" />
          <stop offset="100%" stopColor="#8B5638" />
        </linearGradient>
        <linearGradient id={id("hairBase")} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#232936" />
          <stop offset="45%" stopColor="#12151D" />
          <stop offset="100%" stopColor="#080A0F" />
        </linearGradient>
        <linearGradient id={id("hoodie")} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#242835" />
          <stop offset="30%" stopColor="#181B24" />
          <stop offset="72%" stopColor="#14161D" />
          <stop offset="100%" stopColor="#0C0E13" />
        </linearGradient>
        <linearGradient id={id("hoodieDark")} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#12151C" />
          <stop offset="100%" stopColor="#080A0E" />
        </linearGradient>
        <linearGradient id={id("sleeveShade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A4152" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={id("tee")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B9FEFF" />
          <stop offset="45%" stopColor={COLORS.cyan} />
          <stop offset="100%" stopColor="#007A88" />
        </linearGradient>
        <linearGradient id={id("lipUpper")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9A5A50" />
          <stop offset="100%" stopColor="#7C403C" />
        </linearGradient>
        <linearGradient id={id("lipLower")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B06A5B" />
          <stop offset="65%" stopColor="#9C584D" />
          <stop offset="100%" stopColor="#7A3E38" />
        </linearGradient>
        <radialGradient id={id("iris")} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#B98552" />
          <stop offset="38%" stopColor="#8B5A31" />
          <stop offset="74%" stopColor="#4A2B17" />
          <stop offset="100%" stopColor="#170D07" />
        </radialGradient>
        <linearGradient id={id("sclera")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9C7B5" />
          <stop offset="55%" stopColor="#F5EADF" />
          <stop offset="100%" stopColor="#E3D0BD" />
        </linearGradient>
        <linearGradient
          id={id("rimCyan")}
          gradientUnits="userSpaceOnUse"
          x1="270"
          y1="46"
          x2="300"
          y2="600"
        >
          <stop offset="0%" stopColor={COLORS.cyan} stopOpacity="0.95" />
          <stop offset="55%" stopColor={COLORS.cyan} stopOpacity="0.35" />
          <stop offset="100%" stopColor={COLORS.cyan} stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={id("rimCrimson")}
          gradientUnits="userSpaceOnUse"
          x1="360"
          y1="30"
          x2="360"
          y2="560"
        >
          <stop offset="0%" stopColor={COLORS.crimson} stopOpacity="0.95" />
          <stop offset="60%" stopColor={COLORS.crimson} stopOpacity="0.4" />
          <stop offset="100%" stopColor={COLORS.crimson} stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={id("rimAmber")}
          gradientUnits="userSpaceOnUse"
          x1="520"
          y1="70"
          x2="470"
          y2="640"
        >
          <stop offset="0%" stopColor={COLORS.amber} stopOpacity="0.9" />
          <stop offset="58%" stopColor={COLORS.amber} stopOpacity="0.35" />
          <stop offset="100%" stopColor={COLORS.amber} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("stubbleFade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#241C25" stopOpacity="0" />
          <stop offset="55%" stopColor="#241C25" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#241C25" stopOpacity="0.72" />
        </linearGradient>
        <pattern
          id={id("stubble")}
          width="5.5"
          height="5.5"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.3" cy="1.4" r="0.7" fill="#1C1520" />
          <circle cx="3.9" cy="3.3" r="0.55" fill="#2B2230" />
          <circle cx="3.2" cy="0.8" r="0.4" fill="#302636" />
        </pattern>
        <filter id={id("glow")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={id("soft")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id={id("figureShadow")} x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow
            dx="0"
            dy="22"
            stdDeviation="26"
            floodColor="#000000"
            floodOpacity="0.6"
          />
        </filter>
        <clipPath id={id("beard")}>
          <path d="M298 226 C302 258 320 282 346 295 C352 298 368 298 374 295 C400 282 418 256 424 226 C420 254 402 282 368 298 C334 292 304 258 298 226 Z" />
          <path d="M330 270 C342 262 378 262 390 270 C390 288 378 300 360 300 C342 300 330 288 330 270 Z" />
        </clipPath>
      </defs>

      <g filter={`url(#${id("figureShadow")})`}>
        <g transform={`rotate(${scene.bodySkew} ${CX} 760)`}>
          {pose === "walking_train" ? (
            <>
              {/* backpack body behind the far shoulder */}
              <path
                d="M196 372 C178 400 172 470 182 540 C190 596 208 630 232 640 L262 600 C238 560 230 500 238 440 C244 400 254 378 264 368 Z"
                fill="#0B0E14"
                stroke="#202633"
                strokeWidth="2"
              />
              <path
                d="M204 420 C198 470 200 520 212 560"
                stroke="#2A3140"
                strokeWidth="3"
                fill="none"
                opacity="0.7"
              />
            </>
          ) : null}

          {/* hood behind neck */}
          <path
            d="M292 352 C282 322 304 296 332 288 L360 284 L388 288 C416 296 438 322 428 352 C414 382 306 382 292 352 Z"
            fill={`url(#${id("hoodieDark")})`}
            stroke="#232936"
            strokeWidth="2"
          />

          {/* neck + trapezius */}
          <path
            d="M322 268 C320 302 318 322 310 340 C290 348 268 360 250 378 C288 382 316 370 330 352 L390 352 C404 370 432 382 470 378 C452 360 430 348 410 340 C402 322 400 302 398 268 Z"
            fill={`url(#${id("skinNeck")})`}
          />
          {/* sternocleidomastoid + jaw shadow */}
          <path
            d="M330 292 C334 318 344 338 360 350 C376 338 386 318 390 292 C382 318 374 330 360 336 C346 330 338 318 330 292 Z"
            fill="#6F422C"
            opacity="0.45"
          />
          <path
            d="M318 340 C340 358 380 358 402 340 C392 364 328 364 318 340 Z"
            fill="#633A27"
            opacity="0.5"
          />
          {/* collarbones */}
          <path
            d="M318 360 C334 368 348 371 360 371 M402 360 C386 368 372 371 360 371"
            stroke="#E3B189"
            strokeWidth="2.4"
            fill="none"
            opacity="0.35"
            strokeLinecap="round"
          />

          {/* hoodie body */}
          <path
            d="M360 346 C304 348 250 366 214 398 C180 428 168 472 162 518 L152 618 C146 668 148 718 150 760 L570 760 C572 718 574 668 568 618 L558 518 C552 472 540 428 506 398 C470 366 416 350 360 346 Z"
            fill={`url(#${id("hoodie")})`}
            stroke="#272E3C"
            strokeWidth="2.6"
          />
          {/* shoulder seams */}
          <path
            d="M298 366 C266 380 232 402 210 432 M422 366 C454 380 488 402 510 432"
            stroke="#2E3545"
            strokeWidth="2.2"
            fill="none"
          />
          {/* chest folds */}
          <g stroke="#07090D" fill="none" strokeLinecap="round" opacity="0.5">
            <path d="M262 470 C286 496 290 540 276 582" strokeWidth="4" />
            <path d="M458 470 C436 498 432 540 446 584" strokeWidth="4" />
            <path d="M320 560 C344 578 378 578 402 560" strokeWidth="3" />
            <path d="M238 640 C266 660 286 700 288 742" strokeWidth="4" />
            <path d="M482 640 C454 660 434 700 432 742" strokeWidth="4" />
            <path d="M356 610 L356 700" strokeWidth="2.4" opacity="0.7" />
          </g>
          {/* fabric highlights */}
          <g stroke="#495468" fill="none" strokeLinecap="round" opacity="0.32">
            <path d="M246 470 C264 494 268 526 262 556" strokeWidth="2.4" />
            <path d="M474 470 C456 494 452 526 458 556" strokeWidth="2.4" />
            <path d="M330 570 C348 582 372 582 390 570" strokeWidth="2" />
          </g>
          {/* tech chest seam */}
          <path
            d="M300 430 C286 500 284 570 292 640"
            stroke="#333C4E"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M300 462 L318 462"
            stroke={COLORS.cyan}
            strokeWidth="2"
            opacity="0.75"
          />
          <rect
            x="296"
            y="474"
            width="10"
            height="26"
            rx="2"
            fill="#0B0E14"
            stroke="#344054"
            strokeWidth="1.4"
          />
          <circle cx="301" cy="487" r="2" fill={COLORS.cyan} opacity="0.9" />

          {/* hood collar */}
          <path
            d="M300 354 C316 388 404 388 420 354 C446 362 458 384 454 404 C420 430 300 430 266 404 C262 384 274 362 300 354 Z"
            fill={`url(#${id("hoodieDark")})`}
            stroke="#2B3343"
            strokeWidth="2.4"
          />
          <path
            d="M286 372 C300 404 420 404 434 372"
            stroke="#394357"
            strokeWidth="2"
            fill="none"
            opacity="0.65"
          />
          {/* cyan tee in the neckline */}
          <path
            d="M322 368 C334 400 386 400 398 368 L412 382 C400 424 320 424 308 382 Z"
            fill={`url(#${id("tee")})`}
          />
          <path
            d="M322 368 C334 400 386 400 398 368 L412 382 C400 424 320 424 308 382 Z"
            fill={COLORS.cyan}
            opacity="0.25"
            filter={`url(#${id("glow")})`}
          />
          {/* drawstrings */}
          <path
            d="M332 398 C326 438 322 478 326 514 M388 398 C394 438 398 478 394 514"
            stroke="#7E899C"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="322" y="512" width="9" height="20" rx="3" fill="#9BA7BA" />
          <rect x="390" y="512" width="9" height="20" rx="3" fill="#9BA7BA" />
          <rect
            x="322.5"
            y="522"
            width="8"
            height="9"
            rx="2"
            fill={COLORS.cyan}
            opacity="0.8"
          />
          <rect
            x="390.5"
            y="522"
            width="8"
            height="9"
            rx="2"
            fill={COLORS.cyan}
            opacity="0.8"
          />

          {/* rim light along the shoulders */}
          <path
            d="M214 398 C188 424 172 468 166 514"
            stroke={rimGradient}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            filter={`url(#${id("glow")})`}
          />
          <path
            d="M506 398 C534 424 548 470 556 516"
            stroke={rimGradient}
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* ── arms ──────────────────────────────────────────────────── */}
          {pose === "standing" ? (
            <g>
              {/* upper arms */}
              <circle cx="196" cy="470" r="46" fill={`url(#${id("hoodie")})`} />
              <circle cx="524" cy="470" r="46" fill={`url(#${id("hoodie")})`} />
              <path
                d={limb({ x: 210, y: 430 }, { x: 180, y: 592 }, 98, 78, -10)}
                fill={`url(#${id("hoodie")})`}
                stroke="#252C39"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 510, y: 430 }, { x: 540, y: 592 }, 98, 78, 10)}
                fill={`url(#${id("hoodie")})`}
                stroke="#252C39"
                strokeWidth="2"
              />
              {/* right forearm (lower) */}
              <path
                d={limb({ x: 540, y: 598 }, { x: 286, y: 636 }, 68, 58, -14)}
                fill={`url(#${id("hoodie")})`}
                stroke="#242B38"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 540, y: 598 }, { x: 286, y: 636 }, 68, 58, -14)}
                fill={`url(#${id("sleeveShade")})`}
              />
              {/* left forearm (upper) */}
              <path
                d={limb({ x: 180, y: 588 }, { x: 458, y: 572 }, 70, 58, 12)}
                fill={`url(#${id("hoodie")})`}
                stroke="#2A3242"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 180, y: 588 }, { x: 458, y: 572 }, 70, 58, 12)}
                fill={`url(#${id("sleeveShade")})`}
              />
              {/* fold lines */}
              <g stroke="#080A0F" fill="none" opacity="0.55" strokeLinecap="round">
                <path d="M196 520 C206 544 206 566 198 584" strokeWidth="3.4" />
                <path d="M516 520 C506 544 506 566 514 584" strokeWidth="3.4" />
                <path d="M236 600 C300 592 368 586 430 578" strokeWidth="3" />
                <path d="M320 622 C380 626 436 620 494 606" strokeWidth="3" />
              </g>
              <g stroke="#454F63" fill="none" opacity="0.3" strokeLinecap="round">
                <path d="M212 536 C220 556 220 570 214 582" strokeWidth="2" />
                <path d="M500 536 C492 556 492 570 498 582" strokeWidth="2" />
              </g>
              {/* wrist watch */}
              <path
                d="M404 578 C416 570 432 574 436 586 L410 596 Z"
                fill="#0B0E14"
                stroke="#2C3545"
                strokeWidth="1.6"
              />
              <rect
                x="410"
                y="576"
                width="16"
                height="12"
                rx="2"
                fill={COLORS.cyan}
                opacity="0.7"
              />
              {/* left hand gripping right bicep */}
              <g transform="translate(474 566) rotate(14)">
                <path
                  d="M-34 -18 C-18 -30 16 -30 30 -14 C42 0 38 24 22 34 C6 44 -18 38 -30 24 C-40 12 -42 -6 -34 -18 Z"
                  fill={`url(#${id("skin")})`}
                  stroke="#8F5B3D"
                  strokeWidth="1.4"
                  strokeOpacity="0.55"
                />
                {finger(-30, 18, 13, 46, -16, id("skin"), "#8F5B3D")}
                {finger(-16, 24, 13, 52, -6, id("skin"), "#8F5B3D")}
                {finger(-2, 26, 13, 52, 3, id("skin"), "#8F5B3D")}
                {finger(12, 22, 12, 46, 12, id("skin"), "#8F5B3D")}
                <path
                  d="M-30 -12 C-18 -4 -12 10 -14 26"
                  stroke="#8F5B3D"
                  strokeWidth="1.4"
                  fill="none"
                  opacity="0.55"
                />
              </g>
              {/* right hand tucked under the left forearm */}
              <g transform="translate(300 632) rotate(-6)">
                <path
                  d="M-30 -14 C-14 -24 12 -24 26 -10 C36 4 30 24 14 30 C-4 36 -24 28 -32 14 C-38 2 -38 -6 -30 -14 Z"
                  fill={`url(#${id("skinNeck")})`}
                  stroke="#7E4C33"
                  strokeWidth="1.4"
                  strokeOpacity="0.5"
                />
                {finger(-24, 16, 12, 34, -14, id("skinNeck"), "#7E4C33")}
                {finger(-11, 20, 12, 38, -5, id("skinNeck"), "#7E4C33")}
                {finger(2, 20, 12, 38, 3, id("skinNeck"), "#7E4C33")}
              </g>
            </g>
          ) : null}

          {pose === "walking_train" ? (
            <g>
              {/* diagonal backpack strap */}
              <path
                d="M252 372 L476 760 L536 760 L312 372 Z"
                fill="#0B0E14"
                stroke="#222938"
                strokeWidth="2"
              />
              <path
                d="M268 390 L470 738"
                stroke="#2F3848"
                strokeWidth="2.4"
                strokeDasharray="3 7"
                opacity="0.8"
              />
              <path
                d="M316 470 L382 470 L398 506 L326 506 Z"
                fill="#10141C"
                stroke="#2D3646"
                strokeWidth="2"
              />
              <rect
                x="330"
                y="480"
                width="50"
                height="8"
                rx="3"
                fill={COLORS.cyan}
                opacity="0.55"
              />
              {/* far arm */}
              <path
                d={limb({ x: 196, y: 448 }, { x: 178, y: 632 }, 86, 66, -8)}
                fill={`url(#${id("hoodieDark")})`}
                stroke="#1F2531"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 178, y: 632 }, { x: 166, y: 744 }, 64, 52, -6)}
                fill={`url(#${id("hoodieDark")})`}
                stroke="#1F2531"
                strokeWidth="2"
              />
              {/* near arm, hand holding the strap */}
              <circle cx="520" cy="470" r="44" fill={`url(#${id("hoodie")})`} />
              <path
                d={limb({ x: 512, y: 438 }, { x: 548, y: 610 }, 96, 74, 10)}
                fill={`url(#${id("hoodie")})`}
                stroke="#262E3C"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 548, y: 610 }, { x: 386, y: 542 }, 70, 56, -8)}
                fill={`url(#${id("hoodie")})`}
                stroke="#262E3C"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 548, y: 610 }, { x: 386, y: 542 }, 70, 56, -8)}
                fill={`url(#${id("sleeveShade")})`}
              />
              <g stroke="#080A0F" fill="none" opacity="0.5" strokeLinecap="round">
                <path d="M530 520 C540 552 542 576 538 592" strokeWidth="3.2" />
                <path d="M424 562 C462 570 504 582 540 596" strokeWidth="3" />
              </g>
              {/* gripping hand */}
              <g transform="translate(382 540) rotate(-24)">
                <path
                  d="M-28 -20 C-10 -34 18 -30 30 -12 C40 4 32 26 14 34 C-4 42 -26 34 -34 18 C-40 6 -38 -10 -28 -20 Z"
                  fill={`url(#${id("skin")})`}
                  stroke="#8F5B3D"
                  strokeWidth="1.4"
                  strokeOpacity="0.55"
                />
                {finger(-28, 8, 13, 38, -22, id("skin"), "#8F5B3D")}
                {finger(-14, 12, 13, 44, -8, id("skin"), "#8F5B3D")}
                {finger(0, 12, 13, 44, 4, id("skin"), "#8F5B3D")}
                {finger(14, 8, 12, 38, 16, id("skin"), "#8F5B3D")}
              </g>
              {/* far hand */}
              <g transform="translate(160 740) rotate(4)">
                <ellipse cx="0" cy="0" rx="26" ry="34" fill={`url(#${id("skinNeck")})`} />
                {finger(-22, 22, 11, 34, -10, id("skinNeck"), "#7E4C33")}
                {finger(-9, 26, 11, 38, -3, id("skinNeck"), "#7E4C33")}
                {finger(4, 26, 11, 36, 4, id("skinNeck"), "#7E4C33")}
              </g>
            </g>
          ) : null}

          {pose === "coding" ? (
            <g>
              {/* shoulders / upper arms */}
              <circle cx="212" cy="468" r="46" fill={`url(#${id("hoodie")})`} />
              <circle cx="508" cy="468" r="46" fill={`url(#${id("hoodie")})`} />
              <path
                d={limb({ x: 224, y: 440 }, { x: 244, y: 610 }, 98, 76, -8)}
                fill={`url(#${id("hoodie")})`}
                stroke="#262E3C"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 496, y: 440 }, { x: 476, y: 610 }, 98, 76, 8)}
                fill={`url(#${id("hoodie")})`}
                stroke="#262E3C"
                strokeWidth="2"
              />
              {/* forearms reaching down to the holographic keys */}
              <path
                d={limb({ x: 244, y: 606 }, { x: 318, y: 712 }, 70, 56, -4)}
                fill={`url(#${id("hoodie")})`}
                stroke="#2A3242"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 476, y: 606 }, { x: 402, y: 712 }, 70, 56, 4)}
                fill={`url(#${id("hoodie")})`}
                stroke="#2A3242"
                strokeWidth="2"
              />
              <g stroke="#080A0F" fill="none" opacity="0.5" strokeLinecap="round">
                <path d="M232 528 C242 558 246 584 246 600" strokeWidth="3.2" />
                <path d="M488 528 C478 558 474 584 474 600" strokeWidth="3.2" />
                <path d="M268 660 C292 680 312 696 324 708" strokeWidth="3" />
                <path d="M452 660 C428 680 408 696 396 708" strokeWidth="3" />
              </g>
              {/* hands */}
              <g transform="translate(318 722) rotate(-3)">
                <path
                  d="M-30 -22 C-12 -34 18 -32 32 -14 C42 2 36 26 18 34 C0 42 -24 34 -34 18 C-42 6 -40 -12 -30 -22 Z"
                  fill={`url(#${id("skin")})`}
                  stroke="#8F5B3D"
                  strokeWidth="1.4"
                  strokeOpacity="0.55"
                />
                {finger(-30, 6, 12, 52, -14, id("skin"), "#8F5B3D")}
                {finger(-17, 10, 12, 58, -4, id("skin"), "#8F5B3D")}
                {finger(-4, 12, 12, 58, 4, id("skin"), "#8F5B3D")}
                {finger(9, 8, 11, 50, 12, id("skin"), "#8F5B3D")}
                <path
                  d="M-30 -6 C-16 4 -10 18 -12 34"
                  stroke="#8F5B3D"
                  strokeWidth="1.4"
                  fill="none"
                  opacity="0.5"
                />
              </g>
              <g transform="translate(402 714) rotate(4)">
                <path
                  d="M-30 -22 C-12 -34 18 -32 32 -14 C42 2 36 26 18 34 C0 42 -24 34 -34 18 C-42 6 -40 -12 -30 -22 Z"
                  fill={`url(#${id("skin")})`}
                  stroke="#8F5B3D"
                  strokeWidth="1.4"
                  strokeOpacity="0.55"
                />
                {finger(-30, 6, 12, 50, -12, id("skin"), "#8F5B3D")}
                {finger(-17, 10, 12, 56, -3, id("skin"), "#8F5B3D")}
                {finger(-4, 12, 12, 56, 5, id("skin"), "#8F5B3D")}
                {finger(9, 8, 11, 48, 13, id("skin"), "#8F5B3D")}
              </g>
            </g>
          ) : null}

          {pose === "stressed_desk" ? (
            <g>
              {/* left arm folded low */}
              <circle cx="208" cy="470" r="44" fill={`url(#${id("hoodieDark")})`} />
              <path
                d={limb({ x: 216, y: 442 }, { x: 188, y: 614 }, 94, 72, -8)}
                fill={`url(#${id("hoodieDark")})`}
                stroke="#1F2531"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 188, y: 614 }, { x: 322, y: 648 }, 68, 54, -8)}
                fill={`url(#${id("hoodieDark")})`}
                stroke="#1F2531"
                strokeWidth="2"
              />
              <g transform="translate(340 654) rotate(10)">
                <ellipse cx="0" cy="0" rx="25" ry="30" fill={`url(#${id("skinNeck")})`} />
                {finger(-22, 18, 11, 34, -8, id("skinNeck"), "#7E4C33")}
                {finger(-9, 22, 11, 36, 0, id("skinNeck"), "#7E4C33")}
                {finger(4, 20, 11, 34, 8, id("skinNeck"), "#7E4C33")}
              </g>
              {/* right arm raised to the forehead */}
              <circle cx="520" cy="452" r="44" fill={`url(#${id("hoodieDark")})`} />
              <path
                d={limb({ x: 514, y: 430 }, { x: 598, y: 438 }, 94, 74, 4)}
                fill={`url(#${id("hoodieDark")})`}
                stroke="#1F2531"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 598, y: 438 }, { x: 430, y: 196 }, 70, 52, -14)}
                fill={`url(#${id("hoodieDark")})`}
                stroke="#252C39"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 598, y: 438 }, { x: 430, y: 196 }, 70, 52, -14)}
                fill={`url(#${id("sleeveShade")})`}
              />
              <g stroke="#080A0F" fill="none" opacity="0.5" strokeLinecap="round">
                <path d="M214 528 C224 560 224 586 218 604" strokeWidth="3.2" />
                <path d="M536 500 C560 486 580 468 594 448" strokeWidth="3" />
                <path d="M560 380 C520 340 476 300 442 250" strokeWidth="3" />
              </g>
            </g>
          ) : null}

          {pose === "together" ? (
            <g>
              <circle cx="202" cy="468" r="44" fill={`url(#${id("hoodie")})`} />
              <circle cx="518" cy="468" r="44" fill={`url(#${id("hoodie")})`} />
              <path
                d={limb({ x: 212, y: 440 }, { x: 188, y: 622 }, 94, 70, -8)}
                fill={`url(#${id("hoodie")})`}
                stroke="#262E3C"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 188, y: 622 }, { x: 176, y: 748 }, 66, 54, -4)}
                fill={`url(#${id("hoodie")})`}
                stroke="#262E3C"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 508, y: 440 }, { x: 532, y: 622 }, 94, 70, 8)}
                fill={`url(#${id("hoodie")})`}
                stroke="#262E3C"
                strokeWidth="2"
              />
              <path
                d={limb({ x: 532, y: 622 }, { x: 544, y: 748 }, 66, 54, 4)}
                fill={`url(#${id("hoodie")})`}
                stroke="#262E3C"
                strokeWidth="2"
              />
              <g stroke="#080A0F" fill="none" opacity="0.45" strokeLinecap="round">
                <path d="M200 530 C210 562 210 590 202 612" strokeWidth="3" />
                <path d="M520 530 C510 562 510 590 518 612" strokeWidth="3" />
              </g>
              <g transform="translate(174 738) rotate(6)">
                <ellipse cx="0" cy="0" rx="26" ry="34" fill={`url(#${id("skin")})`} />
                {finger(-23, 22, 11, 40, -8, id("skin"), "#8F5B3D")}
                {finger(-10, 26, 11, 44, -2, id("skin"), "#8F5B3D")}
                {finger(3, 26, 11, 42, 5, id("skin"), "#8F5B3D")}
              </g>
              <g transform="translate(546 738) rotate(-6)">
                <ellipse cx="0" cy="0" rx="26" ry="34" fill={`url(#${id("skin")})`} />
                {finger(-23, 22, 11, 40, -8, id("skin"), "#8F5B3D")}
                {finger(-10, 26, 11, 44, -2, id("skin"), "#8F5B3D")}
                {finger(3, 26, 11, 42, 5, id("skin"), "#8F5B3D")}
              </g>
            </g>
          ) : null}

          {/* ── head ─────────────────────────────────────────────────── */}
          <g transform={headTranslate}>
            {/* hair mass behind the face */}
            <path
              d="M360 42 C292 42 252 88 256 160 C259 202 268 230 280 252 C290 234 288 214 292 196 C288 172 290 150 300 132 C316 104 340 96 360 96 C384 96 408 108 422 134 C432 156 432 180 428 202 C432 220 432 236 442 252 C456 226 464 198 464 166 C468 90 426 42 360 42 Z"
              fill={`url(#${id("hairBase")})`}
            />
            {/* ears */}
            <g>
              <path
                d="M286 176 C270 168 258 182 262 204 C265 222 274 236 286 238 C294 238 296 226 294 210 Z"
                fill={`url(#${id("skin")})`}
                stroke="#8F5B3D"
                strokeWidth="1.6"
                strokeOpacity="0.5"
              />
              <path
                d="M277 190 C272 198 272 212 278 222"
                stroke="#8F5B3D"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M434 176 C450 168 462 182 458 204 C455 222 446 236 434 238 C426 238 424 226 426 210 Z"
                fill={`url(#${id("skin")})`}
                stroke="#8F5B3D"
                strokeWidth="1.6"
                strokeOpacity="0.5"
              />
              <path
                d="M443 190 C448 198 448 212 442 222"
                stroke="#8F5B3D"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
            </g>

            {/* face */}
            <path
              d="M289 138 C292 104 320 82 360 82 C402 82 431 106 433 142 C435 170 432 196 423 220 C413 250 392 278 366 294 C362 296 358 296 354 294 C328 278 306 248 297 216 C289 192 287 164 289 138 Z"
              fill={`url(#${id("skin")})`}
            />

            {/* cel shading: right plane of the face */}
            <path
              d="M428 138 C434 172 430 206 418 232 C408 254 392 274 372 288 C396 276 414 252 424 222 C434 192 436 162 428 138 Z"
              fill="#8C5739"
              opacity="0.4"
            />
            {/* shadow under the cheekbone + jaw */}
            <path
              d="M418 208 C408 230 392 252 372 266 C388 262 404 246 414 224 Z"
              fill="#7C4A31"
              opacity="0.3"
            />
            {/* forehead / left cheek highlight */}
            <path
              d="M300 148 C306 128 322 112 342 104 C330 122 318 144 313 168 C306 164 302 156 300 148 Z"
              fill="#F0C69B"
              opacity="0.35"
            />
            <ellipse
              cx="316"
              cy="218"
              rx="22"
              ry="12"
              fill="#F0C69B"
              opacity="0.18"
              transform="rotate(-16 316 218)"
            />
            {/* temples */}
            <path
              d="M289 138 C286 152 286 168 289 182 C284 174 282 154 289 138 Z"
              fill="#7C4A31"
              opacity="0.35"
            />

            {/* brow ridge shadows + brows */}
            <path
              d="M292 164 C306 152 332 148 348 156 C330 154 310 160 298 172 Z"
              fill="#7C4A31"
              opacity="0.28"
            />
            <path
              d="M428 164 C414 152 388 148 372 156 C390 154 410 160 422 172 Z"
              fill="#7C4A31"
              opacity="0.28"
            />
            {drawBrow("left")}
            {drawBrow("right")}

            {/* eyes */}
            {drawEye("left")}
            {drawEye("right")}

            {/* nose */}
            <path
              d="M352 182 C350 202 348 218 344 230 C348 238 354 241 360 241 C366 241 372 238 376 230 C372 218 370 202 368 182 Z"
              fill="#B47A53"
              opacity="0.25"
            />
            <path
              d="M345 234 C349 242 354 246 360 246 C366 246 371 242 375 234 C371 238 366 240 360 240 C354 240 349 238 345 234 Z"
              fill="#8F5B3D"
              opacity="0.5"
            />
            <ellipse cx="345" cy="236" rx="4.2" ry="2.6" fill="#5C3522" opacity="0.8" />
            <ellipse cx="375" cy="236" rx="4.2" ry="2.6" fill="#5C3522" opacity="0.8" />
            <path
              d="M356 184 C354 202 352 216 350 226"
              stroke="#F5D0A7"
              strokeWidth="2.4"
              fill="none"
              opacity="0.4"
              strokeLinecap="round"
            />
            <ellipse cx="359" cy="228" rx="5" ry="3.4" fill="#F0C69B" opacity="0.35" />
            <path
              d="M338 232 C330 228 322 230 318 236"
              stroke="#8F5B3D"
              strokeWidth="2"
              fill="none"
              opacity="0.25"
              strokeLinecap="round"
            />
            <path
              d="M382 232 C390 228 398 230 402 236"
              stroke="#8F5B3D"
              strokeWidth="2"
              fill="none"
              opacity="0.25"
              strokeLinecap="round"
            />

            {/* philtrum */}
            <path
              d="M354 244 C354 250 356 254 360 256 M366 244 C366 250 364 254 360 256"
              stroke="#8F5B3D"
              strokeWidth="1.4"
              fill="none"
              opacity="0.3"
              strokeLinecap="round"
            />

            {/* stubble along the jaw and chin */}
            <g clipPath={`url(#${id("beard")})`}>
              <rect x="292" y="220" width="136" height="86" fill={`url(#${id("stubbleFade")})`} />
              <rect x="292" y="220" width="136" height="86" fill={`url(#${id("stubble")})`} opacity="0.5" />
            </g>
            <path
              d="M330 246 C344 240 376 240 390 246"
              stroke="#3A2A28"
              strokeWidth="3"
              fill="none"
              opacity="0.18"
              strokeLinecap="round"
            />

            {/* mouth with jaw-driven opening */}
            <g transform={`translate(0 ${n(jaw * 4)})`}>
              <path
                d={`M330 ${cornerY} C340 ${cornerY - 7} 350 ${centerY - 7} 356 ${centerY - 3} Q360 ${centerY - 6} 364 ${centerY - 3} C370 ${centerY - 7} 380 ${cornerY - 7} 390 ${cornerY} C380 ${centerY + 2} 340 ${centerY + 2} 330 ${cornerY} Z`}
                fill={`url(#${id("lipUpper")})`}
              />
              <path
                d={`M332 ${cornerY + 1} C344 ${centerY + 4} 376 ${centerY + 4} 388 ${cornerY + 1} C380 ${centerY + 4 + opening} 340 ${centerY + 4 + opening} 332 ${cornerY + 1} Z`}
                fill="#33141A"
              />
              {jaw > 0.22 ? (
                <path
                  d={`M336 ${cornerY + 2} C348 ${centerY + 5} 372 ${centerY + 5} 384 ${cornerY + 2} C378 ${centerY + 8} 342 ${centerY + 8} 336 ${cornerY + 2} Z`}
                  fill="#E9D9CA"
                  opacity="0.85"
                />
              ) : null}
              <path
                d={`M332 ${cornerY + 1 + opening * 0.4} C344 ${centerY + 6 + opening} 376 ${centerY + 6 + opening} 388 ${cornerY + 1 + opening * 0.4} C383 ${centerY + 16 + opening * 0.7} 337 ${centerY + 16 + opening * 0.7} 332 ${cornerY + 1 + opening * 0.4} Z`}
                fill={`url(#${id("lipLower")})`}
              />
              <ellipse
                cx="360"
                cy={centerY + 10 + opening * 0.5}
                rx="13"
                ry="3"
                fill="#E7B199"
                opacity="0.3"
              />
              <path
                d={`M330 ${cornerY} C340 ${centerY + 1} 380 ${centerY + 1} 390 ${cornerY}`}
                stroke="#5C2C2C"
                strokeWidth="1.6"
                fill="none"
                opacity="0.7"
              />
            </g>
            {/* chin crease */}
            <path
              d="M350 288 C356 292 364 292 370 288"
              stroke="#8F5B3D"
              strokeWidth="1.6"
              fill="none"
              opacity="0.3"
              strokeLinecap="round"
            />

            {/* hairline shadow + fringe locks */}
            <path
              d="M292 150 C300 122 326 102 356 98 C332 110 314 130 306 154 Z"
              fill="#3A2A28"
              opacity="0.16"
            />
            <g
              transform={`translate(${n(wind * 4)} ${n(Math.abs(wind) * -2)}) rotate(${n(wind * 1.2)} 360 90)`}
            >
              <path
                d="M300 130 C310 102 334 84 364 80 C348 96 338 114 332 138 C324 158 318 174 314 188 C304 172 300 150 300 130 Z"
                fill="#10131A"
              />
              <path
                d={`M356 80 C384 82 410 100 422 128 C408 114 392 104 374 100 C368 92 362 84 356 80 Z`}
                fill="#151923"
              />
              <path
                d={`M312 122 C330 100 360 88 396 94 C372 98 352 110 338 128 C328 142 322 156 ${318 + n(windLift)} 172 C314 154 312 136 312 122 Z`}
                fill="#1A1F2A"
              />
              <path
                d={`M292 150 C300 126 312 110 328 98 C318 120 312 146 ${312 + n(windLift)} 174 C306 166 298 158 292 150 Z`}
                fill="#0D1016"
              />
              <path
                d="M372 88 C392 92 408 106 416 124 C400 112 384 104 368 100 C366 94 368 90 372 88 Z"
                fill="#242A37"
                opacity="0.8"
              />
              {/* strand highlights */}
              <g stroke="#39404F" fill="none" opacity="0.7" strokeLinecap="round">
                <path d="M318 104 C336 96 356 92 376 92" strokeWidth="2" />
                <path d="M308 128 C316 112 326 100 340 92" strokeWidth="1.6" />
                <path d="M404 110 C412 118 418 126 422 134" strokeWidth="1.6" />
              </g>
            </g>
            {/* loose strand, wind-reactive */}
            <path
              d={`M300 120 C290 140 ${286 + n(wind * 14)} ${158 + n(wind * 6)} ${292 + n(wind * 18)} 176`}
              stroke="#0C0E14"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* sideburns */}
            <path
              d="M288 178 C284 196 286 214 292 230 L300 226 C294 210 294 194 298 180 Z"
              fill="#0C0E14"
            />
            <path
              d="M432 178 C436 196 434 214 428 230 L420 226 C426 210 426 194 422 180 Z"
              fill="#0C0E14"
            />

            {/* hair rim light */}
            <path
              d="M292 196 C282 160 280 120 300 92 C318 66 342 52 366 46"
              stroke={rimGradient}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              filter={`url(#${id("glow")})`}
            />
            <path
              d="M422 134 C432 158 434 186 426 210"
              stroke={rimGradient}
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
          </g>

          {/* hand pressed to the brow sits in front of the head */}
          {pose === "stressed_desk" ? (
            <g transform="translate(420 186) rotate(-32)">
              <path
                d="M-30 -22 C-12 -36 16 -34 30 -16 C42 0 36 26 18 36 C0 44 -24 36 -34 20 C-42 6 -40 -12 -30 -22 Z"
                fill={`url(#${id("skin")})`}
                stroke="#8F5B3D"
                strokeWidth="1.4"
                strokeOpacity="0.6"
              />
              {finger(-30, 4, 12, 46, -18, id("skin"), "#8F5B3D")}
              {finger(-17, 8, 12, 52, -7, id("skin"), "#8F5B3D")}
              {finger(-4, 10, 12, 54, 3, id("skin"), "#8F5B3D")}
              {finger(9, 6, 11, 46, 13, id("skin"), "#8F5B3D")}
              <path
                d="M-28 -8 C-14 0 -8 14 -10 30"
                stroke="#8F5B3D"
                strokeWidth="1.4"
                fill="none"
                opacity="0.5"
              />
            </g>
          ) : null}

          {/* ── holographic keyboard ────────────────────────────────── */}
          {pose === "coding" ? (
            <g opacity="0.9">
              <path
                d="M186 760 L226 706 L494 706 L534 760 Z"
                fill={COLORS.cyan}
                opacity="0.06"
                stroke={COLORS.cyan}
                strokeWidth="1.6"
                strokeOpacity="0.55"
              />
              {Array.from({ length: 4 }, (_, i) => {
                const y = 714 + i * 12;
                const inset = 40 - i * 6;
                return (
                  <path
                    key={i}
                    d={`M${226 + inset} ${y} L${494 - inset} ${y}`}
                    stroke={COLORS.cyan}
                    strokeWidth="1.2"
                    opacity={0.45 - i * 0.06}
                  />
                );
              })}
              {Array.from({ length: 9 }, (_, i) => {
                const x = 240 + i * 30;
                return (
                  <path
                    key={i}
                    d={`M${x} 708 L${x - (x - 360) * 0.18} 760`}
                    stroke={COLORS.cyan}
                    strokeWidth="1"
                    opacity="0.22"
                  />
                );
              })}
              <rect
                x="212"
                y="714"
                width="296"
                height="46"
                fill="none"
                stroke={COLORS.cyan}
                strokeWidth="1"
                opacity={0.3 + 0.25 * Math.abs(Math.sin(frame * 0.08))}
              />
              <path
                d="M240 740 L300 740 M330 744 L360 744 M390 736 L430 736"
                stroke={COLORS.cyan}
                strokeWidth="2"
                opacity="0.6"
                filter={`url(#${id("glow")})`}
              />
            </g>
          ) : null}

          {/* ── pose lighting ───────────────────────────────────────── */}
          {pose === "coding" ? (
            <g style={{ mixBlendMode: "screen" }} opacity="0.9">
              <ellipse cx="360" cy="700" rx="330" ry="150" fill={COLORS.cyan} opacity="0.13" />
              <ellipse cx="360" cy="330" rx="150" ry="90" fill={COLORS.cyan} opacity="0.1" />
            </g>
          ) : null}
          {pose === "stressed_desk" ? (
            <g style={{ mixBlendMode: "screen" }}>
              <ellipse cx="360" cy="40" rx="330" ry="220" fill={COLORS.crimson} opacity="0.16" />
              <ellipse cx="360" cy="120" rx="150" ry="120" fill={COLORS.crimson} opacity="0.12" />
            </g>
          ) : null}
          {pose === "together" ? (
            <g style={{ mixBlendMode: "screen" }}>
              <ellipse cx="620" cy="330" rx="200" ry="360" fill={COLORS.amber} opacity="0.1" />
            </g>
          ) : null}
        </g>
      </g>
    </svg>
  );
};
