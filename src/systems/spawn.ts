import { CONFIG, type FoodKind } from '../config';
import { clamp, compact, pickWeighted, randInt, randRange } from '../core/math';
import { Fish, Food } from '../game/entities';
import { BONUS_FISH, pickSpecies } from '../game/species';
import type { World } from '../game/World';
import { radiusFor } from './growth';

type SizeBand = 'prey' | 'peer' | 'threat';

/**
 * Keeps a bounded population of fish and food around the camera. Fish always appear off-screen
 * (so threats never materialise on top of the player); food may fade in anywhere nearby.
 * Ocean of Plenty multiplies the food quota and refill rate and keeps feeding zones stocked.
 */
export class SpawnManager {
  private fishTimer = 0;
  private foodTimer = 0;
  private zoneTimer = 0;

  populate(w: World): void {
    for (let i = 0; i < CONFIG.spawn.fishTarget * 2 && w.fish.length < CONFIG.spawn.fishTarget; i++) this.spawnFish(w);
    const foodTarget = this.foodTarget(w);
    for (let i = 0; i < foodTarget; i++) this.spawnFood(w, -1);
    for (const z of w.zones) {
      if (this.zoneNear(w, z)) for (let i = 0; i < CONFIG.ocean.plenty.zoneFoodTarget; i++) this.spawnFood(w, z.id);
    }
  }

  update(w: World, dt: number): void {
    this.despawn(w);

    const s = CONFIG.spawn;
    if (w.fish.length < s.fishTarget) {
      this.fishTimer += dt;
      const interval = 1 / s.fishPerSecond;
      while (this.fishTimer >= interval && w.fish.length < s.fishTarget) {
        this.fishTimer -= interval;
        this.spawnFish(w);
      }
    } else this.fishTimer = 0;

    const plenty = w.ocean === 'plenty';
    const foodTarget = this.foodTarget(w);
    let free = 0;
    for (const f of w.food) if (f.zone < 0) free++;
    if (free < foodTarget) {
      this.foodTimer += dt;
      const interval = 1 / (CONFIG.food.perSecond * (plenty ? CONFIG.ocean.plenty.foodRateMul : 1));
      while (this.foodTimer >= interval && free < foodTarget) {
        this.foodTimer -= interval;
        if (this.spawnFood(w, -1)) free++;
      }
    } else this.foodTimer = 0;

    if (plenty) {
      this.zoneTimer += dt;
      if (this.zoneTimer >= 0.25) {
        this.zoneTimer = 0;
        for (const z of w.zones) {
          if (!this.zoneNear(w, z)) continue;
          let n = 0;
          for (const f of w.food) if (f.zone === z.id) n++;
          // Refill a few at a time so zones restock visibly rather than instantly.
          for (let k = 0; k < 3 && n < CONFIG.ocean.plenty.zoneFoodTarget; k++, n++) this.spawnFood(w, z.id);
        }
      }
    }
  }

  private foodTarget(w: World): number {
    return Math.round(CONFIG.food.target * (w.ocean === 'plenty' ? CONFIG.ocean.plenty.foodCountMul : 1));
  }

  private zoneNear(w: World, z: { x: number; y: number; radius: number }): boolean {
    const m = CONFIG.spawn.activeRangeMul;
    return Math.abs(z.x - w.viewX) < w.viewHalfW * m + z.radius && Math.abs(z.y - w.viewY) < w.viewHalfH * m + z.radius;
  }

  private despawn(w: World): void {
    const m = CONFIG.spawn.despawnRangeMul;
    const hw = w.viewHalfW * m;
    const hh = w.viewHalfH * m;
    for (const f of w.fish) {
      if (Math.abs(f.x - w.viewX) > hw + f.radius || Math.abs(f.y - w.viewY) > hh + f.radius) f.alive = false;
    }
    for (const f of w.food) {
      if (f.zone >= 0) {
        const z = w.zones[f.zone];
        if (z && !this.zoneNear(w, z)) f.alive = false;
      } else if (Math.abs(f.x - w.viewX) > hw || Math.abs(f.y - w.viewY) > hh) f.alive = false;
    }
    compact(w.fish);
    compact(w.food);
  }

