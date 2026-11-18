/**
 * Ammu — a deliberately minimal silhouette, not a second detailed lead.
 *
 * Same 240 x 440 character space as the Explorer so the two figures share a
 * ground line, but drawn as a warm dark shape with an amber rim: presence
 * without competing with the coded character.
 */
export const Ammu: React.FC = () => {
  return (
    <svg
      viewBox="0 0 240 440"
      width="100%"
      height="100%"
      style={{ overflow: "visible", display: "block" }}
      role="img"
      aria-label="Minimal silhouette of Ammu"
    >
      {/* long hair mass, behind everything */}
      <path
        d="M92 96 C86 60 104 44 120 44 C138 44 154 60 148 98 L152 150 C156 168 150 182 142 190 L136 150 L130 108 L110 108 L104 150 L98 190 C88 180 84 164 88 148 Z"
        fill="#191307"
      />
      {/* head */}
      <ellipse cx="120" cy="92" rx="22" ry="25" fill="#221A0C" />
      {/* neck */}
      <path d="M111 112 L111 132 Q120 138 129 132 L129 112 Z" fill="#1B1408" />
      {/* shoulders + kurta */}
      <path
        d="M92 144 Q120 130 148 144 L158 192 L152 256 L166 330 L176 404 L64 404 L74 330 L88 256 L82 192 Z"
        fill="#1B1408"
        stroke="#FFB800"
        strokeWidth="1.8"
        strokeOpacity="0.45"
      />
      {/* dupatta sweep */}
      <path
        d="M96 148 Q120 162 144 148 L154 196 Q146 210 132 204 L128 300 L112 300 L108 204 Q94 210 86 196 Z"
        fill="#241B0A"
        opacity="0.95"
      />
      <path
        d="M105 154 Q120 168 135 154"
        stroke="#FFB800"
        strokeWidth="1.4"
        fill="none"
        opacity="0.35"
      />
      {/* arms, relaxed at her sides */}
      <path
        d="M92 152 L83 208 L80 252"
        stroke="#1B1408"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M148 152 L157 208 L160 252"
        stroke="#1B1408"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="80" cy="256" r="6.5" fill="#221A0C" />
      <circle cx="160" cy="256" r="6.5" fill="#221A0C" />
      {/* hem shadow */}
      <path
        d="M64 404 L176 404"
        stroke="#FFB800"
        strokeWidth="1.6"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* amber rim on the side facing the explorer */}
      <path
        d="M92 144 Q86 200 88 256 L74 330 L64 404"
        stroke="#FFB800"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      <path
        d="M96 92 Q93 62 108 49"
        stroke="#FFB800"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
};
