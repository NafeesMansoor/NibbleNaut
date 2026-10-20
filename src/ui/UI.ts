import { CONFIG, type RewardTier } from '../config';
import { STARTER_FISH, type PlayerFishDef } from '../game/playerFish';
import { drawFish, type FishLook } from '../render/fishArt';
import type { Species } from '../game/species';
import { TriviaCollection, TriviaDeck, type Trivia } from '../game/trivia';
import type { World } from '../game/World';
import { stageInfo } from '../systems/growth';
import { nextTierGoal, rewardText } from '../systems/rewards';
import type { Settings } from '../systems/save';
import { APP_VERSION } from '../version';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
};

export const formatTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export interface GameOverSummary {
  title: string;
  score: number;
  fishEaten: number;
  maxSize: number;
  time: number;
  bestScore: number;
  newBest: boolean;
  tier: RewardTier;
  /** Points this run added to the bank, and the bank total afterwards. */
  pointsEarned: number;
  pointsBank: number;
  fish: PlayerFishDef;
  /** The fish that ate the player, or null when the run was ended by hand. */
  predator: Species | null;
  /** The species the player ate most this run. */
  topMeal: { species: Species; count: number } | null;
}

export interface ShopEntry {
  fish: PlayerFishDef;
  owned: boolean;
  selected: boolean;
}

export interface ShopView {
  points: number;
  entries: ShopEntry[];
}

export interface UICallbacks {
  onPlay(): void;
  onResume(): void;
  onEndRun(): void;
  onMenu(): void;
  onPause(): void;
  onSettings(s: Settings): void;
  onClick(): void;
  onOpenShop(): void;
  onBuyFish(id: string): void;
  onSelectFish(id: string): void;
}

const formatMul = (m: number): string => `×${m}`;

/** Draws a still fish centred in a small canvas, sharp on high-DPI screens. */
function drawThumb(canvas: HTMLCanvasElement, look: FishLook, cssW: number, cssH: number): void {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  const r = Math.min(cssW / 4.6, cssH / 2.6);
  drawFish(ctx, cssW * 0.57, cssH / 2, r, 1, 0, 0.6, look, { outline: 'rgba(255,255,255,0.85)', outlineWidth: 1.5, screenRadius: r });
}

const SOUND_ON = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const SOUND_OFF = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

type ScreenId = 'menu' | 'pause' | 'over' | 'none';

/** DOM overlay: menus, HUD, banners and the reward celebration. */
export class UI {
  private screens: Record<Exclude<ScreenId, 'none'>, HTMLElement> = {
    menu: $('screen-menu'),
    pause: $('screen-pause'),
    over: $('screen-over'),
  };
  private hud = $('hud');
  private touch = $('touch');
  private banner = $('banner');
  private bannerTimer = 0;
  private settings: Settings;
  private settingsModal = $('screen-settings');
  private howModal = $('screen-how');
  private shopModal = $('screen-shop');
  private previewLook: FishLook | null = null;
  private toastEl = $('toast');
  private toastTimer = 0;
  private toastAction: (() => void) | null = null;
  private previewRaf = 0;
  private last = { score: -1, time: -1, size: -1, stage: '', growth: -1, chip: '', dash: -1 };
  readonly touchMode: boolean;

  private triviaSeen = new TriviaCollection();
  private trivia = new TriviaDeck(undefined, undefined, this.triviaSeen.seen);
  /** The fish that "tells" trivia: whichever fish the player swims as. */
  private mascot: FishLook = STARTER_FISH.look;
  private readonly cb: UICallbacks;

