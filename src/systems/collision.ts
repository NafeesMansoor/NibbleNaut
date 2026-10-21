import { CONFIG } from '../config';
import { dist2 } from '../core/math';
import type { Body, Fish } from '../game/entities';
import type { World } from '../game/World';
import { canEat, massFromFish, sizeAfterGain } from './growth';
import { pointsForFish, pointsForFood } from './score';

/** The eater must mostly cover the target, not just graze it. */
export function overlapsToEat(eater: Body, target: Body): boolean {
  const reach = eater.radius * 0.9 + target.radius * 0.4;
  return dist2(eater.x, eater.y, target.x, target.y) < reach * reach;
}

/**
 * Resolves eating for one frame in a fixed order so simultaneous contacts are deterministic:
 *   1. the player eats food (any number per frame),
 *   2. the player eats smaller fish,
 *   3. larger fish eat the player (using the player's size after step 2),
 *   4. AI fish eat each other, at most one meal per fish per frame.
 * Dead entities are skipped, so nothing is eaten twice.
 */
export function resolveCollisions(w: World): void {
  const p = w.player;
  const g = CONFIG.growth;

  if (p.alive) {
    for (const f of w.food) {
      if (!f.alive) continue;
      const reach = p.radius * 1.05 + f.radius;
      if (dist2(p.x, p.y, f.x, f.y) > reach * reach) continue;
      f.alive = false;
      const inZone = f.zone >= 0;
      p.grow(g.food[f.kind] * (inZone ? g.zoneMultiplier : 1));
      const points = Math.round(pointsForFood(f.kind, inZone) * p.feedMul);
      w.addScore(points);
      w.stats.foodEaten++;
      w.events.push({ type: 'eatFood', x: f.x, y: f.y, kind: f.kind, points, zone: inZone });
    }

    for (const f of w.fish) {
      if (!f.alive || !canEat(p.size, f.size) || !overlapsToEat(p, f)) continue;
      f.alive = false;
      p.grow(massFromFish(f.size, g.fishMassAbsorb));
      const points = Math.round(pointsForFish(f.size, f.golden ? (f.species.bonus ?? CONFIG.score.goldenBonus) : 0) * p.feedMul);
      w.addScore(points);
      w.stats.fishEaten++;
      if (f.golden) w.stats.goldenEaten++;
      w.stats.eaten[f.species.id] = (w.stats.eaten[f.species.id] ?? 0) + 1;
      w.events.push({ type: 'eatFish', x: f.x, y: f.y, size: f.size, points, golden: f.golden, color: f.species.body });
    }

    if (p.protectTime <= 0) {
      for (const f of w.fish) {
        if (!f.alive || f.species.harmless || !canEat(f.size, p.size) || !overlapsToEat(f, p)) continue;
        p.alive = false;
        p.vx = p.vy = 0;
        f.ateThisFrame = true;
        w.events.push({ type: 'playerEaten', x: p.x, y: p.y, by: f });
        break;
      }
    }
  }

  const list = w.fish;
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!a.alive || a.ateThisFrame) continue;
    for (let j = i + 1; j < list.length; j++) {
      const b = list[j];
      if (!b.alive || b.ateThisFrame) continue;
      let eater: Fish | null = null;
      let prey: Fish | null = null;
      if (canEat(a.size, b.size) && overlapsToEat(a, b)) [eater, prey] = [a, b];
      else if (canEat(b.size, a.size) && overlapsToEat(b, a)) [eater, prey] = [b, a];
      if (!eater || !prey) continue;
      prey.alive = false;
      eater.ateThisFrame = true;
      const cap = Math.min(CONFIG.size.fishMax, eater.species.maxSize * 1.15);
      eater.setSize(Math.max(eater.size, sizeAfterGain(eater.size, massFromFish(prey.size, g.aiMassAbsorb), cap)));
      w.events.push({ type: 'fishEaten', x: prey.x, y: prey.y, color: prey.species.body });
      if (!a.alive || a.ateThisFrame) break;
    }
  }
}