  /** A random point in the active ring around the view: inside the world, outside the screen. */
  private offscreenPoint(w: World, r: number): { x: number; y: number } | null {
    const m = CONFIG.spawn.activeRangeMul;
    const minY = r + 40;
    const maxY = w.seabedY - r - 10;
    if (maxY <= minY) return null;
    for (let attempt = 0; attempt < 12; attempt++) {
      const x = w.viewX + (w.rng() * 2 - 1) * w.viewHalfW * m;
      const y = w.viewY + (w.rng() * 2 - 1) * w.viewHalfH * m;
      if (y < minY || y > maxY) continue;
      const margin = r + 60;
      if (Math.abs(x - w.viewX) < w.viewHalfW + margin && Math.abs(y - w.viewY) < w.viewHalfH + margin) continue;
      return { x, y };
    }
    return null;
  }

  spawnFish(w: World): void {
    const s = CONFIG.spawn;
    const p = w.player;
    const ref = p.size;

    if (w.rng() < s.bonusChance && w.fish.filter((f) => f.golden).length < s.maxBonusFish) {
      const kind = pickWeighted(w.rng, Object.fromEntries(BONUS_FISH.map((b) => [b.id, b.weight])));
      const bonus = BONUS_FISH.find((b) => b.id === kind) ?? BONUS_FISH[0];
      const size = Math.max(bonus.minSize, ref * randRange(w.rng, 0.45, 0.7));
      const pos = this.offscreenPoint(w, radiusFor(size));
      if (pos) w.fish.push(new Fish(w.newFishId(), bonus, pos.x, pos.y, size, w.rng() * Math.PI * 2, true));
      return;
    }

    const ramp = Math.min(1, s.threatRampStart + (1 - s.threatRampStart) * (w.time / s.threatRampSeconds));
    const band: SizeBand = pickWeighted(w.rng, { prey: s.weights.prey, peer: s.weights.peer, threat: s.weights.threat * ramp });
    const range = band === 'prey' ? s.preyRange : band === 'peer' ? s.peerRange : s.threatRange;
    const size = clamp(ref * randRange(w.rng, range[0], range[1]), s.minFishSize, CONFIG.size.fishMax);
    const species = pickSpecies(size, w.rng);
    const pos = this.offscreenPoint(w, radiusFor(size));
    if (!pos) return;
    const angle = w.rng() * Math.PI * 2;

    if (species.schooling && band === 'prey' && w.rng() < s.schoolChance) {
      const n = randInt(w.rng, s.schoolSize[0], s.schoolSize[1]);
      for (let i = 0; i < n && w.fish.length < s.fishTarget + 6; i++) {
        const fs = clamp(size * randRange(w.rng, 0.85, 1.15), species.minSize, species.maxSize);
        const spread = radiusFor(fs) * 4;
        const fx = pos.x + (w.rng() * 2 - 1) * spread;
        const fy = clamp(pos.y + (w.rng() * 2 - 1) * spread, 40, w.seabedY - 10);
        w.fish.push(new Fish(w.newFishId(), species, fx, fy, fs, angle + (w.rng() - 0.5) * 0.3));
      }
      return;
    }
    const fish = new Fish(w.newFishId(), species, pos.x, pos.y, size, angle);
    fish.aggressive = species.hunter && w.rng() < CONFIG.ai.hunterAggression;
    w.fish.push(fish);
  }

  spawnFood(w: World, zoneId: number): boolean {
    const kind: FoodKind = pickWeighted(w.rng, CONFIG.food.weights[w.ocean]);
    let x: number;
    let y: number;
    if (zoneId >= 0) {
      const z = w.zones[zoneId];
      const a = w.rng() * Math.PI * 2;
      const d = Math.sqrt(w.rng()) * z.radius * 0.9;
      x = z.x + Math.cos(a) * d;
      y = z.y + Math.sin(a) * d;
    } else {
      const m = CONFIG.spawn.activeRangeMul;
      x = w.viewX + (w.rng() * 2 - 1) * w.viewHalfW * m;
      y = w.viewY + (w.rng() * 2 - 1) * w.viewHalfH * m;
    }
    if (y < 60 || y > w.seabedY - 12) return false;
    const p = w.player;
    const keepOut = p.radius * 2.5;
    if (Math.abs(x - p.x) < keepOut && Math.abs(y - p.y) < keepOut) return false;
    w.food.push(new Food(kind, x, y, zoneId, w.rng() * 10));
    return true;
  }
}
