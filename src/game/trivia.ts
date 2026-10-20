/**
 * Bay of Bengal trivia shown on the menu, pause and game-over screens. Each fact leads with one
 * headline figure. Numbers are rounded, widely published values (marked "about" where sources
 * differ); keep new entries to facts that are easy to verify.
 */
export interface Trivia {
  /** A big picture for the fact card. */
  emoji: string;
  /** Short headline figure, e.g. "2.2 million km²". */
  figure: string;
  /** What the figure measures, shown under it. */
  label: string;
  text: string;
  tag: 'Geography' | 'Wildlife' | 'People' | 'Weather' | 'Ocean floor' | 'Fishing';
}

export const TRIVIA: Trivia[] = [
  { emoji: '🌊', figure: '2.2 million km²', label: 'surface area', tag: 'Geography', text: 'The Bay of Bengal is the largest bay in the world, about 15 times the size of Bangladesh.' },
  { emoji: '🗺️', figure: '4', label: 'countries on its shores', tag: 'Geography', text: 'Bangladesh, India, Myanmar and Sri Lanka all have coastlines on the Bay of Bengal.' },
  { emoji: '🤿', figure: '≈ 4,700 m', label: 'deepest point', tag: 'Ocean floor', text: 'The deepest parts of the Bay are deeper than the Alps are tall. On average it is about 2,600 m deep.' },
  { emoji: '📏', figure: '≈ 1,600 km', label: 'wide', tag: 'Geography', text: 'The Bay stretches roughly 1,600 km from the coast of India to the coast of Myanmar.' },
  { emoji: '🧑‍🤝‍🧑', figure: '1 in 5', label: 'people on Earth', tag: 'People', text: 'About one in every five people in the world lives in the countries around the Bay of Bengal.' },
  { emoji: '🏞️', figure: '#1', label: 'largest river delta', tag: 'Geography', text: 'The Ganges, Brahmaputra and Meghna rivers build the biggest delta on Earth, covering most of Bangladesh and West Bengal.' },
  { emoji: '⛰️', figure: '≈ 1 billion t', label: 'of sediment a year', tag: 'Ocean floor', text: 'The Ganges and Brahmaputra carry around a billion tonnes of mud and sand into the Bay every year, among the most of any rivers on Earth.' },
  { emoji: '🪭', figure: '≈ 3,000 km', label: 'long underwater fan', tag: 'Ocean floor', text: 'All that river sand has built the Bengal Fan, the largest pile of sediment under any ocean. It reaches almost to the equator.' },
  { emoji: '🐋', figure: '> 1 km', label: 'deep canyon', tag: 'Ocean floor', text: 'The “Swatch of No Ground” is an undersea canyon off Bangladesh, so deep that old sailors could not touch bottom. It is a protected home for whales and dolphins.' },
  { emoji: '🌳', figure: '≈ 10,000 km²', label: 'of mangrove forest', tag: 'Wildlife', text: 'The Sundarbans, shared by Bangladesh and India, is the largest mangrove forest in the world and a UNESCO World Heritage Site.' },
  { emoji: '🌱', figure: 'Sundari', label: 'the tree behind the name', tag: 'Wildlife', text: 'The Sundarbans is named after the sundari, a mangrove tree that grows there. Its roots poke up out of the mud to breathe.' },
  { emoji: '🐯', figure: 'Swimmers', label: 'Bengal tigers', tag: 'Wildlife', text: 'Tigers of the Sundarbans are strong swimmers. They cross tidal rivers between islands and even catch fish and crabs.' },
  { emoji: '🏖️', figure: '≈ 120 km', label: 'of sandy beach', tag: 'Geography', text: 'Cox’s Bazar in Bangladesh is often called the world’s longest natural unbroken sea beach.' },
  { emoji: '🪸', figure: '1', label: 'coral island', tag: 'Wildlife', text: 'Saint Martin’s Island is Bangladesh’s only coral island, home to coral, sea turtles and colourful reef fish.' },
  { emoji: '🌅', figure: 'Sunrise + sunset', label: 'from one beach', tag: 'Geography', text: 'At Kuakata beach in Bangladesh you can watch the sun both rise and set over the sea.' },
  { emoji: '🐟', figure: 'Ilish', label: 'national fish of Bangladesh', tag: 'Fishing', text: 'Most of the world’s hilsa (ilish) is caught in Bangladesh. It swims from the Bay up the rivers to lay its eggs.' },
  { emoji: '📅', figure: '22 days', label: 'fishing break', tag: 'Fishing', text: 'Bangladesh pauses hilsa fishing for about three weeks each year during the main breeding season, so young fish can survive.' },
  { emoji: '🐢', figure: 'Arribada', label: 'mass turtle nesting', tag: 'Wildlife', text: 'On Odisha’s beaches, hundreds of thousands of olive ridley sea turtles come ashore together to nest, one of the biggest gatherings on Earth.' },
  { emoji: '🐬', figure: 'Irrawaddy', label: 'dolphin', tag: 'Wildlife', text: 'Round-headed Irrawaddy dolphins live in the Bay’s coastal waters and the Sundarbans. Bangladesh has the largest population in the world.' },
  { emoji: '👂', figure: 'Nearly blind', label: 'river dolphin', tag: 'Wildlife', text: 'The Ganges river dolphin finds food by echolocation, clicking and listening to the echoes. It is India’s national aquatic animal.' },
  { emoji: '💧', figure: '8+', label: 'great rivers flow in', tag: 'Geography', text: 'The Ganges, Brahmaputra, Meghna, Irrawaddy, Mahanadi, Godavari, Krishna and Kaveri all empty into the Bay of Bengal.' },
  { emoji: '🧂', figure: 'Less salty', label: 'than the Arabian Sea', tag: 'Ocean floor', text: 'So much river water pours in that the Bay’s surface is much less salty than the sea on the other side of India.' },
  { emoji: '🔄', figure: '2 ways', label: 'currents switch', tag: 'Weather', text: 'With the monsoon, the main current along India’s east coast reverses direction, flowing north in spring and south in winter.' },
  { emoji: '🌧️', figure: 'Monsoon', label: 'engine', tag: 'Weather', text: 'Warm water in the Bay feeds the monsoon rains that farmers across South Asia depend on.' },
  { emoji: '🌀', figure: 'Cyclones', label: 'twice a year', tag: 'Weather', text: 'Most Bay of Bengal cyclones form just before and just after the monsoon, in April–May and October–November.' },
  { emoji: '📢', figure: '1970', label: 'Bhola cyclone', tag: 'Weather', text: 'The 1970 Bhola cyclone is the deadliest tropical cyclone on record. Since then, shelters and early warnings have saved countless lives.' },
  { emoji: '🚩', figure: '≈ 118,000 km²', label: 'Bangladesh’s sea area', tag: 'People', text: 'International rulings in 2012 and 2014 settled Bangladesh’s sea borders with Myanmar and India, giving it a large share of the Bay.' },
  { emoji: '🏝️', figure: '570+', label: 'islands', tag: 'Geography', text: 'India’s Andaman and Nicobar Islands form the Bay’s eastern edge, ringed by coral reefs full of the fish you meet in this game.' },
  { emoji: '🚢', figure: 'Chattogram', label: 'busiest port in Bangladesh', tag: 'People', text: 'Most of Bangladesh’s trade with the world passes through the port of Chattogram (Chittagong) on the Bay.' },
  { emoji: '🐠', figure: 'Reef fish', label: 'in this game', tag: 'Wildlife', text: 'Every fish in Fish Fight lives in the Bay of Bengal: from tiny blue demoiselles to bull sharks that can swim up rivers into fresh water.' },
];

