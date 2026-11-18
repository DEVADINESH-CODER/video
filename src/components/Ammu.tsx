/**
 * Ammu — the matching waist-up portrait, turned toward the Explorer.
 *
 * A deliberately quiet silhouette: warm shadow planes, a closed-eye profile,
 * layered hair and an amber (#FFB800) rim so she reads as a real presence
 * beside the fully-lit lead rather than a flat icon.
 */
export const Ammu: React.FC = () => {
  return (
    <svg
      viewBox="0 0 720 760"
      width="100%"
      height="100%"
      style={{ overflow: "visible", display: "block" }}
      role="img"
      aria-label="Ammu, stylized profile portrait in warm amber light"
    >
      <defs>
        <linearGradient id="ammu-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A97650" />
          <stop offset="55%" stopColor="#7B5136" />
          <stop offset="100%" stopColor="#4C3020" />
        </linearGradient>
        <linearGradient id="ammu-hair" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#2A1D0F" />
          <stop offset="45%" stopColor="#171008" />
          <stop offset="100%" stopColor="#090604" />
        </linearGradient>
        <linearGradient id="ammu-cloth" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#2C1F0C" />
          <stop offset="45%" stopColor="#1B1308" />
          <stop offset="100%" stopColor="#0D0905" />
        </linearGradient>
        <linearGradient
          id="ammu-rim"
          gradientUnits="userSpaceOnUse"
          x1="300"
          y1="70"
          x2="250"
          y2="620"
        >
          <stop offset="0%" stopColor="#FFB800" stopOpacity="0.95" />
          <stop offset="48%" stopColor="#FFB800" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
        </linearGradient>
        <filter id="ammu-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ammu-shadow" x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="22" stdDeviation="26" floodColor="#000000" floodOpacity="0.55" />
        </filter>
      </defs>

      <g filter="url(#ammu-shadow)">
        {/* hair mass behind the head and down the shoulders */}
        <path
          d="M404 74 C348 74 310 110 304 164 C300 198 306 228 320 250 C308 268 300 300 298 336 C296 388 306 438 318 486 C330 534 338 584 336 640 L372 700 L366 620 C360 556 350 500 344 448 C352 420 356 390 354 360 L402 380 C426 350 440 306 448 258 C456 320 456 392 448 470 C442 540 434 604 430 680 L470 700 L468 606 C482 520 496 432 496 348 C496 244 466 118 404 74 Z"
          fill="url(#ammu-hair)"
        />
        {/* face profile, turned toward the left */}
        <path
          d="M404 84 C362 76 326 96 318 128 C313 146 314 158 318 170 C310 178 302 188 296 199 C302 204 310 205 316 203 C314 210 313 218 316 224 C309 232 308 240 311 247 C317 252 326 253 333 249 C336 262 346 276 360 285 C376 295 398 293 412 283 C398 279 386 269 379 256 C390 244 399 228 402 212 C404 202 405 192 403 184 C414 168 422 150 422 132 C421 110 416 92 404 84 Z"
          fill="url(#ammu-skin)"
        />
        {/* warm plane shading down the back of the face */}
        <path
          d="M404 90 C428 106 432 136 424 164 C418 188 408 206 402 222 C398 240 388 258 376 270 C398 262 416 236 424 206 C434 172 430 130 404 90 Z"
          fill="#2C1A10"
          opacity="0.55"
        />
        {/* cheekbone and jaw light */}
        <path
          d="M322 186 C330 194 340 202 346 214 C338 210 328 202 320 194 Z"
          fill="#C08A5C"
          opacity="0.35"
        />
        {/* closed eye + lashes */}
        <path
          d="M318 160 C326 153 340 153 348 158"
          stroke="#150E08"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M344 157 L351 152 M339 155 L344 149 M333 154 L336 148"
          stroke="#150E08"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* brow */}
        <path
          d="M316 145 C326 139 342 139 351 144"
          stroke="#140D07"
          strokeWidth="3.6"
          fill="none"
          strokeLinecap="round"
        />
        {/* nose + lips detail */}
        <path
          d="M318 186 C314 192 310 198 308 203"
          stroke="#3A2315"
          strokeWidth="1.6"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M311 222 C316 220 322 221 327 223 M311 231 C316 234 322 234 328 232"
          stroke="#3C211A"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        {/* ear + jhumka */}
        <path
          d="M399 174 C412 168 420 180 416 194 C413 206 406 212 398 210 C392 206 390 190 399 174 Z"
          fill="#6B452D"
        />
        <path
          d="M402 190 C406 196 406 204 402 208"
          stroke="#3A2315"
          strokeWidth="1.6"
          fill="none"
          opacity="0.7"
        />
        <circle cx="404" cy="218" r="4" fill="#FFB800" opacity="0.9" />
        <path
          d="M400 226 L408 226 L412 238 L406 244 L400 238 Z"
          fill="#FFB800"
          opacity="0.55"
        />
        {/* neck */}
        <path
          d="M352 262 C360 284 376 300 396 306 L402 352 C376 358 356 352 342 338 C350 316 352 290 352 262 Z"
          fill="#4C3020"
        />
        <path
          d="M360 286 C368 304 380 314 392 318"
          stroke="#2A1A10"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />

        {/* shoulders + kurta */}
        <path
          d="M396 336 C344 340 286 360 246 392 C212 420 196 468 188 520 L170 632 C160 690 158 730 160 760 L560 760 C562 720 562 668 552 616 L532 510 C520 452 494 404 452 378 C434 364 414 348 396 336 Z"
          fill="url(#ammu-cloth)"
          stroke="#3A2A12"
          strokeWidth="2"
        />
        {/* dupatta fall */}
        <path
          d="M306 350 C340 382 372 404 404 420 C438 438 462 470 474 512 L492 592 C466 556 430 522 392 496 C352 470 322 432 306 396 Z"
          fill="#35260F"
          opacity="0.85"
        />
        <path
          d="M314 366 C344 398 378 422 414 442"
          stroke="#FFB800"
          strokeWidth="1.6"
          fill="none"
          opacity="0.28"
        />
        {/* near arm hanging at her side */}
        <path
          d="M228 408 C210 470 200 540 198 612 L192 700"
          stroke="#1B1308"
          strokeWidth="72"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M218 430 C204 488 196 552 196 616"
          stroke="#FFB800"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
        {/* neckline */}
        <path
          d="M356 342 C368 362 386 374 404 378 C394 390 372 388 356 376 C350 364 350 352 356 342 Z"
          fill="#0E0905"
          stroke="#3A2A12"
          strokeWidth="1.6"
        />
        <path
          d="M398 376 C416 388 440 392 460 388"
          stroke="#FFB800"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />

        {/* amber rim along the face, hair and shoulder facing the Explorer */}
        <path
          d="M318 170 C313 146 314 122 330 104 C346 86 372 78 396 82"
          stroke="url(#ammu-rim)"
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
          filter="url(#ammu-glow)"
        />
        <path
          d="M300 199 C310 204 317 204 320 201"
          stroke="url(#ammu-rim)"
          strokeWidth="3.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M311 247 C318 253 327 253 333 249"
          stroke="url(#ammu-rim)"
          strokeWidth="3.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M379 256 C391 244 400 226 403 208"
          stroke="url(#ammu-rim)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M246 392 C214 420 198 466 190 518"
          stroke="url(#ammu-rim)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          filter="url(#ammu-glow)"
        />
        <path
          d="M298 336 C294 386 302 436 316 484"
          stroke="url(#ammu-rim)"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* loose hair strands over the rim */}
        <path
          d="M330 108 C318 130 312 154 314 178"
          stroke="#120C06"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M356 88 C340 102 330 122 326 144"
          stroke="#3A2A18"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </svg>
  );
};
