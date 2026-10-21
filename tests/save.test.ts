import { describe, expect, it } from 'vitest';
import { SAVE_KEY, SAVE_VERSION } from '../src/config';
import { defaultSave, MemoryStorage, migrate, SaveSystem } from '../src/systems/save';

describe('save system', () => {
  it('falls back to defaults on corrupt data', () => {
    const s = new MemoryStorage();
    s.setItem(SAVE_KEY, '{not json');
    expect(new SaveSystem(s).get()).toEqual(defaultSave());
  });

  it('sanitises bad fields and unknown reward tiers', () => {
    const d = migrate({ bestScore: 'lots', pendingReward: 'legendary', settings: { volume: 9, muted: 'yes' } });
    expect(d.version).toBe(SAVE_VERSION);
    expect(d.bestScore).toBe(0);
    expect(d.pendingReward).toBeNull();
    expect(d.settings.volume).toBe(1);
    expect(d.settings.muted).toBe(false);
  });

  it('fun facts are on by default, and older saves without the setting get the default', () => {
    expect(defaultSave().settings.trivia).toBe(true);
    expect(migrate({ settings: { volume: 0.5 } }).settings.trivia).toBe(true);
    expect(migrate({ settings: { trivia: false } }).settings.trivia).toBe(false);
  });

  it('moves progress between devices with a progress code, and rejects junk', () => {
    const from = new SaveSystem(new MemoryStorage());
    from.update((d) => {
      d.points = 11400;
      d.lifetimePoints = 20000;
      d.bestScore = 2638;
      d.ownedFish = ['nemo', 'sunny', 'lion'];
      d.selectedFish = 'lion';
      d.settings.lang = 'bn';
    });
    const code = from.exportCode();
    const storage = new MemoryStorage();
    const to = new SaveSystem(storage);
    expect(to.importCode('hello')).toBe(false);
    expect(to.importCode('NIBBLENAUT1:%%%')).toBe(false);
    expect(to.get().points).toBe(0);
    expect(to.importCode(`  ${code}\n`)).toBe(true);
    expect(to.get()).toEqual(from.get());
    expect(new SaveSystem(storage).get()).toEqual(from.get());
    expect(storage.getItem(`${SAVE_KEY}.backup-before-import`)).not.toBeNull();
  });

  it('keeps working when storage throws', () => {
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };
    const save = new SaveSystem(broken);
    save.update((d) => (d.bestScore = 42));
    expect(save.get().bestScore).toBe(42);
  });

  it('writes through on every update', () => {
    const s = new MemoryStorage();
    new SaveSystem(s).update((d) => (d.pendingReward = 'good'));
    expect(JSON.parse(s.getItem(SAVE_KEY)!).pendingReward).toBe('good');
  });

  it('backs up a corrupt save before it can be overwritten', () => {
    const s = new MemoryStorage();
    s.setItem(SAVE_KEY, '{not json');
    new SaveSystem(s).update((d) => (d.bestScore = 1));
    expect(s.getItem(`${SAVE_KEY}.backup-corrupt`)).toBe('{not json');
  });

  it('backs up an older-version save before migrating it', () => {
    const s = new MemoryStorage();
    const v1 = JSON.stringify({ version: 1, bestScore: 777 });
    s.setItem(SAVE_KEY, v1);
    const save = new SaveSystem(s);
    expect(save.get().bestScore).toBe(777);
    expect(s.getItem(`${SAVE_KEY}.backup-v1`)).toBe(v1);
  });
});
