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
  /** Bangla name and description. */
  bn?: { name: string; about: string };
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
  /** Never eats the player, whatever its size (the filter-feeding whale shark). */
  harmless?: boolean;
  /** Bonus fish only: extra points for catching it. */
  bonus?: number;
}

export const SPECIES: Species[] = [
  {
    id: 'fusilier', bn: { name: 'নীল-সোনালি ফিউজিলিয়ার', about: 'প্রবালপ্রাচীরের ওপর বিশাল ঝাঁক বেঁধে ঝিলমিল করে ঘোরে, আর খোলা পানি থেকে প্ল্যাংকটন খুঁটে খায়।' }, name: 'Blue-and-gold Fusilier', sci: 'Caesio caerulaurea',
    about: 'Travels in big flashing schools over the reef, picking plankton out of the open water.',
    minSize: 2.5, maxSize: 7, shape: 'long', body: '#2f7fe0', belly: '#e6f3ff', fin: '#5fa8ff', tail: '#ffd23f', band: '#ffd23f',
    speedMul: 1.1, hunter: false, weight: 3, schooling: true,
  },
  {
    id: 'mackerel', bn: { name: 'ভারতীয় ম্যাকেরেল', about: 'দল বেঁধে সাঁতার কাটে আর বেশির ভাগ প্ল্যাংকটন খায়। একসাথে থাকলে খাবার খোঁজা সহজ হয়, আর শিকারিও আলাদা করে একটাকে ধরতে পারে না।' }, name: 'Indian Mackerel', sci: 'Rastrelliger kanagurta',
    about: 'A speedy school swimmer that feeds mostly on plankton. Swimming together helps it find food and makes it hard for predators to single one out.',
    minSize: 3, maxSize: 9, shape: 'long', body: '#3f8fc0', belly: '#eaf3fa', fin: '#e9c24a', band: '#e9c24a', spots: '#24577d',
    speedMul: 1.12, hunter: false, weight: 2.5, schooling: true,
  },
  {
    id: 'demoiselle', bn: { name: 'নীল ড্যামসেল', about: 'ঝকঝকে নীল রঙের ছোট্ট মাছ, নিজের প্রবালের জায়গাটুকু সাহস করে পাহারা দেয়।' }, name: 'Blue Demoiselle', sci: 'Chrysiptera cyanea',
    about: 'A tiny electric-blue damselfish that boldly defends its own patch of coral.',
    minSize: 4, maxSize: 10, shape: 'round', body: '#2648ff', belly: '#4f7dff', fin: '#1d33c9', tail: '#ff9f2e',
    speedMul: 1.05, hunter: false, weight: 2.5,
  },
  {
    id: 'hogfish', bn: { name: 'দুই-রঙা হগফিশ', about: 'অর্ধেক লাল আর অর্ধেক সাদা একটা র‍্যাস মাছ, মাঝে কালো ডোরা। বালি খুঁড়ে ছোট কাঁকড়া আর শামুক খায়।' }, name: 'Splitlevel Hogfish', sci: 'Bodianus mesothorax',
    about: 'A wrasse painted half red and half white, split by a dark band. It digs up small crabs and snails.',
    minSize: 5, maxSize: 12, shape: 'round', body: '#d0344c', belly: '#f6f1ea', fin: '#ffd23f', stripe: '#2a1416', stripes: 1,
    speedMul: 1.05, hunter: false, weight: 2,
  },
  {
    id: 'raccoon', bn: { name: 'র‍্যাকুন প্রজাপতি মাছ', about: 'চোখের ওপর কালো “মুখোশ” থাকায় এমন নাম। রাতে কেঁচো আর প্রবাল-পলিপ খায়।' }, name: 'Raccoon Butterflyfish', sci: 'Chaetodon lunula',
    about: 'Named for the black "mask" across its eyes. It feeds at night on worms and coral polyps.',
    minSize: 7, maxSize: 15, shape: 'tall', body: '#ffcf24', belly: '#ffe680', fin: '#ff9f00', stripe: '#1d1d1d', stripes: 1,
    speedMul: 1, hunter: false, weight: 2,
  },
  {
    id: 'copperband', bn: { name: 'তামা-ডোরা প্রজাপতি মাছ', about: 'চিমটার মতো লম্বা ঠোঁট দিয়ে প্রাচীরের সরু ফাটল থেকে খাবার তুলে আনে।' }, name: 'Copperband Butterflyfish', sci: 'Chelmon rostratus',
    about: 'Uses its long tweezer-like snout to pluck food from narrow cracks in the reef.',
    minSize: 8, maxSize: 18, shape: 'tall', body: '#f5f7fa', belly: '#ffffff', fin: '#f08a24', stripe: '#f08a24', stripes: 3, stripeEdge: '#1d1d1d',
    speedMul: 1, hunter: false, weight: 1.8,
  },
  {
    id: 'vermiculated', bn: { name: 'নকশি এঞ্জেল মাছ', about: 'লাজুক এঞ্জেল মাছ: ফ্যাকাশে মুখ, সূক্ষ্ম নকশা-আঁকা কালচে শরীর আর উজ্জ্বল হলুদ লেজ।' }, name: 'Vermiculated Angelfish', sci: 'Chaetodontoplus mesoleucus',
    about: 'A shy angelfish with a pale face, a finely patterned dark body and a bright yellow tail.',
    minSize: 10, maxSize: 22, shape: 'tall', body: '#2b3140', belly: '#e9edf2', fin: '#3a4256', tail: '#ffd23f', spots: '#b9c3d1',
    speedMul: 0.95, hunter: false, weight: 1.5,
  },
  {
    id: 'humpback', bn: { name: 'কুঁজো গ্রুপার', about: 'ফুটকি-ফুটকি গায়ের জন্য একে “চিতা গ্রুপার”ও বলে। প্রবালের গুহায় লুকিয়ে ছোট মাছ ধরে।' }, name: 'Humpback Grouper', sci: 'Chromileptes altivelis',
    about: 'Also called the panther grouper for its polka dots. It ambushes small fish from coral caves.',
    minSize: 15, maxSize: 40, shape: 'round', body: '#f1ece0', belly: '#ffffff', fin: '#e6dfcf', spots: '#1d1d24',
    speedMul: 0.9, hunter: true, weight: 2,
  },
  {
    id: 'snapper', bn: { name: 'ম্যানগ্রোভ লাল স্ন্যাপার', about: 'পাথর, প্রবাল আর ম্যানগ্রোভের শিকড়ের কাছে লুকিয়ে থাকে, পাশ দিয়ে শিকার গেলেই হঠাৎ আক্রমণ করে — ওত পেতে শিকারের দারুণ উদাহরণ।' }, name: 'Mangrove Red Snapper', sci: 'Lutjanus argentimaculatus',
    about: 'A reef ambusher: it hides near rocks, reefs and mangrove roots and strikes suddenly at passing prey.',
    minSize: 14, maxSize: 38, shape: 'round', body: '#c8463a', belly: '#f3b49b', fin: '#9e2f26', tail: '#b23a2f',
    speedMul: 0.95, hunter: true, weight: 1.6,
  },
  {
    id: 'dolphinfish', bn: { name: 'মাহি-মাহি (ডলফিন মাছ)', about: 'সবুজ, নীল আর সোনালি রঙের ঝলমলে দ্রুতগামী মাছ, উড়ুক্কু মাছ শিকার করে।' }, name: 'Common Dolphinfish', sci: 'Coryphaena hippurus',
    about: 'Also known as mahi-mahi: a dazzling green, blue and gold speedster that hunts flying fish.',
    minSize: 20, maxSize: 55, shape: 'long', body: '#1fb37a', belly: '#ffe04a', fin: '#2a7de1', spots: '#1a5fb4',
    speedMul: 1.15, hunter: true, weight: 1.6,
  },
  {
    id: 'blacktip', bn: { name: 'কালো-ডগা রিফ হাঙর', about: 'পাখনার কালো ডগা দেখেই চেনা যায়। অগভীর লেগুনে টহল দিয়ে প্রবালের মাছ শিকার করে।' }, name: 'Blacktip Reef Shark', sci: 'Carcharhinus melanopterus',
    about: 'Easy to spot by the black tips on its fins. It patrols shallow lagoons hunting reef fish.',
    minSize: 40, maxSize: 110, shape: 'shark', body: '#8a9aa6', belly: '#eef3f6', fin: '#1f262c', tail: '#1f262c',
    speedMul: 1.05, hunter: true, weight: 2,
  },
  {
    id: 'bull', bn: { name: 'ষাঁড় হাঙর', about: 'ভারী আর শক্তিশালী হাঙর, বঙ্গোপসাগর থেকে নদী বেয়ে মিঠা পানিতেও চলে আসতে পারে।' }, name: 'Bull Shark', sci: 'Carcharhinus leucas',
    about: 'A heavy, powerful shark that can even swim up rivers from the Bay of Bengal into fresh water.',
    minSize: 100, maxSize: 200, shape: 'shark', body: '#5d6873', belly: '#e6e9ec', fin: '#3d4650',
    speedMul: 1, hunter: true, weight: 1,
  },
  {
    id: 'whaleshark', bn: { name: 'তিমি হাঙর', about: 'পৃথিবীর সবচেয়ে বড় মাছ, ১২ মিটার বা তারও বেশি লম্বা হয়। এত বিশাল হয়েও এরা পানি ছেঁকে ছোট্ট জীব, মাছের ডিম আর ছোট মাছ খায়। এরা তিমি নয়, আর মানুষের জন্য সাধারণত নিরীহ। এই খেলায় তোমাকে কখনো খাবে না!' }, name: 'Whale Shark', sci: 'Rhincodon typus',
    about: 'The gentle giant and largest fish on Earth, around 12 metres or more. It filters tiny organisms, fish eggs and small fish from the water. Not a whale, and generally harmless to people. It will never eat you!',
    minSize: 110, maxSize: 200, shape: 'shark', body: '#36577a', belly: '#e1eaf1', fin: '#284460', spots: '#eaf2f8',
    speedMul: 0.7, hunter: false, harmless: true, weight: 0.8,
  },
];

