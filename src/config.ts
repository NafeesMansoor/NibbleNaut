/**
 * Central balance configuration for NibbleNaut.
 *
 * Every tunable number lives here so playtesting changes never require hunting through the
 * code. Sizes are abstract gameplay units (not pixels); world positions are world units, and
 * the camera derives on-screen scale from them.
 */

export type RewardTier = 'normal' | 'good' | 'great' | 'amazing' | 'plenty';
export type OceanKind = 'normal' | 'plenty';
export type FoodKind = 'plankton' | 'shrimp' | 'bubble';

export interface StageDef {
  name: string;
  /** Size at which this stage begins. */
  min: number;
}

export const CONFIG = {
  world: {
    width: 12000,
    height: 4800,
    /** Thickness of the sand band at the bottom of the world. */
    seabedHeight: 220,
    /** Player spawns this far above the seabed, near the reef. */
    playerStartAboveSeabed: 170,
  },

  size: {
    normalStart: 10,
    /** "Good" reward: slightly larger than normal. */
    goodStart: 15,
    /** "Great", "Amazing" and Ocean of Plenty rewards all start here — never larger. */
    mediumStart: 25,
    /** An eater must be at least this many times the target's size. */
    eatMultiplier: 1.2,
    playerMax: 160,
    fishMax: 200,
    /** World units of hitbox radius per size unit. Visuals use the same value. */
    radiusPerSize: 1.6,
    /** Exponential rate at which the current size approaches the grown size. */
    growRate: 7,
    stages: [
      { name: 'Small Fish', min: 0 },
      { name: 'Medium Fish', min: 22 },
      { name: 'Large Fish', min: 45 },
      { name: 'Ocean Titan', min: 90 },
    ] as StageDef[],
  },

  growth: {
    /** Fraction of a prey fish's mass (size²) the player absorbs. */
    fishMassAbsorb: 0.45,
    /** AI fish grow more slowly from their own meals. */
    aiMassAbsorb: 0.15,
    /** Growth points (mass) granted by each food type. */
    food: { plankton: 5, shrimp: 14, bubble: 22 } as Record<FoodKind, number>,
    /** Growth multiplier for food eaten inside an Ocean of Plenty feeding zone. */
    zoneMultiplier: 2,
  },

  movement: {
    /** Cruising speed (world units/s) of a size-10 fish. */
    baseSpeed: 205,
    /** Speed scales with size^exponent: bigger fish are faster in absolute terms. */
    speedSizeExponent: 0.5,
    playerSpeedMul: 1.4,
    /** How quickly the player's velocity reaches the desired velocity. */
    playerResponsiveness: 13,
    dashSpeedMul: 2.6,
    dashDuration: 0.3,
    dashCooldown: 2.2,
    speedBoostMul: 1.45,
  },

  ai: {
    wanderSpeedMul: 0.4,
    fleeRadiusBase: 220,
    fleeRadiusPerRadius: 4,
    huntRadiusBase: 300,
    huntRadiusPerRadius: 3.5,
    /** Hunters give up after this long so escapes are always possible. */
    chaseMaxSeconds: 3.5,
    restSeconds: 3,
    /**
     * A hunter chasing the player never exceeds this fraction of the player's cruising speed,
     * so swimming away cleanly always works; danger comes from ambushes and being cornered.
     */
    maxChaseVsPlayer: 0.92,
    /** At most this many fish may hunt the player at once, so the player is never swarmed. */
    maxPlayerChasers: 2,
    /** Share of hunter-species fish that actively hunt; the rest only eat on contact. */
    hunterAggression: 0.6,
    /** Fish re-evaluate their surroundings at this interval rather than every frame. */
    senseInterval: 0.18,
  },

  spawn: {
    fishTarget: 32,
    fishPerSecond: 6,
    /** Fish spawn within (view half-extent × this) of the view centre, outside the view. */
    activeRangeMul: 2.2,
    /** Entities beyond (view half-extent × this) are removed. */
    despawnRangeMul: 3,
    weights: { prey: 0.64, peer: 0.14, threat: 0.22 },
    /** Threat spawns ramp from `threatRampStart`× to full weight over the opening seconds. */
    threatRampSeconds: 25,
    threatRampStart: 0.35,
    preyRange: [0.3, 0.8] as [number, number],
    peerRange: [0.85, 1.15] as [number, number],
    threatRange: [1.25, 2.3] as [number, number],
    minFishSize: 2.5,
    /** Chance that a spawn is a bonus fish (Golden Ilish, Silver Rupchanda or Lakkha). */
    bonusChance: 0.07,
    /** At most this many bonus fish around at once. */
    maxBonusFish: 3,
    schoolChance: 0.4,
    schoolSize: [4, 7] as [number, number],
    /** Brief invulnerability at the start of every game. */
    spawnProtectionSeconds: 2.5,
  },

  food: {
    target: 45,
    perSecond: 6,
    lifetime: 45,
    radius: { plankton: 3, shrimp: 6, bubble: 7 } as Record<FoodKind, number>,
    weights: {
      normal: { plankton: 0.7, shrimp: 0.22, bubble: 0.08 },
      plenty: { plankton: 0.45, shrimp: 0.35, bubble: 0.2 },
    } as Record<OceanKind, Record<FoodKind, number>>,
  },

  ocean: {
    plenty: {
      /** Ocean of Plenty keeps 2.5× as much food around the player… */
      foodCountMul: 2.5,
      /** …and refills it three times as fast. */
      foodRateMul: 3,
      zoneCount: 7,
      zoneRadius: 480,
      zoneFoodTarget: 14,
    },
  },

  score: {
    fishBase: 10,
    fishPerSize: 5,
    /** Bonus points for a bonus fish without its own `bonus` value. */
    goldenBonus: 500,
    food: { plankton: 2, shrimp: 8, bubble: 12 } as Record<FoodKind, number>,
    zoneMultiplier: 2,
    /** Kept low on purpose so hunting always beats hiding. */
    survivalPerSecond: 1,
    stageBonus: 250,
  },

  rewards: {
    /** Minimum final score for each tier. Tune after playtesting. */
    thresholds: { good: 1200, great: 3000, amazing: 6000, plenty: 10000 } as Record<
      Exclude<RewardTier, 'normal'>,
      number
    >,
    /** Length of the "Amazing" reward's opening speed boost. */
    speedBoostSeconds: 10,
  },

  camera: {
    /** Player's on-screen radius as a fraction of the smaller screen dimension, at start… */
    screenRadiusSmall: 0.032,
    /**
     * On-screen radius grows with (size / start size)^0.6, so every meal makes the fish visibly
     * bigger on screen while the camera still pulls back enough to show more of the ocean.
     */
    screenRadiusExponent: 0.6,
    /** Cap on the player's on-screen radius (fraction of the smaller screen dimension). */
    screenRadiusMax: 0.11,
    followRate: 6,
    zoomRate: 2.5,
  },
};

/**
 * Storage key for player progress. It keeps the game's former name (Fish Fight) on purpose:
 * changing it would make every existing player's points, fish and settings disappear.
 */
export const SAVE_KEY = 'fishfight.save';
export const SAVE_VERSION = 2;
