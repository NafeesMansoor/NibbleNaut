export type Rng = () => number;

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Frame-rate independent exponential approach of `current` toward `target`. */
export const damp = (current: number, target: number, rate: number, dt: number): number =>
  target + (current - target) * Math.exp(-rate * dt);

export const randRange = (rng: Rng, lo: number, hi: number): number => lo + (hi - lo) * rng();

export const randInt = (rng: Rng, lo: number, hi: number): number => Math.floor(randRange(rng, lo, hi + 1));

export function pickWeighted<K extends string>(rng: Rng, weights: Record<K, number>): K {
  const keys = Object.keys(weights) as K[];
  let total = 0;
  for (const k of keys) total += weights[k];
  let roll = rng() * total;
  for (const k of keys) {
    roll -= weights[k];
    if (roll <= 0) return k;
  }
  return keys[keys.length - 1];
}

export const dist2 = (ax: number, ay: number, bx: number, by: number): number => {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};

/** Small deterministic PRNG (mulberry32) for decor generation and tests. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** In-place removal of dead entries without allocating a new array. */
export function compact<T extends { alive: boolean }>(list: T[]): void {
  let w = 0;
  for (let r = 0; r < list.length; r++) {
    if (list[r].alive) list[w++] = list[r];
  }
  list.length = w;
}
