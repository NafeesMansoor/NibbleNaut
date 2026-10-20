import type { OceanKind } from '../config';
import { seededRng, type Rng } from '../core/math';
import { makeCanvas } from './textures';

/**
 * Distant scenery in screen space: two hazy parallax layers of reef ridges and kelp silhouettes,
 * plus schools of far-away fish. Atmospheric perspective (things fade toward the water colour
 * with distance) is what makes the scene read as "underwater", so far layers are low-contrast
 * and translucent and blend into whatever water colour is behind them.
 */

interface LayerSpec {
  seed: number;
  /** Horizontal / vertical parallax relative to the world. */
  fx: number;
  fy: number;
  /** Tile size in CSS px at a 720 px-tall screen. */
  tileW: number;
  tileH: number;
  top: [number, number, number, number];
  bottom: [number, number, number, number];
  kelp: number;
  ridge: { base: number; amp: number; pinnacles: number };
}

const LAYERS: Record<OceanKind, LayerSpec[]> = {
  normal: [
    { seed: 11, fx: 0.18, fy: 0.45, tileW: 1800, tileH: 520, top: [70, 160, 225, 0.34], bottom: [30, 100, 185, 0.55], kelp: 12, ridge: { base: 0.62, amp: 0.16, pinnacles: 4 } },
    { seed: 23, fx: 0.4, fy: 0.68, tileW: 1500, tileH: 440, top: [50, 125, 205, 0.55], bottom: [22, 75, 160, 0.8], kelp: 16, ridge: { base: 0.7, amp: 0.13, pinnacles: 3 } },
  ],
  plenty: [
    { seed: 11, fx: 0.18, fy: 0.45, tileW: 1800, tileH: 520, top: [140, 175, 140, 0.3], bottom: [50, 110, 110, 0.5], kelp: 10, ridge: { base: 0.62, amp: 0.16, pinnacles: 4 } },
    { seed: 23, fx: 0.4, fy: 0.68, tileW: 1500, tileH: 440, top: [110, 140, 100, 0.5], bottom: [30, 80, 85, 0.78], kelp: 14, ridge: { base: 0.7, amp: 0.13, pinnacles: 3 } },
  ],
};

interface School {
  x: number;
  y: number;
  vx: number;
  fish: { ox: number; oy: number; ph: number; s: number }[];
  layer: number;
}

const TAU = Math.PI * 2;
const rgba = (c: [number, number, number, number]): string => `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`;

interface Jelly {
  x: number;
  y: number;
  s: number;
  ph: number;
  bell: string;
  stripe: string;
}

export class Backdrop {
  private tiles = new Map<string, HTMLCanvasElement>();
  private schools: School[] = [];
  private jellies: Jelly[] = [];

  constructor() {
    const rng = seededRng(41);
    const tones: [string, string][] = [
      ['255,214,150', '232,120,60'],
      ['255,190,210', '220,90,150'],
      ['220,200,255', '150,100,230'],
    ];
    for (let i = 0; i < 6; i++) {
      const [bell, stripe] = tones[i % tones.length];
      this.jellies.push({ x: rng() * 2400, y: 0.12 + rng() * 0.45, s: 0.7 + rng() * 0.6, ph: rng() * TAU, bell, stripe });
    }
    for (let i = 0; i < 5; i++) {
      const n = 10 + Math.floor(rng() * 16);
      const fish = [];
      for (let k = 0; k < n; k++) fish.push({ ox: (rng() - 0.5) * 140, oy: (rng() - 0.5) * 50, ph: rng() * TAU, s: 0.7 + rng() * 0.6 });
      this.schools.push({ x: rng() * 3000, y: 0.25 + rng() * 0.45, vx: (rng() < 0.5 ? -1 : 1) * (12 + rng() * 18), fish, layer: i % 2 });
    }
  }

  private tile(kind: OceanKind, index: number): HTMLCanvasElement {
    const key = `${kind}:${index}`;
    let c = this.tiles.get(key);
    if (!c) {
      c = buildLayer(LAYERS[kind][index]);
      this.tiles.set(key, c);
    }
    return c;
  }

