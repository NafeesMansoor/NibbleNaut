import { describe, expect, it } from 'vitest';
import { seededRng } from '../src/core/math';
import { TRIVIA, TriviaDeck } from '../src/game/trivia';

describe('trivia', () => {
  it('every fact has a figure, label and text', () => {
    expect(TRIVIA.length).toBeGreaterThanOrEqual(20);
    for (const t of TRIVIA) {
      expect(t.figure.length).toBeGreaterThan(0);
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.text.length).toBeGreaterThan(20);
    }
  });

  it('shows every fact once before repeating, never the same fact twice in a row', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const deck = new TriviaDeck(TRIVIA, seededRng(seed));
      const first = new Set(Array.from({ length: TRIVIA.length }, () => deck.next()));
      expect(first.size).toBe(TRIVIA.length);
      let prev = deck.next();
      for (let i = 0; i < TRIVIA.length * 3; i++) {
        const t = deck.next();
        expect(t).not.toBe(prev);
        prev = t;
      }
    }
  });
});
