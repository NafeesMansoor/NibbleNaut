import { CONFIG } from '../config';

/** Hitbox radius and visual radius are both derived from size through this one function. */
export const radiusFor = (size: number): number => size * CONFIG.size.radiusPerSize;

/**
 * The single eat-eligibility rule used by the player, AI fish and the renderer's danger cues.
 * Exactly at the threshold counts as edible; the epsilon absorbs floating-point noise.
 */
export const canEat = (eaterSize: number, targetSize: number): boolean =>
  eaterSize >= targetSize * CONFIG.size.eatMultiplier - 1e-9;

/** Growth model: mass = size², eating adds mass, size = √mass. */
export const sizeAfterGain = (size: number, massGain: number, max: number): number =>
  Math.min(max, Math.sqrt(size * size + massGain));

export const massFromFish = (preySize: number, absorb: number): number => preySize * preySize * absorb;

export function stageIndex(size: number): number {
  const stages = CONFIG.size.stages;
  let idx = 0;
  for (let i = 0; i < stages.length; i++) if (size >= stages[i].min) idx = i;
  return idx;
}

export interface StageInfo {
  index: number;
  name: string;
  /** 0..1 progress from this stage's start to the next milestone (or to max size). */
  progress: number;
  nextName: string | null;
}

export function stageInfo(size: number): StageInfo {
  const stages = CONFIG.size.stages;
  const index = stageIndex(size);
  // The first stage's bar starts from the normal starting size, not zero.
  const lo = index === 0 ? Math.min(CONFIG.size.normalStart, stages[1]?.min ?? 0) : stages[index].min;
  const next = stages[index + 1];
  const hi = next ? next.min : CONFIG.size.playerMax;
  const progress = Math.max(0, Math.min(1, (size - lo) / (hi - lo)));
  return { index, name: stages[index].name, progress, nextName: next ? next.name : null };
}

/** Swimming speed in world units/s for a fish of the given size. */
export const speedFor = (size: number): number =>
  CONFIG.movement.baseSpeed * Math.pow(size / 10, CONFIG.movement.speedSizeExponent);
