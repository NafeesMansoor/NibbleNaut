import { BN } from './bn';
import { EN, type MessageKey } from './en';

/**
 * Tiny translation layer. `t(key, params)` looks a message up in the current language and fills
 * `{name}` placeholders. Static HTML uses data attributes, applied by `applyStatic()`:
 *   data-i18n="key"        → textContent
 *   data-i18n-html="key"   → innerHTML (trusted messages with markup)
 *   data-i18n-aria="key"   → aria-label
 * Game content (fish, fun facts) carries its own `bn` fields; `loc()` picks the right one.
 */
export type Lang = 'en' | 'bn';
export const LANGS: Lang[] = ['en', 'bn'];

const TABLES: Record<Lang, Record<MessageKey, string>> = { en: EN, bn: BN };
const NUMBER_LOCALE: Record<Lang, string> = { en: 'en-US', bn: 'bn-BD' };

let current: Lang = 'en';

export const getLang = (): Lang => current;

export function setLang(lang: Lang): void {
  current = lang;
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  let s = TABLES[current][key] ?? EN[key];
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

/** Number with grouping, in Bangla digits when Bangla is on. */
export const num = (n: number, fractionDigits?: number): string =>
  n.toLocaleString(NUMBER_LOCALE[current], fractionDigits === undefined ? undefined : { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });

/** Digits only (no grouping), e.g. inside "1:05" or a version string. */
export const digits = (s: string): string => (current === 'bn' ? s.replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]) : s);

/** Picks the Bangla variant of a content object's text fields when Bangla is on. */
export const loc = <T extends object>(base: T, bn?: Partial<T>): T => (current === 'bn' && bn ? { ...base, ...bn } : base);

export function applyStatic(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n as MessageKey)));
  root.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml as MessageKey)));
  root.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria as MessageKey)));
}
