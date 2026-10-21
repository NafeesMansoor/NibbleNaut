import { CONFIG, type FoodKind } from '../config';

export interface RunStats {
  score: number;
  fishEaten: number;
  foodEaten: number;
  goldenEaten: number;
  maxSize: number;
  time: number;
  /** Highest size stage reached this run. */
  stage: number;
  /** Fish eaten this run, counted per species id. */
  eaten: Record<string, number>;
}

export const newRunStats = (startSize: number, startStage: number): RunStats => ({
  score: 0,
  fishEaten: 0,
  foodEaten: 0,
  goldenEaten: 0,
  maxSize: startSize,
  time: 0,
  stage: startStage,
  eaten: {},
});

/** Points for eating a fish; `bonus` is the bonus fish's extra (0 for ordinary fish). */
export const pointsForFish = (preySize: number, bonus = 0): number =>
  Math.round(CONFIG.score.fishBase + preySize * CONFIG.score.fishPerSize) + bonus;

export const pointsForFood = (kind: FoodKind, inZone: boolean): number =>
  CONFIG.score.food[kind] * (inZone ? CONFIG.score.zoneMultiplier : 1);
