/**
 * Installing NibbleNaut as an app, and knowing when it already is one.
 *
 * Today the game ships as a PWA. It is also meant to go to Google Play (as a Trusted Web
 * Activity) and the App Store (in a native shell such as Capacitor). Everything that depends on
 * how the game is running lives here, so the store builds need no other changes: in an installed
 * PWA or a store app the install button and instructions simply hide.
 */

export type Platform = 'ios' | 'android' | 'desktop';

/** Chrome's install prompt event (not in the standard DOM typings). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let justInstalled = false;
const listeners = new Set<() => void>();
const notify = (): void => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Keep the event for our own Install button instead of the browser's mini banner.
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    justInstalled = true;
    notify();
  });
}

export function platform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac; touch support gives it away.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

/** Running inside a store build: a native shell (Capacitor) or an Android Trusted Web Activity. */
export function isStoreApp(): boolean {
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.()) || document.referrer.startsWith('android-app://');
}

/** Already running as an installed app (home-screen PWA or store app). */
export function isInstalled(): boolean {
  const standalone = ['standalone', 'fullscreen', 'minimal-ui'].some((m) => window.matchMedia?.(`(display-mode: ${m})`).matches);
  return justInstalled || standalone || (navigator as Navigator & { standalone?: boolean }).standalone === true || isStoreApp();
}

/** The browser can show its own install dialog (Chrome, Edge, Samsung Internet on Android/desktop). */
export const canPromptInstall = (): boolean => deferred !== null;

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const e = deferred;
  if (!e) return 'unavailable';
  deferred = null;
  await e.prompt();
  const { outcome } = await e.userChoice;
  notify();
  return outcome;
}

/** Called whenever install availability changes (prompt became available, app installed). */
export function onInstallChange(fn: () => void): void {
  listeners.add(fn);
}
