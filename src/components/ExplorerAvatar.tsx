import { useId } from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

/**
 * ExplorerAvatar — the recurring coded character of the series.
 *
 * One modular SVG vector character, driven entirely by frame number:
 *  - pose changes the silhouette (stand, walk, code, break down, stand together)
 *  - expression changes brows, eyes and mouth geometry
 *  - isSpeaking adds a subtle mouth flap
 *  - Math.sin() breathing + arm sway keeps the figure alive between beats
 *
 * The character space is 240 x 440 with the soles grounded near y = 412.
 * Scenes scale the whole SVG, so all internal measurements stay consistent.
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

export const AVATAR_VIEWBOX = { width: 240, height: 440 } as const;
/** Vertical fraction of the SVG where the hands rest (used to line up desks). */
export const AVATAR_HANDS_Y = 290 / AVATAR_VIEWBOX.height;

type Pt = { x: number; y: number };

type PoseJoints = {
  bob: number;
  lean: number;
  headTilt: number;
  headDrop: number;
  hipL: Pt;
  hipR: Pt;
  thighL: number;
  shinL: number;
  thighR: number;
  shinR: number;
  shoulderL: Pt;
  upperL: number;
  foreL: number;
  shoulderR: Pt;
  upperR: number;
  foreR: number;
};

const DEG = Math.PI / 180;

/** angle 0 = straight down, positive = toward +x */
const polar = (origin: Pt, angleDeg: number, length: number): Pt => {
  const a = angleDeg * DEG;
  return {
    x: origin.x + Math.sin(a) * length,
    y: origin.y + Math.cos(a) * length,
  };
};

const n = (value: number) => Math.round(value * 10) / 10;
const pt = (p: Pt) => `${n(p.x)} ${n(p.y)}`;

const UPPER_ARM = 76;
const FOREARM = 70;
const THIGH = 80;
const SHIN = 76;

const getPose = (pose: AvatarPose, frame: number): PoseJoints => {
  const t = frame / 30;
  const idleSway = Math.sin(frame * 0.045) * 1.6;

  const base: PoseJoints = {
    bob: Math.sin(frame * 0.055) * 1.8,
    lean: 0,
    headTilt: 0,
    headDrop: 0,
    hipL: { x: 105, y: 250 },
    hipR: { x: 135, y: 250 },
    thighL: -3,
    shinL: -1,
    thighR: 3,
    shinR: 1,
    shoulderL: { x: 86, y: 150 },
    upperL: -2 + idleSway,
    foreL: -1,
    shoulderR: { x: 154, y: 150 },
    upperR: 2 + idleSway,
    foreR: 1,
  };

  switch (pose) {
    case "standing":
      return base;

    case "together":
      return {
        ...base,
        headTilt: 4,
        lean: -1,
        upperL: -6,
        foreL: -4,
        upperR: 13,
        foreR: 19,
      };

    case "walking_train": {
      const phase = t * Math.PI * 2 * 1.05;
      const swing = Math.sin(phase);
      return {
        ...base,
        bob: -Math.abs(Math.cos(phase)) * 3.4,
        lean: 3,
        headTilt: -2,
        thighL: swing * 15,
        shinL: swing * 6 + 5,
        thighR: -swing * 15,
        shinR: -swing * 6 + 5,
        upperL: -swing * 20,
        foreL: -swing * 20 + 24,
        upperR: swing * 20,
        foreR: swing * 20 + 24,
      };
    }

    case "coding": {
      const typing = Math.sin(frame * 0.9) * 2.5;
      return {
        ...base,
        lean: 4,
        headTilt: 2,
        bob: Math.sin(frame * 0.075) * 1.2,
        upperL: 14,
        foreL: 22 + typing,
        upperR: -14,
        foreR: -22 + typing,
      };
    }

    case "stressed_desk": {
      const tremble = Math.sin(frame * 1.35) * 1.6;
      return {
        ...base,
        lean: 9,
        headTilt: -4,
        headDrop: 4,
        bob: Math.sin(frame * 0.09) * 1.4,
        thighL: -2,
        thighR: 2,
        upperL: -150 + tremble,
        foreL: 119 + tremble,
        upperR: 150 + tremble,
        foreR: -119 + tremble,
      };
    }
  }
};

type FaceSpec = {
  eyeH: number;
  browOuterY: number;
  browInnerY: number;
  browW: number;
  mouthCurve: number;
  pupilShift: number;
  lid: boolean;
};