/** Bonus fish: rare, flee fast, glow, and are worth extra points (`bonus`). */
export const GOLDEN: Species = {
  id: 'golden',
  bn: { name: 'সোনালি ইলিশ', about: 'ইলিশ বাংলাদেশের জাতীয় মাছ। প্রতি বছর বঙ্গোপসাগর থেকে বড় বড় নদী বেয়ে উজানে যায় ডিম পাড়তে।' },
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
  weight: 1,
  bonus: 500,
};

export const RUPCHANDA: Species = {
  id: 'rupchanda',
  bn: { name: 'রুপালি রূপচাঁদা', about: 'রূপচাঁদা বঙ্গোপসাগরের সবচেয়ে প্রিয় মাছগুলোর একটা: চ্যাপ্টা, গোল আর আয়নার মতো চকচকে রুপালি। ঝাঁক বেঁধে চলে আর ছোট জলজ প্রাণী খায়।' },
  name: 'Silver Rupchanda',
  sci: 'Pampus argenteus',
  about: 'The silver pomfret (rupchanda) is one of the Bay of Bengal\'s best-loved fish: flat, round and shiny as a mirror. It travels in schools and eats tiny sea creatures.',
  minSize: 3,
  maxSize: 200,
  shape: 'tall',
  body: '#dfe8f0',
  belly: '#ffffff',
  fin: '#b4c3d1',
  spots: '#f7fbff',
  speedMul: 1.45,
  hunter: false,
  weight: 1.4,
  bonus: 300,
};

export const LAKKHA: Species = {
  id: 'lakkha',
  bn: { name: 'লাক্ষা', about: 'লাক্ষা বা চারআঙুলে থ্রেডফিন বড় আর দামি মাছ। বুকের নিচে সুতোর মতো লম্বা পাখনা দিয়ে ঘোলা পানিতে খাবার হাতড়ে খোঁজে।' },
  name: 'Lakkha',
  sci: 'Eleutheronema tetradactylum',
  about: 'The fourfinger threadfin (lakkha) is a big, prized fish. Long thread-like fins under its chest help it feel for food in muddy water.',
  minSize: 3,
  maxSize: 200,
  shape: 'long',
  body: '#d8c690',
  belly: '#f6efd6',
  fin: '#e0a640',
  band: '#efe2b0',
  speedMul: 1.5,
  hunter: false,
  weight: 1.1,
  bonus: 400,
};

/** All bonus fish, picked by `weight` when a bonus fish spawns. */
export const BONUS_FISH: Species[] = [GOLDEN, RUPCHANDA, LAKKHA];

export const speciesById = (id: string): Species | undefined => BONUS_FISH.find((s) => s.id === id) ?? SPECIES.find((s) => s.id === id);

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
