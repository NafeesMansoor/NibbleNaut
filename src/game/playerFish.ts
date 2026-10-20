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
  /** Bangla name, shop blurb and fact. */
  bn?: { name: string; description: string; about: string };
  look: FishLook;
}

/** Every player fish is a real Bay of Bengal reef species. Ids stay fixed: saves refer to them. */
export const PLAYER_FISH: PlayerFishDef[] = [
  {
    id: 'nemo',
    bn: {
      name: 'ক্লার্কের ক্লাউন মাছ',
      description: 'সাহসী ছোট্ট ক্লাউন মাছ। সব কিংবদন্তির শুরু এখান থেকেই।',
      about: 'সামুদ্রিক অ্যানিমোনের হুল-ভরা শুঁড়ের মাঝে নিরাপদে থাকে, গায়ের বিশেষ পিচ্ছিল আবরণ তাকে বাঁচায়। বাড়ি ছেড়ে কখনো বেশি দূরে যায় না।',
    },
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
    bn: {
      name: 'তিন-ফোঁটা এঞ্জেল মাছ',
      description: 'রোদের মতো হলুদ এঞ্জেল মাছ, খাবারের দারুণ ভক্ত।',
      about: 'উজ্জ্বল হলুদ শরীর আর নীল ঠোঁট। প্রাচীরের দেয়ালে স্পঞ্জ আর সি-স্কুয়ার্ট খুঁটে খায়।',
    },
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
    bn: {
      name: 'লাল-নীল গ্রুপার',
      description: 'চুনির মতো লাল, গায়ে নীল ফুটকি, আর ভীষণ ক্ষুধার্ত।',
      about: 'একে প্রবাল হাইন্ডও বলে। প্রবালের পাশে ওত পেতে থাকে, পাশ দিয়ে মাছ গেলেই ঝট করে ধরে ফেলে।',
    },
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
    bn: {
      name: 'দৈত্য ট্রেভালি',
      description: 'রুপালি চকচকে শিকারি, প্রতিটা খাবারে বড় পয়েন্ট।',
      about: 'প্রবালপ্রাচীরের সবচেয়ে শক্তিশালী মাছদের একটা। দল বেঁধে শিকার করে, লম্বায় ১.৭ মিটার পর্যন্ত হয়।',
    },
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
    bn: {
      name: 'ধূসর রিফ হাঙর',
      description: 'একটা কিশোর হাঙর। প্রাচীর এবার সতর্ক।',
      about: 'প্রাচীরের বাইরের দিকের দ্রুতগামী, কৌতূহলী হাঙর। এরা বিপন্ন, তাই টিকে থাকতে সুরক্ষা দরকার।',
    },
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
    bn: {
      name: 'কুঁজমাথা র‍্যাস',
      description: 'প্রাচীরের কিংবদন্তি দানব। প্রতি কামড়ে তিনগুণ পয়েন্ট।',
      about: 'পৃথিবীর সবচেয়ে বড় র‍্যাস মাছ: ২ মিটারের বেশি লম্বা, বাঁচে ৩০ বছরেরও বেশি। এমনকি বিষাক্ত ক্রাউন-অব-থর্নস তারামাছও খায়।',
    },
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
