import { CONFIG } from '../config';
import { pickWeighted, randRange, seededRng, type Rng } from '../core/math';

/**
 * Reef scenery along the seabed, generated once from a fixed seed. The sea is endless: the scenery
 * is one tile `CONFIG.world.width` long that repeats seamlessly to the left and right. Two rows give depth:
 * the back row stands on the sand line and is softened by water haze; the front row sits in the
 * sand in the foreground. Everything is lit from above (lighter tops, darker bases).
 */

const TAU = Math.PI * 2;

type Item =
  | { k: 'rock'; x: number; y: number; ext: number; top: number; pts: number[]; blotches: number[]; tufts: number[]; crust: number[]; light: string; dark: string }
  | { k: 'kelp'; x: number; y: number; ext: number; top: number; h: number; phase: number; lean: number; blade: string; stipe: string; spacing: number }
  | { k: 'grass'; x: number; y: number; ext: number; top: number; blades: number[]; phase: number; color: string }
  | { k: 'staghorn'; x: number; y: number; ext: number; top: number; segs: number[]; tips: number[]; color: string; shade: string; light: string }
  | { k: 'brain'; x: number; y: number; ext: number; top: number; rx: number; ry: number; grooves: number[][]; light: string; dark: string }
  | { k: 'fan'; x: number; y: number; ext: number; top: number; segs: number[]; color: string; phase: number; size: number }
  | { k: 'sponge'; x: number; y: number; ext: number; top: number; tubes: number[]; color: string }
  | { k: 'anemone'; x: number; y: number; ext: number; top: number; r: number; n: number; color: string; tip: string; phase: number }
  | { k: 'star'; x: number; y: number; ext: number; top: number; r: number; rot: number; color: string }
  | { k: 'shell'; x: number; y: number; ext: number; top: number; r: number; rot: number; color: string }
  | { k: 'urchin'; x: number; y: number; ext: number; top: number; r: number }
  | { k: 'pebble'; x: number; y: number; ext: number; top: number; rx: number; ry: number; color: string };

const pick = <T,>(rng: Rng, list: T[]): T => list[Math.floor(rng() * list.length)];

// Bright cartoon-reef palette: grey rocks, violet and amber branching corals, golden brain
// corals, pink anemones and green/purple seaweed over pale sand.
const ROCK_TONES: [string, string][] = [
  ['#a3a9b8', '#3a3f4f'],
  ['#9097a8', '#30364a'],
  ['#a99fb8', '#3d3550'],
  ['#8e9aa6', '#2c3644'],
];
const KELP: [string, string][] = [
  ['#3fbf4f', '#237a34'],
  ['#2fae5e', '#1d7040'],
  ['#9a45e0', '#5e2496'],
  ['#b25cf0', '#6a2aa6'],
  ['#5fd05a', '#2f8a34'],
];
const GRASS = ['#3fbf4f', '#5fd05a', '#2fa04a', '#a04fe0'];
const STAGHORN: [string, string, string][] = [
  ['#a63fe0', '#6a1fa0', '#e2a8ff'],
  ['#c04fd8', '#7a2696', '#f0b8ff'],
  ['#f2a024', '#b8650c', '#ffd98a'],
  ['#ff8a3a', '#c0501a', '#ffc79a'],
  ['#ff6fae', '#b83a74', '#ffc2de'],
];
const BRAIN: [string, string][] = [
  ['#ffd45a', '#c8861a'],
  ['#ffc94a', '#b8741c'],
  ['#f5d36e', '#b48a2a'],
  ['#8fdc5a', '#3f8a2a'],
];
const FANS = ['#c23ad8', '#8a3fe0', '#ff8a2a', '#ff4f8a'];
const SPONGES = ['#ff8a2a', '#ffcf3a', '#a04fe0', '#ff5a7a'];
const ANEMONES: [string, string][] = [
  ['#ff8fc4', '#fff0f7'],
  ['#ff6fae', '#ffe0ef'],
  ['#c58ae0', '#f6e6ff'],
  ['#ffb35a', '#fff3d6'],
];
const STARS = ['#c23ad8', '#ff5a3a', '#ffb02a', '#ff4f8a'];
const SHELLS = ['#efe2cc', '#f2c9b0', '#e9d7e8'];
const PEBBLES = ['#b9b2a6', '#9a9389', '#c7bfb2'];

