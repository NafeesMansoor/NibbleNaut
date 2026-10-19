import type { FishLook } from '../render/fishArt';

/**
 * Fish the player can swim as. The starter is free; the rest are bought in the Upgrade Fish
 * shop with banked points. Advanced fish earn more points for everything they eat
 * (`feedMul` multiplies food and fish points), so they fill the bank faster.
 */
export interface PlayerFishDef {
  id: string;
  name: string;
  /** Points needed to buy. 0 = owned from the start. */
  cost: number;
  /** Multiplier on points for food and fish eaten. */
  feedMul: number;
  description: string;
  look: FishLook;
}

export const PLAYER_FISH: PlayerFishDef[] = [
  {
    id: 'nemo',
    name: 'Nemo Jr.',
    cost: 0,
    feedMul: 1,
    description: 'A plucky little clownfish. Where every legend starts.',
    look: { shape: 'round', body: '#ff8a1f', belly: '#ffc27a', fin: '#ff6a00', stripe: '#ffffff', stripes: 2, stripeEdge: '#1d1d1d' },
  },
  {
    id: 'sunny',
    name: 'Sunny Tang',
    cost: 3000,
    feedMul: 1.25,
    description: 'A bright yellow tang with a taste for snacks.',
    look: { shape: 'tall', body: '#ffd400', belly: '#fff06a', fin: '#f2a900', stripe: '#ffffff', stripes: 1 },
  },
  {
    id: 'lion',
    name: 'Lionfish',
    cost: 8000,
    feedMul: 1.5,
    description: 'Striped, spiny and very hungry.',
    look: { shape: 'tall', body: '#d9412b', belly: '#ffd9c7', fin: '#a3241a', stripe: '#fff4ea', stripes: 4, stripeEdge: '#6b1208' },
  },
  {
    id: 'blade',
    name: 'Silver Blade',
    cost: 20000,
    feedMul: 2,
    description: 'A sleek hunter that turns every meal into big points.',
    look: { shape: 'long', body: '#9fb8d0', belly: '#f1f7fc', fin: '#3f6d9c', stripe: '#2c4f75', stripes: 5 },
  },
  {
    id: 'hammer',
    name: 'Hammerhead',
    cost: 50000,
    feedMul: 2.5,
    description: 'A young shark. The reef takes notice.',
    look: { shape: 'shark', body: '#4f6d88', belly: '#e3edf4', fin: '#33495d', stripe: '#3d5870', stripes: 2 },
  },
  {
    id: 'dragon',
    name: 'Golden Dragon',
    cost: 120000,
    feedMul: 3,
    description: 'The legendary fish of the deep. Triple points for every bite.',
    look: { shape: 'long', body: '#ffbf1f', belly: '#fff2b3', fin: '#ff7a00', stripe: '#c0392b', stripes: 4, stripeEdge: '#7a2a00' },
  },
];

export const STARTER_FISH = PLAYER_FISH[0];

export const fishById = (id: string): PlayerFishDef | undefined => PLAYER_FISH.find((f) => f.id === id);
