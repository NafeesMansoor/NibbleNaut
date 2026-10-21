import { CONFIG } from '../config';
import { clamp, damp } from '../core/math';
import type { Fish, Food } from '../game/entities';
import type { World } from '../game/World';
import { canEat, radiusFor } from '../systems/growth';
import { Backdrop } from './backdrop';
import { Decor } from './decor';
import type { Effects } from './effects';
import { drawFish } from './fishArt';
import { OceanFx } from './ocean';

const TAU = Math.PI * 2;

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** Water colour by depth (0 = surface, 1 = seabed). */
const PALETTES: Record<'normal' | 'plenty', RGB[]> = {
  normal: ['#74e0f4', '#33bdec', '#1c96dc', '#1874c6', '#1660b0'].map(hex),
  plenty: ['#8fe0c9', '#45b3a2', '#2d8a8a', '#21696f', '#1d5a62'].map(hex),
};

function waterAt(pal: RGB[], t: number, alpha = 1): string {
  const x = clamp(t, 0, 1) * (pal.length - 1);
  const i = Math.min(pal.length - 2, Math.floor(x));
  const f = x - i;
  const a = pal[i];
  const b = pal[i + 1];
  return `rgba(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)},${alpha})`;
}

/** Zoom that keeps the player a comfortable on-screen size; it pulls out as the fish grows. */
export function zoomFor(size: number, screenW: number, screenH: number): number {
  const c = CONFIG.camera;
  const dim = Math.max(Math.min(screenW, screenH), Math.max(screenW, screenH) * 0.55);
  const k = Math.min(c.screenRadiusMax, c.screenRadiusSmall * Math.pow(size / CONFIG.size.normalStart, c.screenRadiusExponent));
  return (dim * k) / radiusFor(size);
}

export interface RenderOpts {
  dangerOutlines: boolean;
}

