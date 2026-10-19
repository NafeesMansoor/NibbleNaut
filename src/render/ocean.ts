import type { OceanKind } from '../config';
import { clamp } from '../core/math';
import { makeCausticTexture, makeRaySprite, makeSandTexture, makeSoftDot, makeCanvas } from './textures';

/**
 * Light and water: sun shafts, caustics, drifting particles at several depths, the bright
 * underside of the surface, and a soft vignette. Together these do most of the work of making
 * the scene feel like it is underwater.
 */

interface Mote {
  x: number;
  y: number;
  /** 0 = far (small, faint, slow parallax) … 1 = right in front of the camera (big, blurry). */
  z: number;
  ph: number;
}

const NEAR_Z = 0.82;

const TINT: Record<OceanKind, { caustic: [number, number, number]; ray: [number, number, number]; sand: [number, number, number]; mote: string }> = {
  normal: { caustic: [215, 250, 255], ray: [200, 240, 255], sand: [212, 190, 146], mote: '225,245,255' },
  plenty: { caustic: [255, 232, 150], ray: [255, 226, 140], sand: [226, 200, 130], mote: '255,240,195' },
};

interface KindAssets {
  causticA: HTMLCanvasElement;
  causticB: HTMLCanvasElement;
  ray: HTMLCanvasElement;
  sand: HTMLCanvasElement;
}

export class OceanFx {
  private assets = new Map<OceanKind, KindAssets>();
  private patterns = new WeakMap<HTMLCanvasElement, CanvasPattern | null>();
  private dot = makeSoftDot();
  private motes: Mote[] = [];
  private vignetteCanvas: HTMLCanvasElement | null = null;
  private buffer: HTMLCanvasElement | null = null;

  constructor() {
    for (let i = 0; i < 140; i++) {
      const near = i < 10;
      this.motes.push({ x: Math.random(), y: Math.random(), z: near ? NEAR_Z + Math.random() * (1 - NEAR_Z) : Math.random() * NEAR_Z, ph: Math.random() * 6.3 });
    }
  }

  private kind(k: OceanKind): KindAssets {
    let a = this.assets.get(k);
    if (!a) {
      const t = TINT[k];
      a = {
        causticA: makeCausticTexture(t.caustic, 3),
        causticB: makeCausticTexture(t.caustic, 9, 256, 8),
        ray: makeRaySprite(t.ray),
        sand: makeSandTexture(t.sand, 5),
      };
      this.assets.set(k, a);
    }
    return a;
  }

  private pattern(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement): CanvasPattern | null {
    let p = this.patterns.get(c);
    if (p === undefined) {
      p = ctx.createPattern(c, 'repeat');
      this.patterns.set(c, p);
    }
    return p;
  }

  sandPattern(ctx: CanvasRenderingContext2D, k: OceanKind): CanvasPattern | null {
    return this.pattern(ctx, this.kind(k).sand);
  }

