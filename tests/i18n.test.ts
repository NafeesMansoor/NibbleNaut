import { afterEach, describe, expect, it } from 'vitest';
import { PLAYER_FISH } from '../src/game/playerFish';
import { BONUS_FISH, SPECIES } from '../src/game/species';
import { TRIVIA } from '../src/game/trivia';
import { BN } from '../src/i18n/bn';
import { EN, type MessageKey } from '../src/i18n/en';
import { digits, loc, num, setLang, t } from '../src/i18n/i18n';
import { migrate } from '../src/systems/save';

const placeholders = (s: string): string[] => (s.match(/\{\w+\}/g) ?? []).sort();

describe('i18n', () => {
  afterEach(() => setLang('en'));

  it('every Bangla message exists, is non-empty and keeps the same {placeholders}', () => {
    for (const key of Object.keys(EN) as MessageKey[]) {
      if (EN[key] === '') continue;
      expect(BN[key], key).toBeTruthy();
      expect(placeholders(BN[key]), key).toEqual(placeholders(EN[key]));
    }
  });

  it('every fish and fun fact has Bangla text', () => {
    for (const s of [...SPECIES, ...BONUS_FISH]) expect(s.bn?.name && s.bn.about, s.id).toBeTruthy();
    for (const f of PLAYER_FISH) expect(f.bn?.name && f.bn.description && f.bn.about, f.id).toBeTruthy();
    for (const f of TRIVIA) expect(f.bn?.figure && f.bn.label && f.bn.text, f.figure).toBeTruthy();
  });

  it('switches language, fills placeholders and uses Bangla digits', () => {
    expect(t('hud.next', { name: 'X' })).toBe('Next: X');
    expect(num(12345)).toBe('12,345');
    setLang('bn');
    expect(t('menu.play')).toBe('খেলো');
    expect(t('hud.next', { name: 'X' })).toBe('পরের ধাপ: X');
    expect(num(1234)).toMatch(/^১,?২৩৪$/);
    expect(digits('1:05')).toBe('১:০৫');
    expect(loc({ name: 'Bull Shark' }, { name: 'ষাঁড় হাঙর' }).name).toBe('ষাঁড় হাঙর');
  });

  it('saves the language and falls back to a valid one', () => {
    expect(migrate({ settings: { lang: 'bn' } }).settings.lang).toBe('bn');
    expect(['en', 'bn']).toContain(migrate({ settings: { lang: 'fr' } }).settings.lang);
  });
});