export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  readonly camera = { x: 0, y: 0, zoom: 1 };
  /** CSS-pixel size of the canvas. */
  w = 1;
  h = 1;
  private dpr = 1;
  /** Whole-pixel CSS size at the last measurement, compared each frame by syncSize(). */
  private clientW = -1;
  private clientH = -1;
  private decor = new Decor();
  private backdrop = new Backdrop();
  private ocean = new OceanFx();
  private sparkles: { x: number; y: number; p: number }[] = [];

  constructor(readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D is not supported');
    this.ctx = ctx;
    for (let i = 0; i < 36; i++) this.sparkles.push({ x: Math.random(), y: Math.random(), p: Math.random() * TAU });
    this.resize();
  }

  /**
   * Re-measures the canvas if its on-screen size or the pixel ratio changed. Called every frame:
   * on phones the resize/orientationchange events can fire before the rotated layout settles,
   * which would otherwise leave a stretched (zoomed-looking) picture.
   */
  syncSize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.canvas.clientWidth !== this.clientW || this.canvas.clientHeight !== this.clientH || dpr !== this.dpr) this.resize();
  }

  resize(): void {
    this.clientW = this.canvas.clientWidth;
    this.clientH = this.canvas.clientHeight;
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  }

  /** Visible half-extents in world units at the current zoom. */
  get halfW(): number {
    return this.w / 2 / this.camera.zoom;
  }
  get halfH(): number {
    return this.h / 2 / this.camera.zoom;
  }

  snapCamera(world: World): void {
    this.camera.zoom = zoomFor(world.player.size, this.w, this.h);
    this.camera.x = world.player.x;
    this.camera.y = world.player.y;
    this.clampCamera(world);
  }

  updateCamera(world: World, dt: number): void {
    const c = CONFIG.camera;
    const p = world.player;
    this.camera.zoom = damp(this.camera.zoom, zoomFor(p.size, this.w, this.h), c.zoomRate, dt);
    this.camera.x = damp(this.camera.x, p.x, c.followRate, dt);
    this.camera.y = damp(this.camera.y, p.y, c.followRate, dt);
    this.clampCamera(world);
  }

  private clampCamera(_world: World): void {
    const v = this.viewFor(this.camera.x, this.camera.y, this.camera.zoom);
    this.camera.x = v.x;
    this.camera.y = v.y;
  }

  /** The clamped visible area for a camera aimed at (x, y) with the given zoom. */
  viewFor(x: number, y: number, zoom: number): { x: number; y: number; halfW: number; halfH: number } {
    const W = CONFIG.world.width;
    const H = CONFIG.world.height;
    const hw = this.w / 2 / zoom;
    const hh = this.h / 2 / zoom;
    const cx = W < hw * 2 ? W / 2 : clamp(x, hw, W - hw);
    const minY = hh - 140; // a peek above the surface
    const maxY = H - CONFIG.world.seabedHeight + 110 - hh; // show only a strip of sand
    const cy = maxY < minY ? (minY + maxY) / 2 : clamp(y, minY, maxY);
    return { x: cx, y: cy, halfW: hw, halfH: hh };
  }

  /** View for a fresh game, used so the opening population spawns off-screen. */
  startView = (s: { x: number; y: number; size: number }): { x: number; y: number; halfW: number; halfH: number } =>
    this.viewFor(s.x, s.y, zoomFor(s.size, this.w, this.h));

  render(world: World, fx: Effects, opts: RenderOpts): void {
    this.syncSize();
    const { ctx, w, h, camera: cam } = this;
    const t = world.time;
    const kind = world.ocean;
    const plenty = kind === 'plenty';
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const x0 = cam.x - this.halfW;
    const x1 = cam.x + this.halfW;
    const y0 = cam.y - this.halfH;
    const y1 = cam.y + this.halfH;
    const pal = PALETTES[kind];

    // 1. Water colour for the visible depth range.
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, waterAt(pal, y0 / world.seabedY));
    g.addColorStop(1, waterAt(pal, y1 / world.seabedY));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // 2. Distant hazy reef, far-off fish schools, sun shafts and fine particles.
    const floorScreenY = (world.seabedY - cam.y) * cam.zoom + h / 2;
    this.backdrop.draw(ctx, w, h, cam.x, cam.zoom, floorScreenY, kind, t);
    this.ocean.rays(ctx, w, h, cam.x, cam.zoom, y0, t, kind);
    this.ocean.motesLayer(ctx, w, h, cam.x, cam.y, cam.zoom, t, kind, false);

    // 3. The world.
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);

    if (y0 < 20) this.ocean.surface(ctx, x0, x1, y0, cam.zoom, t, kind);
    if (y1 > world.seabedY - 1300) {
      this.decor.drawBack(ctx, x0, x1, y0, y1, t, cam.zoom);
      this.drawHaze(pal, x0, x1, world.seabedY);
      this.decor.drawSand(ctx, x0, x1, this.ocean.sandPattern(ctx, kind), plenty ? '#e2c882' : '#e6eaf0', plenty);
      this.decor.drawFront(ctx, x0, x1, y0, y1, t, cam.zoom);
    }
    this.ocean.caustics(ctx, { w, h, dpr: this.dpr, camX: cam.x, camY: cam.y, zoom: cam.zoom }, world.seabedY, t, kind);

    for (const z of world.zones) this.drawZone(z.x, z.y, z.radius, t, x0, x1, y0, y1);
    for (const f of world.food) this.drawFood(f, t, x0, x1, y0, y1);
    const p = world.player;
    for (const f of world.fish) this.drawFishEntity(f, world, opts, x0, x1, y0, y1);
    if (p.alive) this.drawPlayer(world);
    fx.draw(ctx, cam.zoom);
    ctx.restore();

    // 4. Foreground: big out-of-focus specks, vignette, then gameplay overlays.
    this.ocean.motesLayer(ctx, w, h, cam.x, cam.y, cam.zoom, t, kind, true);
    this.ocean.vignette(ctx, w, h);
    if (plenty) this.drawPlentyOverlay(t);
    if (p.alive) this.drawThreatCues(world, t);
  }

  /** Water between the camera and the back-row scenery softens it, like distance haze. */
  private drawHaze(pal: RGB[], x0: number, x1: number, seabedY: number): void {
    const ctx = this.ctx;
    const top = seabedY - 1150;
    const bottom = seabedY + 40;
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, waterAt(pal, top / seabedY, 0));
    g.addColorStop(0.35, waterAt(pal, (top + 400) / seabedY, 0.1));
    g.addColorStop(1, waterAt(pal, 1, 0.16));
    ctx.fillStyle = g;
    ctx.fillRect(x0, top, x1 - x0, bottom - top);
  }

  private toScreen(x: number, y: number): [number, number] {
    const c = this.camera;
    return [(x - c.x) * c.zoom + this.w / 2, (y - c.y) * c.zoom + this.h / 2];
  }

  private drawZone(x: number, y: number, r: number, t: number, x0: number, x1: number, y0: number, y1: number): void {
    if (x + r < x0 || x - r > x1 || y + r < y0 || y - r > y1) return;
    const ctx = this.ctx;
    const pulse = 1 + Math.sin(t * 2) * 0.04;
    const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * pulse);
    g.addColorStop(0, 'rgba(255,225,120,0.35)');
    g.addColorStop(0.7, 'rgba(255,205,80,0.14)');
    g.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * pulse, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,140,0.55)';
    ctx.lineWidth = 3 / this.camera.zoom;
    ctx.setLineDash([18 / this.camera.zoom, 14 / this.camera.zoom]);
    ctx.lineDashOffset = -t * 20;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.95, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawFood(f: Food, t: number, x0: number, x1: number, y0: number, y1: number): void {
    const r = f.radius;
    if (f.x + r * 3 < x0 || f.x - r * 3 > x1 || f.y + r * 3 < y0 || f.y - r * 3 > y1) return;
    const ctx = this.ctx;
    const life = 1 - Math.max(0, f.age - (CONFIG.food.lifetime - 2)) / 2;
    ctx.globalAlpha = Math.min(1, f.age / 0.5) * clamp(life, 0, 1);
    const minR = 1.6 / this.camera.zoom;
    if (f.zone >= 0) {
      ctx.fillStyle = 'rgba(255,215,90,0.35)';
      ctx.beginPath();
      ctx.arc(f.x, f.y, Math.max(r * 2.2, minR * 2), 0, TAU);
      ctx.fill();
    }
    if (f.kind === 'plankton') {
      const pr = Math.max(r * (0.9 + Math.sin(t * 4 + f.phase) * 0.15), minR);
      ctx.fillStyle = '#b6f27a';
      ctx.beginPath();
      ctx.arc(f.x, f.y, pr, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f4ffd8';
      ctx.beginPath();
      ctx.arc(f.x - pr * 0.25, f.y - pr * 0.25, pr * 0.45, 0, TAU);
      ctx.fill();
    } else if (f.kind === 'shrimp') {
      const dir = Math.cos(f.phase * 0.7) >= 0 ? 1 : -1;
      const sr = Math.max(r, minR * 1.5);
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(dir, 1);
      ctx.strokeStyle = '#ff8fa3';
      ctx.lineWidth = sr * 0.7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, sr * 0.8, Math.PI * 0.9, Math.PI * 2.1);
      ctx.stroke();
      ctx.strokeStyle = '#ffd1da';
      ctx.lineWidth = sr * 0.15;
      ctx.beginPath();
      ctx.moveTo(sr * 0.7, -sr * 0.3);
      ctx.lineTo(sr * 1.6, -sr * 0.9);
      ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(sr * 0.75, -sr * 0.15, sr * 0.14, 0, TAU);
      ctx.fill();
      ctx.restore();
    } else {
      const br = Math.max(r, minR * 1.5);
      ctx.fillStyle = 'rgba(220,250,255,0.25)';
      ctx.strokeStyle = 'rgba(240,255,255,0.9)';
      ctx.lineWidth = Math.max(br * 0.12, 1 / this.camera.zoom);
      ctx.beginPath();
      ctx.arc(f.x, f.y, br, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffb347';
      ctx.beginPath();
      ctx.arc(f.x, f.y + br * 0.15, br * 0.45, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(f.x - br * 0.35, f.y - br * 0.4, br * 0.18, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawFishEntity(f: Fish, world: World, opts: RenderOpts, x0: number, x1: number, y0: number, y1: number): void {
    const r = f.radius;
    if (f.x + r * 2 < x0 || f.x - r * 2 > x1 || f.y + r * 2 < y0 || f.y - r * 2 > y1) return;
    const ctx = this.ctx;
    const p = world.player;
    const zoom = this.camera.zoom;
    const threat = p.alive && !f.species.harmless && canEat(f.size, p.size);
    const chasing = f.state === 'chase' && f.target === p;
    let outline: string | null = null;
    let width = 2 / zoom;
    if (opts.dangerOutlines && threat) {
      outline = chasing ? `rgba(255,50,80,${0.75 + Math.sin(world.time * 12) * 0.25})` : 'rgba(255,70,90,0.85)';
      width = (chasing ? 3.5 : 2.2) / zoom;
    }
    if (f.golden) {
      const g = ctx.createRadialGradient(f.x, f.y, r * 0.3, f.x, f.y, r * 2.2);
      g.addColorStop(0, 'rgba(255,230,120,0.6)');
      g.addColorStop(1, 'rgba(255,210,60,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, r * 2.2, 0, TAU);
      ctx.fill();
    }
    drawFish(ctx, f.x, f.y, r, f.facing, f.tilt, f.tailPhase, f.species, {
      outline,
      outlineWidth: width,
      alpha: Math.min(1, f.age / 0.6),
      angry: chasing,
      screenRadius: r * zoom,
    });
    if (chasing && opts.dangerOutlines) {
      const s = 1 / zoom;
      ctx.fillStyle = '#ff3355';
      ctx.font = `800 ${22 * s}px Fredoka, 'Hind Siliguri', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('!', f.x, f.y - r * 1.1 - 4 * s);
    }
  }

  private drawPlayer(world: World): void {
    const ctx = this.ctx;
    const p = world.player;
    const zoom = this.camera.zoom;
    const r = p.radius;
    // Soft halo so the player is always easy to find.
    const halo = ctx.createRadialGradient(p.x, p.y, r * 0.6, p.x, p.y, r * 2);
    halo.addColorStop(0, 'rgba(255,255,255,0.28)');
    halo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 2, 0, TAU);
    ctx.fill();

    if (p.protectTime > 0) {
      ctx.strokeStyle = `rgba(200,245,255,${0.4 + Math.sin(world.time * 10) * 0.3})`;
      ctx.lineWidth = 3 / zoom;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 1.55, 0, TAU);
      ctx.stroke();
    }
    if (p.boostTime > 0) {
      ctx.strokeStyle = `rgba(120,240,255,${0.5 + Math.sin(world.time * 14) * 0.2})`;
      ctx.lineWidth = 2.5 / zoom;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 1.35, 0, TAU);
      ctx.stroke();
    }
    const pulse = 1 + p.growPulse * 0.22 * Math.sin(p.growPulse * Math.PI);
    drawFish(ctx, p.x, p.y, r, p.facing, p.tilt, p.tailPhase, p.look, {
      outline: 'rgba(255,255,255,0.9)',
      outlineWidth: 2 / zoom,
      alpha: p.protectTime > 0 ? 0.75 + Math.sin(world.time * 16) * 0.2 : 1,
      pulse,
      screenRadius: r * zoom,
    });
  }

  private drawPlentyOverlay(t: number): void {
    const { ctx, w, h } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const s of this.sparkles) {
      const a = (Math.sin(t * 2.2 + s.p) + 1) * 0.5;
      if (a < 0.4) continue;
      const x = s.x * w;
      const y = ((s.y * h + t * 6) % h + h) % h;
      const size = 2 + a * 3;
      ctx.fillStyle = `rgba(255,220,120,${(a - 0.4) * 0.9})`;
      ctx.fillRect(x - size / 2, y - 0.6, size, 1.2);
      ctx.fillRect(x - 0.6, y - size / 2, 1.2, size);
    }
    ctx.restore();
    const edge = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
    edge.addColorStop(0, 'rgba(255,200,60,0)');
    edge.addColorStop(1, 'rgba(255,200,60,0.22)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, w, h);
  }

  /** Red vignette when a hunter is close, plus edge arrows pointing at off-screen hunters. */
  private drawThreatCues(world: World, t: number): void {
    const { ctx, w, h } = this;
    const p = world.player;
    let danger = 0;
    const range = Math.min(this.halfW, this.halfH) * 1.3;
    for (const f of world.fish) {
      if (!f.alive || f.species.harmless || !canEat(f.size, p.size)) continue;
      const d = Math.hypot(f.x - p.x, f.y - p.y) - f.radius - p.radius;
      const chasing = f.state === 'chase' && f.target === p;
      const k = clamp(1 - d / range, 0, 1) * (chasing ? 1 : 0.45);
      if (k > danger) danger = k;
      if (!chasing) continue;
      const [sx, sy] = this.toScreen(f.x, f.y);
      const pad = 34;
      if (sx >= 0 && sx <= w && sy >= 0 && sy <= h) continue;
      const cx = w / 2;
      const cy = h / 2;
      const dx = sx - cx;
      const dy = sy - cy;
      const scale = Math.min((w / 2 - pad) / Math.abs(dx || 1e-6), (h / 2 - pad) / Math.abs(dy || 1e-6));
      const ax = cx + dx * scale;
      const ay = cy + dy * scale;
      const ang = Math.atan2(dy, dx);
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(ang);
      ctx.globalAlpha = 0.75 + Math.sin(t * 10) * 0.25;
      ctx.fillStyle = '#ff3355';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-10, -12);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-10, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if (danger > 0.05) {
      const a = danger * (0.28 + Math.sin(t * 8) * 0.08);
      const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.72);
      v.addColorStop(0, 'rgba(255,30,60,0)');
      v.addColorStop(1, `rgba(255,30,60,${a})`);
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
    }
  }

  /** Strongest danger level last frame, for the audio warning cue. */
  dangerLevel(world: World): number {
    const p = world.player;
    if (!p.alive) return 0;
    let best = 0;
    const range = Math.min(this.halfW, this.halfH) * 1.3;
    for (const f of world.fish) {
      if (f.state !== 'chase' || f.target !== p) continue;
      const d = Math.hypot(f.x - p.x, f.y - p.y) - f.radius - p.radius;
      best = Math.max(best, clamp(1 - d / range, 0, 1));
    }
    return best;
  }
}
