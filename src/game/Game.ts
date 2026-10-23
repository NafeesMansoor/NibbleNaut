import { CONFIG, type RewardTier } from '../config';
import { AudioManager } from '../audio/AudioManager';
import { Input } from '../input/Input';
import { UpdateManager } from '../pwa/updates';
import { Effects } from '../render/effects';
import { Renderer } from '../render/Renderer';
import { RewardLedger, rewardText, startConditionsFor } from '../systems/rewards';
import { FishShop } from '../systems/shop';
import type { SaveSystem, Settings } from '../systems/save';
import { UI, type GameOverSummary, type ShopView } from '../ui/UI';
import { applyStatic, digits, loc, num, setLang, t } from '../i18n/i18n';
import { handoffUrl, isOldHome, newHomeReady } from '../pwa/handoff';
import { isInstalled } from '../pwa/install';
import { startSizeFor } from './playerFish';
import { speciesById, type Species } from './species';
import { World, type Controls } from './World';

type State = 'menu' | 'playing' | 'paused' | 'dying' | 'over';

const MAX_DT = 1 / 20;
const DYING_SECONDS = 1.4;

/**
 * Owns the main loop and the screen state machine:
 *   menu → playing ⇄ paused → dying → over → playing (next game) / menu
 * The reward for the next game is written to storage at the moment a run ends, before any
 * animation, so restarting or refreshing can never skip or duplicate it.
 */
export class Game {
  private state: State = 'menu';
  private world: World;
  private renderer: Renderer;
  private fx = new Effects();
  private audio = new AudioManager();
  private input: Input;
  private ui: UI;
  private ledger: RewardLedger;
  private shop: FishShop;
  private updates: UpdateManager;
  private activeReward: RewardTier | null = null;
  private dyingTime = 0;
  private summary: GameOverSummary | null = null;
  private finalized = false;
  private last = 0;
  private menuDir = 1;
  private readonly idle: Controls = { moveX: 0, moveY: 0, dash: false };

