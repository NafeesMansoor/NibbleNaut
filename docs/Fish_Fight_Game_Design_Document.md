# Fish Fight
## Game Design Document and Development Brief

**Tagline:** Eat. Grow. Survive. Rule the Ocean.

**Purpose:** This document is the source of truth for planning and building *Fish Fight*. Implement the core game first, then expand it in stages. Where details are not specified, use sensible defaults while preserving the mechanics and design principles described here.

---

## 1. Game Overview

*Fish Fight* is a colorful 2D underwater survival and growth game. The player starts as a small fish, eats smaller fish and other food to grow, avoids larger predators, explores the ocean, and tries to achieve the highest score possible.

Its signature feature is a **performance-based next-game reward system**. A strong performance can improve the player's starting conditions in the next game. An unbelievably amazing score unlocks **The Ocean of Plenty**, where the player still starts as a medium-sized fish but finds much more food and can grow faster.

### Core player fantasy

Start small, hunt wisely, survive dangerous encounters, grow into a powerful fish, and earn a better next adventure by playing exceptionally well.

### Design principles

1. **Easy to understand:** Smaller creatures are potential food; larger creatures are threats.
2. **Skill matters:** Movement, timing, escape decisions, and target selection should matter.
3. **Growth feels rewarding:** Eating should provide clear feedback and visible progress.
4. **Risk and reward:** Dangerous areas can contain better food, treasures, or rare creatures.
5. **Rewards improve opportunity, not guaranteed victory:** Even with a bonus, the player can still lose.
6. **Fair progression:** Unlockable cosmetics should not be pay-to-win.
7. **Build incrementally:** Make the core loop fun before implementing advanced content.

---

## 2. Core Gameplay Loop

1. Start a game as a small fish under normal conditions, unless a previous-game reward applies.
2. Swim around the ocean and look for food and prey.
3. Eat creatures that are sufficiently smaller than the player.
4. Gain growth points, increase size, and earn score.
5. Avoid or escape larger predators and environmental hazards.
6. Collect power-ups, discover rare fish, and explore the map.
7. Survive, grow, and aim for a high score.
8. At game over, show performance statistics and determine the reward for the next game.
9. Start another game with the earned starting advantage or special ocean condition, if eligible.

The loop should be quick to restart and satisfying to repeat.

---

## 3. Size, Eating, and Growth

### 3.1 Size rule

Use a configurable size comparison. A reasonable initial rule is:

- The player can eat a target if the player's size is at least **1.2 times** the target's size.
- A target too close to the player's size is not automatically edible.
- A larger predator can eat the player if it meets the corresponding size threshold and successfully catches or collides with the player.
- Tune the threshold after playtesting.

Keep the size threshold in configuration rather than hard-coding it in multiple places.

### 3.2 Growth

- Eating fish and food grants growth points.
- Eating a fish should generally grant more growth than eating ordinary food.
- Larger or rarer prey may grant more growth, but should involve greater risk.
- When enough growth points accumulate, increase the player's size.
- Visual scale, collision hitbox, and eating eligibility must remain synchronized.
- Growth should be visible and satisfying through animation, particles, sound, or UI feedback.
- The game should prevent a newly grown fish from immediately eating something that is still too large.

### 3.3 Example size stages

These are descriptive milestones, not necessarily rigid caps:

1. **Small Fish:** Normal starting stage. Fast or agile, but vulnerable.
2. **Medium Fish:** Can hunt more prey, while remaining vulnerable to larger predators.
3. **Large Fish:** Can eat many ordinary creatures and challenge more dangerous prey.
4. **Ocean Titan:** An enormous late-game size with a dramatic transformation effect. Legendary predators can still be a threat.

Use continuous size growth where practical, with stage labels or milestones layered on top. Do not force a player into a fixed stage if their actual size does not justify it.

---

## 4. Fish and Character Selection

The initial version can use one default fish. Add selectable fish after the core loop works.

Suggested character concepts:

- **Nemo Jr.:** Small orange fish with a quick-dash ability.
- **Blue Flash:** Fast tropical fish with a temporary speed boost.
- **Spike:** Pufferfish that inflates defensively for a short time.
- **Hammer:** Unlockable baby hammerhead with a powerful forward dash.

These are placeholder concepts and names. Character stats and abilities should be configurable. Do not make character selection a blocker for the first playable build.

---

## 5. Performance-Based Next-Game Rewards

