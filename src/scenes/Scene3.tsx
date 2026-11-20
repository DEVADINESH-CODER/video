import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { InkStroke } from "../components/InkStroke";
import { SketchCanvas } from "../components/SketchCanvas";
import { SketchGroup } from "../components/SketchGroup";
import {
  AMBER,
  FONT_SERIF,
  INK,
  TEAL,
  alpha,
  bowed,
  roughOval,
  roughRect,
  tickRing,
} from "../sketch";

/**
 * Scene 3 · 330 – 660
 * A sequential montage: the train window, the folded uniform and bag, the
 * shared tiffin, then the route he actually took. Each object is finished
 * before the next one starts, so the whole scene feels like one long drawing.
 */
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const caption = interpolate(frame, [244, 262], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const route =
    "M132 1510 C214 1464 248 1386 326 1332 C404 1278 438 1364 518 1384 C598 1404 620 1308 700 1254 C780 1200 854 1280 944 1236";
  const routePoints = [
    { x: 132, y: 1510 },
    { x: 326, y: 1332 },
    { x: 518, y: 1384 },
    { x: 700, y: 1254 },
    { x: 944, y: 1236 },
  ];

  return (
    <AbsoluteFill>
      <SketchCanvas tone="paper">
        <defs>
          <clipPath id="scene3-window">
            <rect x={118} y={214} width={844} height={452} />
          </clipPath>
        </defs>

        {/* the carriage window */}
        <rect x={118} y={214} width={844} height={452} fill={TEAL} opacity={0.035} />
        <g clipPath="url(#scene3-window)">
          <SketchGroup
            base={10}
            strokes={[
              { d: "M120 604 C236 540 348 574 462 550 C584 524 704 566 828 544 C892 532 934 542 960 556", start: 0, dur: 18, width: 2.6, tone: "soft" },
              { d: "M120 626 C246 572 352 604 478 580 C600 556 716 592 844 570 C900 560 936 566 960 578", start: 4, dur: 18, width: 2, tone: "hatch" },
              { d: "M120 654 C260 614 380 638 500 620 C626 600 742 626 960 610", start: 8, dur: 16, width: 1.8, tone: "hatch" },
              { d: "M146 318 L960 300", start: 12, dur: 16, width: 2.4, tone: "soft" },
              { d: "M140 382 L958 360", start: 14, dur: 16, width: 2, tone: "soft" },
              { d: "M136 446 L956 424", start: 16, dur: 16, width: 1.8, tone: "soft" },
              { d: "M134 510 L954 488", start: 18, dur: 16, width: 2.2, tone: "accentSoft" },
            ]}
          />
          {/* a few speed dashes inside the glass */}
          <SketchGroup
            base={24}
            strokes={[
              { d: "M188 300 L302 296", start: 0, dur: 7, width: 3, tone: "soft" },
              { d: "M626 336 L760 330", start: 2, dur: 7, width: 2.6, tone: "soft" },
              { d: "M744 390 L866 384", start: 4, dur: 7, width: 2, tone: "soft" },
            ]}
          />
        </g>
        <InkStroke
          d={roughRect(96, 190, 888, 500, 2.2)}
          startFrame={0}
          durationFrames={24}
          width={5.5}
          double
        />
        <InkStroke
          d={roughRect(118, 214, 844, 452, 1.5)}
          startFrame={8}
          durationFrames={18}
          width={3}
        />
        <InkStroke
          d={bowed({ x: 540, y: 214 }, { x: 540, y: 666 }, 1.1)}
          startFrame={16}
          durationFrames={12}
          width={3}
        />
        <InkStroke
          d="M486 190 L486 174 M534 190 L534 174 M582 190 L582 174"
          startFrame={22}
          durationFrames={8}
          width={2.4}
          opacity={0.45}
        />

        {/* folded school shirt */}
        <SketchGroup
          base={58}
          accent={AMBER}
          strokes={[
            { d: roughRect(116, 842, 226, 206, 2), start: 0, dur: 20, width: 4.6, double: true },
            { d: roughRect(126, 866, 206, 164, 1.4), start: 6, dur: 16, width: 2.6, tone: "soft" },
            { d: "M146 1002 C190 982 268 982 314 1004", start: 10, dur: 10, width: 2.6 },
            { d: "M162 1018 C204 1002 260 1002 302 1018", start: 12, dur: 9, width: 2, tone: "soft" },
            { d: "M204 842 C214 874 238 890 252 876 C264 862 276 852 284 842", start: 8, dur: 12, width: 3.2 },
            { d: "M212 872 L252 930 L292 870", start: 12, dur: 10, width: 2.4, tone: "soft" },
            { d: "M206 872 L206 930", start: 14, dur: 8, width: 2, tone: "soft" },
            ...tickRing(230, 952, 7, 6).map((d, i) => ({ d, start: 18 + i, dur: 5, width: 2.2 })),
            ...tickRing(230, 998, 7, 6).map((d, i) => ({ d, start: 20 + i, dur: 5, width: 2.2 })),
            { d: "M140 892 L318 892", start: 14, dur: 8, width: 1.8, tone: "hatch" },
          ]}
        />

        {/* the travel bag */}
        <SketchGroup
          base={78}
          accent={AMBER}
          strokes={[
            {
              d: "M388 844 C388 812 406 794 436 794 L518 794 C548 794 566 812 566 844 L566 1034 C566 1064 548 1082 518 1082 L436 1082 C406 1082 388 1064 388 1034 Z",
              start: 0,
              dur: 22,
              width: 4.8,
              double: true,
            },
            { d: "M430 794 C430 748 458 724 478 724 C498 724 526 748 526 794", start: 8, dur: 14, width: 4 },
            { d: "M388 866 C344 916 344 1000 388 1050", start: 10, dur: 14, width: 3.6 },
            { d: "M566 866 C610 916 610 1000 566 1050", start: 10, dur: 14, width: 3.2, tone: "soft" },
            { d: "M402 844 C452 830 512 830 554 844", start: 12, dur: 12, width: 2.8 },
            { d: "M456 840 L456 856", start: 18, dur: 5, width: 2.6 },
            { d: "M402 918 L554 918 L550 1010 L406 1010 Z", start: 14, dur: 14, width: 2.8 },
            { d: "M414 946 L540 946", start: 22, dur: 8, width: 1.8, tone: "hatch" },
            { d: "M414 970 L540 970", start: 24, dur: 8, width: 1.8, tone: "hatch" },
            { d: "M534 1004 L574 996 L582 1024 L542 1032 Z", start: 26, dur: 8, width: 2.4, tone: "accentSoft" },
            { d: "M548 1018 L560 1016", start: 30, dur: 4, width: 2 },
          ]}
        />

        {/* tiffin and the two hands sharing it */}
        <SketchGroup
          base={112}
          accent={AMBER}
          strokes={[
            {
              d: "M700 858 C700 830 720 812 746 812 L818 812 C844 812 864 830 864 858 L864 878 L700 878 Z",
              start: 0,
              dur: 16,
              width: 4.4,
              double: true,
            },
            { d: "M700 878 L864 878 L858 918 L706 918 Z", start: 6, dur: 12, width: 3.6 },
            { d: "M706 918 L858 918 L852 954 L712 954 Z", start: 10, dur: 12, width: 3.4 },
            { d: "M712 954 L852 954 L846 986 L718 986 Z", start: 14, dur: 12, width: 3.4 },
            { d: "M700 878 L680 858 C672 850 674 838 684 834 C692 830 700 836 702 844", start: 12, dur: 10, width: 3 },
            { d: "M864 878 L884 858 C892 850 890 838 880 834 C872 830 864 836 862 844", start: 12, dur: 10, width: 3 },
            { d: "M772 812 L772 786 C772 778 780 774 786 778 L786 810", start: 16, dur: 8, width: 3 },
            { d: "M782 940 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0", start: 20, dur: 6, width: 3 },
            { d: "M758 786 C744 756 768 734 754 704 C744 682 760 666 752 646", start: 24, dur: 16, width: 2.8, tone: "accentSoft" },
            { d: "M792 782 C782 754 804 736 792 706 C782 682 798 664 790 640", start: 27, dur: 16, width: 2.2, tone: "soft" },
            { d: "M826 790 C812 762 834 742 822 714 C812 690 826 674 820 654", start: 30, dur: 16, width: 2.6, tone: "accentSoft" },
            // left hand
            {
              d: "M572 1024 C576 992 596 970 622 964 C642 960 660 972 668 992 C678 1016 674 1044 658 1058",
              start: 14,
              dur: 16,
              width: 4.2,
            },
            { d: "M628 964 C640 938 656 922 672 916", start: 18, dur: 10, width: 3.6 },
            { d: "M644 968 C658 944 674 930 688 926", start: 19, dur: 10, width: 3.4 },
            { d: "M658 978 C672 956 688 944 700 940", start: 20, dur: 10, width: 3.2 },
            { d: "M668 994 C680 976 694 966 706 962", start: 21, dur: 10, width: 3 },
            { d: "M596 1004 C612 990 628 986 642 992", start: 20, dur: 8, width: 3.4 },
            // right hand
            {
              d: "M992 1024 C988 992 968 970 942 964 C922 960 904 972 896 992 C886 1016 890 1044 906 1058",
              start: 16,
              dur: 16,
              width: 4.2,
            },
            { d: "M936 964 C924 938 908 922 892 916", start: 20, dur: 10, width: 3.6 },
            { d: "M920 968 C906 944 890 930 876 926", start: 21, dur: 10, width: 3.4 },
            { d: "M906 978 C892 956 876 944 864 940", start: 22, dur: 10, width: 3.2 },
            { d: "M896 994 C884 976 870 966 858 962", start: 23, dur: 10, width: 3 },
            { d: "M968 1004 C952 990 936 986 922 992", start: 22, dur: 8, width: 3.4 },
            { d: "M566 1024 L540 1034", start: 28, dur: 5, width: 3, tone: "soft" },
            { d: "M998 1024 L1024 1034", start: 28, dur: 5, width: 3, tone: "soft" },
          ]}
        />

        {/* railway route and unnamed stops */}
        <SketchGroup
          base={120}
          strokes={[
            { d: route, start: 0, dur: 38, width: 4.4, tone: "accent" },
            { d: route, start: 4, dur: 38, width: 1.6, tone: "accentSoft" },
            ...[0.12, 0.23, 0.34, 0.45, 0.56, 0.67, 0.78, 0.89].map((t, i) => {
              const approx = routePoints[Math.min(routePoints.length - 1, Math.floor(t * 4))];
              return {
                d: `M${approx.x - 12} ${approx.y - 22} L${approx.x + 12} ${approx.y + 22}`,
                start: 24 + i * 1.6,
                dur: 5,
                width: 2.4,
                tone: "soft" as const,
              };
            }),
            ...routePoints.flatMap((p, i) =>
              tickRing(p.x, p.y, 11, 7).map((d, j) => ({
                d,
                start: 34 + i * 3 + j * 0.5,
                dur: 5,
                width: 2.4,
                tone: "accent" as const,
              })),
            ),
            ...routePoints.map((p, i) => ({
              d: roughOval(p.x, p.y, 5, 5, 1),
              start: 36 + i * 3,
              dur: 5,
              width: 3,
            })),
          ]}
        />

        {/* a quiet hand-written label for the route */}
        <InkStroke
          d="M844 1584 C874 1578 902 1582 916 1594"
          startFrame={218}
          durationFrames={10}
          width={2.6}
          stroke={TEAL}
          opacity={0.5}
        />
      </SketchCanvas>

      <div
        style={{
          position: "absolute",
          left: 62,
          right: 62,
          bottom: 118,
          opacity: caption,
          transform: `translateY(${(1 - caption) * 14}px)`,
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 35,
          lineHeight: 1.3,
          color: alpha(INK, 0.78),
        }}
      >
        nobody was teaching this.
      </div>
    </AbsoluteFill>
  );
};
