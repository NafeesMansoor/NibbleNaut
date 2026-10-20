import { SAVE_KEY, SAVE_VERSION, type RewardTier } from '../config';
import { fishById, STARTER_FISH } from '../game/playerFish';
import type { Lang } from '../i18n/i18n';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Settings {
  volume: number;
  muted: boolean;
  dangerOutlines: boolean;
  /** Show the Bay of Bengal fun-fact cards on the menu, pause and game-over screens. */
  trivia: boolean;
  /** Interface language, switched from the home screen. */
  lang: Lang;
}

/** First-run language: Bangla when the device is set to Bangla, otherwise English. */
const deviceLang = (): Lang =>
  typeof navigator !== 'undefined' && /^bn\b/i.test(navigator.language ?? '') ? 'bn' : 'en';

export interface SaveData {
  version: number;
  bestScore: number;
  bestSize: number;
  gamesPlayed: number;
  /** Reward earned at the last game over, waiting to be consumed by the next game. */
  pendingReward: RewardTier | null;
  plentyUnlocks: number;
  /** Spendable points banked on this installation: every run's final score is added here. */
  points: number;
  /** All points ever banked, never reduced by spending. */
  lifetimePoints: number;
  /** Ids of fish bought in the Upgrade Fish shop (always includes the starter). */
  ownedFish: string[];
  selectedFish: string;
  settings: Settings;
}

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  bestScore: 0,
  bestSize: 0,
  gamesPlayed: 0,
  pendingReward: null,
  plentyUnlocks: 0,
  points: 0,
  lifetimePoints: 0,
  ownedFish: [STARTER_FISH.id],
  selectedFish: STARTER_FISH.id,
  settings: { volume: 0.7, muted: false, dangerOutlines: true, trivia: true, lang: deviceLang() },
});

const TIERS: RewardTier[] = ['normal', 'good', 'great', 'amazing', 'plenty'];
const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/**
 * Accepts anything parsed from storage and returns a valid, current-version save.
 * Unknown or corrupt fields fall back to defaults; older versions are migrated here.
 */
export function migrate(raw: unknown): SaveData {
  const base = defaultSave();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const s = (r.settings && typeof r.settings === 'object' ? r.settings : {}) as Record<string, unknown>;
  const pending = TIERS.includes(r.pendingReward as RewardTier) ? (r.pendingReward as RewardTier) : null;
  const owned = new Set([STARTER_FISH.id]);
  if (Array.isArray(r.ownedFish)) for (const id of r.ownedFish) if (typeof id === 'string' && fishById(id)) owned.add(id);
  const selected = typeof r.selectedFish === 'string' && owned.has(r.selectedFish) ? r.selectedFish : STARTER_FISH.id;
  const points = Math.floor(Math.max(0, num(r.points, 0)));
  return {
    version: SAVE_VERSION,
    bestScore: Math.max(0, num(r.bestScore, 0)),
    bestSize: Math.max(0, num(r.bestSize, 0)),
    gamesPlayed: Math.max(0, num(r.gamesPlayed, 0)),
    pendingReward: pending === 'normal' ? null : pending,
    plentyUnlocks: Math.max(0, num(r.plentyUnlocks, 0)),
    points,
    lifetimePoints: Math.max(points, Math.floor(num(r.lifetimePoints, 0))),
    ownedFish: [...owned],
    selectedFish: selected,
    settings: {
      volume: Math.min(1, Math.max(0, num(s.volume, base.settings.volume))),
      muted: typeof s.muted === 'boolean' ? s.muted : base.settings.muted,
      dangerOutlines: typeof s.dangerOutlines === 'boolean' ? s.dangerOutlines : base.settings.dangerOutlines,
      trivia: typeof s.trivia === 'boolean' ? s.trivia : base.settings.trivia,
      lang: s.lang === 'en' || s.lang === 'bn' ? s.lang : base.settings.lang,
    },
  };
}

/** In-memory fallback for private windows or blocked storage. */
export class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

export class SaveSystem {
  private data: SaveData;

  constructor(private storage: StorageLike) {
    this.data = this.load();
  }

  static fromBrowser(): SaveSystem {
    try {
      const ls = window.localStorage;
      const probe = '__fishfight_probe__';
      ls.setItem(probe, '1');
      ls.removeItem(probe);
      return new SaveSystem(ls);
    } catch {
      return new SaveSystem(new MemoryStorage());
    }
  }

  private load(): SaveData {
    let text: string | null = null;
    try {
      text = this.storage.getItem(SAVE_KEY);
      if (!text) return defaultSave();
      const raw: unknown = JSON.parse(text);
      const version = raw && typeof raw === 'object' ? (raw as { version?: unknown }).version : undefined;
      // Keep the pre-migration save so an upgrade can never silently destroy progress.
      if (version !== SAVE_VERSION) this.backup(`v${String(version ?? 'unknown')}`, text);
      return migrate(raw);
    } catch {
      if (text) this.backup('corrupt', text);
      return defaultSave();
    }
  }

  private backup(tag: string, text: string): void {
    try {
      const key = `${SAVE_KEY}.backup-${tag}`;
      if (this.storage.getItem(key) === null) this.storage.setItem(key, text);
    } catch {
      // Storage full or blocked: nothing more we can do.
    }
  }

  get(): Readonly<SaveData> {
    return this.data;
  }

  /** Applies a change and writes it through immediately, so a refresh never loses it. */
  update(fn: (d: SaveData) => void): void {
    fn(this.data);
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage full or blocked: keep playing with the in-memory copy.
    }
  }
}
