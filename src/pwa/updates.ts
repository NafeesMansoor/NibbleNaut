import { APP_VERSION } from '../version';

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const UPDATED_FROM_KEY = 'fishfight.updatedFrom';

export interface UpdateHooks {
  /** A new version is installed and waiting. The game decides when it is safe to apply it. */
  onUpdateReady(): void;
  /** This page load is the first one after an update was applied. */
  onUpdated(from: string, to: string): void;
}

const session = {
  get(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null): void {
    try {
      if (value === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    } catch {
      // Storage blocked: the "updated" confirmation is simply skipped.
    }
  },
};

/**
 * Service worker registration and the update lifecycle.
 *
 * A new release installs in the background and then waits. Nothing reloads until the game calls
 * `apply()` from a safe screen, so an update can never interrupt a match. One `apply()` causes at
 * most one reload, and the first-ever install (no previous version) never reloads.
 */
export class UpdateManager {
  private reg: ServiceWorkerRegistration | null = null;
  private waiting: ServiceWorker | null = null;
  private applying = false;
  private reloading = false;
  private lastCheck = 0;

  constructor(private hooks: UpdateHooks) {}

  get ready(): boolean {
    return this.waiting !== null;
  }

  async start(): Promise<void> {
    const from = session.get(UPDATED_FROM_KEY);
    if (from !== null) {
      session.set(UPDATED_FROM_KEY, null);
      if (from !== APP_VERSION) this.hooks.onUpdated(from, APP_VERSION);
    }
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

    const sw = navigator.serviceWorker;
    try {
      // updateViaCache 'none': the browser always revalidates sw.js instead of trusting the HTTP cache.
      this.reg = await sw.register('./sw.js', { updateViaCache: 'none' });
    } catch (err) {
      console.warn('Fish Fight: service worker registration failed; the game runs without offline support.', err);
      return;
    }
    const reg = this.reg;

    sw.addEventListener('controllerchange', () => {
      // Only reload for an update this page asked for; ignore the first install claiming the page.
      if (!this.applying || this.reloading) return;
      this.reloading = true;
      window.location.reload();
    });

    if (reg.waiting && sw.controller) this.found(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        // 'installed' with an existing controller = a new version waiting behind the running one.
        if (worker.state === 'installed' && sw.controller) this.found(worker);
      });
    });

    this.check(true);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.check(false);
    });
    window.setInterval(() => this.check(false), CHECK_INTERVAL_MS);
  }

  /** Looks for a newer release; throttled so returning to the tab doesn't hammer the server. */
  check(force: boolean): void {
    if (!this.reg || this.applying) return;
    const now = Date.now();
    if (!force && now - this.lastCheck < CHECK_INTERVAL_MS) return;
    this.lastCheck = now;
    this.reg.update().catch(() => {
      // Offline or server error: keep running the current version and try again later.
    });
  }

  /** Switches to the waiting version and reloads once. Call only from a safe screen. */
  apply(): void {
    if (!this.waiting || this.applying) return;
    this.applying = true;
    session.set(UPDATED_FROM_KEY, APP_VERSION);
    this.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  private found(worker: ServiceWorker): void {
    if (this.waiting === worker) return;
    this.waiting = worker;
    this.hooks.onUpdateReady();
  }
}