export class Decor {
  readonly back: Item[] = [];
  readonly front: Item[] = [];
  /** Sand surface heights sampled every `sandStep` world units across one tile (periodic). */
  readonly sand: number[] = [];
  readonly sandStep = 80;
  private readonly period = CONFIG.world.width;

  constructor(seed = 7) {
    const rng = seededRng(seed);
    const W = CONFIG.world.width;
    const base = CONFIG.world.height - CONFIG.world.seabedHeight;
    // Whole numbers of waves per tile, so the sand meets itself seamlessly where tiles join.
    const k1 = (Math.PI * 2 * 4) / W;
    const k2 = (Math.PI * 2 * 13) / W;
    for (let x = 0; x < W; x += this.sandStep) {
      this.sand.push(base + 14 + Math.sin(x * k1) * 10 + Math.sin(x * k2 + 1) * 6 + rng() * 4);
    }

    let x = 20;
    while (x < W) {
      const y = this.sandAt(x) + 6;
      const kind = pickWeighted(rng, { kelp: 0.16, rock: 0.16, staghorn: 0.2, brain: 0.14, fan: 0.1, sponge: 0.1, grass: 0.14 });
      if (kind === 'kelp') {
        // Kelp grows in groves.
        const n = 1 + Math.floor(rng() * 3);
        for (let i = 0; i < n; i++) this.back.push(makeKelp(rng, x + i * randRange(rng, 25, 70), this.sandAt(x) + 6));
      } else if (kind === 'rock') this.back.push(makeRock(rng, x, y, randRange(rng, 90, 280), randRange(rng, 60, 170)));
      else if (kind === 'staghorn') this.back.push(makeStaghorn(rng, x, y, randRange(rng, 90, 220)));
      else if (kind === 'brain') this.back.push(makeBrain(rng, x, y + 4, randRange(rng, 30, 80)));
      else if (kind === 'fan') this.back.push(makeFan(rng, x, y, randRange(rng, 90, 200)));
      else if (kind === 'sponge') this.back.push(makeSponge(rng, x, y));
      else this.back.push(makeGrass(rng, x, y, 60, 150));
      x += randRange(rng, 55, 190);
    }

    x = 10;
    while (x < W) {
      const y = this.sandAt(x) + randRange(rng, 28, 88);
      const kind = pickWeighted(rng, { grass: 0.26, anemone: 0.18, star: 0.12, shell: 0.12, urchin: 0.05, pebbles: 0.12, rock: 0.07, brain: 0.08 });
      if (kind === 'grass') this.front.push(makeGrass(rng, x, y, 30, 90));
      else if (kind === 'anemone') this.front.push(makeAnemone(rng, x, y));
      else if (kind === 'star') this.front.push({ k: 'star', x, y, ext: 30, top: 30, r: randRange(rng, 10, 20), rot: rng() * TAU, color: pick(rng, STARS) });
      else if (kind === 'shell') this.front.push({ k: 'shell', x, y, ext: 20, top: 20, r: randRange(rng, 6, 13), rot: (rng() - 0.5) * 1.2, color: pick(rng, SHELLS) });
      else if (kind === 'urchin') this.front.push({ k: 'urchin', x, y, ext: 30, top: 30, r: randRange(rng, 7, 13) });
      else if (kind === 'pebbles') {
        const n = 2 + Math.floor(rng() * 5);
        for (let i = 0; i < n; i++) {
          const rx = randRange(rng, 4, 12);
          this.front.push({ k: 'pebble', x: x + randRange(rng, -30, 30), y: y + randRange(rng, -8, 8), ext: 14, top: 10, rx, ry: rx * randRange(rng, 0.5, 0.8), color: pick(rng, PEBBLES) });
        }
      } else if (kind === 'rock') this.front.push(makeRock(rng, x, y + 10, randRange(rng, 40, 90), randRange(rng, 22, 50)));
      else this.front.push(makeBrain(rng, x, y + 4, randRange(rng, 14, 28)));
      x += randRange(rng, 40, 140);
    }
  }

