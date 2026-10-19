import { describe, expect, it } from 'vitest';
import { CONFIG } from '../src/config';
import { canEat, radiusFor, sizeAfterGain, stageIndex, stageInfo } from '../src/systems/growth';

describe('eat rule', () => {
  it('is edible exactly at the threshold', () => {
    expect(canEat(12, 10)).toBe(true);
    expect(canEat(10 * CONFIG.size.eatMultiplier, 10)).toBe(true);
    expect(canEat(36, 30)).toBe(true);
  });
  it('is not edible just under the threshold or at similar size', () => {
    expect(canEat(11.99, 10)).toBe(false);
    expect(canEat(10, 10)).toBe(false);
    expect(canEat(10, 9)).toBe(false);
  });
  it('is never mutual', () => {
    for (let a = 2; a < 200; a += 3.7) for (let b = 2; b < 200; b += 5.3) expect(canEat(a, b) && canEat(b, a)).toBe(false);
  });
});

describe('growth', () => {
  it('radius is derived from size so visuals and hitbox stay in sync', () => {
    expect(radiusFor(10)).toBeCloseTo(10 * CONFIG.size.radiusPerSize);
    expect(radiusFor(25) / radiusFor(10)).toBeCloseTo(2.5);
  });
  it('adds mass and respects the cap', () => {
    expect(sizeAfterGain(10, 0, 160)).toBe(10);
    expect(sizeAfterGain(3, 16, 160)).toBeCloseTo(5);
    expect(sizeAfterGain(150, 1e6, 160)).toBe(160);
  });
  it('maps sizes to stages', () => {
    expect(stageIndex(CONFIG.size.normalStart)).toBe(0);
    expect(stageIndex(CONFIG.size.mediumStart)).toBe(1);
    expect(stageInfo(CONFIG.size.mediumStart).name).toBe('Medium Fish');
    expect(stageIndex(100)).toBe(3);
    expect(stageInfo(160).progress).toBe(1);
  });
});
