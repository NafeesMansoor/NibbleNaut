import { CONFIG } from '../config';
import { clamp, damp } from '../core/math';
import type { Body, Fish } from '../game/entities';
import type { World } from '../game/World';
import { canEat } from './growth';

/**
 * Fish behaviour: flee anything that can eat you, hunters chase the nearest thing they can eat,
 * everyone else wanders. Sensing is throttled; steering runs every frame.
 */
export function updateFishAI(w: World, f: Fish, dt: number): void {
  const ai = CONFIG.ai;
  f.age += dt;
  f.stateTime += dt;
  f.senseTimer -= dt;
  f.restTime = Math.max(0, f.restTime - dt);
  f.ateThisFrame = false;

  if (f.target && !f.target.alive) f.target = null;
  if (f.threat && !f.threat.alive) f.threat = null;
  if ((f.state === 'chase' && !f.target) || (f.state === 'flee' && !f.threat)) setState(f, 'wander');

  if (f.senseTimer <= 0) {
    f.senseTimer = ai.senseInterval * (0.8 + 0.4 * w.rng());
    sense(w, f);
  }

  // Hunters tire out, so a determined escape always works.
  if (f.state === 'chase' && f.stateTime > ai.chaseMaxSeconds) {
    setState(f, 'wander');
    f.target = null;
    f.restTime = ai.restSeconds;
  }

  const sp = f.speed;
  let tx = 0;
  let ty = 0;
  let rate = 2;
  if (f.state === 'flee' && f.threat) {
    const dx = f.x - f.threat.x;
    const dy = f.y - f.threat.y;
    const d = Math.hypot(dx, dy) || 1;
    tx = (dx / d) * sp;
    ty = (dy / d) * sp;
    rate = 5;
  } else if (f.state === 'chase' && f.target) {
    const dx = f.target.x - f.x;
    const dy = f.target.y - f.y;
    const d = Math.hypot(dx, dy) || 1;
    const chase = f.target === w.player ? Math.min(sp, w.player.cruiseSpeed * ai.maxChaseVsPlayer) : sp;
    tx = (dx / d) * chase;
    ty = (dy / d) * chase;
    rate = 4;
  } else {
    f.wanderAngle += (w.rng() - 0.5) * 2.4 * dt;
    // Steer away from the surface and the seabed before touching them.
    const s = Math.sin(f.wanderAngle);
    if ((f.y < 160 + f.radius && s < 0) || (f.y > w.seabedY - 140 - f.radius && s > 0)) f.wanderAngle = -f.wanderAngle;
    tx = Math.cos(f.wanderAngle) * sp * ai.wanderSpeedMul;
    ty = Math.sin(f.wanderAngle) * sp * ai.wanderSpeedMul;
  }

  f.vx = damp(f.vx, tx, rate, dt);
  f.vy = damp(f.vy, ty, rate, dt);
  f.x += f.vx * dt;
  f.y += f.vy * dt;
  if (w.clampToWater(f)) f.wanderAngle += Math.PI;

  if (Math.abs(f.vx) > 3) f.facing = f.vx < 0 ? -1 : 1;
  const speed = Math.hypot(f.vx, f.vy);
  if (speed > 3) f.tilt = damp(f.tilt, clamp(Math.atan2(f.vy, Math.abs(f.vx)), -0.6, 0.6), 6, dt);
  f.tailPhase += dt * (4 + (speed / f.radius) * 1.5);
}

function playerChasers(w: World): number {
  let n = 0;
  for (const o of w.fish) if (o.alive && o.state === 'chase' && o.target === w.player) n++;
  return n;
}

function setState(f: Fish, state: Fish['state']): void {
  if (f.state !== state) {
    f.state = state;
    f.stateTime = 0;
  }
}

function sense(w: World, f: Fish): void {
  const ai = CONFIG.ai;
  const p = w.player;

  // 1. Threats: anything that can eat this fish, measured edge-to-edge.
  const fleeR = (ai.fleeRadiusBase + f.radius * ai.fleeRadiusPerRadius) * (f.golden ? 1.6 : 1);
  let threat: Body | null = null;
  let best = Infinity;
  if (p.alive && canEat(p.size, f.size)) {
    const d = Math.hypot(p.x - f.x, p.y - f.y) - p.radius;
    if (d < fleeR && d < best) {
      best = d;
      threat = p;
    }
  }
  for (const o of w.fish) {
    if (o === f || !o.alive || !canEat(o.size, f.size)) continue;
    const d = Math.hypot(o.x - f.x, o.y - f.y) - o.radius;
    if (d < fleeR && d < best) {
      best = d;
      threat = o;
    }
  }
  if (threat) {
    setState(f, 'flee');
    f.threat = threat;
    f.target = null;
    return;
  }
  f.threat = null;
  if (f.state === 'flee') setState(f, 'wander');

  // 2. Hunting: hunters pick the nearest edible body, with a slight preference for the player.
  if (!f.aggressive || f.restTime > 0) return;
  const huntR = ai.huntRadiusBase + f.radius * ai.huntRadiusPerRadius;
  let prey: Body | null = null;
  best = Infinity;
  if (p.alive && p.protectTime <= 0 && canEat(f.size, p.size) && (f.target === p || playerChasers(w) < ai.maxPlayerChasers)) {
    const d = (Math.hypot(p.x - f.x, p.y - f.y) - p.radius) * 0.8;
    if (d < huntR) {
      best = d;
      prey = p;
    }
  }
  for (const o of w.fish) {
    if (o === f || !o.alive || !canEat(f.size, o.size)) continue;
    const d = Math.hypot(o.x - f.x, o.y - f.y) - o.radius;
    if (d < huntR && d < best) {
      best = d;
      prey = o;
    }
  }
  if (prey) {
    // Retargeting keeps the chase timer running, so switching prey can't extend a chase.
    if (f.state !== 'chase') setState(f, 'chase');
    f.target = prey;
  } else if (f.state === 'chase') {
    setState(f, 'wander');
    f.target = null;
  }
}