This is a signature feature and must be implemented as a core system, not just a cosmetic effect.

### 5.1 Main rule

At the end of a game, evaluate the player's score or performance tier. Store the reward for the **next game only**. When the next game begins, apply the reward and mark it as consumed. Do not apply it indefinitely.

The reward improves the next game's starting conditions. It does not make the player invincible.

### 5.2 Reward tiers

Use configurable thresholds rather than fixed assumptions. Initial suggested tiers:

| Performance tier | Next-game reward |
|---|---|
| Normal score | Start as a small fish in a normal ocean |
| Good score | Start slightly larger than the normal starting size |
| Great score | Start as a medium-sized fish |
| Amazing score | Start as a medium-sized fish with a temporary speed boost |
| Unbelievably amazing score | Start as a medium-sized fish in **The Ocean of Plenty** |

Thresholds should be adjusted after playtesting. Consider score, survival time, size reached, and fish eaten when designing the final performance calculation. For the first version, score-based thresholds are simplest.

### 5.3 The Ocean of Plenty

An unbelievably amazing performance unlocks this special condition for the next game.

**Important:** The player still starts as a **medium-sized fish**, not a large fish. The advantage comes from the environment.

Changes in this special game:

- Much more food than in a normal ocean.
- More frequent plankton, shrimp, food bubbles, and other edible items.
- Faster food respawn rates.
- Special feeding zones that grant bonus growth.
- A distinctive golden or magical visual treatment to show the reward is active.
- More opportunities to grow quickly, while normal predator and eating rules remain in effect.

The reward provides an opportunity to become enormous, but the player still has to play well.

### 5.4 Reward lifecycle and edge cases

- A reward is earned at game over and applies to the next game.
- A reward must be consumed once when that next game starts.
- If the player earns a new reward in the rewarded game, save that new reward for the following game.
- Define and test behavior for restarting, refreshing, closing, and reopening the game.
- If progress persistence is implemented, store pending rewards reliably so refreshes do not duplicate or erase them unexpectedly.
- Display the active reward on the pre-game screen and during the game.
- Make it clear that The Ocean of Plenty is a special next-game bonus.

### 5.5 Reward presentation

When a reward is earned:

1. Show a celebration animation.
2. Display the score and reward tier.
3. Explain the next-game benefit.
4. For The Ocean of Plenty, show a preview of the food-rich ocean.
5. Provide a clear **Play Next Game** button.

Suggested message:

> **REWARD UNLOCKED: THE OCEAN OF PLENTY**  
> Your next game starts with a medium-sized fish and an ocean full of food. Eat, grow, and make the most of your advantage!

---

## 6. Ocean Environments and World Simulation

The ocean should feel alive, not like an empty background.

### 6.1 Initial environment types

- **Coral Reef:** Colorful, with smaller fish, food, and hiding spots.
- **Open Ocean:** Broad swimming areas, schools of fish, and larger predators.
- **Deep Sea:** Darker and more dangerous, with unusual creatures and valuable rewards.
- **Underwater Caves:** Narrow passages, ambush predators, and hidden treasure.

For the first playable build, implement one scrolling ocean environment. Add other environment types later.

### 6.2 Environmental systems

Possible systems to add incrementally:

- Schools of fish scatter when a predator approaches.
- Crabs hide between rocks.
- Jellyfish temporarily slow the player on contact.
- Sea urchins and other obstacles damage or hinder movement.
- Currents push fish in particular directions.
- Day-night cycles change visuals and possibly creature spawns.
- Rare golden fish appear occasionally and award bonus points.
- Giant predators can enter the map as dynamic threats.
- Food and creature spawn rates are configurable.

Environmental hazards must communicate their danger clearly and should not cause unavoidable, unfair deaths.

---

## 7. Food, Treasure, and Power-Ups

### 7.1 Food types

- **Plankton and tiny food particles:** Small growth rewards.
- **Shrimp:** A more valuable food source for small and medium fish.
- **Small fish:** Growth and score.
- **Larger prey:** More growth and score, with increased risk.
- **Golden or rare food:** Occasional bonus rewards.
- **Feeding zones:** Areas with concentrated food and possible bonus growth.

### 7.2 Treasure

Treasure chests may contain coins, temporary power-ups, or bonus growth. Place treasure in interesting but reasonably reachable areas. Do not let treasure replace the core eat-and-grow loop.

### 7.3 Power-ups