  /** Sand height at sample index `i` (any integer: the samples repeat every tile). */
  private sandSample(i: number): number {
    const n = this.sand.length;
    return this.sand[((i % n) + n) % n];
  }

  sandAt(x: number): number {
    const f = x / this.sandStep;
    const i = Math.floor(f);
    const a = this.sandSample(i);
    return a + (this.sandSample(i + 1) - a) * (f - i);
  }

  drawBack(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number, t: number, zoom: number): void {
    this.tiled(ctx, this.back, x0, x1, y0, y1, t, zoom);
  }

  drawFront(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number, t: number, zoom: number): void {
    this.tiled(ctx, this.front, x0, x1, y0, y1, t, zoom);
  }

  /** Draws every repeat of the tile that overlaps [x0, x1] (with a margin for wide items). */
  private tiled(ctx: CanvasRenderingContext2D, items: Item[], x0: number, x1: number, y0: number, y1: number, t: number, zoom: number): void {
    const W = this.period;
    const margin = 600;
    for (let k = Math.floor((x0 - margin) / W); k <= Math.floor((x1 + margin) / W); k++) {
      const off = k * W;
      ctx.save();
      ctx.translate(off, 0);
      drawItems(ctx, items, x0 - off, x1 - off, y0, y1, t, zoom);
      ctx.restore();
    }
  }

  /** Sand band: textured fill, then shading so it darkens with distance into the foreground. */
  drawSand(ctx: CanvasRenderingContext2D, x0: number, x1: number, texture: CanvasPattern | null, fallback: string, plenty: boolean): void {
    const H = CONFIG.world.height;
    const i0 = Math.floor(x0 / this.sandStep) - 1;
    const i1 = Math.ceil(x1 / this.sandStep) + 1;
    ctx.beginPath();
    ctx.moveTo(i0 * this.sandStep, H + 50);
    for (let i = i0; i <= i1; i++) ctx.lineTo(i * this.sandStep, this.sandSample(i));
    ctx.lineTo(i1 * this.sandStep, H + 50);
    ctx.closePath();
    ctx.fillStyle = texture ?? fallback;
    ctx.fill();
    const top = H - CONFIG.world.seabedHeight;
    const shade = ctx.createLinearGradient(0, top, 0, top + 160);
    shade.addColorStop(0, plenty ? 'rgba(40,110,110,0.32)' : 'rgba(40,110,190,0.3)');
    shade.addColorStop(0.25, plenty ? 'rgba(40,110,110,0.12)' : 'rgba(60,130,200,0.08)');
    shade.addColorStop(1, plenty ? 'rgba(10,30,50,0.28)' : 'rgba(30,60,120,0.18)');
    ctx.fillStyle = shade;
    ctx.fill();
  }
}