const SEEN_KEY = 'fishfight.triviaSeen';

/**
 * Which facts this player has discovered, remembered on this device so the "facts discovered"
 * collection keeps growing between visits. Storage problems just mean starting the count again.
 */
export class TriviaCollection {
  readonly seen = new Set<number>();

  constructor(private readonly facts: Trivia[] = TRIVIA) {
    try {
      const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as unknown;
      if (Array.isArray(raw)) for (const i of raw) if (Number.isInteger(i) && i >= 0 && i < facts.length) this.seen.add(i);
    } catch {
      // Unavailable or corrupt: start an empty collection.
    }
  }

  get total(): number {
    return this.facts.length;
  }

  mark(fact: Trivia): void {
    const i = this.facts.indexOf(fact);
    if (i < 0 || this.seen.has(i)) return;
    this.seen.add(i);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...this.seen]));
    } catch {
      // Storage blocked: the collection still counts up for this session.
    }
  }
}

/** Hands out facts in a shuffled order, so a player sees every fact before any repeats. */
export class TriviaDeck {
  private order: number[] = [];
  private last = -1;

  /** `seen` (optional): facts already discovered are dealt after the new ones in each round. */
  constructor(
    private readonly facts: Trivia[] = TRIVIA,
    private readonly rng: () => number = Math.random,
    private readonly seen: ReadonlySet<number> = new Set(),
  ) {}

  next(): Trivia {
    if (this.order.length === 0) {
      this.order = this.facts.map((_, i) => i);
      for (let i = this.order.length - 1; i > 0; i--) {
        const j = Math.floor(this.rng() * (i + 1));
        [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
      }
      // Cards are dealt from the end: put undiscovered facts there so they come first.
      this.order = [...this.order.filter((i) => this.seen.has(i)), ...this.order.filter((i) => !this.seen.has(i))];
      // Never show the same fact twice in a row across a reshuffle.
      if (this.order.length > 1 && this.order[this.order.length - 1] === this.last) this.order.unshift(this.order.pop()!);
    }
    this.last = this.order.pop()!;
    return this.facts[this.last];
  }
}
