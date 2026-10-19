import { describe, expect, it } from 'vitest';
import { CONFIG } from '../src/config';
import { seededRng } from '../src/core/math';
import { Fish, Food } from '../src/game/entities';
import { SPECIES } from '../src/game/species';
import { World } from '../src/game/World';
import { startConditionsFor } from '../src/systems/rewards';

const still = { moveX: 0, moveY: 0, dash: false };

function emptyWorld(size = 10, ocean: 'normal' | 'plenty' = 'normal'): World {
  const w = new World({ startSize: size, ocean, rng: seededRng(1) });
  w.fish.length = 0;
  w.food.length = 0;
  w.player.protectTime = 0;
  return w;
}

const minnow = SPECIES.find((s) => s.id === 'minnow')!;
const shark = SPECIES.find((s) => s.id === 'shark')!;

describe('world', () => {
  it('player eats a smaller fish on contact, grows and scores', () => {
    const w = emptyWorld();
    const p = w.player;
    w.fish.push(new Fish(1, minnow, p.x + 2, p.y, 5, 0));
    w.update(1 / 60, still);
    expect(w.stats.fishEaten).toBe(1);
    expect(p.targetSize).toBeGreaterThan(10);
    expect(w.stats.score).toBeGreaterThan(CONFIG.score.fishBase);
  });

  it('a much larger fish eats the player', () => {
    const w = emptyWorld();
    const p = w.player;
    w.fish.push(new Fish(1, shark, p.x + 1, p.y, 50, 0));
    w.update(1 / 60, still);
    expect(p.alive).toBe(false);
    expect(w.drainEvents().some((e) => e.type === 'playerEaten')).toBe(true);
  });

  it('spawn protection prevents an immediate death', () => {
    const w = emptyWorld();
    w.player.protectTime = 1;
    w.fish.push(new Fish(1, shark, w.player.x + 1, w.player.y, 50, 0));
    w.update(1 / 60, still);
    expect(w.player.alive).toBe(true);
  });

  it('similar-size fish are neither eaten nor deadly', () => {
    const w = emptyWorld();
    w.fish.push(new Fish(1, minnow, w.player.x + 1, w.player.y, 10.5, 0));
    w.update(1 / 60, still);
    expect(w.player.alive).toBe(true);
    expect(w.stats.fishEaten).toBe(0);
  });

  it('eats several food items in one frame, each exactly once', () => {
    const w = emptyWorld();
    const p = w.player;
    for (let i = 0; i < 5; i++) w.food.push(new Food('plankton', p.x + i, p.y, -1, 0));
    w.update(1 / 60, still);
    expect(w.stats.foodEaten).toBe(5);
    expect(w.food.some((f) => Math.abs(f.x - p.x) < 5 && f.age < 0.1 && !f.alive)).toBe(false);
  });

  it('Ocean of Plenty starts medium and has far more food and feeding zones', () => {
    const plenty = startConditionsFor('plenty');
    const a = new World({ startSize: plenty.startSize, ocean: plenty.ocean, rng: seededRng(3) });
    const b = new World({ startSize: CONFIG.size.mediumStart, ocean: 'normal', rng: seededRng(3) });
    expect(a.player.size).toBe(CONFIG.size.mediumStart);
    expect(a.zones.length).toBe(CONFIG.ocean.plenty.zoneCount);
    expect(b.zones.length).toBe(0);
    expect(a.food.length).toBeGreaterThan(b.food.length * 2);
  });

  it('opening fish spawn outside the real starting view', () => {
    const view = { halfW: 900, halfH: 520 };
    const w = new World({ startSize: 25, ocean: 'plenty', rng: seededRng(5), view: (s) => ({ x: s.x, y: s.y, ...view }) });
    expect(w.fish.length).toBeGreaterThan(10);
    for (const f of w.fish) {
      const inside = Math.abs(f.x - w.viewX) < view.halfW && Math.abs(f.y - w.viewY) < view.halfH;
      expect(inside).toBe(false);
    }
  });

  it('runs a long random session without NaNs, escapes or unbounded populations', () => {
    for (const ocean of ['normal', 'plenty'] as const) {
      const rng = seededRng(ocean === 'normal' ? 11 : 12);
      const w = new World({ startSize: 10, ocean, rng });
      let mx = 0;
      let my = 0;
      for (let i = 0; i < 60 * 90; i++) {
        if (i % 30 === 0) {
          mx = rng() * 2 - 1;
          my = rng() * 2 - 1;
        }
        w.update(1 / 60, { moveX: mx, moveY: my, dash: i % 120 === 0 });
        w.setView(w.player.x, w.player.y, 450, 260);
        if (!w.player.alive) w.player.alive = true; // keep the soak going
      }
      const p = w.player;
      expect(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.size)).toBe(true);
      expect(w.fish.length).toBeLessThanOrEqual(CONFIG.spawn.fishTarget + 7);
      expect(w.food.length).toBeLessThan(400);
      for (const f of w.fish) {
        expect(Number.isFinite(f.x) && Number.isFinite(f.y)).toBe(true);
        expect(f.x).toBeGreaterThanOrEqual(0);
        expect(f.x).toBeLessThanOrEqual(w.width);
        expect(f.y).toBeGreaterThanOrEqual(0);
        expect(f.y).toBeLessThanOrEqual(w.seabedY);
      }
      for (const f of w.food) expect(f.y).toBeLessThanOrEqual(w.seabedY);
    }
  });
});
