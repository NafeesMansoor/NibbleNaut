import { describe, expect, it } from 'vitest';
import { handoffUrl, HOME_ORIGIN } from '../src/pwa/handoff';
import { MemoryStorage, SaveSystem } from '../src/systems/save';

describe('moving players to the new home', () => {
  it('carries the full progress in the new-home link, intact', () => {
    const old = new SaveSystem(new MemoryStorage());
    old.update((d) => {
      d.points = 11400;
      d.lifetimePoints = 20000;
      d.bestScore = 2638;
      d.gamesPlayed = 40;
      d.ownedFish = ['nemo', 'chromis', 'sunny', 'lion'];
      d.selectedFish = 'lion';
      d.settings.lang = 'bn';
    });
    const url = new URL(handoffUrl(old.exportCode()));
    expect(url.origin).toBe(HOME_ORIGIN);
    expect(url.pathname).toBe('/');
    // The code travels in the fragment, which browsers never send to a server.
    const code = decodeURIComponent(url.hash.match(/progress=([^&]+)/)![1]);
    const home = new SaveSystem(new MemoryStorage());
    expect(home.importCode(code)).toBe(true);
    expect(home.get()).toEqual(old.get());
  });
});