- **Speed Boost:** Move faster for a limited duration.
- **Bubble Shield:** Survive one predator attack.
- **Food Magnet:** Pull nearby food toward the player.
- **Growth Burst:** Temporarily increase growth earned from food.

Power-ups should have clear visual indicators, durations, and cooldowns where appropriate. Prevent stacking exploits unless stacking is intentional.

---

## 8. Special Abilities

Possible character-specific abilities:

- Fast tropical fish: quick dash.
- Pufferfish: temporarily inflate to deter predators.
- Shark: powerful forward charge.
- Future fish: stealth, a short shield, or a special escape move.

For the first version, implement at most one ability, such as a dash. Add additional abilities only after movement and eating feel good.

---

## 9. Game Modes

All modes use the same basic eat-or-be-eaten rules, with different objectives.

### 9.1 Survival Mode

- Stay alive as long as possible.
- Grow and achieve the highest score.
- Track survival time and personal best.
- This should be the first and primary mode to implement.

### 9.2 King of the Ocean

- Become the biggest fish before the timer runs out.
- The winner is determined by size or a clearly explained combination of size and score.
- Can initially be played against AI fish.

### 9.3 Ocean Adventure

- Complete missions, explore caves, find treasures, and defeat bosses.
- Add this after the core survival loop is stable.

### 9.4 Fish Fight Arena

- Compete against computer-controlled fish.
- Online multiplayer is a possible future expansion, not a requirement for the first release.

---

## 10. Bosses and Major Encounters

Future boss concepts include:

- Giant octopus.
- Barracuda.
- Legendary shark.
- Deep-sea monster.

Boss encounters should use readable patterns and fair warnings. Defeating a boss can reward coins, cosmetic unlocks, or achievements. Bosses are future content and should not delay the first playable version.

---

## 11. Scoring, Coins, and Achievements

### 11.1 Scoring

Award points for:

- Eating fish.
- Collecting food.
- Eating rare creatures.
- Surviving for longer periods.
- Completing objectives.
- Defeating bosses in future versions.

The score formula should be configurable. Avoid making passive survival more rewarding than active play unless that is intentional.

### 11.2 Coins and customization

Players can earn coins by playing and completing missions. Coins can unlock:

- Fish skins and color variants.
- Hats and accessories.
- Fin styles.
- Swimming trails.
- Other cosmetic items.

Keep customizations cosmetic so players do not need to pay to become stronger.

### 11.3 Achievement ideas

- **First Hunt:** Eat your first fish.
- **Growing Strong:** Reach medium size.
- **Shark Survivor:** Escape a shark.
- **Ocean Champion:** Become the biggest fish in a game.
- **Golden Hunter:** Catch a rare golden fish.
- **Legendary Feeder:** Unlock The Ocean of Plenty.

Achievements can be added after the core loop and reward system are working.

---

## 12. User Interface and Controls

The interface should be simple and readable, especially on mobile screens.

### 12.1 In-game HUD

- **Top-left:** Player fish name and current size.
- **Top-center:** Score and elapsed time.
- **Top-right:** Pause button and settings.
- **Bottom-left on mobile:** Virtual joystick.
- **Bottom-right on mobile:** Dash or special ability button.
- **Growth bar:** Progress toward the next growth milestone.
- **Reward indicator:** Clearly show when a next-game bonus is active.

For desktop, support **WASD** and **arrow keys** for movement, **Space** for dash if implemented, and **Escape** for pause.

### 12.2 Screens

Plan for these screens:

1. Main menu.
2. Fish selection, when implemented.
3. Mode selection, when implemented.
4. Pre-game reward preview.
5. Gameplay.
6. Pause menu.
7. Game-over summary.
8. Reward-unlocked celebration.
9. Settings.

For the first version, the main menu, gameplay, pause, game-over, and reward feedback are enough.

### 12.3 Game-over summary

Display:

- Final score.
- Fish eaten.
- Maximum size reached.
- Survival time.
- Personal best, if applicable.
- Reward tier earned.
- Description of the next-game reward.
- Restart / Play Next Game button.

Make restarting fast. Avoid unnecessary loading or menus between runs.

---

## 13. Visual and Audio Direction

### Visual style

- Colorful, friendly, polished 2D cartoon art.
- Readable silhouettes so players can recognize fish size and danger quickly.
- A lively ocean with coral, seaweed, bubbles, rocks, and light rays.
- Clear visual distinction between food, edible prey, predators, hazards, and power-ups.
- A special golden or magical visual treatment for The Ocean of Plenty.
- Satisfying growth animations and small effects when food is eaten.

