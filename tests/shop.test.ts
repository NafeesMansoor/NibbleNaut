import { describe, expect, it } from 'vitest';
import { SAVE_KEY } from '../src/config';
import { seededRng } from '../src/core/math';
import { Fish, Food } from '../src/game/entities';
import { fishById, PLAYER_FISH, STARTER_FISH } from '../src/game/playerFish';
import { SPECIES } from '../src/game/species';
import { World } from '../src/game/World';
import { RewardLedger } from '../src/systems/rewards';
import { MemoryStorage, migrate, SaveSystem } from '../src/systems/save';
import { FishShop } from '../src/systems/shop';

const still = { moveX: 0, moveY: 0, dash: false };
const sunny = fishById('sunny')!;

describe('points bank', () => {
  it('adds every run score to the bank and survives a reload', () => {
    const storage = new MemoryStorage();
    const ledger = new RewardLedger(new SaveSystem(storage));
    expect(ledger.recordGameOver(1234.7, 20).pointsEarned).toBe(1234);
    ledger.recordGameOver(500, 12);
    const reloaded = new SaveSystem(storage).get();
    expect(reloaded.points).toBe(1734);
    expect(reloaded.lifetimePoints).toBe(1734);
  });

  it('migrates a version-1 save to an empty bank and the starter fish', () => {
    const d = migrate({ version: 1, bestScore: 900 });
    expect(d.points).toBe(0);
    expect(d.ownedFish).toEqual([STARTER_FISH.id]);
    expect(d.selectedFish).toBe(STARTER_FISH.id);
    expect(d.bestScore).toBe(900);
  });

  it('drops unknown or unowned fish from a tampered save', () => {
    const d = migrate({ points: -5, ownedFish: ['sunny', 'kraken', 7], selectedFish: 'dragon' });
    expect(d.points).toBe(0);
    expect(d.ownedFish.sort()).toEqual(['nemo', 'sunny']);
    expect(d.selectedFish).toBe('nemo');
  });
});

describe('Upgrade Fish shop', () => {
  it('catalog is free first, then strictly pricier and stronger', () => {
    expect(PLAYER_FISH[0].cost).toBe(0);
    for (let i = 1; i < PLAYER_FISH.length; i++) {
      expect(PLAYER_FISH[i].cost).toBeGreaterThan(PLAYER_FISH[i - 1].cost);
      expect(PLAYER_FISH[i].feedMul).toBeGreaterThan(PLAYER_FISH[i - 1].feedMul);
    }
  });

  it('refuses a purchase without enough points', () => {
    const shop = new FishShop(new SaveSystem(new MemoryStorage()));
    expect(shop.buy('sunny')).toBe('insufficient');
    expect(shop.owns('sunny')).toBe(false);
  });

  it('spends points, owns and selects the fish, and persists it', () => {
    const storage = new MemoryStorage();
    const save = new SaveSystem(storage);
    save.update((d) => (d.points = sunny.cost + 100));
    const shop = new FishShop(save);
    expect(shop.buy('sunny')).toBe('bought');
    expect(shop.points).toBe(100);
    expect(shop.selected().id).toBe('sunny');
    expect(shop.buy('sunny')).toBe('owned');
    expect(shop.points).toBe(100);
    const saved = JSON.parse(storage.getItem(SAVE_KEY)!);
    expect(saved.ownedFish).toContain('sunny');
    expect(saved.lifetimePoints).toBe(0);
  });

  it('only selects owned fish', () => {
    const shop = new FishShop(new SaveSystem(new MemoryStorage()));
    expect(shop.select('dragon')).toBe(false);
    expect(shop.select('nemo')).toBe(true);
  });
});

describe('advanced fish feeding points', () => {
  const eatOnce = (fishId: string): number => {
    const w = new World({ startSize: 10, ocean: 'normal', rng: seededRng(1), fish: fishById(fishId) });
    w.fish.length = 0;
    w.food.length = 0;
    const p = w.player;
    w.food.push(new Food('shrimp', p.x, p.y, -1, 0));
    w.fish.push(new Fish(1, SPECIES[0], p.x + 2, p.y, 5, 0));
    const before = w.stats.score;
    w.update(1 / 60, still);
    return w.stats.score - before;
  };

  it('a 3× fish earns about three times the points for the same meal', () => {
    const base = eatOnce('nemo');
    const dragon = eatOnce('dragon');
    expect(dragon / base).toBeGreaterThan(2.8);
    expect(dragon / base).toBeLessThan(3.1);
  });
});