  constructor(cb: UICallbacks, settings: Settings) {
    this.cb = cb;
    this.settings = { ...settings };
    this.touchMode = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    $('dash-hint').hidden = this.touchMode;
    $('menu-version').textContent = `v${APP_VERSION}`;
    $('settings-version').textContent = `v${APP_VERSION}`;

    const click = (id: string, fn: () => void): void =>
      $(id).addEventListener('click', () => {
        cb.onClick();
        fn();
      });
    click('btn-play', () => cb.onPlay());
    click('btn-again', () => cb.onPlay());
    click('btn-menu', () => cb.onMenu());
    click('btn-resume', () => cb.onResume());
    click('btn-end', () => cb.onEndRun());
    click('btn-pause', () => cb.onPause());
    click('btn-how', () => (this.howModal.hidden = false));
    click('btn-how-close', () => (this.howModal.hidden = true));
    click('btn-settings', () => this.openSettings());
    click('btn-pause-settings', () => this.openSettings());
    click('btn-settings-close', () => (this.settingsModal.hidden = true));
    click('btn-shop', () => cb.onOpenShop());
    click('toast-close', () => this.hideToast());
    click('toast-action', () => {
      const run = this.toastAction;
      this.hideToast();
      run?.();
    });
    click('btn-shop-close', () => (this.shopModal.hidden = true));
    $('shop-list').addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-fish]');
      if (!btn || btn.disabled) return;
      cb.onClick();
      if (btn.dataset.action === 'buy') cb.onBuyFish(btn.dataset.fish!);
      else cb.onSelectFish(btn.dataset.fish!);
    });
    click('btn-mute', () => {
      this.settings.muted = !this.settings.muted;
      this.syncSettingsInputs();
      cb.onSettings({ ...this.settings });
    });

    const vol = $<HTMLInputElement>('set-volume');
    const mute = $<HTMLInputElement>('set-mute');
    const outlines = $<HTMLInputElement>('set-outlines');
    vol.addEventListener('input', () => {
      this.settings.volume = Number(vol.value);
      if (this.settings.volume > 0) this.settings.muted = false;
      this.syncSettingsInputs();
      cb.onSettings({ ...this.settings });
    });
    mute.addEventListener('change', () => {
      this.settings.muted = mute.checked;
      this.syncSettingsInputs();
      cb.onSettings({ ...this.settings });
    });
    outlines.addEventListener('change', () => {
      this.settings.dangerOutlines = outlines.checked;
      cb.onSettings({ ...this.settings });
    });
    this.syncSettingsInputs();
  }

  private openSettings(): void {
    this.syncSettingsInputs();
    this.settingsModal.hidden = false;
  }

  private syncSettingsInputs(): void {
    $<HTMLInputElement>('set-volume').value = String(this.settings.volume);
    $<HTMLInputElement>('set-mute').checked = this.settings.muted;
    $<HTMLInputElement>('set-outlines').checked = this.settings.dangerOutlines;
    $('btn-mute').innerHTML = this.settings.muted ? SOUND_OFF : SOUND_ON;
  }

  get modalOpen(): boolean {
    return !this.settingsModal.hidden || !this.howModal.hidden || !this.shopModal.hidden;
  }

  closeModals(): void {
    this.settingsModal.hidden = true;
    this.howModal.hidden = true;
    this.shopModal.hidden = true;
  }

  /** Home-screen points bank and the fish currently selected. */
  setBank(points: number, fish: PlayerFishDef): void {
    this.mascot = fish.look;
    $('menu-points').textContent = Math.floor(points).toLocaleString();
    $('menu-fish-name').textContent = fish.name;
    $('menu-fish-mul').textContent = `${formatMul(fish.feedMul)} feeding points`;
    drawThumb($<HTMLCanvasElement>('menu-fish'), fish.look, 64, 40);
  }

  /** Opens (or refreshes) the Upgrade Fish shop. */
  showShop(view: ShopView): void {
    $('shop-points').textContent = Math.floor(view.points).toLocaleString();
    const list = $('shop-list');
    list.innerHTML = '';
    for (const { fish, owned, selected } of view.entries) {
      const card = document.createElement('div');
      card.className = 'shop-card' + (selected ? ' selected' : owned ? ' owned' : '');
      const canvas = document.createElement('canvas');
      canvas.className = 'fish-thumb';
      canvas.setAttribute('aria-hidden', 'true');
      const info = document.createElement('div');
      info.className = 'shop-info';
      info.innerHTML = `<div class="shop-name">${fish.name} <span class="shop-mul">${formatMul(fish.feedMul)} points</span></div><div class="shop-desc">${fish.description}</div>`;
      const btn = document.createElement('button');
      btn.className = 'btn shop-btn';
      btn.dataset.fish = fish.id;
      if (selected) {
        btn.textContent = 'Swimming';
        btn.disabled = true;
      } else if (owned) {
        btn.textContent = 'Select';
        btn.dataset.action = 'select';
      } else {
        const short = fish.cost - view.points;
        btn.dataset.action = 'buy';
        btn.classList.add('primary');
        btn.innerHTML = `★ ${fish.cost.toLocaleString()}`;
        if (short > 0) {
          btn.disabled = true;
          btn.title = `${short.toLocaleString()} more points needed`;
          btn.innerHTML += `<small>need ${short.toLocaleString()} more</small>`;
        }
      }
      card.append(canvas, info, btn);
      list.appendChild(card);
      drawThumb(canvas, fish.look, 72, 46);
    }
    this.shopModal.hidden = false;
  }

  /** Sets the HUD name tag for the fish being played. */
  setPlayerFish(fish: PlayerFishDef): void {
    this.mascot = fish.look;
    $('hud-name').innerHTML = fish.feedMul > 1 ? `${fish.name} <span class="hud-mul">${formatMul(fish.feedMul)}</span>` : fish.name;
  }

  private show(id: ScreenId): void {
    for (const [k, el] of Object.entries(this.screens)) el.hidden = k !== id;
    if (id !== 'over') this.stopPreview();
  }

  setPlaying(playing: boolean): void {
    this.hud.hidden = !playing;
    this.touch.hidden = !playing || !this.touchMode;
    if (playing) this.show('none');
  }

  showMenu(pending: RewardTier | null, best: number): void {
    this.setPlaying(false);
    this.show('menu');
    $('menu-best').textContent = Math.floor(best).toLocaleString();
    this.fillTrivia($('menu-trivia'), this.trivia.next(), true);
    const card = $('menu-reward');
    if (pending) {
      card.hidden = false;
      this.fillRewardCard(card, pending, 'Next game reward');
      $('btn-play').textContent = 'Play with reward';
    } else {
      card.hidden = true;
      $('btn-play').textContent = 'Play';
    }
    queueMicrotask(() => $('btn-play').focus({ preventScroll: true }));
  }

  showPause(): void {
    this.show('pause');
    this.fillTrivia($('pause-trivia'), this.trivia.next());
    $('btn-resume').focus({ preventScroll: true });
  }

  hidePause(): void {
    this.show('none');
  }

  showGameOver(s: GameOverSummary): void {
    this.setPlaying(false);
    this.show('over');
    $('over-title').textContent = s.title;
    $('over-score').textContent = Math.floor(s.score).toLocaleString();
    $('over-best').hidden = !s.newBest;
    $('over-fish').textContent = String(s.fishEaten);
    $('over-size').textContent = String(Math.round(s.maxSize));
    $('over-time').textContent = formatTime(s.time);
    $('over-bestscore').textContent = Math.floor(s.bestScore).toLocaleString();
    $('over-points').innerHTML = `<b>+${Math.floor(s.pointsEarned).toLocaleString()}</b> points banked · total <b>${Math.floor(s.pointsBank).toLocaleString()}</b>`;
    this.previewLook = s.fish.look;
    this.fillFactCards(s);
    this.fillTrivia($('over-trivia'), this.trivia.next());

    const card = $('over-reward');
    this.fillRewardCard(card, s.tier, s.tier === 'normal' ? 'Next game' : `${rewardText(s.tier).label} score · Reward unlocked`);
    const goal = nextTierGoal(s.tier);
    $('over-next').textContent = goal
      ? `Score ${goal.score.toLocaleString()} for the ${rewardText(goal.tier).label} reward: ${rewardText(goal.tier).title}.`
      : 'You reached the highest reward tier!';

    const preview = $<HTMLCanvasElement>('plenty-preview');
    preview.hidden = s.tier !== 'plenty';
    if (s.tier === 'plenty') this.startPreview(preview);
    if (s.tier !== 'normal') this.confetti(s.tier === 'plenty' ? 140 : 60);
    $('btn-again').textContent = s.tier === 'normal' ? 'Play Again' : 'Play Next Game';
    queueMicrotask(() => $('btn-again').focus({ preventScroll: true }));
  }

  /**
   * A kid-friendly "Fun fact!" card: the player's own fish tells a Bay of Bengal fact in a speech
   * bubble, themed by topic, with a "facts discovered" collection bar. `cycle` adds a button that
   * deals the next fact.
   */
  private fillTrivia(box: HTMLElement, t: Trivia, cycle = false): void {
    this.triviaSeen.mark(t);
    const el = (tag: string, cls: string, text = '', parent: HTMLElement = box): HTMLElement => {
      const e = document.createElement(tag);
      e.className = cls;
      if (text) e.textContent = text;
      parent.appendChild(e);
      return e;
    };
    box.innerHTML = '';
    box.className = `trivia theme-${t.tag.toLowerCase().replace(/\s+/g, '-')}`;

    const bubbles = el('div', 'tv-bubbles');
    bubbles.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 7; i++) el('i', '', '', bubbles);

    const ribbon = el('div', 'tv-ribbon');
    el('span', 'tv-ribbon-text', 'Fun fact!', ribbon);
    el('span', 'tv-tag', t.tag, ribbon);

    const body = el('div', 'tv-body');
    const mascot = el('canvas', 'tv-mascot', '', body) as HTMLCanvasElement;
    mascot.setAttribute('aria-hidden', 'true');
    const bubble = el('div', 'tv-bubble', '', body);
    const top = el('div', 'tv-top', '', bubble);
    const emoji = el('span', 'tv-emoji', t.emoji, top);
    emoji.setAttribute('aria-hidden', 'true');
    const head = el('div', 'tv-headline', '', top);
    el('div', 'tv-figure', t.figure, head);
    el('div', 'tv-label', t.label, head);
    el('p', 'tv-text', t.text, bubble);

    const foot = el('div', 'tv-foot');
    const found = this.triviaSeen.seen.size;
    const total = this.triviaSeen.total;
    const progress = el('div', 'tv-progress', '', foot);
    el('div', 'tv-count', found >= total ? `🏆 All ${total} facts discovered!` : `⭐ ${found} / ${total} facts discovered`, progress);
    const bar = el('div', 'tv-bar', '', progress);
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Facts discovered');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(total));
    bar.setAttribute('aria-valuenow', String(found));
    (el('i', '', '', bar) as HTMLElement).style.width = `${(found / total) * 100}%`;
    if (cycle) {
      const next = el('button', 'tv-next', '🎲 Tell me another!', foot) as HTMLButtonElement;
      next.type = 'button';
      next.addEventListener('click', () => {
        this.cb.onClick();
        this.fillTrivia(box, this.trivia.next(), true);
        (box.querySelector('.tv-next') as HTMLElement | null)?.focus({ preventScroll: true });
      });
    }

    drawThumb(mascot, this.mascot, 112, 62);
    box.classList.remove('tv-in');
    void box.offsetWidth; // restart the pop-in animation
    box.classList.add('tv-in');
  }

  /** "Meet your fish" cards: the player's species, then its predator (or favourite meal). */
  private fillFactCards(s: GameOverSummary): void {
    const box = $('over-facts');
    box.innerHTML = '';
    const add = (label: string, look: FishLook, name: string, sci: string, about: string, kind: string): void => {
      const card = document.createElement('div');
      card.className = `fact-card ${kind}`;
      const canvas = document.createElement('canvas');
      canvas.className = 'fc-fish';
      const text = document.createElement('div');
      text.className = 'fc-text';
      const el = (cls: string, content: string, tag = 'div'): void => {
        const e = document.createElement(tag);
        e.className = cls;
        e.textContent = content;
        text.appendChild(e);
      };
      el('fc-label', label);
      el('fc-name', name);
      el('fc-sci', sci, 'i');
      el('fc-about', about, 'p');
      card.append(canvas, text);
      box.appendChild(card);
      drawThumb(canvas, look, 92, 60);
    };
    add('Your fish', s.fish.look, s.fish.name, s.fish.sci, s.fish.about, 'mine');
    if (s.predator) {
      add('Eaten by', s.predator, s.predator.name, s.predator.sci, s.predator.about, 'predator');
    } else if (s.topMeal) {
      const m = s.topMeal;
      add(`Favourite meal · ate ${m.count}`, m.species, m.species.name, m.species.sci, m.species.about, 'meal');
    }
  }

  private fillRewardCard(card: HTMLElement, tier: RewardTier, label: string): void {
    const r = rewardText(tier);
    card.className = 'reward-card' + (tier === 'plenty' ? ' earned plenty' : tier !== 'normal' ? ' earned' : '');
    const title = tier === 'plenty' ? 'REWARD UNLOCKED: THE OCEAN OF PLENTY' : r.title;
    const extra = tier === 'plenty' ? '<div class="rc-desc" style="margin-top:6px">A special bonus for your next game only.</div>' : '';
    card.innerHTML = `<div class="rc-label">${label}</div><div class="rc-title">${title}</div><div class="rc-desc">${r.description}</div>${extra}`;
  }

  private confetti(n: number): void {
    const box = $('confetti');
    box.innerHTML = '';
    const colors = ['#ffd23f', '#ff8a1f', '#7cf0a0', '#5ad1ec', '#ff6f91', '#ffffff'];
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i');
      el.style.left = `${Math.random() * 100}%`;
      el.style.background = colors[i % colors.length];
      el.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
      el.style.animationDelay = `${Math.random() * 0.8}s`;
      el.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
      el.style.setProperty('--rot', `${Math.random() * 900 - 450}deg`);
      box.appendChild(el);
    }
    window.setTimeout(() => (box.innerHTML = ''), 5500);
  }

  /** Small animated preview of the food-rich golden ocean. */
  private startPreview(canvas: HTMLCanvasElement): void {
    this.stopPreview();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const food = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, p: Math.random() * 6, k: Math.random() }));
    const t0 = performance.now();
    const frame = (now: number): void => {
      const t = (now - t0) / 1000;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#8eeadb');
      g.addColorStop(1, '#2a7f86');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const zg = ctx.createRadialGradient(W * 0.7, H * 0.55, 10, W * 0.7, H * 0.55, 110);
      zg.addColorStop(0, 'rgba(255,225,120,0.55)');
      zg.addColorStop(1, 'rgba(255,225,120,0)');
      ctx.fillStyle = zg;
      ctx.fillRect(0, 0, W, H);
      for (const f of food) {
        const x = (f.x + Math.sin(t + f.p) * 8 + W) % W;
        const y = f.y + Math.cos(t * 0.8 + f.p) * 5;
        ctx.fillStyle = f.k < 0.5 ? '#b6f27a' : f.k < 0.8 ? '#ff8fa3' : '#ffb347';
        ctx.beginPath();
        ctx.arc(x, y, f.k < 0.5 ? 3 : 5, 0, Math.PI * 2);
        ctx.fill();
      }
      const fx = ((t * 70) % (W + 120)) - 60;
      drawFish(ctx, fx, H * 0.5 + Math.sin(t * 2) * 14, 26, 1, Math.cos(t * 2) * 0.2, t * 9, this.previewLook ?? STARTER_FISH.look, {
        outline: 'rgba(255,255,255,0.9)',
        outlineWidth: 2,
        screenRadius: 26,
      });
      ctx.fillStyle = 'rgba(58,38,0,0.75)';
      ctx.font = '600 15px Fredoka, system-ui, sans-serif';
      ctx.fillText('Preview: medium fish · food everywhere · golden feeding zones', 12, H - 12);
      this.previewRaf = requestAnimationFrame(frame);
    };
    this.previewRaf = requestAnimationFrame(frame);
  }

  private stopPreview(): void {
    if (this.previewRaf) cancelAnimationFrame(this.previewRaf);
    this.previewRaf = 0;
  }

  flash(html: string, seconds: number, gold = false): void {
    this.banner.innerHTML = html;
    this.banner.classList.toggle('gold', gold);
    this.banner.classList.add('show');
    window.clearTimeout(this.bannerTimer);
    this.bannerTimer = window.setTimeout(() => this.banner.classList.remove('show'), seconds * 1000);
  }

  /** Small unobtrusive notice (update ready / updated). `seconds` 0 keeps it until dismissed. */
  toast(title: string, body: string, action: { label: string; run: () => void } | null = null, seconds = 0): void {
    $('toast-title').textContent = title;
    $('toast-body').textContent = body;
    const btn = $('toast-action');
    btn.hidden = !action;
    btn.textContent = action?.label ?? '';
    this.toastAction = action?.run ?? null;
    this.toastEl.hidden = false;
    window.clearTimeout(this.toastTimer);
    if (seconds > 0) this.toastTimer = window.setTimeout(() => this.hideToast(), seconds * 1000);
  }

  hideToast(): void {
    window.clearTimeout(this.toastTimer);
    this.toastEl.hidden = true;
    this.toastAction = null;
  }

  hideBanner(): void {
    window.clearTimeout(this.bannerTimer);
    this.banner.classList.remove('show');
  }

  /** Per-frame HUD refresh; only touches the DOM when a value changes. */
  updateHud(world: World, activeReward: RewardTier | null): void {
    const p = world.player;
    const L = this.last;
    const score = Math.floor(world.stats.score);
    if (score !== L.score) {
      L.score = score;
      $('hud-score').textContent = score.toLocaleString();
    }
    const time = Math.floor(world.stats.time);
    if (time !== L.time) {
      L.time = time;
      $('hud-time').textContent = formatTime(time);
    }
    // One decimal so every meal visibly ticks the number up.
    const size = Math.round(p.size * 10) / 10;
    if (size !== L.size) {
      L.size = size;
      $('hud-size').textContent = size.toFixed(1);
    }
    const info = stageInfo(p.size);
    if (info.name !== L.stage) {
      L.stage = info.name;
      $('hud-stage').textContent = info.name;
      $('hud-next').textContent = info.nextName ? `Next: ${info.nextName}` : 'Max stage reached';
    }
    const growth = Math.round(info.progress * 100);
    if (growth !== L.growth) {
      L.growth = growth;
      $('hud-growth').style.width = `${growth}%`;
    }
    let chip = '';
    if (activeReward && activeReward !== 'normal') {
      chip = rewardText(activeReward).chip;
      if (p.boostTime > 0) chip = `Speed boost ${Math.ceil(p.boostTime)}s`;
    }
    if (chip !== L.chip) {
      L.chip = chip;
      const el = $('hud-reward');
      el.hidden = !chip;
      el.textContent = chip ? `★ ${chip}` : '';
    }
    const ready = 1 - p.dashCooldown / CONFIG.movement.dashCooldown;
    const dash = Math.round(ready * 20) / 20;
    if (dash !== L.dash) {
      L.dash = dash;
      $('dash-meter').style.width = `${dash * 100}%`;
      $('btn-dash').style.setProperty('--ready', String(dash));
    }
  }

  resetHudCache(): void {
    this.last = { score: -1, time: -1, size: -1, stage: '', growth: -1, chip: '', dash: -1 };
  }
}