function drawItems(ctx: CanvasRenderingContext2D, items: Item[], x0: number, x1: number, y0: number, y1: number, t: number, zoom: number): void {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const hair = 1 / zoom;
  for (const it of items) {
    if (it.x + it.ext < x0 || it.x - it.ext > x1 || it.y - it.top > y1 || it.y + 40 < y0) continue;
    switch (it.k) {
      case 'rock':
        drawRock(ctx, it, t);
        break;
      case 'kelp':
        drawKelp(ctx, it, t, hair);
        break;
      case 'grass':
        drawGrass(ctx, it, t);
        break;
      case 'staghorn':
        drawStaghorn(ctx, it, hair);
        break;
      case 'brain':
        drawBrain(ctx, it);
        break;
      case 'fan':
        drawFan(ctx, it, t, hair);
        break;
      case 'sponge':
        drawSponge(ctx, it);
        break;
      case 'anemone':
        drawAnemone(ctx, it, t);
        break;
      case 'star':
        drawStar(ctx, it);
        break;
      case 'shell':
        drawShell(ctx, it);
        break;
      case 'urchin':
        drawUrchin(ctx, it, hair);
        break;
      case 'pebble': {
        const g = ctx.createRadialGradient(it.x - it.rx * 0.3, it.y - it.ry * 0.4, 0, it.x, it.y, it.rx);
        g.addColorStop(0, it.color);
        g.addColorStop(1, '#5a554d');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(it.x, it.y, it.rx, it.ry, 0, 0, TAU);
        ctx.fill();
        break;
      }
    }
  }
}

// ---------- generators ----------

function makeRock(rng: Rng, x: number, y: number, w: number, h: number): Item {
  const pts: number[] = [];
  const n = 13;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    const k = i === 0 || i === n ? 1 : 0.8 + rng() * 0.28;
    pts.push(x + Math.cos(a) * w * 0.5 * k, y + 12 + Math.sin(a) * h * k);
  }
  const blotches: number[] = [];
  for (let i = 0; i < 22; i++) blotches.push(x + (rng() - 0.5) * w * 0.85, y - rng() * h * 0.85, 2 + rng() * w * 0.05, 1.5 + rng() * h * 0.035, rng() < 0.6 ? 0 : 1);
  const tufts: number[] = [];
  for (let i = 1; i < n; i++) if (rng() < 0.55) tufts.push(pts[i * 2], pts[i * 2 + 1], 6 + rng() * 14, rng() * TAU);
  const crust: number[] = [];
  for (let i = 0; i < 3; i++) if (rng() < 0.6) crust.push(x + (rng() - 0.5) * w * 0.6, y - h * (0.2 + rng() * 0.5), 8 + rng() * 18, 4 + rng() * 8);
  const [light, dark] = pick(rng, ROCK_TONES);
  return { k: 'rock', x, y, ext: w * 0.6, top: h + 20, pts, blotches, tufts, crust, light, dark };
}

function makeKelp(rng: Rng, x: number, y: number): Item {
  const h = randRange(rng, 380, 1050);
  const [blade, stipe] = pick(rng, KELP);
  return { k: 'kelp', x, y, ext: 160, top: h + 60, h, phase: rng() * TAU, lean: (rng() - 0.5) * 120, blade, stipe, spacing: randRange(rng, 30, 44) };
}

function makeGrass(rng: Rng, x: number, y: number, hMin: number, hMax: number): Item {
  const n = 8 + Math.floor(rng() * 10);
  const blades: number[] = [];
  for (let i = 0; i < n; i++) blades.push((rng() - 0.5) * 30, randRange(rng, hMin, hMax), (rng() - 0.5) * 2, randRange(rng, 2.2, 4.2));
  return { k: 'grass', x, y, ext: 80, top: hMax + 20, blades, phase: rng() * TAU, color: pick(rng, GRASS) };
}

function makeStaghorn(rng: Rng, x: number, y: number, size: number): Item {
  const segs: number[] = [];
  const tips: number[] = [];
  const branch = (bx: number, by: number, a: number, len: number, w: number, depth: number): void => {
    const x2 = bx + Math.cos(a) * len;
    const y2 = by + Math.sin(a) * len;
    segs.push(bx, by, x2, y2, w);
    if (depth <= 0) {
      tips.push(x2, y2, w);
      return;
    }
    const n = rng() < 0.55 ? 2 : 3;
    for (let i = 0; i < n; i++) branch(x2, y2, a + randRange(rng, -0.75, 0.75), len * randRange(rng, 0.62, 0.82), w * 0.74, depth - 1);
  };
  const stems = 1 + Math.floor(rng() * 3);
  for (let s = 0; s < stems; s++) branch(x + (rng() - 0.5) * size * 0.4, y, -Math.PI / 2 + (rng() - 0.5) * 0.6, size * 0.4, size * 0.11, 3);
  const [color, shade, light] = pick(rng, STAGHORN);
  return { k: 'staghorn', x, y, ext: size * 1.3, top: size * 1.6, segs, tips, color, shade, light };
}

