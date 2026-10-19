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
}

export const newRunStats = (startSize: number, startStage: number): RunStats => ({
  score: 0,
  fishEaten: 0,
  foodEaten: 0,
  goldenEaten: 0,
  maxSize: startSize,
  time: 0,
  stage: startStage,
});

export const pointsForFish = (preySize: number, golden: boolean): number =>
  Math.round(CONFIG.score.fishBase + preySize * CONFIG.score.fishPerSize) + (golden ? CONFIG.score.goldenBonus : 0);

export const pointsForFood = (kind: FoodKind, inZone: boolean): number =>
  CONFIG.score.food[kind] * (inZone ? CONFIG.score.zoneMultiplier : 1);
