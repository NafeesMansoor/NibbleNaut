/**
 * The NibbleNaut mascot: a glossy, cheerful orange fish with crimson-magenta fins, a huge shiny
 * blue eye and a round "O" mouth, in a deep-blue sea with bubbles, coral and little fish behind.
 * One drawing, used for every icon size (see tools/make-icons.mjs) and, without the sea, on the
 * home screen.
 *
 *   mascotSvg({ background: true,  scale: 1 })    app icon (full-bleed square; the OS rounds it)
 *   mascotSvg({ background: true,  scale: 0.8 })  maskable icon (fish inside the safe circle)
 *   mascotSvg({ background: false })              transparent mascot for the UI
 */
export function mascotSvg({ background = true, scale = 1 } = {}) {
  const smallFish = (x, y, s, flip, body, fin, o) => `
    <g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" opacity="${o}">
      <path d="M-34 0 L-58 -18 L-52 0 L-58 18 Z" fill="${fin}"/>
      <path d="M-6 -22 Q8 -40 22 -20 Z" fill="${fin}"/>
      <ellipse cx="0" cy="0" rx="40" ry="26" fill="${body}"/>
      <ellipse cx="-6" cy="-10" rx="22" ry="8" fill="#ffffff" opacity="0.25"/>
      <circle cx="20" cy="-4" r="9" fill="#ffffff"/>
      <circle cx="22" cy="-3" r="5" fill="#141b4d"/>
      <circle cx="19" cy="-6" r="2" fill="#ffffff"/>
    </g>`;
  const bg = background
    ? `
  <defs>
    <radialGradient id="sea" cx="0.55" cy="0.4" r="0.8">
      <stop offset="0" stop-color="#43d6ff"/>
      <stop offset="0.45" stop-color="#1590ee"/>
      <stop offset="1" stop-color="#0a2f8a"/>
    </radialGradient>
    <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bokeh" cx="0.4" cy="0.35" r="0.65">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#bfefff" stop-opacity="0.08"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#sea)"/>
  <path d="M170 0 L240 0 L190 512 L90 512 Z" fill="url(#ray)" opacity="0.5"/>
  <path d="M330 0 L370 0 L420 512 L340 512 Z" fill="url(#ray)" opacity="0.35"/>
  <!-- coral, softly out of focus -->
  <g opacity="0.75">
    <path d="M0 512 L0 360 Q20 330 34 360 Q44 300 70 330 Q86 290 104 340 Q118 380 96 420 L130 512 Z" fill="#7a3df0"/>
    <circle cx="40" cy="352" r="16" fill="#9b6bff"/>
    <circle cx="82" cy="322" r="14" fill="#9b6bff"/>
    <path d="M110 512 Q130 440 150 470 Q168 420 190 470 Q206 440 214 512 Z" fill="#1fc7b6"/>
    <path d="M512 512 L512 420 Q490 400 474 430 Q460 400 440 440 Q428 470 452 512 Z" fill="#25b8e0" opacity="0.8"/>
  </g>
  <!-- little fish far away -->
  ${smallFish(330, 56, 0.9, false, '#5b6cff', '#3a3fd8', 0.9)}
  ${smallFish(468, 118, 1.05, true, '#a35cff', '#7a2fe0', 0.85)}
  <!-- bubbles -->
  <g>
    <circle cx="440" cy="40" r="14" fill="url(#bokeh)"/>
    <circle cx="470" cy="210" r="9" fill="url(#bokeh)"/>
    <circle cx="60" cy="70" r="18" fill="url(#bokeh)" opacity="0.7"/>
    <circle cx="100" cy="150" r="7" fill="url(#bokeh)"/>
    <circle cx="30" cy="250" r="11" fill="url(#bokeh)" opacity="0.6"/>
    <circle cx="300" cy="24" r="6" fill="url(#bokeh)"/>
    <circle cx="490" cy="300" r="12" fill="url(#bokeh)" opacity="0.6"/>
  </g>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${bg}
  <defs>
    <radialGradient id="body" cx="0.6" cy="0.32" r="0.78">
      <stop offset="0" stop-color="#ffe066"/>
      <stop offset="0.35" stop-color="#ffab24"/>
      <stop offset="0.72" stop-color="#ff6a1a"/>
      <stop offset="1" stop-color="#d93a1f"/>
    </radialGradient>
    <linearGradient id="fin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff6a3d"/>
      <stop offset="0.5" stop-color="#ff2f6e"/>
      <stop offset="1" stop-color="#b8125a"/>
    </linearGradient>
    <linearGradient id="dorsal" x1="0" y1="1" x2="0.6" y2="0">
      <stop offset="0" stop-color="#ff7a2a"/>
      <stop offset="0.55" stop-color="#ff4a5a"/>
      <stop offset="1" stop-color="#d81b60"/>
    </linearGradient>
    <radialGradient id="iris" cx="0.45" cy="0.4" r="0.65">
      <stop offset="0" stop-color="#9fe6ff"/>
      <stop offset="0.45" stop-color="#2b9bff"/>
      <stop offset="1" stop-color="#0b3aa8"/>
    </radialGradient>
    <radialGradient id="sclera" cx="0.4" cy="0.35" r="0.75">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#d6e6ff"/>
    </radialGradient>
    <radialGradient id="gloss" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="lips" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#ffb36b"/>
      <stop offset="1" stop-color="#ff5a2a"/>
    </radialGradient>
    <clipPath id="bodyClip"><ellipse cx="276" cy="272" rx="186" ry="150"/></clipPath>
  </defs>
  <g transform="translate(256 262) scale(${scale}) translate(-256 -262) rotate(7 276 272)">
    <!-- tail -->
    <path d="M112 260 C80 210 46 170 8 150 C26 210 36 240 54 268 C34 300 22 334 12 392 C50 368 84 324 112 284 Z" fill="url(#fin)"/>
    <path d="M30 180 Q62 226 88 262 M26 360 Q60 314 88 284 M44 210 Q70 240 92 266" fill="none" stroke="#a80f4c" stroke-width="5" stroke-linecap="round" opacity="0.45"/>
    <!-- dorsal fin -->
    <path d="M150 168 C180 92 260 44 352 52 C392 56 410 72 404 92 C360 96 320 118 300 146 Z" fill="url(#dorsal)"/>
    <path d="M190 140 Q250 86 330 70 M230 136 Q280 100 350 86 M270 140 Q310 112 372 98" fill="none" stroke="#b0124f" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
    <!-- belly fin -->
    <path d="M206 392 C214 446 262 470 322 456 C298 440 286 418 284 396 Z" fill="url(#fin)"/>
    <!-- body -->
    <ellipse cx="276" cy="272" rx="186" ry="150" fill="url(#body)"/>
    <g clip-path="url(#bodyClip)">
      <!-- soft shading underneath, gill line, gloss on top -->
      <ellipse cx="300" cy="420" rx="220" ry="90" fill="#c2331a" opacity="0.35"/>
      <path d="M222 140 Q252 272 220 410" fill="none" stroke="#e5531b" stroke-width="8" stroke-linecap="round" opacity="0.28"/>
      <ellipse cx="300" cy="170" rx="130" ry="46" fill="url(#gloss)" opacity="0.8"/>
      <ellipse cx="170" cy="230" rx="40" ry="70" fill="url(#gloss)" opacity="0.35"/>
    </g>
    <!-- pectoral fin -->
    <path d="M214 300 C176 300 150 330 152 362 C190 370 228 346 246 316 Z" fill="url(#fin)"/>
    <path d="M168 350 Q196 332 228 316 M176 362 Q206 346 236 324" fill="none" stroke="#a80f4c" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
    <!-- eye -->
    <ellipse cx="362" cy="262" rx="74" ry="72" fill="#e2471f" opacity="0.35"/>
    <ellipse cx="364" cy="266" rx="66" ry="64" fill="url(#sclera)"/>
    <circle cx="370" cy="270" r="55" fill="url(#iris)"/>
    <circle cx="372" cy="272" r="30" fill="#0b1546"/>
    <ellipse cx="348" cy="243" rx="21" ry="18" fill="#ffffff"/>
    <circle cx="394" cy="296" r="8" fill="#ffffff" opacity="0.9"/>
    <!-- round "O" mouth -->
    <ellipse cx="456" cy="330" rx="30" ry="34" fill="url(#lips)"/>
    <ellipse cx="460" cy="334" rx="16" ry="21" fill="#5a0a1e"/>
    <ellipse cx="452" cy="314" rx="10" ry="6" fill="#ffffff" opacity="0.55"/>
  </g>
</svg>
`;
}
