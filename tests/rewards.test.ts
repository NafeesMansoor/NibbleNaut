import { describe, expect, it } from 'vitest';
import { CONFIG } from '../src/config';
import { evaluateTier, RewardLedger, startConditionsFor } from '../src/systems/rewards';
import { MemoryStorage, SaveSystem } from '../src/systems/save';

const t = CONFIG.rewards.thresholds;

describe('tier evaluation', () => {
  it('maps scores to tiers at the configured thresholds', () => {
    expect(evaluateTier(0)).toBe('normal');
    expect(evaluateTier(t.good - 1)).toBe('normal');
    expect(evaluateTier(t.good)).toBe('good');
    expect(evaluateTier(t.great)).toBe('great');
    expect(evaluateTier(t.amazing)).toBe('amazing');
    expect(evaluateTier(t.plenty)).toBe('plenty');
    expect(evaluateTier(t.plenty * 10)).toBe('plenty');
  });
});

describe('start conditions', () => {
  it('normal / no reward starts small in a normal ocean', () => {
    expect(startConditionsFor(null)).toMatchObject({ startSize: CONFIG.size.normalStart, ocean: 'normal', speedBoostSeconds: 0 });
  });
  it('good starts slightly larger, great starts medium', () => {
    const good = startConditionsFor('good').startSize;
    expect(good).toBeGreaterThan(CONFIG.size.normalStart);
    expect(good).toBeLessThan(CONFIG.size.mediumStart);
    expect(startConditionsFor('great').startSize).toBe(CONFIG.size.mediumStart);
  });
  it('amazing adds a speed boost', () => {
    const c = startConditionsFor('amazing');
    expect(c.startSize).toBe(CONFIG.size.mediumStart);
    expect(c.speedBoostSeconds).toBeGreaterThan(0);
  });
  it('Ocean of Plenty starts MEDIUM (not large) in the plenty ocean', () => {
    const c = startConditionsFor('plenty');
    expect(c.startSize).toBe(CONFIG.size.mediumStart);
    expect(c.ocean).toBe('plenty');
  });
});

describe('reward lifecycle', () => {
  it('saves at game over and is consumed exactly once', () => {
    const save = new SaveSystem(new MemoryStorage());
    const ledger = new RewardLedger(save);
    ledger.recordGameOver(t.great + 5, 30);
    expect(ledger.peekPending()).toBe('great');
    expect(ledger.consumeForNewGame()).toBe('great');
    expect(ledger.consumeForNewGame()).toBeNull();
  });

  it('survives a refresh before it is consumed', () => {
    const storage = new MemoryStorage();
    new RewardLedger(new SaveSystem(storage)).recordGameOver(t.plenty, 100);
    const afterRefresh = new RewardLedger(new SaveSystem(storage));
    expect(afterRefresh.peekPending()).toBe('plenty');
  });

  it('cannot be duplicated by refreshing after it was consumed', () => {
    const storage = new MemoryStorage();
    new RewardLedger(new SaveSystem(storage)).recordGameOver(t.amazing, 50);
    expect(new RewardLedger(new SaveSystem(storage)).consumeForNewGame()).toBe('amazing');
    expect(new RewardLedger(new SaveSystem(storage)).consumeForNewGame()).toBeNull();
  });

  it('a reward earned during a bonus game is saved for the following game', () => {
    const ledger = new RewardLedger(new SaveSystem(new MemoryStorage()));
    ledger.recordGameOver(t.plenty, 100);
    expect(ledger.consumeForNewGame()).toBe('plenty');
    ledger.recordGameOver(t.good, 20);
    expect(ledger.consumeForNewGame()).toBe('good');
  });

  it('a normal score clears any pending reward and tracks best score', () => {
    const save = new SaveSystem(new MemoryStorage());
    const ledger = new RewardLedger(save);
    ledger.recordGameOver(t.great, 30);
    const r = ledger.recordGameOver(10, 11);
    expect(r.tier).toBe('normal');
    expect(r.newBest).toBe(false);
    expect(ledger.peekPending()).toBeNull();
    expect(save.get().bestScore).toBe(t.great);
    expect(save.get().gamesPlayed).toBe(2);
  });
});
