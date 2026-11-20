import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { InkStroke } from "../components/InkStroke";
import { SketchCanvas } from "../components/SketchCanvas";
import { SketchGroup, StrokeList } from "../components/SketchGroup";
import {
  CHALK,
  CRIMSON,
  FONT_SERIF,
  bowed,
  hatch,
  roughOval,
  roughRect,
} from "../sketch";
import { GATE_PERSON, GATE_PERSON_MASK, HAND_FILLS, HANDS } from "./figures";

const Gate: React.FC<{ frame: number }> = ({ frame }) => {
  const bars = Array.from({ length: 9 }, (_, i) => 176 + i * 91);
  const caption = interpolate(frame, [158, 178], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g>
      {/* school behind the gate */}
      <InkStroke
        d={roughRect(96, 402, 888, 420, 2.2)}
        startFrame={98}
        durationFrames={24}
        width={4.6}
        double
      />
      <InkStroke
        d="M96 402 L300 312 L780 312 L984 402"
        startFrame={104}
        durationFrames={20}
        width={4.6}
      />
      <InkStroke
        d="M420 402 L540 322 L660 402"
        startFrame={110}
        durationFrames={16}
        width={4}
      />
      <InkStroke
        d="M96 424 L984 424"
        startFrame={114}
        durationFrames={18}
        width={2.8}
        opacity={0.6}
      />
      <InkStroke
        d={roughOval(540, 474, 35, 35, 1.4)}
        startFrame={118}
        durationFrames={16}
        width={4}
      />
      <InkStroke
        d="M540 474 L540 452 M540 474 L556 482"
        startFrame={128}
        durationFrames={8}
        width={2.6}
      />

      {/* windows, two rows, with a mullion cross in each */}
      <SketchGroup
        base={116}
        accent={CRIMSON}
        strokes={Array.from({ length: 10 }, (_, i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const x = 148 + col * 158;
          const y = 492 + row * 112;
          return [
            { d: roughRect(x, y, 92, 78, 1.2), start: i * 1.3, dur: 12, width: 2.8 },
            { d: `M${x + 46} ${y} L${x + 46} ${y + 78}`, start: 10 + i * 1.3, dur: 6, width: 2 },
            { d: `M${x} ${y + 39} L${x + 92} ${y + 39}`, start: 12 + i * 1.3, dur: 6, width: 2 },
          ];
        }).flat()}
      />
      <InkStroke
        d={roughRect(492, 688, 96, 134, 1.4)}
        startFrame={132}
        durationFrames={14}
        width={3.6}
      />
      <InkStroke
        d="M492 754 L588 754 M540 688 L540 822"
        startFrame={138}
        durationFrames={8}
        width={2}
        opacity={0.6}
      />

      {/* three waiting figures, behind the bars */}
      {[
        { x: 274, scale: 0.94, base: 154 },
        { x: 540, scale: 1.02, base: 146 },
        { x: 806, scale: 0.9, base: 162 },
      ].map((figure, i) => (
        <g
          key={i}
          transform={`translate(${figure.x} 1538) scale(${
            i === 1 ? figure.scale : -figure.scale
          } ${figure.scale})`}
        >
          <polygon points={GATE_PERSON_MASK} fill="#08090B" opacity={1} />
          <StrokeList strokes={GATE_PERSON} base={figure.base} accent={CRIMSON} />
        </g>
      ))}

      {/* stone pillars and iron gate in front */}
      <SketchGroup
        base={138}
        accent={CRIMSON}
        strokes={[
          { d: "M74 760 L160 760 L160 1588 L74 1588 Z", start: 0, dur: 16, width: 4.4 },
          { d: "M920 760 L1006 760 L1006 1588 L920 1588 Z", start: 1, dur: 16, width: 4.4 },
          { d: "M64 734 L170 734 L170 764 L64 764 Z", start: 8, dur: 10, width: 3.6 },
          { d: "M910 734 L1016 734 L1016 764 L910 764 Z", start: 9, dur: 10, width: 3.6 },
          { d: "M86 806 L148 806 M932 806 L994 806", start: 14, dur: 7, width: 2, tone: "soft" },
        ]}
      />
      <SketchGroup
        base={154}
        accent={CRIMSON}
        strokes={bars.flatMap((x, i) => [
          { d: bowed({ x, y: 804 }, { x, y: 1524 }, i % 2 === 0 ? 0.8 : -0.8), start: i * 1.1, dur: 16, width: 4.6 },
          { d: `M${x - 15} 804 L${x} 764 L${x + 15} 804`, start: 6 + i * 1.1, dur: 7, width: 3.4 },
          { d: `M${x - 12} 1044 L${x + 12} 1044`, start: 12 + i * 1.1, dur: 4, width: 2, tone: "soft" as const },
        ])}
      />
      <InkStroke
        d="M152 1038 C400 1030 680 1030 928 1038"
        startFrame={164}
        durationFrames={16}
        width={7}
        double
      />
      <InkStroke
        d="M152 1432 C400 1424 680 1424 928 1432"
        startFrame={168}
        durationFrames={16}
        width={7}
        double
      />

      {/* ground and a few loose stones */}
      <InkStroke
        d="M40 1578 C300 1568 780 1568 1040 1578"
        startFrame={138}
        durationFrames={18}
        width={5}
        double
      />
      <SketchGroup
        base={160}
        strokes={[
          ...hatch(80, 1608, 920, 130, 24, -22, 28).map((d, i) => ({
            d,
            start: i * 1.1,
            dur: 7,
            width: 2,
            tone: "hatch" as const,
          })),
          ...hatch(120, 1750, 840, 140, 18, 20, 30).map((d, i) => ({
            d,
            start: 8 + i * 0.9,
            dur: 6,
            width: 1.8,
            tone: "hatch" as const,
          })),
          { d: "M286 1638 C302 1632 318 1634 326 1644", start: 12, dur: 6, width: 2.4, tone: "soft" },
          { d: "M742 1666 C760 1658 780 1660 790 1672", start: 14, dur: 6, width: 2.4, tone: "soft" },
        ]}
      />

      {/* DAY 21, set as type but underlined by hand */}
      <text
        x={540}
        y={262}
        textAnchor="middle"
        fontFamily={FONT_SERIF}
        fontSize={138}
        letterSpacing={-3}
        fill={CHALK}
        opacity={caption}
      >
        DAY 21
      </text>
      <InkStroke
        d="M326 300 C430 292 646 292 752 302"
        startFrame={166}
        durationFrames={14}
        stroke={CRIMSON}
        width={6}
        opacity={0.8}
      />
      <InkStroke
        d="M360 314 C452 308 628 308 720 316"
        startFrame={172}
        durationFrames={10}
        stroke={CRIMSON}
        width={2.4}
        opacity={0.5}
      />

      {/* crimson creeping around the border */}
      <SketchGroup
        base={168}
        accent={CRIMSON}
        forceColor={CRIMSON}
        strokes={[
          { d: "M36 300 C58 334 34 366 56 400 C78 434 34 466 54 500 C76 534 32 566 52 600 C74 634 30 666 50 700 C72 734 28 766 48 800 C70 834 26 866 46 900 C68 934 24 966 44 1000 C66 1034 22 1066 42 1100 C64 1134 20 1166 40 1200 C62 1234 18 1266 38 1300 C60 1334 16 1366 36 1400 C58 1434 14 1466 34 1498", start: 0, dur: 34, width: 4.6 },
          { d: "M60 400 C82 390 88 412 68 424 M52 600 C30 590 24 612 44 624 M48 800 C70 792 76 812 56 824 M40 1200 C62 1192 68 1212 48 1224 M36 1400 C58 1392 64 1412 44 1424", start: 6, dur: 24, width: 2.2, tone: "accentSoft" },
          { d: "M1040 338 C1018 370 1042 402 1020 434 C998 466 1044 498 1022 530 C1000 562 1046 594 1024 626 C1002 658 1048 690 1026 722 C1004 754 1050 786 1028 818 C1006 850 1052 882 1030 914 C1008 946 1054 978 1032 1010 C1010 1042 1056 1074 1034 1106 C1012 1138 1058 1170 1036 1202 C1014 1234 1060 1266 1038 1298 C1016 1330 1062 1362 1040 1394 C1018 1426 1054 1458 1030 1490", start: 8, dur: 34, width: 4.2 },
          { d: "M1020 434 C998 424 992 446 1012 458 M1022 626 C1000 616 994 638 1014 650 M1028 818 C1006 808 1000 830 1020 842 M1032 1010 C1010 1000 1004 1022 1024 1034 M1040 1394 C1018 1384 1012 1406 1032 1418", start: 12, dur: 24, width: 2, tone: "accentSoft" },
          { d: "M90 88 C150 76 194 98 248 86 C302 74 346 98 400 86 C454 74 498 98 552 86 C606 74 650 98 704 86 C758 74 802 98 856 86 C908 74 946 92 1002 86", start: 14, dur: 26, width: 3.6, tone: "accentSoft" },
          { d: "M76 1824 C136 1810 186 1836 242 1824 C298 1812 344 1834 398 1822 C452 1810 498 1832 552 1820 C606 1808 652 1832 706 1820 C760 1808 806 1830 860 1818 C912 1806 952 1826 1008 1820", start: 18, dur: 26, width: 3.2, tone: "accentSoft" },
          { d: "M118 420 L98 492 L122 560 L100 634", start: 24, dur: 18, width: 2.4, tone: "accentSoft" },
          { d: "M144 88 C158 74 172 76 180 90 M472 86 C486 72 500 74 508 88 M804 86 C818 72 832 74 840 88", start: 26, dur: 16, width: 2, tone: "accentSoft" },
        ]}
      />

    </g>
  );
};

/**
 * Scene 4 · 660 – 900
 * Two hands finish the top button on charcoal, then the sheet cranes upward
 * into the gate. Every bar and every figure is a fresh stroke.
 */
export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const crane = interpolate(frame, [92, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const offset = -1920 + crane * 1920;

  return (
    <AbsoluteFill>
      <SketchCanvas tone="charcoal">
        <g transform={`translate(0 ${offset})`}>
          <Gate frame={frame} />
          <g transform="translate(0 1920)">
            <StrokeList strokes={HANDS} fills={HAND_FILLS} fillColor="#C99A78" base={0} accent={CRIMSON} />
          </g>
        </g>
      </SketchCanvas>
    </AbsoluteFill>
  );
};