  /** Slanted sun shafts from the surface; strongest near the top, never fully gone. */
  rays(ctx: CanvasRenderingContext2D, w: number, h: number, camX: number, zoom: number, viewTop: number, t: number, k: OceanKind): void {
    const strength = clamp(1 - viewTop / 3800, 0.3, 1) * (k === 'plenty' ? 0.3 : 0.22);
    const sprite = this.kind(k).ray;
    const span = w * 1.5;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 8; i++) {
      const x = ((((i / 8) * span - camX * zoom * 0.22 + Math.sin(t * 0.07 + i) * 40) % span) + span) % span - w * 0.25;
      const bw = w * (0.05 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.21 + i * 2.3)));
      ctx.globalAlpha = strength * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.35 + i * 1.7)));
      ctx.save();
      ctx.translate(x, -30);
      ctx.rotate(0.22);
      ctx.drawImage(sprite, -bw / 2, 0, bw, h * 1.35);
      ctx.restore();
    }
    ctx.restore();
  }

  /** Marine snow. `near` draws the few big out-of-focus specks that pass in front of everything. */
  motesLayer(ctx: CanvasRenderingContext2D, w: number, h: number, camX: number, camY: number, zoom: number, t: number, k: OceanKind, near: boolean): void {
    const col = TINT[k].mote;
    const W = w + 80;
    const H = h + 80;
    for (const m of this.motes) {
      if (near !== m.z >= NEAR_Z) continue;
      const par = 0.15 + m.z * 0.9;
      const x = ((((m.x * W - camX * zoom * par + Math.sin(t * 0.25 + m.ph) * 14) % W) + W) % W) - 40;
      const y = ((((m.y * H - camY * zoom * par + t * (4 + m.z * 10)) % H) + H) % H) - 40;
      if (near) {
        const s = 14 + (m.z - NEAR_Z) * 160;
        ctx.globalAlpha = 0.16;
        ctx.drawImage(this.dot, x - s / 2, y - s / 2, s, s);
      } else {
        const s = 0.6 + m.z * 2.2;
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(${col},${0.18 + m.z * 0.4})`;
        ctx.fillRect(x, y, s, s);
      }
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Caustic light net. Two textures drifting in different directions are drawn in world space
   * (so the pattern stays put as the camera moves) into a half-resolution buffer, which is then
   * masked by a smooth depth gradient: strongest on the sand, faint near the surface, absent in
   * open mid-water. The caller must be in world space; this draws in screen space and restores.
   */
  caustics(
    ctx: CanvasRenderingContext2D,
    view: { w: number; h: number; dpr: number; camX: number; camY: number; zoom: number },
    seabedY: number,
    t: number,
    k: OceanKind,
  ): void {
    if (typeof DOMMatrix === 'undefined') return;
    const { w, h, camX, camY, zoom } = view;
    const y0 = camY - h / 2 / zoom;
    const y1 = camY + h / 2 / zoom;
    const intensity = (y: number): number => {
      const f = clamp((y - (seabedY - 140)) / 170, 0, 1);
      return 0.05 * Math.exp(-Math.max(0, y) / 450) + 0.27 * f * f * (3 - 2 * f);
    };
    if (intensity(y0) < 0.01 && intensity(y1) < 0.01) return;

    const bw = Math.max(1, Math.round(w / 2));
    const bh = Math.max(1, Math.round(h / 2));
    if (!this.buffer || this.buffer.width !== bw || this.buffer.height !== bh) [this.buffer] = makeCanvas(bw, bh);
    const b = this.buffer.getContext('2d');
    const a = this.kind(k);
    const pa = this.pattern(ctx, a.causticA);
    const pb = this.pattern(ctx, a.causticB);
    if (!b || !pa || !pb) return;
    pa.setTransform(new DOMMatrix().translateSelf(t * 16, t * 7).scaleSelf(2.3));
    pb.setTransform(new DOMMatrix().translateSelf(-t * 11, t * 10).rotateSelf(27).scaleSelf(1.8));

    b.setTransform(1, 0, 0, 1, 0, 0);
    b.globalCompositeOperation = 'copy';
    b.fillStyle = 'rgba(0,0,0,0)';
    b.fillRect(0, 0, bw, bh);
    b.globalCompositeOperation = 'lighter';
    b.setTransform(zoom / 2, 0, 0, zoom / 2, bw / 2 - (camX * zoom) / 2, bh / 2 - (camY * zoom) / 2);
    const vx = camX - w / 2 / zoom;
    b.globalAlpha = 1;
    b.fillStyle = pa;
    b.fillRect(vx, y0, w / zoom, y1 - y0);
    b.globalAlpha = 0.65;
    b.fillStyle = pb;
    b.fillRect(vx, y0, w / zoom, y1 - y0);

    // Depth mask.
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.globalAlpha = 1;
    b.globalCompositeOperation = 'destination-in';
    const mask = b.createLinearGradient(0, 0, 0, bh);
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      mask.addColorStop(u, `rgba(0,0,0,${clamp(intensity(y0 + (y1 - y0) * u), 0, 1).toFixed(3)})`);
    }
    b.fillStyle = mask;
    b.fillRect(0, 0, bw, bh);

    ctx.save();
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(this.buffer, 0, 0, w, h);
    ctx.restore();
  }

  /** The surface seen from below: a bright, rippling ceiling with a glow just under it. */
  surface(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, zoom: number, t: number, k: OceanKind): void {
    const top = y0 - 20;
    const sky = ctx.createLinearGradient(0, top, 0, 0);
    sky.addColorStop(0, k === 'plenty' ? '#fff3cf' : '#e6fbff');
    sky.addColorStop(1, k === 'plenty' ? '#cfeec0' : '#9fe0f2');
    ctx.fillStyle = sky;
    ctx.beginPath();
    ctx.moveTo(x0 - 60, top);
    ctx.lineTo(x1 + 60, top);
    for (let x = x1 + 60; x >= x0 - 60; x -= 30) ctx.lineTo(x, waveY(x, t));
    ctx.closePath();
    ctx.fill();
    const pa = this.pattern(ctx, this.kind(k).causticA);
    if (pa && typeof DOMMatrix !== 'undefined') {
      pa.setTransform(new DOMMatrix().translateSelf(t * 30, 0).scaleSelf(1.4, 0.6));
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = pa;
      ctx.fillRect(x0 - 60, top, x1 - x0 + 120, -top + 20);
      ctx.restore();
    }
    const glow = ctx.createLinearGradient(0, 0, 0, 160);
    glow.addColorStop(0, 'rgba(255,255,255,0.35)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x0 - 60, 0, x1 - x0 + 120, 160);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3 / zoom;
    ctx.beginPath();
    for (let x = x0 - 60; x <= x1 + 60; x += 30) {
      if (x === x0 - 60) ctx.moveTo(x, waveY(x, t));
      else ctx.lineTo(x, waveY(x, t));
    }
    ctx.stroke();
  }

  vignette(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const cw = Math.max(1, Math.round(w / 4));
    const ch = Math.max(1, Math.round(h / 4));
    let c = this.vignetteCanvas;
    if (!c || c.width !== cw || c.height !== ch) {
      const [nc, vctx] = makeCanvas(cw, ch);
      const g = vctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.3, cw / 2, ch / 2, Math.hypot(cw, ch) * 0.55);
      g.addColorStop(0, 'rgba(0,12,30,0)');
      g.addColorStop(1, 'rgba(0,12,30,0.5)');
      vctx.fillStyle = g;
      vctx.fillRect(0, 0, cw, ch);
      this.vignetteCanvas = c = nc;
    }
    ctx.drawImage(c, 0, 0, w, h);
  }
}

const waveY = (x: number, t: number): number => Math.sin(x * 0.012 + t * 1.4) * 7 + Math.sin(x * 0.031 - t * 2.1) * 3;
