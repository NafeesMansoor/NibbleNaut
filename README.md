# Fish Fight

**Eat. Grow. Survive. Rule the Ocean.**

A colorful 2D underwater survival-and-growth game for desktop and mobile browsers. You start as a small fish, eat smaller fish and food to grow, and avoid bigger predators. A strong score earns a better start in your next game. An unbelievably amazing score unlocks **The Ocean of Plenty**.

## Credits

**Story, game design and code: Nabeeha Mansoor**

The full design brief is in [docs/Fish_Fight_Game_Design_Document.md](docs/Fish_Fight_Game_Design_Document.md).

---

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # play at the URL Vite prints (http://localhost:5173)
npm test           # unit + simulation tests
npm run build      # type-check and build a static site into dist/
npm run preview    # serve the built site
npm run balance    # headless bot plays many games; prints scores per reward tier
```

`dist/` is a plain static site with relative paths, so it can be hosted from any folder (GitHub Pages, Netlify, itch.io and so on).

## How to play

| | Desktop | Touch |
|---|---|---|
| Swim | WASD / arrow keys, or hold the left mouse button | Drag anywhere on the left side |
| Dash | Space (or right-click) | DASH button, bottom-right |
| Pause | Esc / P, or the pause button | Pause button |

- You can eat fish that are at least **1.2×** smaller than you.
- Fish that can eat you have a **red outline**. Hunters chasing you also show a **!**, and red arrows at the screen edge point to hunters you can't see yet.
- You get 2.5 seconds of spawn protection at the start of every game (shown as a shimmering ring).

## Next-game rewards

Your final score decides the reward. It applies to **the next game only**.

| Score | Next game |
|---|---:|
| under 1,200 | Small fish, normal ocean |
| 1,200+ **Good** | Slightly larger start (size 15) |
| 3,000+ **Great** | Medium start (size 25) |
| 6,000+ **Amazing** | Medium start + 10 s speed boost |
| 10,000+ **Unbelievably Amazing** | Medium start in **The Ocean of Plenty** |

In The Ocean of Plenty you still start medium-sized (never large). Instead, the ocean holds 2.5× more food, refills it 3× faster, has more shrimp and food bubbles, and has seven golden **feeding zones** where food gives double growth and double points. Normal predator rules still apply.

The reward is saved the moment a run ends and cleared the moment the next game starts:
- Refreshing after earning a reward keeps it.
- Refreshing after starting the rewarded game does not bring it back.
- A reward earned during a bonus game is saved for the game after it.
- "End run" from the pause menu counts as a game over and still earns a reward.

## Points and Upgrade Fish

Every game's final score is added to a points bank saved on this device (`localStorage`), shown on the home screen. Points are spent in **Upgrade fish** (home screen) on new fish. Advanced fish multiply the points for everything they eat (food and fish, including golden fish); survival and stage-up bonuses are not multiplied. Higher feeding points also make reward tiers easier to reach.

| Fish | Cost | Feeding points |
|---|---:|---:|
| Nemo Jr. | free | ×1 |
| Sunny Tang | 3,000 | ×1.25 |
| Lionfish | 8,000 | ×1.5 |
| Silver Blade | 20,000 | ×2 |
| Hammerhead | 50,000 | ×2.5 |
| Golden Dragon | 120,000 | ×3 |

The catalog and prices live in `src/game/playerFish.ts`. Purchases are saved immediately. Saves from the previous version migrate with 0 points and Nemo Jr.

## What's implemented

The design document's roadmap, Phases 1 to 3:

- **Phase 1 – Minimum playable game.** Scrolling reef ocean, one player fish (Nemo Jr.), eight AI species from minnows to the Leviathan, eat-or-be-eaten, continuous growth with four stages (Small, Medium, Large, Ocean Titan), food spawning, score and timer, game over and instant restart.
- **Phase 2 – AI and game feel.** Fish flee from anything that can eat them. Hunters chase smaller fish, give up after 3.5 s, and at most 2 may hunt you at once. Minnows swim in schools that scatter. Eat bursts, floating points, growth pulse, stage-up banners, danger outlines, edge arrows, a red danger vignette and a heartbeat cue. Dash ability. Keyboard, mouse and touch controls.
- **Phase 3 – Next-game rewards.** All five tiers, one-time pending reward stored in `localStorage`, reward card on the menu, reward chip in the HUD, celebration with confetti and a fanfare, and an animated Ocean of Plenty preview on the game-over screen.
- **Extras:** rare golden fish (+500 points), synthesized sound effects and ambience, settings (volume, mute, danger outlines), auto-pause when the tab is hidden or loses focus, and a live ocean behind the menu.

## Not yet implemented (Phases 4–6)

Fish abilities beyond feeding points, power-ups (shield, magnet, growth burst), cosmetics, achievements, extra environments (deep sea, caves), treasure chests, the other game modes (King of the Ocean, Ocean Adventure, Arena), bosses, music, and playtesting on real devices.

## Project layout

```
src/
  config.ts            all balance values (sizes, speeds, spawns, scores, reward thresholds)
  credits.ts
  main.ts              entry point
  game/
    World.ts           headless simulation: player update, events, run stats
    Game.ts            main loop and screen state machine, reward lifecycle wiring
    entities.ts        Player, Fish, Food, FeedingZone
    playerFish.ts      buyable player fish: looks, prices, feeding-point multipliers
    species.ts         species looks and temperaments
  systems/
    ai.ts              flee / hunt / wander
    collision.ts       deterministic eating resolution
    spawn.ts           population limits, off-screen spawns, Ocean of Plenty food and zones
    growth.ts          eat rule, size ↔ radius, stages, speed curve
    score.ts           points and run stats
    rewards.ts         tier evaluation, start conditions, RewardLedger
    save.ts            versioned, validated localStorage save (points bank, owned fish)
    shop.ts            Upgrade Fish shop: buy and select fish with points
  render/
    Renderer.ts        camera, draw order, gameplay cues (outlines, arrows, vignette)
    backdrop.ts        distant parallax reef ridges, kelp silhouettes, far-off fish schools
    ocean.ts           sun shafts, caustics, marine snow, surface from below, vignette
    decor.ts           seabed scenery: rocks, kelp, sea grass, corals, sponges, anemones…
    textures.ts        procedural caustic / sand / light-shaft textures (no image files)
    fishArt.ts, effects.ts
  ui/UI.ts             DOM menus, HUD, game-over and reward screens
  audio/AudioManager.ts
  input/Input.ts
