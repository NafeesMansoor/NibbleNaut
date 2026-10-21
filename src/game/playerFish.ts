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
    id: 'chromis',
    bn: {
      name: 'নীল-সবুজ ক্রোমিস',
      description: 'ঝিকমিকে নীল-সবুজ প্রবালের মাছ। প্রথম বদলের জন্য দারুণ।',
      about: 'শাখা-প্রবালের ওপর বড় ঝলমলে ঝাঁকে থাকে, বিপদ এলেই প্রবালের ভেতরে ঢুকে পড়ে।',
    },
    name: 'Blue-green Chromis',
    sci: 'Chromis viridis',
    cost: 1500,
    feedMul: 1.1,
    description: 'A shimmering blue-green reef fish. A great first upgrade.',
    about: 'Lives in big sparkling schools above branching corals, and darts down into them when danger comes.',
    look: { shape: 'round', body: '#4fdcc8', belly: '#b9fff4', fin: '#22b5a6', tail: '#7ff0e0' },
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
    id: 'hawkfish',
    bn: {
      name: 'প্রবাল বাজপাখি মাছ',
      description: 'প্রবালের ওপর বসে থাকে, গায়ে লাল ফুটকি, ঝাঁপিয়ে পড়তে ওস্তাদ।',
      about: 'এর বাতাসের থলি নেই, তাই মোটা পাখনায় ভর দিয়ে প্রবালের ডালে বসে থাকে আর পাশ দিয়ে চিংড়ি গেলেই ঝাঁপিয়ে ধরে।',
    },
    name: 'Coral Hawkfish',
    sci: 'Cirrhitichthys oxycephalus',
    cost: 5000,
    feedMul: 1.35,
    description: 'Perches on coral, red-spotted and quick to pounce.',
    about: 'It has no swim bladder, so it rests on coral branches on its thick fins and pounces on passing shrimp.',
    look: { shape: 'round', body: '#fff1ea', belly: '#ffffff', fin: '#ff7a5c', spots: '#e8402b' },
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
    id: 'puffer',
    bn: {
      name: 'সাদা-ফুটকি পটকা মাছ',
      description: 'ফুটকি-ফুটকি, গোলগাল, আর চমকে ভরা।',
      about: 'ভয় পেলে পানি গিলে বলের মতো ফুলে ওঠে। ঠোঁটের মতো শক্ত দাঁত দিয়ে খোলস আর প্রবাল চিবিয়ে খায়।',
    },
    name: 'White-spotted Puffer',
    sci: 'Arothron hispidus',
    cost: 12000,
    feedMul: 1.75,
    description: 'Spotty, round and full of surprises.',
    about: 'When scared it gulps water and puffs up like a ball. Its strong beak-like teeth crunch shells and coral.',
    look: { shape: 'round', body: '#8a7a5c', belly: '#f4ead2', fin: '#6e6046', spots: '#fff8e8' },
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
    id: 'mahi',
    bn: {
      name: 'মাহি-মাহি',
      description: 'ঝলমলে সবুজ-সোনালি দ্রুতগামী মাছ।',
      about: 'সাগরের সবচেয়ে দ্রুত মাছগুলোর একটা। সবুজ, নীল আর সোনালি রঙে ঝলমল করে, উড়ুক্কু মাছ শিকার করে।',
    },
    name: 'Mahi-mahi',
    sci: 'Coryphaena hippurus',
    cost: 32000,
    feedMul: 2.25,
    description: 'A dazzling green-and-gold speedster.',
    about: 'One of the fastest fish in the sea. It shines green, blue and gold and hunts flying fish.',
    look: { shape: 'long', body: '#1fb37a', belly: '#ffe04a', fin: '#2a7de1', spots: '#1a5fb4' },
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
  {
    id: 'barracuda',
    bn: {
      name: 'বড় ব্যারাকুডা',
      description: 'ধারালো দাঁতের রুপালি টর্পেডো।',
      about: 'পানিতে প্রায় স্থির ভেসে থাকে, তারপর চোখের পলকে আক্রমণ করে। লম্বা রুপালি শরীর হঠাৎ গতির জন্যই তৈরি।',
    },
    name: 'Great Barracuda',
    sci: 'Sphyraena barracuda',
    cost: 150000,
    feedMul: 3.25,
    description: 'A silver torpedo with fang-like teeth.',
    about: 'It hangs almost still in the water, then strikes in a flash. Its long silver body is built for sudden speed.',
    look: { shape: 'long', body: '#a9bccb', belly: '#f0f5f8', fin: '#4f6578', stripe: '#3c4e5e', stripes: 6 },
  },
  {
    id: 'giantgrouper',
    bn: {
      name: 'দৈত্য গ্রুপার',
      description: 'প্রবাল-গুহার রাজা, গায়ে উজ্জ্বল হলুদ ফুটকি।',
      about: 'প্রবালপ্রাচীরের সবচেয়ে বড় হাড়ওয়ালা মাছ, ২.৭ মিটার পর্যন্ত লম্বা। এক গ্রাসে শিকার আস্ত গিলে ফেলে, আর এখন এর সুরক্ষা দরকার।',
    },
    name: 'Giant Grouper',
    sci: 'Epinephelus lanceolatus',
    cost: 190000,
    feedMul: 3.5,
    description: 'The king of the reef caves, with bright yellow spots.',
    about: 'The biggest bony fish of coral reefs, up to 2.7 metres long. It can swallow its prey whole in one gulp, and today it needs protection.',
    look: { shape: 'round', body: '#6f6c3e', belly: '#c9c48a', fin: '#f2c94c', tail: '#e8b93a', spots: '#f6d860' },
  },
  {
    id: 'sailfish',
    bn: {
      name: 'ইন্দো-প্যাসিফিক পালতোলা মাছ',
      description: 'পিঠে বিশাল পাল নিয়ে দারুণ দ্রুত সাঁতারু।',
      about: 'সাগরের সবচেয়ে দ্রুত মাছগুলোর একটা। পালের মতো বিশাল পাখনা তুলে ছোট মাছদের এক জায়গায় জড়ো করে, তারপর ঝাঁপিয়ে পড়ে।',
    },
    name: 'Indo-Pacific Sailfish',
    sci: 'Istiophorus platypterus',
    cost: 220000,
    feedMul: 3.75,
    description: 'A super-fast swimmer with a giant sail on its back.',
    about: 'One of the fastest fish in the sea. It raises its huge sail-like fin to herd small fish into a tight ball, then darts in.',
    look: { shape: 'long', body: '#1f4f9e', belly: '#e8f1fb', fin: '#3aa0ff', stripe: '#7fd3ff', stripes: 5 },
  },
  {
    id: 'whaleshark',
    bn: {
      name: 'তিমি হাঙর',
      description: 'নিরীহ দানব। প্রতি কামড়ে চারগুণ পয়েন্ট!',
      about: 'পৃথিবীর সবচেয়ে বড় মাছ, প্রায় ১২ মিটার লম্বা। পানি ছেঁকে ছোট্ট খাবার খায়, মানুষের জন্য নিরীহ।',
    },
    name: 'Whale Shark',
    sci: 'Rhincodon typus',
    cost: 250000,
    feedMul: 4,
    description: 'The gentle giant. Quadruple points for every bite!',
    about: 'The largest fish on Earth, about 12 metres long. It filters tiny food from the water and is harmless to people.',
    look: { shape: 'shark', body: '#36577a', belly: '#e1eaf1', fin: '#284460', spots: '#eaf2f8' },
  },
  {
    id: 'tigershark',
    bn: {
      name: 'বাঘা হাঙর',
      description: 'ডোরাকাটা সাগরের রাজা। প্রতি কামড়ে সাড়ে চারগুণ পয়েন্ট!',
      about: 'ছোটবেলার ডোরার জন্যই এমন নাম। সবচেয়ে বড় শিকারি হাঙরদের একটা, প্রায় সবকিছুই খায় আর রাতে উপকূলে টহল দেয়।',
    },
    name: 'Tiger Shark',
    sci: 'Galeocerdo cuvier',
    cost: 320000,
    feedMul: 4.5,
    description: 'The striped ruler of the sea. ×4.5 points for every bite!',
    about: 'Named for the stripes it has when young. One of the biggest hunting sharks, it eats almost anything and patrols the coast at night.',
    look: { shape: 'shark', body: '#7d8a96', belly: '#eef2f5', fin: '#5b6772', stripe: '#4c5862', stripes: 5 },
  },
];

export const STARTER_FISH = PLAYER_FISH[0];

export const fishById = (id: string): PlayerFishDef | undefined => PLAYER_FISH.find((f) => f.id === id);
