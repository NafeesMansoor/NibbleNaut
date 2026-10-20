import type { FishLook } from '../render/fishArt';

/**
 * Fish the player can swim as. The starter is free; the rest are bought in the Upgrade Fish
 * shop with banked points. Advanced fish earn more points for everything they eat
 * (`feedMul` multiplies food and fish points), so they fill the bank faster.
 */
export interface PlayerFishDef {
  id: string;
  name: string;
  /** Scientific name. */
  sci: string;
  /** Points needed to buy. 0 = owned from the start. */
  cost: number;
  /** Multiplier on points for food and fish eaten. */
  feedMul: number;
  /** Short shop blurb. */
  description: string;
  /** A real-life fact about the species, shown on the game-over screen. */
  about: string;
  look: FishLook;
}

/** Every player fish is a real Bay of Bengal reef species. Ids stay fixed: saves refer to them. */
export const PLAYER_FISH: PlayerFishDef[] = [
  {
    id: 'nemo',
    name: "Clark's Anemonefish",
    sci: 'Amphiprion clarkii',
    cost: 0,
    feedMul: 1,
    description: 'A plucky little clownfish. Where every legend starts.',
    about: 'Lives safely among the stinging tentacles of sea anemones, protected by a special slime coat. It never strays far from its home.',
    look: { shape: 'round', body: '#ff8a1f', belly: '#ffc27a', fin: '#1d1d1d', tail: '#ffe9a8', stripe: '#ffffff', stripes: 2, stripeEdge: '#1d1d1d' },
  },
  {
    id: 'sunny',
    name: 'Threespot Angelfish',
    sci: 'Apolemichthys trimaculatus',
    cost: 3000,
    feedMul: 1.25,
    description: 'A sunshine-yellow angelfish with a taste for snacks.',
    about: 'Bright yellow with blue lips. It grazes on sponges and sea squirts along reef walls.',
    look: { shape: 'tall', body: '#ffd400', belly: '#fff06a', fin: '#f2a900', tail: '#ffe14d', band: '#ffe86b' },
  },
  {
    id: 'lion',
    name: 'Miniatus Grouper',
    sci: 'Cephalopholis miniata',
    cost: 8000,
    feedMul: 1.5,
    description: 'Ruby red, blue-spotted and very hungry.',
    about: 'Also called the coral hind. It waits near coral heads and dashes out to snap up passing fish.',
    look: { shape: 'round', body: '#e8402b', belly: '#ff7a52', fin: '#c22a1a', spots: '#5fd0ff' },
  },
  {
    id: 'blade',
    name: 'Giant Trevally',
    sci: 'Caranx ignobilis',
    cost: 20000,
    feedMul: 2,
    description: 'A sleek silver hunter that turns every meal into big points.',
    about: 'One of the strongest fish on the reef. It hunts in packs and can grow to 1.7 metres long.',
    look: { shape: 'long', body: '#a9bfd2', belly: '#f1f7fc', fin: '#3a4f66', stripe: '#8ea6bc', stripes: 5 },
  },
  {
    id: 'hammer',
    name: 'Grey Reef Shark',
    sci: 'Carcharhinus amblyrhynchos',
    cost: 50000,
    feedMul: 2.5,
    description: 'A young shark. The reef takes notice.',
    about: 'A fast, curious shark of the outer reef. It is endangered, so it needs protection to survive.',
    look: { shape: 'shark', body: '#5f7891', belly: '#e3edf4', fin: '#3a5068', tail: '#2a3a4c' },
  },
  {
    id: 'dragon',
    name: 'Humphead Wrasse',
    sci: 'Cheilinus undulatus',
    cost: 120000,
    feedMul: 3,
    description: 'The legendary giant of the reef. Triple points for every bite.',
    about: 'The largest wrasse on Earth, over 2 metres long and living for more than 30 years. It even eats poisonous crown-of-thorns starfish.',
    look: { shape: 'round', body: '#2fae9a', belly: '#9fe3cf', fin: '#1f7f8f', tail: '#2a8fa0', stripe: '#1a6a78', stripes: 5 },
  },
];

export const STARTER_FISH = PLAYER_FISH[0];

export const fishById = (id: string): PlayerFishDef | undefined => PLAYER_FISH.find((f) => f.id === id);
