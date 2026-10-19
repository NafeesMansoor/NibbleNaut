// Headless balance simulation (not part of `npm test`). See tools/vitest.balance.config.ts.
import { it } from 'vitest';
import { canEat } from '../src/systems/growth';
import { World, type Controls } from '../src/game/World';
import { startConditionsFor } from '../src/systems/rewards';
import { evaluateTier } from '../src/systems/rewards';

function bot(w: World): Controls {
  const p = w.player;
  let fx = 0, fy = 0, dash = false;
  let best = Infinity, tx = 0, ty = 0, has = false;
  for (const f of w.fish) {
    const d = Math.hypot(f.x - p.x, f.y - p.y) - f.radius - p.radius;
    if (canEat(f.size, p.size) && d < 350 + f.radius * 2) {
      const k = 1 / Math.max(d, 10);
      fx += (p.x - f.x) * k; fy += (p.y - f.y) * k;
      if (d < 120 && f.state === 'chase') dash = true;
    } else if (canEat(p.size, f.size) && d < best) { best = d; tx = f.x; ty = f.y; has = true; }
  }
  for (const f of w.food) { const d = Math.hypot(f.x - p.x, f.y - p.y) * 1.5; if (d < best) { best = d; tx = f.x; ty = f.y; has = true; } }
  let mx = 0, my = 0;
  if (has) { const d = Math.hypot(tx - p.x, ty - p.y) || 1; mx = (tx - p.x) / d; my = (ty - p.y) / d; }
  if (fx || fy) { const d = Math.hypot(fx, fy); mx = mx * 0.2 + (fx / d) * 1.5; my = my * 0.2 + (fy / d) * 1.5; }
  return { moveX: mx, moveY: my, dash };
}

it('balance', () => {
  for (const tier of [null, 'great', 'plenty'] as const) {
    const res: string[] = []; const causes: string[] = [];
    for (let g = 0; g < 12; g++) {
      const c = startConditionsFor(tier);
      const w = new World({ startSize: c.startSize, ocean: c.ocean, speedBoostSeconds: c.speedBoostSeconds });
      const vw = 450, vh = 260;
      let t = 0;
      while (w.player.alive && t < 600) {
        const z = (10 / w.player.size) ** 0.6;
        w.setView(w.player.x, w.player.y, vw / z, vh / z);
        w.update(1 / 30, bot(w)); t += 1 / 30;
        for (const e of w.drainEvents()) if (e.type === 'playerEaten') { const by = e.by; causes.push(`${by.species.id}:${by.state}:${(by.size / w.player.size).toFixed(1)}x:age${by.age.toFixed(1)}`); }
      }
      res.push(`${Math.round(w.stats.score)}/${Math.round(w.stats.maxSize)}/${Math.round(t)}s/${evaluateTier(w.stats.score)}`);
    }
    console.log(tier ?? 'normal', res.join('  ')); console.log('  causes', causes.join(' '));
  }
}, 120000);
