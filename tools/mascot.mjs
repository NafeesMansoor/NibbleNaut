/**
 * The NibbleNaut mascot: a glossy, cheerful orange-yellow fish with bright blue fins, a huge shiny
 * blue eye and a big smile, in a deep-blue sea with bubbles, coral and little fish behind.
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
    <path d="M300 512 Q312 470 326 488 Q336 456 350 486 Q362 466 370 512 Z" fill="#ff5fa2"/>
    <circle cx="326" cy="486" r="7" fill="#ff9cc8"/>
    <circle cx="350" cy="484" r="6" fill="#ff9cc8"/>
    <path d="M400 512 Q404 480 418 492 Q424 470 438 496 L444 512 Z" fill="#ffd23f"/>
  </g>
  <!-- little fish far away -->
  ${smallFish(330, 56, 0.9, false, '#5b6cff', '#3a3fd8', 0.9)}
  ${smallFish(468, 118, 1.05, true, '#a35cff', '#7a2fe0', 0.85)}
  ${smallFish(70, 455, 0.75, false, '#ff5fa2', '#e0307a', 0.9)}
  <!-- sparkles -->
  <g fill="#fff7b0">
    <path d="M410 70 l5 13 l13 5 l-13 5 l-5 13 l-5 -13 l-13 -5 l13 -5 Z"/>
    <path d="M120 120 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z"/>
    <path d="M480 260 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z"/>
  </g>
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
      <stop offset="0" stop-color="#fff86b"/>
      <stop offset="0.32" stop-color="#ffd52a"/>
      <stop offset="0.68" stop-color="#ff9a12"/>
      <stop offset="1" stop-color="#ff5e1a"/>
    </radialGradient>
    <linearGradient id="fin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9ffcff"/>
      <stop offset="0.4" stop-color="#2fb4ff"/>
      <stop offset="0.75" stop-color="#3f6bff"/>
      <stop offset="1" stop-color="#9b4dff"/>
    </linearGradient>
    <linearGradient id="dorsal" x1="0" y1="1" x2="0.6" y2="0">
      <stop offset="0" stop-color="#a8fdff"/>
      <stop offset="0.4" stop-color="#36c0ff"/>
      <stop offset="0.75" stop-color="#4a6bff"/>
      <stop offset="1" stop-color="#a24dff"/>
    </linearGradient>
    <radialGradient id="iris" cx="0.45" cy="0.4" r="0.65">
      <stop offset="0" stop-color="#8ffff0"/>
      <stop offset="0.4" stop-color="#22b8ff"/>
      <stop offset="0.78" stop-color="#3a52e6"/>
      <stop offset="1" stop-color="#5a2fc4"/>
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
    <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff5fa2"/>
      <stop offset="0.5" stop-color="#c05cff"/>
      <stop offset="1" stop-color="#4f8bff"/>
    </linearGradient>
    <clipPath id="bodyClip"><ellipse cx="276" cy="272" rx="186" ry="150"/></clipPath>
  </defs>
  <g transform="translate(256 262) scale(${scale}) translate(-256 -262) rotate(7 276 272)">
    <!-- tail -->
    <path d="M112 260 C80 210 46 170 8 150 C26 210 36 240 54 268 C34 300 22 334 12 392 C50 368 84 324 112 284 Z" fill="url(#fin)" stroke="#0a2f7a" stroke-width="6" stroke-linejoin="round"/>
    <path d="M30 180 Q62 226 88 262 M26 360 Q60 314 88 284 M44 210 Q70 240 92 266" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.45"/>
    <!-- dorsal fin -->
    <path d="M150 168 C180 92 260 44 352 52 C392 56 410 72 404 92 C360 96 320 118 300 146 Z" fill="url(#dorsal)" stroke="#0a2f7a" stroke-width="6" stroke-linejoin="round"/>
    <path d="M190 140 Q250 86 330 70 M230 136 Q280 100 350 86 M270 140 Q310 112 372 98" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
    <!-- belly fin -->
    <path d="M206 392 C214 446 262 470 322 456 C298 440 286 418 284 396 Z" fill="url(#fin)" stroke="#0a2f7a" stroke-width="6" stroke-linejoin="round"/>
    <!-- body -->
    <ellipse cx="276" cy="272" rx="186" ry="150" fill="url(#body)"/>
    <g clip-path="url(#bodyClip)">
      <!-- soft shading underneath, gill line, gloss on top -->
      <ellipse cx="300" cy="420" rx="220" ry="90" fill="#e0701a" opacity="0.3"/>
      <path d="M222 140 Q252 272 220 410" fill="none" stroke="#f08a1f" stroke-width="8" stroke-linecap="round" opacity="0.3"/>
      <ellipse cx="300" cy="170" rx="130" ry="46" fill="url(#gloss)" opacity="0.8"/>
      <ellipse cx="170" cy="230" rx="40" ry="70" fill="url(#gloss)" opacity="0.35"/>
      <!-- a soft rainbow stripe along the gill -->
      <path d="M228 128 Q262 272 226 418" fill="none" stroke="url(#band)" stroke-width="30" stroke-linecap="round" opacity="0.55"/>
    </g>
    <!-- pectoral fin -->
    <path d="M214 300 C176 300 150 330 152 362 C190 370 228 346 246 316 Z" fill="url(#fin)" stroke="#0a2f7a" stroke-width="6" stroke-linejoin="round"/>
    <path d="M168 350 Q196 332 228 316 M176 362 Q206 346 236 324" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
    <!-- eye -->
    <ellipse cx="362" cy="262" rx="74" ry="72" fill="#ef8a1f" opacity="0.35"/>
    <ellipse cx="364" cy="266" rx="66" ry="64" fill="url(#sclera)"/>
    <circle cx="370" cy="270" r="55" fill="url(#iris)"/>
    <circle cx="372" cy="272" r="30" fill="#0b1546"/>
    <ellipse cx="348" cy="243" rx="21" ry="18" fill="#ffffff"/>
    <circle cx="394" cy="296" r="8" fill="#ffffff" opacity="0.9"/>
    <!-- rosy cheek and a big smile -->
    <ellipse cx="336" cy="352" rx="24" ry="13" fill="#ff4f8a" opacity="0.6"/>
    <path d="M394 318 Q428 338 462 306 Q466 352 432 364 Q400 366 392 342 Q390 328 394 318 Z" fill="#8a1530"/>
    <path d="M402 346 Q422 336 446 346 Q436 362 420 362 Q406 360 402 346 Z" fill="#ff7aa2"/>
    <path d="M394 318 Q428 338 462 306" fill="none" stroke="#c4501a" stroke-width="5" stroke-linecap="round"/>
  </g>
</svg>
`;
}