  /**
   * `floorScreenY` is where the real seabed sits on screen; layers sit higher than it (they are
   * farther away) and slide with parallax as the camera moves.
   */
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, camX: number, zoom: number, floorScreenY: number, kind: OceanKind, t: number): void {
    const scale = h / 720;
    const specs = LAYERS[kind];
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      this.drawSchools(ctx, w, h, camX, zoom, t, i, kind);
      // The layer's base is pulled up toward the screen centre the farther away it is.
      const base = h / 2 + (floorScreenY - h / 2) * s.fy + 30 * scale;
      const th = s.tileH * scale;
      const top = base - th;
      if (top > h) continue;
      const tw = s.tileW * scale;
      const off = -((((camX * zoom * s.fx) % tw) + tw) % tw);
      const img = this.tile(kind, i);
      for (let x = off; x < w; x += tw) ctx.drawImage(img, x, top, tw, th);
      if (base < h) {
        ctx.fillStyle = rgba(s.bottom);
        ctx.fillRect(0, base - 1, w, h - base + 1);
      }
    }
    this.drawJellies(ctx, w, h, camX, zoom, t);
  }

  /** Translucent jellyfish pulsing slowly upward in the middle distance. */
  private drawJellies(ctx: CanvasRenderingContext2D, w: number, h: number, camX: number, zoom: number, t: number): void {
    const span = w + 300;
    const scale = h / 720;
    ctx.save();
    ctx.lineCap = 'round';
    for (const j of this.jellies) {
      const px = ((((j.x - camX * zoom * 0.25 + Math.sin(t * 0.1 + j.ph) * 30) % span) + span) % span) - 150;
      const rise = ((j.y * h - t * 6 * j.s) % (h * 0.8) + h * 0.8) % (h * 0.8);
      const py = rise + h * 0.05;
      const pulse = 1 + Math.sin(t * 1.8 + j.ph) * 0.12;
      const r = 26 * j.s * scale;
      const bw = r * pulse;
      const bh = r * 0.8 / pulse;
      // Trailing tentacles, swaying.
      ctx.strokeStyle = `rgba(${j.bell},0.4)`;
      ctx.lineWidth = Math.max(1, 1.6 * scale);
      for (let k = -3; k <= 3; k++) {
        const tx = px + k * bw * 0.22;
        ctx.beginPath();
        ctx.moveTo(tx, py);
        ctx.bezierCurveTo(tx + Math.sin(t * 1.4 + k + j.ph) * r * 0.5, py + r * 1.2, tx - Math.sin(t * 1.1 + k) * r * 0.5, py + r * 2.2, tx + Math.sin(t + k * 0.7) * r * 0.4, py + r * (2.8 + (k & 1) * 0.6));
        ctx.stroke();
      }
      // Frilly oral arms.
      ctx.strokeStyle = `rgba(${j.stripe},0.55)`;
      ctx.lineWidth = Math.max(1.5, 4 * scale);
      for (const k of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(px + k * bw * 0.15, py);
        ctx.quadraticCurveTo(px + k * bw * 0.4 + Math.sin(t * 1.3 + j.ph) * r * 0.2, py + r * 0.9, px + k * bw * 0.1, py + r * 1.6);
        ctx.stroke();
      }
      // Bell with a glossy top and radial stripes.
      const g = ctx.createRadialGradient(px - bw * 0.3, py - bh * 0.7, 0, px, py - bh * 0.3, bw * 1.2);
      g.addColorStop(0, `rgba(255,255,255,0.85)`);
      g.addColorStop(0.35, `rgba(${j.bell},0.75)`);
      g.addColorStop(1, `rgba(${j.bell},0.35)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(px, py, bw, bh, 0, Math.PI, TAU);
      ctx.quadraticCurveTo(px, py + bh * 0.35, px - bw, py);
      ctx.fill();
      ctx.strokeStyle = `rgba(${j.stripe},0.6)`;
      ctx.lineWidth = Math.max(1, 2 * scale);
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.moveTo(px + k * bw * 0.12, py - bh * 0.92);
        ctx.quadraticCurveTo(px + k * bw * 0.32, py - bh * 0.5, px + k * bw * 0.42, py);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private drawSchools(ctx: CanvasRenderingContext2D, w: number, h: number, camX: number, zoom: number, t: number, layer: number, kind: OceanKind): void {
    const span = w + 400;
    ctx.fillStyle = kind === 'plenty' ? 'rgba(40,80,70,0.28)' : layer === 0 ? 'rgba(20,80,160,0.3)' : 'rgba(14,60,130,0.38)';
    const size = (layer === 0 ? 3.2 : 4.6) * (h / 720);
    for (const sc of this.schools) {
      if (sc.layer !== layer) continue;
      const px = ((((sc.x + sc.vx * t - camX * zoom * (layer === 0 ? 0.12 : 0.3)) % span) + span) % span) - 200;
      const py = sc.y * h + Math.sin(t * 0.3 + sc.x) * 12;
      const dir = sc.vx < 0 ? -1 : 1;
      for (const f of sc.fish) {
        const fx = px + f.ox + Math.sin(t * 0.8 + f.ph) * 6;
        const fy = py + f.oy + Math.cos(t * 0.6 + f.ph) * 4;
        const L = size * f.s;
        ctx.beginPath();
        ctx.ellipse(fx, fy, L, L * 0.38, 0, 0, TAU);
        ctx.moveTo(fx - dir * L * 0.8, fy);
        ctx.lineTo(fx - dir * L * 1.6, fy - L * 0.45);
        ctx.lineTo(fx - dir * L * 1.6, fy + L * 0.45);
        ctx.fill();
      }
    }
  }
}

/** Tileable 1-D height: sum of sines with integer periods across the tile width. */
function ridgeFn(rng: Rng, w: number): (x: number) => number {
  const waves = [1, 2, 3, 5, 8].map((k) => ({ k, a: (rng() * 0.6 + 0.4) / k, p: rng() * TAU }));
  const norm = waves.reduce((s, v) => s + v.a, 0);
  return (x) => waves.reduce((s, v) => s + v.a * Math.sin((TAU * v.k * x) / w + v.p), 0) / norm;
}

function buildLayer(s: LayerSpec): HTMLCanvasElement {
  const rng = seededRng(s.seed);
  const W = s.tileW;
  const H = s.tileH;
  const [c, ctx] = makeCanvas(W, H);
  const ridge = ridgeFn(rng, W);
  const pin = Array.from({ length: s.ridge.pinnacles }, () => ({ x: rng() * W, w: 60 + rng() * 120, h: 0.15 + rng() * 0.25 }));
  const heightAt = (x: number): number => {
    let y = H * (s.ridge.base + s.ridge.amp * ridge(x));
    for (const p of pin) {
      // Wrap distance so pinnacles near the edge continue on the next tile.
      let d = Math.abs(x - p.x);
      d = Math.min(d, W - d);
      if (d < p.w) y -= H * p.h * Math.pow(Math.cos((d / p.w) * (Math.PI / 2)), 1.5);
    }
    return y;
  };

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, rgba(s.top));
  grad.addColorStop(1, rgba(s.bottom));

  // Kelp silhouettes behind the ridge line, rising from it.
  ctx.strokeStyle = rgba([s.bottom[0], s.bottom[1], s.bottom[2], s.top[3] * 0.9]);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineCap = 'round';
  for (let i = 0; i < s.kelp; i++) {
    const x = rng() * W;
    const by = heightAt(x) + 20;
    const kh = H * (0.35 + rng() * 0.45);
    const lean = (rng() - 0.5) * 60;
    for (const dx of [0, W, -W]) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + dx, by);
      ctx.quadraticCurveTo(x + dx + lean, by - kh * 0.5, x + dx + lean * 0.4, by - kh);
      ctx.stroke();
      for (let b = 0.15; b < 1; b += 0.09) {
        const bx = x + dx + lean * Math.sin(b * Math.PI * 0.6) * 0.7;
        const byy = by - kh * b;
        const side = Math.round(b * 11) % 2 ? 1 : -1;
        ctx.beginPath();
        ctx.ellipse(bx + side * 10, byy - 6, 13, 4, side * -0.6, 0, TAU);
        ctx.fill();
      }
    }
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 8) ctx.lineTo(x, heightAt(x));
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Soft light catching the tops of the ridges.
  ctx.strokeStyle = `rgba(255,255,255,${s.top[3] * 0.18})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 8) {
    const y = heightAt(x) + 1;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  return c;
}