function makeBrain(rng: Rng, x: number, y: number, rx: number): Item {
  const ry = rx * randRange(rng, 0.55, 0.75);
  const grooves: number[][] = [];
  for (let g = 0; g < 7; g++) {
    const line: number[] = [];
    let gx = x + (rng() - 0.5) * rx * 1.6;
    let gy = y - rng() * ry * 0.9;
    let a = rng() * TAU;
    for (let i = 0; i < 14; i++) {
      line.push(gx, gy);
      a += (rng() - 0.5) * 2.2;
      gx += Math.cos(a) * rx * 0.12;
      gy += Math.sin(a) * rx * 0.1;
    }
    grooves.push(line);
  }
  const [light, dark] = pick(rng, BRAIN);
  return { k: 'brain', x, y, ext: rx + 10, top: ry + 10, rx, ry, grooves, light, dark };
}

function makeFan(rng: Rng, x: number, y: number, size: number): Item {
  const segs: number[] = [];
  const branch = (bx: number, by: number, a: number, len: number, w: number, depth: number): void => {
    const x2 = bx + Math.cos(a) * len;
    const y2 = by + Math.sin(a) * len;
    segs.push(bx, by, x2, y2, w);
    if (depth <= 0) return;
    branch(x2, y2, a - randRange(rng, 0.15, 0.45), len * 0.8, w * 0.8, depth - 1);
    branch(x2, y2, a + randRange(rng, 0.15, 0.45), len * 0.8, w * 0.8, depth - 1);
  };
  branch(x, y, -Math.PI / 2, size * 0.22, 4, 6);
  return { k: 'fan', x, y, ext: size, top: size * 1.2, segs, color: pick(rng, FANS), phase: rng() * TAU, size };
}

function makeSponge(rng: Rng, x: number, y: number): Item {
  const n = 2 + Math.floor(rng() * 3);
  const tubes: number[] = [];
  for (let i = 0; i < n; i++) tubes.push((i - (n - 1) / 2) * randRange(rng, 18, 26), randRange(rng, 14, 26), randRange(rng, 40, 130));
  return { k: 'sponge', x, y, ext: 70, top: 140, tubes, color: pick(rng, SPONGES) };
}

function makeAnemone(rng: Rng, x: number, y: number): Item {
  const r = randRange(rng, 16, 34);
  const [color, tip] = pick(rng, ANEMONES);
  return { k: 'anemone', x, y, ext: r * 2, top: r * 2, r, n: 18 + Math.floor(rng() * 10), color, tip, phase: rng() * TAU };
}

// ---------- drawing ----------

type Of<K extends Item['k']> = Extract<Item, { k: K }>;

