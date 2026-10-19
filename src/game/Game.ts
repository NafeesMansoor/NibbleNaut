import { CONFIG, type RewardTier } from '../config';
import { AudioManager } from '../audio/AudioManager';
import { Input } from '../input/Input';
import { Effects } from '../render/effects';
import { Renderer } from '../render/Renderer';
import { RewardLedger, rewardText, startConditionsFor } from '../systems/rewards';
import { FishShop } from '../systems/shop';
import type { SaveSystem, Settings } from '../systems/save';
import { UI, type GameOverSummary, type ShopView } from '../ui/UI';
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
      },
      settings,
    );

    this.world = this.makeAttractWorld();
    this.renderer.snapCamera(this.world);
    this.ui.showMenu(this.ledger.peekPending(), save.get().bestScore);
    this.ui.setBank(this.shop.points, this.shop.selected());

    window.addEventListener('resize', () => this.renderer.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.renderer.resize(), 200));
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

  private applySettings(s: Settings): void {
    this.save.update((d) => (d.settings = { ...s }));
    this.audio.setVolume(s.volume, s.muted);
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
    this.world = new World({ startSize: c.startSize, ocean: c.ocean, speedBoostSeconds: c.speedBoostSeconds, fish, view: this.renderer.startView });
    this.ui.setPlayerFish(fish);
    this.fx.clear();
    this.renderer.snapCamera(this.world);
    this.syncView();
    this.finalized = false;
    this.summary = null;
    this.input.reset();
    this.ui.closeModals();
    this.ui.resetHudCache();
    this.ui.setPlaying(true);
    this.state = 'playing';
    this.audio.startAmbient();

    if (tier === 'plenty') {
      this.ui.flash('THE OCEAN OF PLENTY<small>Food everywhere and golden feeding zones. Eat, grow, and make the most of it!</small>', 4.5, true);
      this.audio.reward(true);
    } else if (tier && tier !== 'normal') {
      const r = rewardText(tier);
      this.ui.flash(`${r.label.toUpperCase()} REWARD<small>${r.description.replace('Your next game starts', 'You start')}</small>`, 3.5, true);
      this.audio.reward(false);
    } else if (this.save.get().gamesPlayed === 0) {
      this.ui.flash('Eat smaller fish. Avoid bigger ones!<small>Red outline = danger · Space / DASH to dash</small>', 4);
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
    this.finalize('Run ended');
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
  }

  /** Records the result and next-game reward exactly once per run. */
  private finalize(title: string): void {
    if (this.finalized) return;
    this.finalized = true;
    const s = this.world.stats;
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
    };
  }

  private showOver(): void {
    if (!this.summary) return;
    this.state = 'over';
    this.audio.stopAmbient();
    this.ui.hideBanner();
    this.ui.showGameOver(this.summary);
    if (this.summary.tier !== 'normal') this.audio.reward(this.summary.tier === 'plenty');
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
        // Drift the invisible reference point back and forth so the menu ocean keeps moving.
        w.player.x += 40 * dt * this.menuDir;
        if (w.player.x > w.width - 1500 || w.player.x < 1500) this.menuDir *= -1;
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
        this.ui.flash(`${e.name.toUpperCase()}!<small>+${e.points} growth bonus</small>`, 2.2, true);
        break;
      case 'dash':
        this.audio.dash();
        break;
      case 'playerEaten':
        if (this.state !== 'playing') break;
        this.finalize(`Eaten by a ${e.by.species.name}!`);
        this.state = 'dying';
        this.dyingTime = DYING_SECONDS;
        this.audio.gameOver();
        break;
      case 'fishEaten':
        break;
    }
  }
}
