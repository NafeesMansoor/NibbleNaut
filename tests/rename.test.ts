import { describe, expect, it } from 'vitest';
import { SAVE_KEY, SAVE_VERSION } from '../src/config';
import { MemoryStorage, SaveSystem } from '../src/systems/save';

/**
 * The game was renamed from Fish Fight to NibbleNaut in 3.0.1. Players' progress must survive:
 * the storage key keeps the old name, and a save written by the last Fish Fight release loads
 * unchanged.
 */
describe('rename to NibbleNaut keeps existing player data', () => {
  it('still reads and writes the original storage key', () => {
    expect(SAVE_KEY).toBe('fishfight.save');
  });

  it('a Fish Fight 2.1.x save loads with all progress intact', () => {
    const old = {
      version: SAVE_VERSION,
      bestScore: 8421,
      bestSize: 96,
      gamesPlayed: 37,
      pendingReward: 'great',
      plentyUnlocks: 1,
      points: 23150,
      lifetimePoints: 61200,
      ownedFish: ['nemo', 'sunny', 'lion', 'blade'],
      selectedFish: 'blade',
      settings: { volume: 0.4, muted: true, dangerOutlines: false, trivia: false, lang: 'bn' },
    };
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify(old));
    expect(new SaveSystem(storage).get()).toEqual(old);
  });
});
