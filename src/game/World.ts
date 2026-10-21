import { CONFIG, type FoodKind, type OceanKind } from '../config';
import { clamp, compact, damp, randRange, type Rng } from '../core/math';
import { updateFishAI } from '../systems/ai';
import { resolveCollisions } from '../systems/collision';
import { radiusFor, stageIndex } from '../systems/growth';
import { newRunStats, type RunStats } from '../systems/score';
import { SpawnManager } from '../systems/spawn';
import { Fish, Food, Player, type FeedingZone } from './entities';
import type { PlayerFishDef } from './playerFish';

export interface Controls {
  moveX: number;
  moveY: number;
  /** True on the frame the dash button is pressed. */
  dash: boolean;
}

export type GameEvent =
  | { type: 'eatFood'; x: number; y: number; kind: FoodKind; points: number; zone: boolean }
  | { type: 'eatFish'; x: number; y: number; size: number; points: number; golden: boolean; color: string }
  | { type: 'stage'; index: number; name: string; points: number }
  | { type: 'playerEaten'; x: number; y: number; by: Fish }
  | { type: 'fishEaten'; x: number; y: number; color: string }
  | { type: 'dash'; x: number; y: number };

export interface WorldOptions {
  startSize: number;
  ocean: OceanKind;
  speedBoostSeconds?: number;
  /** Which fish the player swims as. Defaults to the starter. */
  fish?: PlayerFishDef;
  rng?: Rng;
  /**
   * Initial visible area in world units, so the opening population spawns truly off-screen.
   * The game keeps it updated every frame from the camera. Defaults centre on the player.
   */
  view?: (start: { x: number; y: number; size: number }) => { x: number; y: number; halfW: number; halfH: number };
}

/**
 * The whole simulation, with no rendering or DOM access, so it can run headless in tests.
 * Everything the presentation layer needs to react to is emitted as `events`.
 */
export class World {
  /**
   * The sea is endless to the left and right. `width` is only the distance after which the
   * scenery and the Ocean of Plenty feeding zones repeat.
   */
  readonly width = CONFIG.world.width;
  readonly height = CONFIG.world.height;
  readonly seabedY = CONFIG.world.height - CONFIG.world.seabedHeight;
  readonly ocean: OceanKind;
  readonly rng: Rng;
  readonly player: Player;
  readonly fish: Fish[] = [];
  readonly food: Food[] = [];
  readonly zones: FeedingZone[] = [];
  readonly stats: RunStats;
  events: GameEvent[] = [];
  viewX: number;
  viewY: number;
  viewHalfW: number;
  viewHalfH: number;
  time = 0;
  private spawner = new SpawnManager();
  private nextId = 1;

  constructor(opts: WorldOptions) {
    this.ocean = opts.ocean;
    this.rng = opts.rng ?? Math.random;
    this.player = new Player(opts.startSize, opts.fish);
    this.player.x = this.width / 2;
    this.player.y = this.seabedY - CONFIG.world.playerStartAboveSeabed;
    this.player.protectTime = CONFIG.spawn.spawnProtectionSeconds;
    this.player.boostTime = opts.speedBoostSeconds ?? 0;
    this.stats = newRunStats(opts.startSize, stageIndex(opts.startSize));
    const v = opts.view?.({ x: this.player.x, y: this.player.y, size: opts.startSize });
    this.viewX = v?.x ?? this.player.x;
    this.viewY = v?.y ?? this.player.y;
    this.viewHalfW = v?.halfW ?? 450;
    this.viewHalfH = v?.halfH ?? 260;
    if (this.ocean === 'plenty') this.createZones();
    this.spawner.populate(this);
  }

  newFishId(): number {
    return this.nextId++;
  }

  setView(cx: number, cy: number, halfW: number, halfH: number): void {
    this.viewX = cx;
    this.viewY = cy;
    this.viewHalfW = halfW;
    this.viewHalfH = halfH;
  }

  update(dt: number, controls: Controls): void {
    this.time += dt;
    const p = this.player;
    if (p.alive) {
      this.stats.time += dt;
      this.updatePlayer(dt, controls);
    }
    // Zones repeat every `width`: each one sits at its copy nearest the player.
    for (const z of this.zones) z.x = z.baseX + Math.round((p.x - z.baseX) / this.width) * this.width;
    for (const f of this.fish) updateFishAI(this, f, dt);
    this.updateFood(dt);
    resolveCollisions(this);
    compact(this.fish);
    compact(this.food);
    this.spawner.update(this, dt);
    if (p.alive) this.addScore(CONFIG.score.survivalPerSecond * dt);
  }

  addScore(points: number): void {
    this.stats.score += points;
  }

  /** Fish currently hunting the player — drives warning cues. */
  chasers(): Fish[] {
    const out: Fish[] = [];
    for (const f of this.fish) if (f.state === 'chase' && f.target === this.player) out.push(f);
    return out;
  }

