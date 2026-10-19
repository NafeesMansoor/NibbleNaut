import { fishById, PLAYER_FISH, STARTER_FISH, type PlayerFishDef } from '../game/playerFish';
import type { SaveSystem } from './save';

export type BuyResult = 'bought' | 'owned' | 'insufficient' | 'unknown';

/** Upgrade Fish shop: trades banked points for new fish and remembers which one you swim as. */
export class FishShop {
  constructor(private save: SaveSystem) {}

  get points(): number {
    return this.save.get().points;
  }

  get catalog(): readonly PlayerFishDef[] {
    return PLAYER_FISH;
  }

  owns(id: string): boolean {
    return this.save.get().ownedFish.includes(id);
  }

  selected(): PlayerFishDef {
    return fishById(this.save.get().selectedFish) ?? STARTER_FISH;
  }

  /** Spends points on a fish and switches to it. The purchase is saved immediately. */
  buy(id: string): BuyResult {
    const fish = fishById(id);
    if (!fish) return 'unknown';
    if (this.owns(id)) return 'owned';
    if (this.points < fish.cost) return 'insufficient';
    this.save.update((d) => {
      d.points -= fish.cost;
      d.ownedFish.push(id);
      d.selectedFish = id;
    });
    return 'bought';
  }

  select(id: string): boolean {
    if (!this.owns(id)) return false;
    this.save.update((d) => (d.selectedFish = id));
    return true;
  }
}
