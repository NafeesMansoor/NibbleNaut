import type { BodyShape } from '../game/species';

/**
 * Procedural placeholder fish art. Everything is drawn relative to the hitbox radius `r`, so a
 * fish's visual size always matches its gameplay size. To switch to sprites, replace drawFish
 * with an image lookup keyed by species id — callers pass the same arguments.
 */

export interface FishLook {
  shape: BodyShape;
  body: string;
  belly: string;
  fin: string;
  stripe?: string;
  stripes?: number;
  /** Optional dark edge drawn under each stripe (the player's clownfish bands). */
  stripeEdge?: string;
}

export interface FishDrawOpts {
  outline?: string | null;
  outlineWidth?: number;
  alpha?: number;
  angry?: boolean;
  /** Extra uniform scale for squash/pulse effects (does not affect the hitbox). */
  pulse?: number;
  /** On-screen radius in px; tiny fish skip the fine details. */
  screenRadius: number;
}

const SHAPES: Record<BodyShape, { rx: number; ry: number }> = {
  round: { rx: 1, ry: 0.64 },
  tall: { rx: 0.86, ry: 0.86 },
  long: { rx: 1.25, ry: 0.34 },
  shark: { rx: 1.25, ry: 0.42 },
};

const TAU = Math.PI * 2;

export function drawFish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  facing: number,
  tilt: number,
  tailPhase: number,
  look: FishLook,
  opts: FishDrawOpts,
): void {
  const sh = SHAPES[look.shape];
  const rx = r * sh.rx;
  const ry = r * sh.ry;
  const detailed = opts.screenRadius > 5;
  const wig = Math.sin(tailPhase) * 0.3 * ry;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * (opts.pulse ?? 1), opts.pulse ?? 1);
  ctx.rotate(tilt);
  if (opts.alpha !== undefined && opts.alpha < 1) ctx.globalAlpha *= opts.alpha;

  // Tail
  ctx.fillStyle = look.fin;
  ctx.beginPath();
  if (look.shape === 'shark') {
    ctx.moveTo(-rx * 0.8, 0);
    ctx.quadraticCurveTo(-rx * 1.15, -ry * 0.3, -rx * 1.55, -ry * 1.35 + wig);
    ctx.quadraticCurveTo(-rx * 1.3, wig * 0.5, -rx * 1.45, ry * 0.9 + wig);
  } else {
    ctx.moveTo(-rx * 0.75, 0);
    ctx.lineTo(-rx * 1.45, -ry * 0.9 + wig);
    ctx.quadraticCurveTo(-rx * 1.22, wig, -rx * 1.45, ry * 0.9 + wig);
  }
  ctx.closePath();
  ctx.fill();

  // Dorsal fin (and anal fin for tall fish)
  ctx.beginPath();
  if (look.shape === 'shark') {
    ctx.moveTo(-rx * 0.3, -ry * 0.8);
    ctx.lineTo(rx * 0.02, -ry * 1.95);
    ctx.lineTo(rx * 0.28, -ry * 0.75);
  } else if (look.shape === 'tall') {
    ctx.moveTo(-rx * 0.6, -ry * 0.6);
    ctx.quadraticCurveTo(-rx * 0.25, -ry * 1.7, rx * 0.35, -ry * 0.78);
    ctx.moveTo(-rx * 0.6, ry * 0.6);
    ctx.quadraticCurveTo(-rx * 0.25, ry * 1.6, rx * 0.3, ry * 0.8);
  } else {
    ctx.moveTo(-rx * 0.55, -ry * 0.7);
    ctx.quadraticCurveTo(-rx * 0.1, -ry * 1.4, rx * 0.3, -ry * 0.82);
  }
  ctx.closePath();
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  ctx.fillStyle = look.body;
  ctx.fill();

  if (detailed) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = look.belly;
    ctx.beginPath();
    ctx.ellipse(rx * 0.05, ry * 0.62, rx * 0.95, ry * 0.55, 0, 0, TAU);
    ctx.fill();
    if (look.stripe && look.stripes) {
      const n = look.stripes;
      for (let i = 0; i < n; i++) {
        const sx = n === 1 ? -rx * 0.1 : -rx * 0.5 + (i * rx * 1.05) / (n - 1);
        if (look.stripeEdge) {
          ctx.strokeStyle = look.stripeEdge;
          ctx.lineWidth = rx * 0.26;
          ctx.beginPath();
          ctx.moveTo(sx, -ry);
          ctx.quadraticCurveTo(sx + rx * 0.12, 0, sx, ry);
          ctx.stroke();
        }
        ctx.strokeStyle = look.stripe;
        ctx.lineWidth = look.stripeEdge ? rx * 0.18 : rx * (n > 3 ? 0.08 : 0.14);
        ctx.beginPath();
        ctx.moveTo(sx, -ry);
        ctx.quadraticCurveTo(sx + rx * 0.12, 0, sx, ry);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Pectoral fin
    ctx.save();
    ctx.globalAlpha *= 0.85;
    ctx.fillStyle = look.fin;
    ctx.beginPath();
    ctx.ellipse(rx * 0.02, ry * 0.28, rx * 0.22, ry * 0.15, 0.5 + Math.sin(tailPhase * 1.3) * 0.35, 0, TAU);
    ctx.fill();
    ctx.restore();

    if (look.shape === 'shark') {
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = Math.max(ry * 0.06, 0.6);
      for (let i = 0; i < 3; i++) {
        const gx = rx * (0.3 - i * 0.09);
        ctx.beginPath();
        ctx.moveTo(gx, -ry * 0.25);
        ctx.quadraticCurveTo(gx - rx * 0.04, 0, gx, ry * 0.25);
        ctx.stroke();
      }
    }
  }

  if (opts.outline) {
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
    ctx.strokeStyle = opts.outline;
    ctx.lineWidth = opts.outlineWidth ?? 2;
    ctx.stroke();
  }

  // Eye
  const er = Math.max(ry * 0.22, r * 0.12);
  const ex = rx * 0.58;
  const ey = look.shape === 'shark' ? -ry * 0.12 : -ry * 0.18;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ex, ey, er, 0, TAU);
  ctx.fill();
  ctx.fillStyle = opts.angry ? '#5a0010' : '#14141c';
  ctx.beginPath();
  ctx.arc(ex + er * 0.22, ey, er * 0.58, 0, TAU);
  ctx.fill();
  if (detailed) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(ex + er * 0.4, ey - er * 0.25, er * 0.2, 0, TAU);
    ctx.fill();
  }
  if (opts.angry) {
    ctx.strokeStyle = '#1a0006';
    ctx.lineWidth = er * 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ex - er * 1.1, ey - er * 1.5);
    ctx.lineTo(ex + er * 0.9, ey - er * 0.7);
    ctx.stroke();
  }

  if (detailed) {
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = Math.max(ry * 0.06, 0.7);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(rx * 0.86, ry * 0.12, ry * 0.16, 0.6, 1.9);
    ctx.stroke();
  }

  ctx.restore();
}
