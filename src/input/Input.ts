/**
 * Keyboard (WASD / arrows, Space to dash, Esc / P to pause), mouse (hold to swim toward the
 * cursor) and touch (floating joystick on the left half, dash button on the right).
 * Only the game canvas captures touches, so menus and buttons keep normal page behaviour.
 */
export class Input {
  private keys = new Set<string>();
  private dashQueued = false;
  private pointer = { active: false, x: 0, y: 0 };
  private joy = { id: -1, ox: 0, oy: 0, x: 0, y: 0 };
  onPause: (() => void) | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private joyBase: HTMLElement,
    private joyKnob: HTMLElement,
    dashButton: HTMLElement,
  ) {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'escape' || k === 'p') {
        this.onPause?.();
        return;
      }
      if (k === ' ' || k === 'shift') {
        if (!e.repeat) this.dashQueued = true;
        e.preventDefault();
      }
      if (k.startsWith('arrow')) e.preventDefault();
      this.keys.add(k);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.reset());

    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') {
        if (e.button === 0) this.pointer = { active: true, x: e.clientX, y: e.clientY };
        else if (e.button === 2) this.dashQueued = true;
        return;
      }
      if (this.joy.id === -1 && e.clientX < window.innerWidth * 0.6) {
        this.joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: e.clientX, y: e.clientY };
        canvas.setPointerCapture(e.pointerId);
        this.showJoystick();
      } else {
        this.dashQueued = true;
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') {
        if (this.pointer.active) {
          this.pointer.x = e.clientX;
          this.pointer.y = e.clientY;
        }
        return;
      }
      if (e.pointerId === this.joy.id) {
        this.joy.x = e.clientX;
        this.joy.y = e.clientY;
        this.showJoystick();
      }
    });
    const end = (e: PointerEvent): void => {
      if (e.pointerType === 'mouse') this.pointer.active = false;
      if (e.pointerId === this.joy.id) {
        this.joy.id = -1;
        this.joyBase.classList.remove('active');
      }
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    dashButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.dashQueued = true;
    });
  }

  private showJoystick(): void {
    const max = 56;
    let dx = this.joy.x - this.joy.ox;
    let dy = this.joy.y - this.joy.oy;
    const d = Math.hypot(dx, dy);
    if (d > max) {
      dx = (dx / d) * max;
      dy = (dy / d) * max;
    }
    this.joyBase.classList.add('active');
    this.joyBase.style.transform = `translate(${this.joy.ox}px, ${this.joy.oy}px)`;
    this.joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  reset(): void {
    this.keys.clear();
    this.pointer.active = false;
    this.joy.id = -1;
    this.joyBase.classList.remove('active');
    this.dashQueued = false;
  }

  /**
   * Movement vector (length ≤ 1). `playerScreen` is the player's on-screen position, used for
   * mouse steering; `scale` is the on-screen distance at which the mouse gives full speed.
   */
  move(playerScreenX: number, playerScreenY: number, scale: number): { x: number; y: number } {
    let x = 0;
    let y = 0;
    const k = this.keys;
    if (k.has('a') || k.has('arrowleft')) x -= 1;
    if (k.has('d') || k.has('arrowright')) x += 1;
    if (k.has('w') || k.has('arrowup')) y -= 1;
    if (k.has('s') || k.has('arrowdown')) y += 1;
    if (x || y) {
      const l = Math.hypot(x, y);
      return { x: x / l, y: y / l };
    }
    if (this.joy.id !== -1) {
      const dx = this.joy.x - this.joy.ox;
      const dy = this.joy.y - this.joy.oy;
      const d = Math.hypot(dx, dy);
      if (d < 6) return { x: 0, y: 0 };
      const m = Math.min(1, d / 56);
      return { x: (dx / d) * m, y: (dy / d) * m };
    }
    if (this.pointer.active) {
      const rect = this.canvas.getBoundingClientRect();
      const dx = this.pointer.x - rect.left - playerScreenX;
      const dy = this.pointer.y - rect.top - playerScreenY;
      const d = Math.hypot(dx, dy);
      if (d < 4) return { x: 0, y: 0 };
      const m = Math.min(1, d / Math.max(scale, 1));
      return { x: (dx / d) * m, y: (dy / d) * m };
    }
    return { x: 0, y: 0 };
  }

  consumeDash(): boolean {
    const d = this.dashQueued;
    this.dashQueued = false;
    return d;
  }
}