const getFace = (expression: AvatarExpression): FaceSpec => {
  switch (expression) {
    case "intense":
      return {
        eyeH: 6,
        browOuterY: 50,
        browInnerY: 60,
        browW: 5,
        mouthCurve: -0.4,
        pupilShift: 0,
        lid: false,
      };
    case "determined":
      return {
        eyeH: 8,
        browOuterY: 53,
        browInnerY: 59,
        browW: 4.6,
        mouthCurve: 0.2,
        pupilShift: 0,
        lid: false,
      };
    case "hurt":
      return {
        eyeH: 5,
        browOuterY: 57,
        browInnerY: 49,
        browW: 3.6,
        mouthCurve: -2.2,
        pupilShift: -0.6,
        lid: true,
      };
    case "hopeful":
      return {
        eyeH: 10,
        browOuterY: 54,
        browInnerY: 48,
        browW: 3.8,
        mouthCurve: 2.4,
        pupilShift: 0.8,
        lid: false,
      };
  }
};

export const ExplorerAvatar: React.FC<ExplorerAvatarProps> = ({
  pose,
  expression,
  isSpeaking,
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const teeId = `tee-${uid}`;
  const glowId = `glow-${uid}`;
  const shadowId = `shade-${uid}`;

  const joints = getPose(pose, frame);
  const face = getFace(expression);

  const legL = {
    knee: polar(joints.hipL, joints.thighL, THIGH),
    ankle: polar(polar(joints.hipL, joints.thighL, THIGH), joints.shinL, SHIN),
  };
  const legR = {
    knee: polar(joints.hipR, joints.thighR, THIGH),
    ankle: polar(polar(joints.hipR, joints.thighR, THIGH), joints.shinR, SHIN),
  };

  const armL = {
    elbow: polar(joints.shoulderL, joints.upperL, UPPER_ARM),
    hand: polar(
      polar(joints.shoulderL, joints.upperL, UPPER_ARM),
      joints.foreL,
      FOREARM,
    ),
  };
  const armR = {
    elbow: polar(joints.shoulderR, joints.upperR, UPPER_ARM),
    hand: polar(
      polar(joints.shoulderR, joints.upperR, UPPER_ARM),
      joints.foreR,
      FOREARM,
    ),
  };

  const mouthOpen = isSpeaking
    ? 1.6 + Math.abs(Math.sin(frame * 0.55)) * 4.2
    : 0;
  const mouthHeight = 1.6 + mouthOpen;
  const smile = face.mouthCurve;

  const eyeY = 68;

  const isLeftFront = joints.thighL >= joints.thighR;
  const legs = [
    {
      key: "L" as const,
      hip: joints.hipL,
      knee: legL.knee,
      ankle: legL.ankle,
      dir: -1 as const,
      front: isLeftFront,
    },
    {
      key: "R" as const,
      hip: joints.hipR,
      knee: legR.knee,
      ankle: legR.ankle,
      dir: 1 as const,
      front: !isLeftFront,
    },
  ].sort((a, b) => Number(a.front) - Number(b.front));

  const sleevePath = (arm: { elbow: Pt; hand: Pt }, shoulder: Pt) =>
    `M${pt(shoulder)} L${pt(arm.elbow)} L${pt(arm.hand)}`;

  return (
    <svg
      viewBox={`0 0 ${AVATAR_VIEWBOX.width} ${AVATAR_VIEWBOX.height}`}
      width="100%"
      height="100%"
      style={{ overflow: "visible", display: "block" }}
      role="img"
      aria-label={`Explorer avatar, ${pose} pose, ${expression} expression`}
    >
      <defs>
        <linearGradient id={teeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9DFBFF" />
          <stop offset="55%" stopColor={COLORS.cyan} />
          <stop offset="100%" stopColor="#008FA0" />
        </linearGradient>
        <radialGradient id={shadowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="120" cy="424" rx="78" ry="16" fill={`url(#${shadowId})`} />

      <g transform={`translate(0 ${joints.bob})`}>
        {/* legs: rear leg first, leading leg over it */}
        {legs.map((leg, index) => (
          <g key={leg.key} opacity={leg.front ? 1 : 0.74}>
            <path
              d={`M${pt(leg.hip)} L${pt(leg.knee)} L${pt(leg.ankle)}`}
              stroke={COLORS.pants}
              strokeWidth={leg.front ? 26 : 25}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {index === 0 ? (
              <path
                d={shoePath(leg.ankle, leg.dir)}
                fill="#151821"
                stroke="#252A37"
                strokeWidth="1.5"
              />
            ) : null}
          </g>
        ))}
        {legs.map((leg) =>
          leg.front ? (
            <g key={`front-${leg.key}`}>
              <path
                d={`M${pt({ x: leg.hip.x + 8, y: 268 })} L${pt({ x: leg.knee.x + 7, y: leg.knee.y })}`}
                stroke={COLORS.cyan}
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.35"
              />
              <path
                d={shoePath(leg.ankle, leg.dir)}
                fill="#191C26"
                stroke="#2C3240"
                strokeWidth="1.5"
              />
              <path
                d={shoeSole(leg.ankle, leg.dir)}
                stroke={COLORS.cyan}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.45"
              />
            </g>
          ) : null,
        )}

        <g transform={`rotate(${joints.lean} 120 250)`}>
          {/* back arm */}
          <path
            d={sleevePath(armL, joints.shoulderL)}
            stroke="#10121A"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle
            cx={joints.shoulderL.x}
            cy={joints.shoulderL.y}
            r="13"
            fill="#10121A"
          />

          {/* neck */}
          <path
            d="M110 92 L110 122 Q120 130 130 122 L130 92 Z"
            fill={COLORS.skinShade}
          />
          <path
            d="M111 100 Q120 108 129 100 L129 118 Q120 124 111 118 Z"
            fill={COLORS.skin}
            opacity="0.85"
          />

          {/* hoodie body */}
          <path
            d="M82 158 C86 132 101 118 120 118 C139 118 154 132 158 158 L150 246 Q148 260 136 262 L104 262 Q92 260 90 246 Z"
            fill={COLORS.charcoal}
            stroke="#2A3040"
            strokeWidth="2.4"
          />
          {/* hood behind the neck */}
          <path
            d="M98 120 Q120 140 142 120 Q150 136 120 152 Q90 136 98 120 Z"
            fill="#1B1F2A"
            stroke="#2C3242"
            strokeWidth="1.6"
          />
          {/* inner electric-cyan tee */}
          <path
            d="M104 124 L136 124 L130 208 Q120 216 110 208 Z"
            fill={`url(#${teeId})`}
            opacity="0.94"
          />
          <path
            d="M104 124 L136 124 L130 208 Q120 216 110 208 Z"
            fill={COLORS.cyan}
            opacity="0.28"
            filter={`url(#${glowId})`}
          />
          {/* hoodie opening over the tee */}
          <path
            d="M104 124 Q108 176 110 210 M136 124 Q132 176 130 210"
            stroke="#2B3242"
            strokeWidth="2"
            fill="none"
          />
          {/* kangaroo pocket + seam */}
          <path
            d="M100 220 L140 220 L136 246 L104 246 Z"
            fill="#171A22"
            stroke="#272D3A"
            strokeWidth="1.4"
          />
          <path
            d="M90 198 Q120 206 150 198"
            stroke="#252B37"
            strokeWidth="1.4"
            fill="none"
            opacity="0.9"
          />
          {/* drawstrings with cyan tips */}
          <path
            d="M110 148 L107 186 M130 148 L133 186"
            stroke="#3A4252"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="107" cy="189" r="2.6" fill={COLORS.cyan} />
          <circle cx="133" cy="189" r="2.6" fill={COLORS.cyan} />

          {/* cyan rim light along the left silhouette */}
          <path
            d="M86 160 C89 138 100 124 112 120"
            stroke={COLORS.cyan}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* head */}
          <g
            transform={`translate(0 ${joints.headDrop}) rotate(${joints.headTilt} 120 104)`}
          >
            {/* ears */}
            <ellipse
              cx="97"
              cy="72"
              rx="5"
              ry="6.5"
              fill={COLORS.skinShade}
            />
            <ellipse
              cx="143"
              cy="72"
              rx="5"
              ry="6.5"
              fill={COLORS.skinShade}
            />
            {/* hair mass */}
            <ellipse cx="120" cy="62" rx="27" ry="28" fill={COLORS.hair} />
            {/* face */}
            <path
              d="M97 58 Q97 38 120 38 Q143 38 143 58 L143 72 Q143 96 120 102 Q97 96 97 72 Z"
              fill={COLORS.skin}
            />
            {/* cheek / jaw shading */}
            <path
              d="M99 74 Q104 94 120 100 Q112 96 108 86 Z"
              fill={COLORS.skinShade}
              opacity="0.45"
            />
            <path
              d="M112 96 Q120 100 128 96"
              stroke={COLORS.skinShade}
              strokeWidth="1.6"
              fill="none"
              opacity="0.6"
            />
            {/* messy dark hair, drawn over the forehead */}
            <path
              d="M95 66 Q93 40 112 34 Q124 27 136 35 Q153 41 148 65 L143 52 L138 63 L131 48 L124 60 L116 47 L109 60 L102 51 L99 64 Z"
              fill={COLORS.hair}
            />
            <path
              d="M104 45 Q114 37 128 39 M132 47 Q140 48 144 56"
              stroke="#333B4C"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            {/* brows */}
            <path
              d={`M${97} ${face.browOuterY} L${111} ${face.browInnerY}`}
              stroke={COLORS.hair}
              strokeWidth={face.browW}
              strokeLinecap="round"
            />
            <path
              d={`M${143} ${face.browOuterY} L${129} ${face.browInnerY}`}
              stroke={COLORS.hair}
              strokeWidth={face.browW}
              strokeLinecap="round"
            />
            {/* geometric eyes */}
            <path
              d={`M97 ${eyeY} L111 ${eyeY - 3} L112 ${eyeY + face.eyeH - 3} L98 ${eyeY + face.eyeH} Z`}
              fill="#E9EFF8"
            />
            <path
              d={`M143 ${eyeY} L129 ${eyeY - 3} L128 ${eyeY + face.eyeH - 3} L142 ${eyeY + face.eyeH} Z`}
              fill="#E9EFF8"
            />
            <rect
              x={103 + face.pupilShift}
              y={eyeY - 1}
              width="5.4"
              height={face.eyeH}
              rx="1.4"
              fill="#0B1018"
            />
            <rect
              x={131.6 + face.pupilShift}
              y={eyeY - 1}
              width="5.4"
              height={face.eyeH}
              rx="1.4"
              fill="#0B1018"
            />
            <rect
              x={104.4 + face.pupilShift}
              y={eyeY}
              width="1.8"
              height="2.6"
              fill={COLORS.cyan}
            />
            <rect
              x={132.9 + face.pupilShift}
              y={eyeY}
              width="1.8"
              height="2.6"
              fill={COLORS.cyan}
            />
            {face.lid ? (
              <path
                d={`M96 ${eyeY + 1} L112 ${eyeY - 2} M144 ${eyeY + 1} L128 ${eyeY - 2}`}
                stroke={COLORS.hair}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            ) : null}
            {/* nose */}
            <path
              d="M120 72 L117 83 L121 84"
              stroke={COLORS.skinShade}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* mouth — subtle talk flap + expression curve */}
            <path
              d={`M113 ${91 - smile * 0.4} Q120 ${91 + mouthHeight + smile * 0.7} 127 ${91 - smile * 0.4} Z`}
              fill="#33191F"
              stroke="#5C2C35"
              strokeWidth="0.8"
            />
            {/* cyan rim light on the left cheek */}
            <path
              d="M98 60 Q97 78 103 90"
              stroke={COLORS.cyan}
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.4"
            />
          </g>

          {/* front arm on top of the torso */}
          <path
            d={sleevePath(armR, joints.shoulderR)}
            stroke={COLORS.charcoal}
            strokeWidth="21"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={`M${pt(joints.shoulderR)} L${pt(armR.elbow)} L${pt(armR.hand)}`}
            stroke="#2A3040"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          <circle
            cx={joints.shoulderR.x}
            cy={joints.shoulderR.y}
            r="14"
            fill={COLORS.charcoal}
            stroke="#2A3040"
            strokeWidth="1.6"
          />
          {/* cuff + hand */}
          <line
            x1={armR.hand.x - 5}
            y1={armR.hand.y - 5}
            x2={armR.hand.x + 4}
            y2={armR.hand.y + 4}
            stroke="#2E3544"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx={armR.hand.x}
            cy={armR.hand.y}
            r="8.6"
            fill={COLORS.skin}
          />
          <path
            d={`M${armR.hand.x - 5} ${armR.hand.y + 1} Q${armR.hand.x} ${armR.hand.y + 4} ${armR.hand.x + 5} ${armR.hand.y + 1}`}
            stroke={COLORS.skinShade}
            strokeWidth="1.4"
            fill="none"
            opacity="0.8"
          />

          {/* left hand (back arm) */}
          <circle
            cx={armL.hand.x}
            cy={armL.hand.y}
            r="8.2"
            fill={COLORS.skinShade}
          />
        </g>
      </g>
    </svg>
  );
};

const shoePath = (ankle: Pt, dir: -1 | 1) => {
  const { x, y } = ankle;
  if (dir === 1) {
    return `M${n(x - 12)} ${n(y - 2)} Q${n(x + 2)} ${n(y - 12)} ${n(x + 22)} ${n(y - 3)} L${n(x + 24)} ${n(y + 6)} Q${n(x + 4)} ${n(y + 12)} ${n(x - 13)} ${n(y + 7)} Z`;
  }
  return `M${n(x + 12)} ${n(y - 2)} Q${n(x - 2)} ${n(y - 12)} ${n(x - 22)} ${n(y - 3)} L${n(x - 24)} ${n(y + 6)} Q${n(x - 4)} ${n(y + 12)} ${n(x + 13)} ${n(y + 7)} Z`;
};

const shoeSole = (ankle: Pt, dir: -1 | 1) => {
  const { x, y } = ankle;
  if (dir === 1) {
    return `M${n(x - 10)} ${n(y + 8)} L${n(x + 20)} ${n(y + 7)}`;
  }
  return `M${n(x + 10)} ${n(y + 8)} L${n(x - 20)} ${n(y + 7)}`;
};
