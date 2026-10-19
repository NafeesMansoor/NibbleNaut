import { CONFIG, type OceanKind, type RewardTier } from '../config';
import type { SaveSystem } from './save';

/**
 * Performance-based next-game rewards.
 *
 * Lifecycle: a reward is evaluated and saved the instant a run ends, sits as `pendingReward`,
 * and is consumed (cleared in storage) the moment the next game starts. A refresh after
 * earning keeps it; a refresh after consuming cannot bring it back.
 */

export const TIER_ORDER: RewardTier[] = ['normal', 'good', 'great', 'amazing', 'plenty'];

export function evaluateTier(score: number, thresholds = CONFIG.rewards.thresholds): RewardTier {
  if (score >= thresholds.plenty) return 'plenty';
  if (score >= thresholds.amazing) return 'amazing';
  if (score >= thresholds.great) return 'great';
  if (score >= thresholds.good) return 'good';
  return 'normal';
}

/** The next tier above `tier` and the score it needs, for the "next goal" hint. */
export function nextTierGoal(tier: RewardTier): { tier: RewardTier; score: number } | null {
  const i = TIER_ORDER.indexOf(tier);
  const next = TIER_ORDER[i + 1] as Exclude<RewardTier, 'normal'> | undefined;
  return next ? { tier: next, score: CONFIG.rewards.thresholds[next] } : null;
}

export interface StartConditions {
  startSize: number;
  speedBoostSeconds: number;
  ocean: OceanKind;
  tier: RewardTier;
}

export function startConditionsFor(tier: RewardTier | null): StartConditions {
  const s = CONFIG.size;
  switch (tier) {
    case 'good':
      return { tier, startSize: s.goodStart, speedBoostSeconds: 0, ocean: 'normal' };
    case 'great':
      return { tier, startSize: s.mediumStart, speedBoostSeconds: 0, ocean: 'normal' };
    case 'amazing':
      return { tier, startSize: s.mediumStart, speedBoostSeconds: CONFIG.rewards.speedBoostSeconds, ocean: 'normal' };
    case 'plenty':
      // The advantage is the environment, not the fish: still a medium start.
      return { tier, startSize: s.mediumStart, speedBoostSeconds: 0, ocean: 'plenty' };
    default:
      return { tier: 'normal', startSize: s.normalStart, speedBoostSeconds: 0, ocean: 'normal' };
  }
}

export interface RewardText {
  label: string;
  title: string;
  description: string;
  chip: string;
}

export function rewardText(tier: RewardTier): RewardText {
  switch (tier) {
    case 'good':
      return {
        label: 'Good',
        title: 'Head Start',
        description: 'Your next game starts with a slightly larger fish.',
        chip: 'Good reward: bigger start',
      };
    case 'great':
      return {
        label: 'Great',
        title: 'Medium Start',
        description: 'Your next game starts as a medium-sized fish.',
        chip: 'Great reward: medium start',
      };
    case 'amazing':
      return {
        label: 'Amazing',
        title: 'Medium Start + Speed Boost',
        description: `Your next game starts as a medium-sized fish with a ${CONFIG.rewards.speedBoostSeconds}-second speed boost.`,
        chip: 'Amazing reward: medium start + boost',
      };
    case 'plenty':
      return {
        label: 'Unbelievably Amazing',
        title: 'The Ocean of Plenty',
        description:
          'Your next game starts with a medium-sized fish and an ocean full of food. Eat, grow, and make the most of your advantage!',
        chip: 'Ocean of Plenty',
      };
    default:
      return {
        label: 'Normal',
        title: 'Normal Start',
        description: 'Your next game starts as a small fish in a normal ocean.',
        chip: '',
      };
  }
}

export class RewardLedger {
  constructor(private save: SaveSystem) {}

  peekPending(): RewardTier | null {
    return this.save.get().pendingReward;
  }

  /** Called once as a new game starts. Returns the reward to apply and clears it from storage. */
  consumeForNewGame(): RewardTier | null {
    const pending = this.save.get().pendingReward;
    if (pending) this.save.update((d) => (d.pendingReward = null));
    return pending;
  }

  /**
   * Called once when a run ends. Saves the earned reward (if any) for the following game and
   * banks the run's score as spendable points.
   */
  recordGameOver(score: number, maxSize: number): { tier: RewardTier; newBest: boolean; pointsEarned: number } {
    const tier = evaluateTier(score);
    const newBest = score > this.save.get().bestScore;
    const pointsEarned = Math.max(0, Math.floor(score));
    this.save.update((d) => {
      d.points += pointsEarned;
      d.lifetimePoints += pointsEarned;
      d.pendingReward = tier === 'normal' ? null : tier;
      d.gamesPlayed += 1;
      d.bestScore = Math.max(d.bestScore, Math.floor(score));
      d.bestSize = Math.max(d.bestSize, Math.round(maxSize));
      if (tier === 'plenty') d.plentyUnlocks += 1;
    });
    return { tier, newBest, pointsEarned };
  }
}
