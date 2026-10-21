/**
 * The NibbleNaut mascot: a cheerful orange-and-yellow fish with big blue eyes, a smiling open
 * mouth and bright blue fins. One drawing, used for every icon size (see tools/make-icons.mjs)
 * and, without the ocean background, on the home screen.
 *
 *   mascotSvg({ background: true,  scale: 1 })    app icon (full-bleed ocean square)
 *   mascotSvg({ background: true,  scale: 0.78 }) maskable icon (fish inside the safe circle)
 *   mascotSvg({ background: false })              transparent mascot for the UI
 */
export function mascotSvg({ background = true, scale = 1 } = {}) {
  const ink = '#0b2a4a';
  const bg = background
    ? `
  <defs>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5fe0ff"/>
      <stop offset="0.55" stop-color="#1f9ae6"/>
      <stop offset="1" stop-color="#0a4f9e"/>
    </linearGradient>
    <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#sea)"/>
  <path d="M120 0 L190 0 L150 512 L60 512 Z" fill="url(#ray)" opacity="0.55"/>
  <path d="M300 0 L350 0 L380 512 L300 512 Z" fill="url(#ray)" opacity="0.4"/>
  <ellipse cx="256" cy="536" rx="340" ry="80" fill="#f5c76a"/>
  <ellipse cx="256" cy="530" rx="320" ry="66" fill="#ffe19a"/>
  <g fill="none" stroke="#ffffff" stroke-width="6" opacity="0.85">
    <circle cx="452" cy="196" r="15"/>
    <circle cx="478" cy="140" r="10"/>
    <circle cx="456" cy="96" r="7"/>
    <circle cx="70" cy="110" r="9" opacity="0.6"/>
  </g>`
    : `
  <defs></defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${bg}
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffd23f"/>
      <stop offset="0.45" stop-color="#ffa51f"/>
      <stop offset="1" stop-color="#ff6a00"/>
    </linearGradient>
    <linearGradient id="fin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5cc8ff"/>
      <stop offset="1" stop-color="#0a6cff"/>
    </linearGradient>
    <radialGradient id="iris" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#8fe1ff"/>
      <stop offset="0.55" stop-color="#1f8fff"/>
      <stop offset="1" stop-color="#0b4fc4"/>
    </radialGradient>
    <clipPath id="bodyClip"><ellipse cx="268" cy="268" rx="152" ry="120"/></clipPath>
  </defs>
  <g transform="translate(256 262) scale(${scale}) translate(-256 -262)" stroke-linejoin="round" stroke-linecap="round">
    <!-- tail -->
    <path d="M140 262 C110 214 84 176 52 160 C62 206 74 236 96 262 C74 288 62 318 52 364 C84 348 110 310 140 262 Z" fill="url(#fin)" stroke="${ink}" stroke-width="9"/>
    <path d="M80 200 Q100 232 112 252 M80 324 Q100 292 112 272" fill="none" stroke="#bfeaff" stroke-width="7" opacity="0.8"/>
    <!-- dorsal fin -->
    <path d="M190 166 C214 100 280 82 336 118 C312 128 296 146 286 164 Z" fill="url(#fin)" stroke="${ink}" stroke-width="9"/>
    <!-- belly fin -->
    <path d="M228 372 C236 410 268 424 300 412 C286 400 280 386 280 372 Z" fill="url(#fin)" stroke="${ink}" stroke-width="9"/>
    <!-- body -->
    <ellipse cx="268" cy="268" rx="152" ry="120" fill="url(#body)" stroke="${ink}" stroke-width="10"/>
    <g clip-path="url(#bodyClip)">
      <ellipse cx="292" cy="338" rx="140" ry="62" fill="#ffe680"/>
      <path d="M196 150 Q216 268 196 392" fill="none" stroke="#fff3b0" stroke-width="20" opacity="0.75"/>
      <ellipse cx="220" cy="200" rx="58" ry="26" fill="#ffffff" opacity="0.28" transform="rotate(-20 220 200)"/>
    </g>
    <ellipse cx="268" cy="268" rx="152" ry="120" fill="none" stroke="${ink}" stroke-width="10"/>
    <!-- pectoral fin -->
    <path d="M232 280 C206 298 200 332 214 346 C240 340 260 316 262 290 Z" fill="url(#fin)" stroke="${ink}" stroke-width="8"/>
    <!-- cheek -->
    <ellipse cx="322" cy="300" rx="24" ry="14" fill="#ff5d8f" opacity="0.45"/>
    <!-- eye -->
    <circle cx="346" cy="222" r="48" fill="#ffffff" stroke="${ink}" stroke-width="9"/>
    <circle cx="354" cy="228" r="32" fill="url(#iris)"/>
    <circle cx="358" cy="232" r="15" fill="#0b1630"/>
    <circle cx="342" cy="212" r="11" fill="#ffffff"/>
    <circle cx="366" cy="244" r="5" fill="#ffffff"/>
    <!-- smiling open mouth -->
    <path d="M362 286 Q394 296 420 276 Q422 318 392 330 Q364 334 356 312 Q354 296 362 286 Z" fill="#8a1530" stroke="${ink}" stroke-width="8"/>
    <path d="M370 316 Q388 306 406 318 Q396 330 382 328 Q372 326 370 316 Z" fill="#ff7aa2"/>
  </g>
</svg>
`;
}