function drawRock(ctx: CanvasRenderingContext2D, r: Of<'rock'>, t: number): void {
  const p = r.pts;
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, r.y - r.top, 0, r.y + 12);
  g.addColorStop(0, r.light);
  g.addColorStop(1, r.dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const b = r.blotches;
  for (let i = 0; i < b.length; i += 5) {
    ctx.fillStyle = b[i + 4] ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.13)';
    ctx.beginPath();
    ctx.ellipse(b[i], b[i + 1], b[i + 2], b[i + 3], 0, 0, TAU);
    ctx.fill();
  }
  const c = r.crust;
  ctx.fillStyle = 'rgba(214,120,150,0.45)';
  for (let i = 0; i < c.length; i += 4) {
    ctx.beginPath();
    ctx.ellipse(c[i], c[i + 1], c[i + 2], c[i + 3], 0, 0, TAU);
    ctx.fill();
  }
  // Sunlit top-left.
  const hl = ctx.createRadialGradient(r.x - r.ext * 0.3, r.y - r.top * 0.9, 0, r.x - r.ext * 0.3, r.y - r.top * 0.9, r.ext);
  hl.addColorStop(0, 'rgba(255,255,255,0.22)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.fillRect(r.x - r.ext, r.y - r.top - 10, r.ext * 2, r.top + 30);
  ctx.restore();
  // Algae tufts along the top edge.
  const tf = r.tufts;
  ctx.strokeStyle = 'rgba(98,142,70,0.9)';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < tf.length; i += 4) {
    const sway = Math.sin(t * 1.5 + tf[i + 3]) * tf[i + 2] * 0.35;
    ctx.beginPath();
    for (let k = -1; k <= 1; k++) {
      ctx.moveTo(tf[i] + k * 3, tf[i + 1] + 2);
      ctx.quadraticCurveTo(tf[i] + k * 5 + sway * 0.5, tf[i + 1] - tf[i + 2] * 0.6, tf[i] + k * 6 + sway, tf[i + 1] - tf[i + 2]);
    }
    ctx.stroke();
  }
}

function drawKelp(ctx: CanvasRenderingContext2D, k: Of<'kelp'>, t: number, hair: number): void {
  const N = 16;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const sway = Math.sin(t * 0.55 + k.phase + f * 2.4) * k.h * 0.06 * f + Math.sin(t * 0.23 + k.phase) * k.h * 0.03 * f;
    xs.push(k.x + sway + k.lean * f * f);
    ys.push(k.y - k.h * f);
  }
  ctx.strokeStyle = k.stipe;
  ctx.lineWidth = Math.max(4, hair);
  ctx.beginPath();
  ctx.moveTo(xs[0], ys[0]);
  for (let i = 1; i <= N; i++) ctx.lineTo(xs[i], ys[i]);
  ctx.stroke();

  let j = 0;
  for (let d = k.spacing * 1.5; d < k.h; d += k.spacing, j++) {
    const f = d / k.h;
    const fi = f * N;
    const i = Math.min(N - 1, Math.floor(fi));
    const u = fi - i;
    const bx = xs[i] + (xs[i + 1] - xs[i]) * u;
    const by = ys[i] + (ys[i + 1] - ys[i]) * u;
    const side = j % 2 ? 1 : -1;
    const a = -Math.PI / 2 + side * (1.05 - f * 0.45) + Math.sin(t * 1.1 + k.phase + j) * 0.18;
    // Long, ruffled, translucent blade: a leaf shape bent slightly by the current.
    const L = 70 * (1 - f * 0.3);
    const W = 5.5 * (1 - f * 0.3);
    const bend = Math.sin(t * 1.3 + k.phase + j * 0.7) * 0.25;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const tx = bx + ca * L + Math.cos(a + bend) * 6;
    const ty = by + sa * L + Math.sin(a + bend) * 6;
    const mx = bx + ca * L * 0.5;
    const my = by + sa * L * 0.5;
    ctx.globalAlpha = 0.78;
    ctx.fillStyle = k.blade;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(mx - sa * W * 1.6, my + ca * W * 1.6, tx, ty);
    ctx.quadraticCurveTo(mx + sa * W * 1.6, my - ca * W * 1.6, bx, by);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = k.stipe;
    ctx.lineWidth = Math.max(1, hair);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = k.stipe;
    ctx.beginPath();
    ctx.arc(bx + ca * 4, by + sa * 4, 2.8, 0, TAU);
    ctx.fill();
  }
}

