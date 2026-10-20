import type { Rng } from '../core/math';

export type BodyShape = 'round' | 'tall' | 'long' | 'shark';

/**
 * A species is a look plus a temperament. Sizes are chosen by the spawner first; the species is
 * then picked from those whose range covers that size. Every species is a real fish of the Bay of
 * Bengal reefs (Fishipedia's Bay of Bengal list); `sci` and `about` feed the game-over fact cards.
 */
export interface Species {
  id: string;
  name: string;
  /** Scientific name. */
  sci: string;
  /** One or two sentences shown on the game-over screen. */
  about: string;
  minSize: number;
  maxSize: number;
  shape: BodyShape;
  body: string;
  belly: string;
  fin: string;
  tail?: string;
  stripe?: string;
  stripes?: number;
  stripeEdge?: string;
  spots?: string;
  band?: string;
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
  {
    id: 'fusilier', name: 'Blue-and-gold Fusilier', sci: 'Caesio caerulaurea',
    about: 'Travels in big flashing schools over the reef, picking plankton out of the open water.',
    minSize: 2.5, maxSize: 7, shape: 'long', body: '#2f7fe0', belly: '#e6f3ff', fin: '#5fa8ff', tail: '#ffd23f', band: '#ffd23f',
    speedMul: 1.1, hunter: false, weight: 3, schooling: true,
  },
  {
    id: 'demoiselle', name: 'Blue Demoiselle', sci: 'Chrysiptera cyanea',
    about: 'A tiny electric-blue damselfish that boldly defends its own patch of coral.',
    minSize: 4, maxSize: 10, shape: 'round', body: '#2648ff', belly: '#4f7dff', fin: '#1d33c9', tail: '#ff9f2e',
    speedMul: 1.05, hunter: false, weight: 2.5,
  },
  {
    id: 'hogfish', name: 'Splitlevel Hogfish', sci: 'Bodianus mesothorax',
    about: 'A wrasse painted half red and half white, split by a dark band. It digs up small crabs and snails.',
    minSize: 5, maxSize: 12, shape: 'round', body: '#d0344c', belly: '#f6f1ea', fin: '#ffd23f', stripe: '#2a1416', stripes: 1,
    speedMul: 1.05, hunter: false, weight: 2,
  },
  {
    id: 'raccoon', name: 'Raccoon Butterflyfish', sci: 'Chaetodon lunula',
    about: 'Named for the black "mask" across its eyes. It feeds at night on worms and coral polyps.',
    minSize: 7, maxSize: 15, shape: 'tall', body: '#ffcf24', belly: '#ffe680', fin: '#ff9f00', stripe: '#1d1d1d', stripes: 1,
    speedMul: 1, hunter: false, weight: 2,
  },
  {
    id: 'copperband', name: 'Copperband Butterflyfish', sci: 'Chelmon rostratus',
    about: 'Uses its long tweezer-like snout to pluck food from narrow cracks in the reef.',
    minSize: 8, maxSize: 18, shape: 'tall', body: '#f5f7fa', belly: '#ffffff', fin: '#f08a24', stripe: '#f08a24', stripes: 3, stripeEdge: '#1d1d1d',
    speedMul: 1, hunter: false, weight: 1.8,
  },
  {
    id: 'vermiculated', name: 'Vermiculated Angelfish', sci: 'Chaetodontoplus mesoleucus',
    about: 'A shy angelfish with a pale face, a finely patterned dark body and a bright yellow tail.',
    minSize: 10, maxSize: 22, shape: 'tall', body: '#2b3140', belly: '#e9edf2', fin: '#3a4256', tail: '#ffd23f', spots: '#b9c3d1',
    speedMul: 0.95, hunter: false, weight: 1.5,
  },
  {
    id: 'humpback', name: 'Humpback Grouper', sci: 'Chromileptes altivelis',
    about: 'Also called the panther grouper for its polka dots. It ambushes small fish from coral caves.',
    minSize: 15, maxSize: 40, shape: 'round', body: '#f1ece0', belly: '#ffffff', fin: '#e6dfcf', spots: '#1d1d24',
    speedMul: 0.9, hunter: true, weight: 2,
  },
  {
    id: 'dolphinfish', name: 'Common Dolphinfish', sci: 'Coryphaena hippurus',
    about: 'Also known as mahi-mahi: a dazzling green, blue and gold speedster that hunts flying fish.',
    minSize: 20, maxSize: 55, shape: 'long', body: '#1fb37a', belly: '#ffe04a', fin: '#2a7de1', spots: '#1a5fb4',
    speedMul: 1.15, hunter: true, weight: 1.6,
  },
  {
    id: 'blacktip', name: 'Blacktip Reef Shark', sci: 'Carcharhinus melanopterus',
    about: 'Easy to spot by the black tips on its fins. It patrols shallow lagoons hunting reef fish.',
    minSize: 40, maxSize: 110, shape: 'shark', body: '#8a9aa6', belly: '#eef3f6', fin: '#1f262c', tail: '#1f262c',
    speedMul: 1.05, hunter: true, weight: 2,
  },
  {
    id: 'bull', name: 'Bull Shark', sci: 'Carcharhinus leucas',
    about: 'A heavy, powerful shark that can even swim up rivers from the Bay of Bengal into fresh water.',
    minSize: 100, maxSize: 200, shape: 'shark', body: '#5d6873', belly: '#e6e9ec', fin: '#3d4650',
    speedMul: 1, hunter: true, weight: 1,
  },
];

/** Rare bonus fish. Flees fast; worth a big score bonus. */
export const GOLDEN: Species = {
  id: 'golden',
  name: 'Golden Ilish',
  sci: 'Tenualosa ilisha',
  about: 'The ilish (hilsa) is the national fish of Bangladesh. Each year it swims from the Bay of Bengal up the great rivers to spawn.',
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

export const speciesById = (id: string): Species | undefined => (id === GOLDEN.id ? GOLDEN : SPECIES.find((s) => s.id === id));

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