tests/                 eat rule, growth, rewards lifecycle, save, world simulation
tools/balance.test.ts  greedy-bot balance simulation (npm run balance)
```

The underwater look comes from layering, back to front: water colour by depth → hazy distant ridges and far-off fish schools (parallax) → slanted sun shafts → fine drifting particles → back-row reef (kelp, rocks, coral, softened by water haze) → textured sand → front-row details (anemones, starfish, shells, urchins, sea grass) → moving caustic light on the seabed → gameplay → big out-of-focus specks in front → vignette. Every texture is generated in code at startup.

The simulation (`World`) has no DOM or canvas access, so it runs headless in tests and in the balance tool. All art is drawn procedurally from each fish's hitbox radius. To swap in sprites, replace `drawFish` in `src/render/fishArt.ts`.

## Design decisions (not specified in the brief)

- **Fair hunters.** A hunter chasing you swims at most 92% of your cruising speed, and at most two fish hunt you at once. Swimming away cleanly always works; danger comes from ambushes, being cornered and inattention. Without this cap, playtest simulations showed medium-start reward games dying within seconds.
- **Gentle openings.** Threat spawns ramp up over the first 25 seconds. Fish always spawn off-screen.
- **Contact rule.** Any fish at least 1.2× your size eats you on contact. Only some fish of the hunter species actively chase.
- **Simultaneous contacts.** Each frame, you eat first, then predators check against your updated size.
- **Amazing speed boost** lasts 10 s, so it's noticeable at the start of a game. The brief's 5 s value is for the future speed power-up.
- **Score.** Fish = 10 + 5 × size, food 2–12, stage-up +250, golden fish +500, survival 1 pt/s (kept low so hunting beats hiding).

## Known limitations

- Reward thresholds are tuned against a simple bot, not human players. Adjust `CONFIG.rewards.thresholds` after real playtests.
- Refreshing during a rewarded game loses that reward. This is intended, so a refresh can never duplicate one.
- Not yet tested on physical phones or tablets. Touch controls were exercised only in desktop browsers.
- Sound is synthesized placeholder audio.