  drainEvents(): GameEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  /** Keeps a body between the surface and the seabed. There are no side walls: the sea is endless. */
  clampToWater(b: { x: number; y: number; radius: number }): boolean {
    const minY = b.radius * 0.6;
    const maxY = this.seabedY - b.radius * 0.4;
    const ny = clamp(b.y, minY, Math.max(minY, maxY));
    const hit = ny !== b.y;
    b.y = ny;
    return hit;
  }

  private updatePlayer(dt: number, c: Controls): void {
    const p = this.player;
    const m = CONFIG.movement;
    p.protectTime = Math.max(0, p.protectTime - dt);
    p.boostTime = Math.max(0, p.boostTime - dt);
    p.dashTime = Math.max(0, p.dashTime - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.growPulse = Math.max(0, p.growPulse - dt * 2.5);

    let mx = c.moveX;
    let my = c.moveY;
    const len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }

    if (c.dash && p.dashCooldown <= 0) {
      if (len > 0.1) {
        p.dashDirX = mx / Math.max(len, 1e-6);
        p.dashDirY = my / Math.max(len, 1e-6);
      } else {
        const a = p.facing < 0 ? Math.PI - p.tilt : p.tilt;
        p.dashDirX = Math.cos(a);
        p.dashDirY = Math.sin(a);
      }
      p.dashTime = m.dashDuration;
      p.dashCooldown = m.dashCooldown;
      this.events.push({ type: 'dash', x: p.x, y: p.y });
    }

    const speed = p.speed;
    let tx: number;
    let ty: number;
    let rate = m.playerResponsiveness;
    if (p.dashTime > 0) {
      const steer = len > 0.1;
      const dx = steer ? mx / Math.max(len, 1) : p.dashDirX;
      const dy = steer ? my / Math.max(len, 1) : p.dashDirY;
      const dl = Math.hypot(dx, dy) || 1;
      tx = (dx / dl) * speed * m.dashSpeedMul;
      ty = (dy / dl) * speed * m.dashSpeedMul;
      rate *= 2.5;
    } else {
      tx = mx * speed;
      ty = my * speed;
    }
    p.vx = damp(p.vx, tx, rate, dt);
    p.vy = damp(p.vy, ty, rate, dt);
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const prevSize = p.size;
    p.size = Math.abs(p.targetSize - p.size) < 0.01 ? p.targetSize : damp(p.size, p.targetSize, CONFIG.size.growRate, dt);
    if (p.size !== prevSize) p.radius = radiusFor(p.size);
    if (this.clampToWater(p)) p.vy *= 0.3;

    if (Math.abs(p.vx) > 4) p.facing = p.vx < 0 ? -1 : 1;
    const sp = Math.hypot(p.vx, p.vy);
    if (sp > 4) p.tilt = damp(p.tilt, clamp(Math.atan2(p.vy, Math.abs(p.vx)), -0.7, 0.7), 8, dt);
    p.tailPhase += dt * (5 + (sp / p.radius) * 1.5);

    if (p.size > this.stats.maxSize) this.stats.maxSize = p.size;
    const stage = stageIndex(p.size);
    if (stage > this.stats.stage) {
      this.stats.stage = stage;
      const points = CONFIG.score.stageBonus;
      this.addScore(points);
      this.events.push({ type: 'stage', index: stage, name: CONFIG.size.stages[stage].name, points });
    }
  }

  private updateFood(dt: number): void {
    const top = 40;
    for (const f of this.food) {
      f.age += dt;
      f.phase += dt;
      if (f.kind === 'bubble') {
        f.x += Math.sin(f.phase * 2) * 12 * dt;
        f.y -= 22 * dt;
      } else if (f.kind === 'shrimp') {
        f.x += Math.cos(f.phase * 0.7) * 18 * dt;
        f.y += Math.sin(f.phase * 1.3) * 10 * dt;
      } else {
        f.x += Math.sin(f.phase * 0.5) * 6 * dt;
        f.y += Math.cos(f.phase * 0.4) * 5 * dt;
      }
      f.y = clamp(f.y, 0, this.seabedY - f.radius);
      if (f.age > CONFIG.food.lifetime || f.y < top) f.alive = false;
    }
  }

  private createZones(): void {
    const cfg = CONFIG.ocean.plenty;
    const margin = cfg.zoneRadius + 200;
    for (let i = 0; i < cfg.zoneCount; i++) {
      // Spread zones across the width; keep one close to the start so the bonus is felt early.
      const x = i === 0 ? this.player.x + 900 : randRange(this.rng, margin, this.width - margin);
      const y = i === 0 ? this.player.y - 300 : randRange(this.rng, margin, this.seabedY - cfg.zoneRadius);
      this.zones.push({ id: i, x, baseX: x, y, radius: cfg.zoneRadius });
    }
  }
}