The visual style should remain consistent. Placeholder assets are acceptable in the prototype, but the code should make it easy to replace them.

### Audio

Add gradually:

- Gentle underwater ambience.
- Eating sound.
- Growth sound.
- Warning cue when a dangerous predator is close.
- Power-up sound.
- Reward celebration sound.
- Game-over and achievement sounds.

Audio should be configurable and have volume controls. Do not make audio necessary for understanding danger; visual cues should also communicate it.

---

## 14. Technical Direction

### Recommended first implementation

Build a browser-playable game using **HTML5 Canvas with JavaScript or TypeScript**, or a game framework such as **Phaser**. Choose the simplest architecture that supports responsive controls and future expansion.

Target:
- Desktop browsers.
- Mobile browsers.
- Tablet screens.

Keep the first release single-player with AI fish. Multiplayer is explicitly a future possibility.

### Suggested architecture

Organize code into clear modules or equivalent components:

- `Game`: main loop, state, start/restart, pause.
- `Player`: movement, size, health or survival state, abilities.
- `FishEntity`: AI fish behavior, size, species, edible status.
- `FoodEntity`: food behavior and growth value.
- `PredatorAI`: hunting, fleeing, and target selection.
- `SpawnManager`: spawn rules and population limits.
- `CollisionSystem`: collision detection and eating/attack resolution.
- `GrowthSystem`: growth points, size changes, thresholds.
- `ScoreSystem`: score and performance metrics.
- `RewardSystem`: reward tier evaluation and next-game reward lifecycle.
- `OceanSystem`: environment, currents, feeding zones, and spawn multipliers.
- `PowerUpSystem`: pickup, duration, effects, and cooldowns.
- `UI`: HUD, menus, game-over, and reward screens.
- `AudioManager`: sound effects and settings.
- `SaveSystem`: local persistence for settings, best score, unlocks, and pending rewards.

These are conceptual boundaries, not mandatory filenames. Avoid putting the entire game in one large file. Use configuration for balancing values such as size thresholds, scores, spawn rates, reward tiers, and power-up duration.

### Persistence

For the first browser prototype, local storage can preserve:

- Best score.
- Settings.
- Cosmetic unlocks.
- Pending next-game reward.

Keep the save format versioned or easy to migrate. Never apply a pending reward more than once.

### Performance and responsiveness

- Keep entity counts bounded.
- Avoid unnecessary allocations inside the main game loop.
- Use delta time for movement so gameplay speed is not tied to frame rate.
- Handle window resizing and mobile orientation changes.
- Make touch controls responsive.
- Pause or handle the game sensibly when the tab is hidden.
- Test on modest mobile hardware.

---

## 15. Development Roadmap

Build in phases. Do not implement all ideas at once.

### Phase 1: Minimum Playable Game

Must include:

- One ocean environment.
- One player fish.
- AI fish of different sizes.
- Basic movement.
- Eat-or-be-eaten rules.
- Growth and size changes.
- Basic food spawning.
- Predators that can eat the player.
- Score and survival timer.
- Game-over screen and quick restart.

**Acceptance criteria:** A player can start, move, eat smaller fish, grow, avoid larger fish, lose, see a result, and restart without errors.

### Phase 2: AI and Game Feel

Add:

- AI fish that seek smaller prey and flee from larger predators.
- Improved spawn behavior and population limits.
- Growth animations and eating feedback.
- Clear warning cues.
- Balanced movement and size rules.
- Mobile touch controls and desktop keyboard controls.

**Acceptance criteria:** Fish behavior feels understandable, danger is readable, and gameplay remains responsive.

### Phase 3: Next-Game Reward System

Add:

- Performance tiers.
- Configurable reward thresholds.
- One-time pending reward storage.
- Slightly larger starting size for a good score.
- Medium-sized starting fish for a great score.
- Medium-sized fish plus temporary speed boost for an amazing score.
- The Ocean of Plenty for an unbelievably amazing score.
- Reward-unlocked screen and next-game preview.
- Correct reward consumption and persistence behavior.

**Acceptance criteria:** A qualifying run unlocks the right reward; it applies to the next game only; The Ocean of Plenty starts the player at medium size with increased food abundance; a reward earned during that game is saved for the following game.

### Phase 4: Content and Progression

Add:

- More fish types.
- Character abilities.
- Power-ups.
- Coins and cosmetics.
- Achievements.
- Additional ocean environments.
- Treasure and rare fish.

### Phase 5: Modes and Advanced Content

Add:

- King of the Ocean.
- Ocean Adventure.
- Fish Fight Arena against AI.
- Boss encounters.
- More missions and unlocks.

### Phase 6: Polish and Release

Add:

- Sound and music.
- Accessibility and settings.
- Performance optimization.
- Save migration and error handling.
- Device and browser testing.
- Bug fixes and gameplay balance.

---

## 16. Initial Balancing Configuration

Use these as starter values, not permanent rules:

| Setting | Suggested initial value |
|---|---:|
| Normal starting size | 10 |
| Medium starting size | 25 |
| Eat-size multiplier | 1.2 |
| Normal food spawn rate | Configurable baseline |
| Ocean of Plenty food spawn multiplier | 2.5x baseline |
| Ocean of Plenty food respawn | Faster than normal |
| Speed boost duration | 5 seconds |
| Bubble shield | Absorbs one predator attack |
| Reward duration | Next game only |

All values should be centralized in a configuration file or equivalent. Playtest and tune them. Ensure that food abundance feels exciting without making growth completely automatic.

The example sizes are abstract gameplay units, not pixels. Visual scale should be derived consistently from the size value.

---

## 17. Important Edge Cases to Test

- A player and target are exactly at the eating threshold.
- Two entities collide at nearly the same time.
- A predator reaches the player while the player grows.
- The player eats multiple food items in one frame.
- Food or fish spawn outside the playable area.
- The screen is resized during gameplay.
- The game loses focus or the browser tab becomes hidden.
- The player restarts before the game-over reward is finalized.
- The player refreshes after earning a pending reward.
- A pending reward is consumed, then the game is refreshed.
- The player earns another reward during a bonus game.
- The Ocean of Plenty's spawn rates do not overload performance.
- The player cannot get trapped in an unavoidable collision.
- Touch controls work without blocking normal page interactions.

---

## 18. Claude Development Instructions

Use this document as the game specification.

1. **Inspect the existing project first**, if a repository or starter project is provided. Identify its framework, scripts, structure, and current functionality before changing files.
2. If no project exists, choose a simple, well-supported browser game setup using JavaScript/TypeScript and HTML5 Canvas or Phaser.
3. **Implement Phase 1 first.** Deliver a playable game before building extra modes, complex progression, or multiplayer.
4. Keep the code modular, readable, and easy to extend.
5. Centralize balance settings, including size thresholds, growth values, spawn rates, score rules, and reward thresholds.
6. Treat the next-game reward system and The Ocean of Plenty as core requirements. Do not replace the food-rich medium-start reward with a large starting fish.
7. Use placeholder art if needed, but keep asset references organized so visuals can be replaced later.
8. Test the main gameplay loop and the reward lifecycle. Fix errors before moving to the next phase.
9. Do not silently remove existing functionality if extending an existing project.
10. Provide clear run and build instructions, summarize changed files, and list any known limitations.
11. If a detail is unspecified, make a sensible choice, document it briefly, and continue instead of stopping for nonessential questions.
12. After Phase 1 works, report what is complete and what remains before proceeding with the next phase.

### First task

Start by inspecting the repository or creating the project structure. Then implement **Phase 1: Minimum Playable Game** with clean code, responsive controls, a playable ocean, fish of different sizes, eating and growth, predator danger, scoring, game over, and restart. Keep the architecture ready for Phase 3's reward system, but prioritize a reliable, fun core loop first.

---

## 19. Definition of a Successful First Release

The first release is successful when:

- The player understands the goal without a long tutorial.
- Movement feels responsive on desktop and mobile.
- Smaller fish can be eaten and increase the player's size.
- Larger predators pose a real but fair threat.
- The score and growth feedback are clear.
- Game over and restart work reliably.
- A high score can grant a one-time next-game advantage.
- An unbelievably amazing score unlocks The Ocean of Plenty.
- The Ocean of Plenty starts the player at medium size and has noticeably more food, faster food respawn, and bonus feeding opportunities.
- The reward is applied to the next game only and cannot be duplicated through refresh or restart exploits.
- The game is structured so new fish, modes, environments, and power-ups can be added without rewriting the core.

---

**Core identity of Fish Fight:** Every meal helps you grow, every predator creates a decision, and every outstanding performance can make your next ocean adventure more rewarding.
