import { CONFIG, type FoodKind } from '../config';
import { radiusFor, sizeAfterGain, speedFor } from '../systems/growth';
import type { FishLook } from '../render/fishArt';
import { STARTER_FISH, type PlayerFishDef } from './playerFish';
import type { Species } from './species';

/** Anything that can eat or be eaten. */
export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  radius: number;
  alive: boolean;
}

export class Player implements Body {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  /** Current size: drives visuals, hitbox and eat eligibility together. */
  size: number;
  /** Size the fish is growing toward; `size` eases up to it. */
  targetSize: number;
  radius: number;
  alive = true;
  facing = 1;
  tilt = 0;
  tailPhase = 0;
  dashTime = 0;
  dashCooldown = 0;
  dashDirX = 1;
  dashDirY = 0;
  boostTime = 0;
  protectTime = 0;
  /** 1 right after growing, decays to 0; drives the growth pulse animation. */
  growPulse = 0;
  readonly name: string;
  readonly look: FishLook;
  /** Multiplier on points from food and fish; advanced fish from the shop earn more. */
  readonly feedMul: number;

  constructor(size: number, fish: PlayerFishDef = STARTER_FISH) {
    this.name = fish.name;
    this.look = fish.look;
    this.feedMul = fish.feedMul;
    this.size = size;
    this.targetSize = size;
    this.radius = radiusFor(size);
  }

  grow(massGain: number): void {
    this.targetSize = sizeAfterGain(this.targetSize, massGain, CONFIG.size.playerMax);
    this.growPulse = 1;
  }

  /** Normal swimming speed, ignoring boosts and dashes. */
  get cruiseSpeed(): number {
    return speedFor(this.size) * CONFIG.movement.playerSpeedMul;
  }

  get speed(): number {
    return this.cruiseSpeed * (this.boostTime > 0 ? CONFIG.movement.speedBoostMul : 1);
  }
}

export type FishState = 'wander' | 'flee' | 'chase';

export class Fish implements Body {
  vx = 0;
  vy = 0;
  radius: number;
  alive = true;
  state: FishState = 'wander';
  stateTime = 0;
  senseTimer = 0;
  restTime = 0;
  target: Body | null = null;
  threat: Body | null = null;
  facing = 1;
  tilt = 0;
  tailPhase: number;
  /** Fade-in timer so spawns never pop. */
  age = 0;
  ateThisFrame = false;
  /** Hunter species roll this at spawn; passive individuals never give chase. */
  aggressive = false;

  constructor(
    readonly id: number,
    readonly species: Species,
    public x: number,
    public y: number,
    public size: number,
    public wanderAngle: number,
    readonly golden = false,
  ) {
    this.radius = radiusFor(size);
    this.tailPhase = wanderAngle * 3;
    this.facing = Math.cos(wanderAngle) < 0 ? -1 : 1;
  }

  setSize(size: number): void {
    this.size = size;
    this.radius = radiusFor(size);
  }

  get speed(): number {
    return speedFor(this.size) * this.species.speedMul;
  }
}

export class Food {
  alive = true;
  age = 0;
  readonly radius: number;
  phase: number;
  vx = 0;
  vy = 0;

  constructor(
    readonly kind: FoodKind,
    public x: number,
    public y: number,
    /** Feeding-zone id when spawned inside an Ocean of Plenty zone, else -1. */
    readonly zone: number,
    phase: number,
  ) {
    this.radius = CONFIG.food.radius[kind];
    this.phase = phase;
  }
}

export interface FeedingZone {
  id: number;
  /** Current position: the repeat of `baseX` nearest the player. */
  x: number;
  baseX: number;
  y: number;
  radius: number;
}
