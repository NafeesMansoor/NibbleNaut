import { seededRng } from '../core/math';

/**
 * Procedural textures generated once at startup: no image assets needed. Each is tileable so it
 * can be used as a repeating canvas pattern.
 */

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported');
  return [c, ctx];
}

/**
 * Caustics: the bright, shifting net of light that sunlight casts through surface ripples.
 * Approximated by the edges of a tileable Voronoi diagram (distance F2 − F1 is small near
 * cell borders). Two of these layered and drifting in different directions shimmer convincingly.
 */
export function makeCausticTexture(rgb: [number, number, number], seed: number, size = 256, cells = 11): HTMLCanvasElement {
  const rng = seededRng(seed);
  const px: number[] = [];
  const py: number[] = [];
  for (let i = 0; i < cells; i++) {
    px.push(rng() * size);
    py.push(rng() * size);
  }
  const [c, ctx] = makeCanvas(size, size);
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const edge = size * 0.05;
  const half = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let f1 = Infinity;
      let f2 = Infinity;
      for (let i = 0; i < cells; i++) {
        let dx = Math.abs(x - px[i]);
        let dy = Math.abs(y - py[i]);
        if (dx > half) dx = size - dx;
        if (dy > half) dy = size - dy;
        const dd = dx * dx + dy * dy;
        if (dd < f1) {
          f2 = f1;
          f1 = dd;
        } else if (dd < f2) f2 = dd;
      }
      let v = Math.max(0, 1 - (Math.sqrt(f2) - Math.sqrt(f1)) / edge);
      v = v * v * (3 - 2 * v);
      v = Math.pow(v, 1.6);
      const i = (y * size + x) * 4;
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = Math.round(v * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Fine-grained sand with gentle wave ripples and scattered darker grains / shell fragments. */
export function makeSandTexture(base: [number, number, number], seed: number, size = 256): HTMLCanvasElement {
  const rng = seededRng(seed);
  const [c, ctx] = makeCanvas(size, size);
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const TAU = Math.PI * 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Integer frequencies keep the ripples seamless across tile edges.
      const warp = 0.12 * Math.sin((TAU * 2 * y) / size) + 0.05 * Math.sin((TAU * 3 * x) / size);
      const ripple = Math.sin(TAU * (6 * (x / size) + warp + (1 * y) / size));
      const grain = rng() * 2 - 1;
      const k = 1 + ripple * 0.06 + grain * 0.07;
      const i = (y * size + x) * 4;
      d[i] = Math.min(255, base[0] * k);
      d[i + 1] = Math.min(255, base[1] * k);
      d[i + 2] = Math.min(255, base[2] * k);
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  for (let i = 0; i < 260; i++) {
    const dark = rng() < 0.6;
    ctx.fillStyle = dark ? `rgba(70,55,35,${0.15 + rng() * 0.25})` : `rgba(255,250,235,${0.3 + rng() * 0.4})`;
    const r = 0.5 + rng() * (dark ? 1.3 : 1.8);
    ctx.beginPath();
    ctx.ellipse(rng() * size, rng() * size, r, r * (0.6 + rng() * 0.4), rng() * 3, 0, TAU);
    ctx.fill();
  }
  return c;
}

/** A soft vertical light shaft: bright core fading to the sides and toward the bottom. */
export function makeRaySprite(rgb: [number, number, number]): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(64, 512);
  const col = rgb.join(',');
  const across = ctx.createLinearGradient(0, 0, 64, 0);
  across.addColorStop(0, `rgba(${col},0)`);
  across.addColorStop(0.5, `rgba(${col},1)`);
  across.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = across;
  ctx.fillRect(0, 0, 64, 512);
  ctx.globalCompositeOperation = 'destination-in';
  const down = ctx.createLinearGradient(0, 0, 0, 512);
  down.addColorStop(0, 'rgba(0,0,0,1)');
  down.addColorStop(0.6, 'rgba(0,0,0,0.45)');
  down.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = down;
  ctx.fillRect(0, 0, 64, 512);
  return c;
}

/** Out-of-focus particle for the nearest layer of drifting marine snow. */
export function makeSoftDot(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(32, 32);
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return c;
}

export { makeCanvas };
