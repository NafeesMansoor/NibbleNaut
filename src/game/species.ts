import type { Rng } from '../core/math';

export type BodyShape = 'round' | 'tall' | 'long' | 'shark';

/**
 * A species is a look plus a temperament. Sizes are chosen by the spawner first; the species is
 * then picked from those whose range covers that size. Swap colours/shapes here, or replace the
 * procedural drawing in render/fishArt.ts with sprites keyed by `id`.
 */
export interface Species {
  id: string;
  name: string;
  minSize: number;
  maxSize: number;
  shape: BodyShape;
  body: string;
  belly: string;
  fin: string;
  stripe?: string;
  stripes?: number;
  /** Multiplier on the size-based swim speed. */
  speedMul: number;
  /** Hunters actively chase smaller fish (including the player). Others only eat on contact. */
  hunter: boolean;
  /** Relative spawn weight among species that fit a size. */
  weight: number;
  /** Tends to spawn in schools. */
  schooling?: boolean;
}

export const SPECIES: Species[] = [
  { id: 'minnow', name: 'Minnow', minSize: 2.5, maxSize: 7, shape: 'long', body: '#9fc9e0', belly: '#e8f6ff', fin: '#6fa3c4', speedMul: 1.1, hunter: false, weight: 3, schooling: true },
  { id: 'gramma', name: 'Royal Gramma', minSize: 5, maxSize: 12, shape: 'round', body: '#9b4dd6', belly: '#ffd23f', fin: '#7a2fb8', speedMul: 1.05, hunter: false, weight: 2 },
  { id: 'tang', name: 'Blue Tang', minSize: 8, maxSize: 18, shape: 'tall', body: '#2f6fe0', belly: '#4f93ff', fin: '#ffd23f', stripe: '#13245c', stripes: 1, speedMul: 1, hunter: false, weight: 2 },
  { id: 'angel', name: 'Angelfish', minSize: 10, maxSize: 22, shape: 'tall', body: '#ffe066', belly: '#fff3b0', fin: '#f2b705', stripe: '#2b2b2b', stripes: 3, speedMul: 0.95, hunter: false, weight: 1.5 },
  { id: 'grouper', name: 'Grouper', minSize: 15, maxSize: 40, shape: 'round', body: '#7c8f4e', belly: '#c9d39a', fin: '#5b6b35', speedMul: 0.9, hunter: true, weight: 2 },
  { id: 'barracuda', name: 'Barracuda', minSize: 20, maxSize: 55, shape: 'long', body: '#8aa2b5', belly: '#dfe9f1', fin: '#5d7487', stripe: '#4c5f70', stripes: 6, speedMul: 1.15, hunter: true, weight: 1.6 },
  { id: 'shark', name: 'Reef Shark', minSize: 40, maxSize: 110, shape: 'shark', body: '#6f7f8f', belly: '#e6ecf0', fin: '#57656f', speedMul: 1.05, hunter: true, weight: 2 },
  { id: 'leviathan', name: 'Leviathan', minSize: 100, maxSize: 200, shape: 'shark', body: '#3d2f5c', belly: '#8f7fb8', fin: '#2a1f42', stripe: '#6e5aa8', stripes: 4, speedMul: 1, hunter: true, weight: 1 },
];

/** Rare bonus fish. Flees fast; worth a big score bonus. */
export const GOLDEN: Species = {
  id: 'golden',
  name: 'Golden Fish',
  minSize: 3,
  maxSize: 200,
  shape: 'round',
  body: '#ffcc33',
  belly: '#fff2b3',
  fin: '#ffaa00',
  speedMul: 1.5,
  hunter: false,
  weight: 0,
};

export function pickSpecies(size: number, rng: Rng): Species {
  let total = 0;
  for (const s of SPECIES) if (size >= s.minSize && size <= s.maxSize) total += s.weight;
  if (total === 0) return size < SPECIES[0].minSize ? SPECIES[0] : SPECIES[SPECIES.length - 1];
  let roll = rng() * total;
  for (const s of SPECIES) {
    if (size < s.minSize || size > s.maxSize) continue;
    roll -= s.weight;
    if (roll <= 0) return s;
  }
  return SPECIES[SPECIES.length - 1];
}
