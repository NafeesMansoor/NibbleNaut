import type { Player } from '../game/entities';
import type { GameEvent } from '../game/World';

/** Fixed-size particle pool plus floating score text, all in world space. */

type Kind = 0 | 1 | 2; // 0 dot, 1 bubble, 2 ring

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  kind: Kind;
  active: boolean;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  max: number;
  /** Font size in screen px. */
  px: number;
}

const MAX_PARTICLES = 500;
const TAU = Math.PI * 2;

export class Effects {
  private pool: Particle[] = [];
  private next = 0;
  private texts: FloatText[] = [];
  private trailAcc = 0;

  constructor() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, color: '#fff', kind: 0, active: false });
    }
  }

  clear(): void {
    for (const p of this.pool) p.active = false;
    this.texts.length = 0;
  }

  spawn(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, kind: Kind): void {
    const p = this.pool[this.next];
    this.next = (this.next + 1) % MAX_PARTICLES;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.max = life;
    p.size = size;
    p.color = color;
    p.kind = kind;
    p.active = true;
  }

  burst(x: number, y: number, n: number, speed: number, size: number, color: string, life = 0.6): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const s = speed * (0.4 + Math.random() * 0.6);
      this.spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, life * (0.6 + Math.random() * 0.4), size * (0.6 + Math.random() * 0.6), color, 0);
    }
  }

  text(x: number, y: number, text: string, color: string, px = 18, life = 1): void {
    this.texts.push({ x, y, text, color, life, max: life, px });
    if (this.texts.length > 40) this.texts.shift();
  }

  handle(e: GameEvent, player: Player): void {
    const r = player.radius;
    switch (e.type) {
      case 'eatFood':
        this.burst(e.x, e.y, e.zone ? 8 : 5, 60, 3, e.zone ? '#ffd76a' : '#d8ffb0', 0.45);
        if (e.zone) this.text(e.x, e.y - r * 0.5, `+${e.points}`, '#ffe28a', 14, 0.7);
        break;
      case 'eatFish':
        this.burst(e.x, e.y, e.golden ? 30 : 12, 90 + r * 2, Math.max(3, r * 0.15), e.golden ? '#ffd23f' : e.color, 0.7);
        this.spawn(e.x, e.y, 0, 0, 0.4, r * 1.2, '#ffffff', 2);
        this.text(e.x, e.y - r * 0.8, e.golden ? `GOLDEN! +${e.points}` : `+${e.points}`, e.golden ? '#ffd23f' : '#ffffff', e.golden ? 24 : 18, e.golden ? 1.6 : 1);
        break;
      case 'stage':
        this.spawn(player.x, player.y, 0, 0, 0.9, r * 3, '#ffe28a', 2);
        this.burst(player.x, player.y, 40, 200 + r * 3, Math.max(4, r * 0.15), '#ffe28a', 1);
        this.text(player.x, player.y - r * 1.6, `${e.name.toUpperCase()}! +${e.points}`, '#ffe28a', 26, 1.8);
        break;
      case 'playerEaten':
        this.burst(e.x, e.y, 50, 160 + r * 3, Math.max(4, r * 0.2), '#ff8a1f', 1.2);
        for (let i = 0; i < 18; i++) this.spawn(e.x, e.y, (Math.random() - 0.5) * 80, -40 - Math.random() * 90, 1.6, Math.max(3, r * 0.15), '#cfefff', 1);
        break;
      case 'fishEaten':
        this.burst(e.x, e.y, 6, 60, 3, e.color, 0.5);
        break;
      case 'dash':
        for (let i = 0; i < 10; i++) this.spawn(e.x, e.y, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120, 0.7, Math.max(2, r * 0.18), '#e6f8ff', 1);
        break;
    }
  }

  /** Continuous effects tied to the player: swim bubbles, dash and boost trails. */
  trail(p: Player, dt: number): void {
    if (!p.alive) return;
    const sp = Math.hypot(p.vx, p.vy);
    const fast = p.dashTime > 0 || p.boostTime > 0;
    this.trailAcc += dt * (fast ? 40 : sp > 20 ? 4 : 1);
    while (this.trailAcc > 1) {
      this.trailAcc -= 1;
      const bx = p.x - p.facing * p.radius * 1.1;
      if (fast) {
        this.spawn(bx, p.y + (Math.random() - 0.5) * p.radius, -p.vx * 0.2, -p.vy * 0.2, 0.35, Math.max(2, p.radius * 0.18), p.boostTime > 0 ? '#9ff3ff' : '#ffffff', 0);
      } else {
        this.spawn(p.x + p.facing * p.radius * 0.9, p.y - p.radius * 0.2, (Math.random() - 0.5) * 10, -30 - Math.random() * 20, 1.4, Math.max(1.5, p.radius * 0.1), '#dff6ff', 1);
      }
    }
  }

  update(dt: number): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 1) {
        p.vy -= 20 * dt;
        p.vx *= 0.98;
      } else {
        p.vx *= 0.92;
        p.vy *= 0.92;
      }
    }
    for (const t of this.texts) {
      t.life -= dt;
      t.y -= 30 * dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      const a = p.life / p.max;
      ctx.globalAlpha = Math.min(1, a * 1.5);
      if (p.kind === 0) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      } else if (p.kind === 1) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1 / zoom, p.size * 0.25);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.stroke();
      } else {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 / zoom;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.4 - a * 0.9), 0, TAU);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const t of this.texts) {
      const a = Math.min(1, (t.life / t.max) * 2);
      ctx.globalAlpha = a;
      ctx.font = `700 ${t.px / zoom}px Fredoka, system-ui, sans-serif`;
      ctx.lineWidth = 4 / zoom;
      ctx.strokeStyle = 'rgba(4,30,60,0.75)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }
}