function drawGrass(ctx: CanvasRenderingContext2D, g: Of<'grass'>, t: number): void {
  ctx.strokeStyle = g.color;
  const b = g.blades;
  for (let i = 0; i < b.length; i += 4) {
    const bx = g.x + b[i];
    const h = b[i + 1];
    const sway = Math.sin(t * 1.2 + g.phase + b[i] * 0.05) * h * 0.18 + b[i + 2] * h * 0.25;
    ctx.lineWidth = b[i + 3];
    ctx.beginPath();
    ctx.moveTo(bx, g.y);
    ctx.quadraticCurveTo(bx + sway * 0.3, g.y - h * 0.55, bx + sway, g.y - h);
    ctx.stroke();
  }
}

function drawStaghorn(ctx: CanvasRenderingContext2D, c: Of<'staghorn'>, hair: number): void {
  const s = c.segs;
  for (const [color, wMul, off] of [
    [c.shade, 1, 0],
    [c.color, 0.72, -0.12],
    [c.light, 0.28, -0.25],
  ] as [string, number, number][]) {
    ctx.strokeStyle = color;
    for (let i = 0; i < s.length; i += 5) {
      const w = s[i + 4];
      ctx.lineWidth = Math.max(w * wMul, hair);
      ctx.beginPath();
      ctx.moveTo(s[i] + w * off, s[i + 1]);
      ctx.lineTo(s[i + 2] + w * off, s[i + 3]);
      ctx.stroke();
    }
  }
  ctx.fillStyle = c.light;
  const tp = c.tips;
  for (let i = 0; i < tp.length; i += 3) {
    ctx.beginPath();
    ctx.arc(tp[i], tp[i + 1], Math.max(tp[i + 2] * 0.5, hair), 0, TAU);
    ctx.fill();
  }
}