  constructor(canvas: HTMLCanvasElement, private save: SaveSystem) {
    this.renderer = new Renderer(canvas);
    this.ledger = new RewardLedger(save);
    this.shop = new FishShop(save);
    this.input = new Input(canvas, document.getElementById('joy-base')!, document.getElementById('joy-knob')!, document.getElementById('btn-dash')!);
    this.input.onPause = () => this.togglePause();

    const settings = save.get().settings;
    this.audio.setVolume(settings.volume, settings.muted);
    setLang(settings.lang);
    applyStatic();
    this.ui = new UI(
      {
        onPlay: () => this.start(),
        onResume: () => this.resume(),
        onEndRun: () => this.endRun(),
        onMenu: () => this.toMenu(),
        onPause: () => this.pause(),
        onSettings: (s) => this.applySettings(s),
        onOpenShop: () => this.ui.showShop(this.shopView()),
        onBuyFish: (id) => {
          if (this.shop.buy(id) === 'bought') this.audio.reward(false);
          this.refreshShop();
        },
        onSelectFish: (id) => {
          this.shop.select(id);
          this.refreshShop();
        },
        onClick: () => {
          this.audio.unlock();
          this.audio.click();
        },
        exportProgress: () => this.save.exportCode(),
        importProgress: (code) => {
          if (!this.save.importCode(code)) return false;
          // Reload so every screen, setting and the language pick up the restored progress.
          window.location.reload();
          return true;
        },
      },
      settings,
    );

    this.world = this.makeAttractWorld();
    this.renderer.snapCamera(this.world);
    this.ui.showMenu(this.ledger.peekPending(), save.get().bestScore);
    this.ui.setBank(this.shop.points, this.shop.selected());

    this.updates = new UpdateManager({
      onUpdateReady: () => this.offerUpdate(),
      onUpdated: (_from, to) => this.ui.toast(t('toast.updatedTitle'), t('toast.updatedBody', { v: digits(to) }), null, 5),
    });
    void this.updates.start();
    void this.handOffIfMoved();

    window.addEventListener('resize', () => this.renderer.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.renderer.resize(), 200));
    // Mobile browser bars and rotation change the visual viewport without always firing 'resize'.
    window.visualViewport?.addEventListener('resize', () => this.renderer.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause();
    });
    window.addEventListener('blur', () => this.pause());
    window.addEventListener('pointerdown', () => this.audio.unlock(), { once: true });
    window.addEventListener('keydown', () => this.audio.unlock(), { once: true });

    requestAnimationFrame((t) => {
      this.last = t;
      this.frame(t);
    });
  }

  /** A living ocean behind the menu: no player, just fish drifting past a slowly moving camera. */
  private makeAttractWorld(): World {
    const w = new World({ startSize: CONFIG.size.normalStart, ocean: 'normal', view: this.renderer.startView });
    w.player.alive = false;
    w.player.y -= 120;
    return w;
  }

  /**
   * At the old address, once the new home serves the game: send the player there with their
   * progress (browser), or show the move screen with their progress code (installed app).
   */
  private async handOffIfMoved(): Promise<void> {
    if (!isOldHome() || !(await newHomeReady())) return;
    const code = this.save.exportCode();
    const url = handoffUrl(code);
    if (isInstalled()) {
      this.ui.showMoved(url, code);
      return;
    }
    // Retire this address's offline copy so it can't keep serving the old site, then go home.
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.unregister();
    } catch {
      // Not critical: the redirect below still happens.
    }
    window.location.replace(url);
  }

  private applySettings(s: Settings): void {
    const langChanged = s.lang !== this.save.get().settings.lang;
    this.save.update((d) => (d.settings = { ...s }));
    this.audio.setVolume(s.volume, s.muted);
    if (langChanged) this.relocalize(s);
  }

  /**
   * Language switched in Settings (from the menu or the pause screen): re-translate the page and
   * redraw the dynamic text on whichever screen is behind the dialog.
   */
  private relocalize(s: Settings): void {
    setLang(s.lang);
    applyStatic();
    this.ui.setBank(this.shop.points, this.shop.selected());
    if (this.state === 'menu') {
      this.ui.showMenu(this.ledger.peekPending(), this.save.get().bestScore);
    } else if (this.state === 'paused' || this.state === 'playing') {
      this.ui.setPlayerFish(this.shop.selected());
      this.ui.resetHudCache();
      this.ui.updateHud(this.world, this.activeReward);
      if (this.state === 'paused') this.ui.refreshPauseTrivia();
    }
  }

  /**
   * Applies a waiting update only where nothing can be lost: the main menu with no dialog open.
   * Game over offers an "Update now" button (the run is already saved); during a match the player
   * is only told, and the offer comes back when the match ends.
   */
  private offerUpdate(): void {
    if (!this.updates.ready) return;
    if (this.state === 'menu' && !this.ui.modalOpen) {
      this.updates.apply();
    } else if (this.state === 'menu' || this.state === 'over') {
      this.ui.toast(t('toast.readyTitle'), t('toast.readyBody'), { label: t('toast.updateNow'), run: () => this.updates.apply() });
    } else {
      this.ui.toast(t('toast.readyTitle'), t('toast.readyBodyMatch'), null, 6);
    }
  }

  private shopView(): ShopView {
    const selected = this.shop.selected().id;
    return {
      points: this.shop.points,
      entries: this.shop.catalog.map((fish) => ({ fish, owned: this.shop.owns(fish.id), selected: fish.id === selected })),
    };
  }

  private refreshShop(): void {
    this.ui.showShop(this.shopView());
    this.ui.setBank(this.shop.points, this.shop.selected());
  }

  start(): void {
    if (this.state === 'playing' || this.state === 'paused' || this.state === 'dying') return;
    this.audio.unlock();
    // Consume the pending reward exactly once, persisting the consumption immediately.
    const tier = this.ledger.consumeForNewGame();
    this.activeReward = tier;
    const c = startConditionsFor(tier);
    const fish = this.shop.selected();
    const startSize = startSizeFor(c.startSize, fish);
    this.world = new World({ startSize, ocean: c.ocean, speedBoostSeconds: c.speedBoostSeconds, fish, view: this.renderer.startView });
    this.ui.setPlayerFish(fish);
    this.fx.clear();
    this.renderer.snapCamera(this.world);
    this.syncView();
    this.finalized = false;
    this.summary = null;
    this.input.reset();
    this.ui.closeModals();
    this.ui.hideToast();
    this.ui.resetHudCache();
    this.ui.setPlaying(true);
    this.state = 'playing';
    this.audio.startAmbient();

    if (tier === 'plenty') {
      this.ui.flash(t('flash.plenty'), 4.5, true);
      this.audio.reward(true);
    } else if (tier && tier !== 'normal') {
      const r = rewardText(tier);
      this.ui.flash(t('flash.reward', { label: r.label.toUpperCase(), desc: r.now }), 3.5, true);
      this.audio.reward(false);
    } else if (this.save.get().gamesPlayed === 0) {
      this.ui.flash(t('flash.tutorial'), 4);
    }
  }

  private togglePause(): void {
    if (this.ui.modalOpen) {
      this.ui.closeModals();
      return;
    }
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  pause(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.reset();
    this.ui.showPause();
    this.audio.stopAmbient();
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.ui.closeModals();
    this.ui.hidePause();
    this.state = 'playing';
    this.last = performance.now();
    this.audio.startAmbient();
  }

  endRun(): void {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    this.finalize(t('over.titleEnded'));
    this.ui.closeModals();
    this.showOver();
  }

  toMenu(): void {
    this.state = 'menu';
    this.audio.stopAmbient();
    this.world = this.makeAttractWorld();
    this.fx.clear();
    this.renderer.snapCamera(this.world);
    this.ui.hideBanner();
    this.ui.showMenu(this.ledger.peekPending(), this.save.get().bestScore);
    this.ui.setBank(this.shop.points, this.shop.selected());
    this.offerUpdate();
  }

  /** Records the result and next-game reward exactly once per run. */
  private finalize(title: string, predator: Species | null = null): void {
    if (this.finalized) return;
    this.finalized = true;
    const s = this.world.stats;
    let topMeal: GameOverSummary['topMeal'] = null;
    for (const [id, count] of Object.entries(s.eaten)) {
      const species = speciesById(id);
      if (species && (!topMeal || count > topMeal.count)) topMeal = { species, count };
    }
    const { tier, newBest, pointsEarned } = this.ledger.recordGameOver(s.score, s.maxSize);
    this.summary = {
      title,
      score: s.score,
      fishEaten: s.fishEaten,
      maxSize: s.maxSize,
      time: s.time,
      bestScore: this.save.get().bestScore,
      newBest,
      tier,
      pointsEarned,
      pointsBank: this.shop.points,
      fish: this.shop.selected(),
      predator,
      topMeal,
    };
  }

  private showOver(): void {
    if (!this.summary) return;
    this.state = 'over';
    this.audio.stopAmbient();
    this.ui.hideBanner();
    this.ui.showGameOver(this.summary);
    if (this.summary.tier !== 'normal') this.audio.reward(this.summary.tier === 'plenty');
    this.offerUpdate();
  }

  private syncView(): void {
    const r = this.renderer;
    this.world.setView(r.camera.x, r.camera.y, r.halfW, r.halfH);
  }

  private controls(): Controls {
    const p = this.world.player;
    const r = this.renderer;
    const sx = (p.x - r.camera.x) * r.camera.zoom + r.w / 2;
    const sy = (p.y - r.camera.y) * r.camera.zoom + r.h / 2;
    const m = this.input.move(sx, sy, Math.min(r.w, r.h) * 0.18);
    return { moveX: m.x, moveY: m.y, dash: this.input.consumeDash() };
  }

  private frame(now: number): void {
    const dt = Math.min(MAX_DT, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    const w = this.world;

    if (this.state === 'playing' || this.state === 'dying' || this.state === 'menu' || this.state === 'over') {
      if (this.state === 'menu') {
        // Drift the invisible reference point through the endless sea so the menu ocean keeps moving.
        w.player.x += 40 * dt * this.menuDir;
      }
      const controls = this.state === 'playing' ? this.controls() : this.idle;
      w.update(dt, controls);
      for (const e of w.drainEvents()) this.onEvent(e);
      this.renderer.updateCamera(w, dt);
      this.syncView();
      this.fx.trail(w.player, dt);
      this.fx.update(dt);
    }

    if (this.state === 'playing') {
      const danger = this.renderer.dangerLevel(w);
      if (danger > 0.15) this.audio.warn(danger);
    }
    if (this.state === 'dying') {
      this.dyingTime -= dt;
      if (this.dyingTime <= 0) this.showOver();
    }

    this.renderer.render(w, this.fx, { dangerOutlines: this.save.get().settings.dangerOutlines });
    if (this.state === 'playing' || this.state === 'paused' || this.state === 'dying') this.ui.updateHud(w, this.activeReward);

    requestAnimationFrame((t) => this.frame(t));
  }

  private onEvent(e: ReturnType<World['drainEvents']>[number]): void {
    if (this.state === 'menu') return;
    const p = this.world.player;
    this.fx.handle(e, p);
    switch (e.type) {
      case 'eatFood':
        this.audio.nibble();
        break;
      case 'eatFish':
        if (e.golden) this.audio.golden();
        else this.audio.eat(e.size);
        break;
      case 'stage':
        this.audio.grow();
        this.ui.flash(t('flash.stage', { name: t(`stage.${e.index}` as 'stage.0').toUpperCase(), points: num(e.points) }), 2.2, true);
        break;
      case 'dash':
        this.audio.dash();
        break;
      case 'playerEaten':
        if (this.state !== 'playing') break;
        this.finalize(t('over.titleEaten', { name: loc(e.by.species, e.by.species.bn).name }), e.by.species);
        this.state = 'dying';
        this.dyingTime = DYING_SECONDS;
        this.audio.gameOver();
        break;
      case 'fishEaten':
        break;
    }
  }
}