function drawBrain(ctx: CanvasRenderingContext2D, b: Of<'brain'>): void {
  ctx.beginPath();
  ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, Math.PI, TAU);
  ctx.closePath();
  const g = ctx.createRadialGradient(b.x - b.rx * 0.35, b.y - b.ry * 0.85, b.rx * 0.05, b.x, b.y - b.ry * 0.3, b.rx * 1.1);
  g.addColorStop(0, b.light);
  g.addColorStop(1, b.dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(120,70,10,0.45)';
  ctx.lineWidth = Math.max(1, b.rx * 0.045);
  for (const line of b.grooves) {
    ctx.beginPath();
    ctx.moveTo(line[0], line[1]);
    for (let i = 2; i < line.length; i += 2) ctx.lineTo(line[i], line[i + 1]);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFan(ctx: CanvasRenderingContext2D, f: Of<'fan'>, t: number, hair: number): void {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(Math.sin(t * 0.5 + f.phase) * 0.05);
  ctx.translate(-f.x, -f.y);
  // Fine mesh between the branches.
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = f.color;
  ctx.beginPath();
  ctx.moveTo(f.x, f.y);
  ctx.ellipse(f.x, f.y - f.size * 0.1, f.size * 0.6, f.size * 0.85, 0, Math.PI * 1.08, Math.PI * 1.92);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = f.color;
  const s = f.segs;
  for (let i = 0; i < s.length; i += 5) {
    ctx.lineWidth = Math.max(s[i + 4] * 0.6, hair);
    ctx.beginPath();
    ctx.moveTo(s[i], s[i + 1]);
    ctx.lineTo(s[i + 2], s[i + 3]);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSponge(ctx: CanvasRenderingContext2D, s: Of<'sponge'>): void {
  const tb = s.tubes;
  for (let i = 0; i < tb.length; i += 3) {
    const cx = s.x + tb[i];
    const w = tb[i + 1];
    const h = tb[i + 2];
    const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(0.35, s.color);
    g.addColorStop(0.65, s.color);
    g.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.42, s.y);
    ctx.lineTo(cx - w * 0.5, s.y - h);
    ctx.lineTo(cx + w * 0.5, s.y - h);
    ctx.lineTo(cx + w * 0.42, s.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.ellipse(cx, s.y - h, w * 0.5, w * 0.18, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(25,12,8,0.75)';
    ctx.beginPath();
    ctx.ellipse(cx, s.y - h, w * 0.36, w * 0.12, 0, 0, TAU);
    ctx.fill();
  }
}

function drawAnemone(ctx: CanvasRenderingContext2D, a: Of<'anemone'>, t: number): void {
  ctx.fillStyle = 'rgba(90,50,60,0.9)';
  ctx.beginPath();
  ctx.ellipse(a.x, a.y, a.r * 0.7, a.r * 0.35, 0, 0, TAU);
  ctx.fill();
  ctx.lineWidth = a.r * 0.17;
  for (let i = 0; i < a.n; i++) {
    const base = -Math.PI + 0.25 + (i / (a.n - 1)) * (Math.PI - 0.5);
    const ang = base + Math.sin(t * 1.6 + a.phase + i * 0.45) * 0.22;
    const L = a.r * (1.3 + ((i * 7) % 5) * 0.08);
    const sx = a.x + Math.cos(base) * a.r * 0.4;
    const sy = a.y - a.r * 0.15;
    const tx = sx + Math.cos(ang) * L;
    const ty = sy + Math.sin(ang) * L;
    ctx.strokeStyle = a.color;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + Math.cos(base) * L * 0.6, sy + Math.sin(base) * L * 0.6, tx, ty);
    ctx.stroke();
    ctx.fillStyle = a.tip;
    ctx.beginPath();
    ctx.arc(tx, ty, a.r * 0.1, 0, TAU);
    ctx.fill();
  }
}

function drawStar(ctx: CanvasRenderingContext2D, s: Of<'star'>): void {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.scale(1, 0.55); // seen at an angle, lying on the sand
  ctx.rotate(s.rot);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? s.r * 0.42 : s.r;
    const a = (i / 10) * TAU - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = s.color;
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.r * 0.18;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,240,220,0.55)';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU - Math.PI / 2;
    for (const d of [0.35, 0.65]) {
      ctx.beginPath();
      ctx.arc(Math.cos(a) * s.r * d, Math.sin(a) * s.r * d, s.r * 0.07, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawShell(ctx: CanvasRenderingContext2D, s: Of<'shell'>): void {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.rot);
  const g = ctx.createLinearGradient(0, -s.r, 0, s.r * 0.3);
  g.addColorStop(0, s.color);
  g.addColorStop(1, '#a8957a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, s.r * 0.25);
  ctx.arc(0, s.r * 0.25, s.r, Math.PI * 1.15, Math.PI * 1.85);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,95,70,0.5)';
  ctx.lineWidth = Math.max(0.6, s.r * 0.07);
  for (let i = 1; i < 6; i++) {
    const a = Math.PI * 1.15 + (i / 6) * Math.PI * 0.7;
    ctx.beginPath();
    ctx.moveTo(0, s.r * 0.25);
    ctx.lineTo(Math.cos(a) * s.r, s.r * 0.25 + Math.sin(a) * s.r);
    ctx.stroke();
  }
  ctx.restore();
}

function drawUrchin(ctx: CanvasRenderingContext2D, u: Of<'urchin'>, hair: number): void {
  ctx.strokeStyle = '#2b1d33';
  ctx.lineWidth = Math.max(1.4, hair);
  ctx.beginPath();
  for (let i = 0; i < 26; i++) {
    const a = Math.PI + (i / 25) * Math.PI + Math.sin(i * 3.3) * 0.1;
    ctx.moveTo(u.x, u.y - u.r * 0.4);
    ctx.lineTo(u.x + Math.cos(a) * u.r * 1.9, u.y - u.r * 0.4 + Math.sin(a) * u.r * 1.9);
  }
  ctx.stroke();
  const g = ctx.createRadialGradient(u.x - u.r * 0.3, u.y - u.r * 0.8, 0, u.x, u.y - u.r * 0.4, u.r);
  g.addColorStop(0, '#5a4466');
  g.addColorStop(1, '#1c1222');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(u.x, u.y - u.r * 0.4, u.r, u.r * 0.8, 0, 0, TAU);
  ctx.fill();
}
