# Changelog

All notable changes to NibbleNaut (formerly Fish Fight). Versions follow [semantic versioning](https://semver.org/); see `docs/PWA.md` for the release rules.

## [3.0.1] - 2026-10-21

Major version approved by the project owner (from 2.1.1; the version number 3.0.1 was requested).

### Changed
- **Fish Fight is now NibbleNaut** — *An Adventure in the Bay of Bengal* · *Eat. Grow. Explore. Survive.* New name, subtitle and slogan on the home screen, in Settings, the page title, the installed-app name and update notices, in English and Bangla (নিবলনট · বঙ্গোপসাগরে এক অভিযান · খাও। বড় হও। ঘুরে দেখো। টিকে থাকো।).
- Existing players keep everything: points, owned and selected fish, best score, settings, language and seen facts. The storage keys, offline-cache prefix, app identity and web address are unchanged; installed copies update in place and just show the new name.
- More bonus fish: they appear almost three times as often (7% of spawns, up to three at once), and there are now three kinds: Golden Ilish (+500), Lakkha (+400) and Silver Rupchanda (+300). The floating text says "BONUS!".

### Added
- New fish from the Bay of Bengal: Indian Mackerel (schools), Mangrove Red Snapper (an ambush hunter) and the Whale Shark, a gentle giant that never eats you and gets no danger outline.
- 15 new fun facts (45 in all), with Bangla: Bangladesh's 740 marine fish species, fresh-to-salty water, mangrove nurseries, the hilsa's two homes, sea animals at risk, whale sharks, giant trevally, Indian mackerel, blacktip sharks, snappers and groupers, Irrawaddy dolphins, Bryde's whales, olive ridley hatchlings, cuttlefish and octopuses, and jellyfish. Two new topics with their own colours: Amazing fish and Sea animals.

## [2.1.1] - 2026-10-20

### Fixed
- Rotating a phone no longer zooms the game: mobile browsers can no longer enlarge text on rotation (`text-size-adjust`), pinch and double-tap zoom are disabled, and the game canvas re-measures itself whenever its size changes (including late or missed rotation events), so it never stays stretched.
- Every screen now fits the display without scrolling, in portrait and landscape, like a mobile game. On short landscape screens the menu, pause and game-over screens use two columns, the shop shows a grid of compact fish cards, and How to play splits into columns. Small portrait phones get a compact shop grid and one-row game-over stats. Whatever still doesn't fit is scaled down smoothly (to no less than 55%) instead of scrolling.

## [2.1.0] - 2026-10-20

Major version bump approved by the project owner (from 1.2.0; 1.3.0 was never released).

### Added
- Bangla language (বাংলা). Switch between English and বাংলা in Settings (reachable from the home and pause screens); the choice is saved, and first-time players whose device is set to Bangla start in Bangla.
- Everything is translated: menus, HUD, banners, floating points, rewards, size stages, settings, How to play, the shop, game-over screen, update notices, every fish name and description, and all 30 Bay of Bengal fun facts. Numbers and times use Bangla digits. Scientific names stay in Latin.
- Bundled Hind Siliguri font (Bengali subset) so Bangla renders the same everywhere, including offline.

### Changed
- The game-over screen no longer shows a fun fact when your fish was eaten (the predator's card is shown instead). Ending a run yourself still shows one.

## [1.2.0] - 2026-10-20

### Added
- Bay of Bengal "Fun fact!" cards: 30 facts, each with a headline figure and an emoji (area, depth, the Sundarbans, the Bengal Fan, hilsa, cyclones, dolphins, turtles and more). Designed for young players: the player's own fish sits in the card's header and tells the fact in a speech bubble, each topic has its own bright colour theme, and bubbles drift behind the card. Shown on the home menu (with a "Tell me another!" button), the pause screen and the game-over screen.
- Settings → "Show Bay of Bengal fun facts" turns the cards on or off (on by default; older saves get the default).
- Facts not yet seen on this device are shown first, and no fact repeats until all have appeared.

### Fixed
- Upgrade Fish shop on phones now shows each fish's picture (it was hidden on screens narrower than 420 px). On phones the buy/select button moves under the fish.

## [1.1.0] - 2026-10-20

### Changed
- Bay of Bengal cast: all AI fish are now real Bay of Bengal reef species (Blue-and-gold Fusilier, Blue Demoiselle, Splitlevel Hogfish, Raccoon and Copperband Butterflyfish, Vermiculated Angelfish, Humpback Grouper, Common Dolphinfish, Blacktip Reef Shark, Bull Shark). The rare golden fish is now the Golden Ilish.
- Player fish renamed to real species (Clark's Anemonefish, Threespot Angelfish, Miniatus Grouper, Giant Trevally, Grey Reef Shark, Humphead Wrasse). Ids, prices and multipliers are unchanged, so saves and purchases carry over.
- Brighter cartoon-reef scenery: cyan-to-royal-blue water, stronger sun rays, white sand, violet/amber branching corals, golden brain corals, pink anemones, green and purple seaweed, grey rocks, and drifting jellyfish.
- Fish art supports separate tail colours, spots and horizontal bands.

### Added
- Game-over fact cards: your fish and the fish that ate you (or your most-eaten fish when you end the run), each with a picture, scientific name and a short description.

## [1.0.3] - 2026-10-19

Version jumps from 0.1.0 to 1.0.3 at the project owner's request (major bump approved).

### Added
- Installable PWA: web app manifest, app icons (including maskable), fullscreen display.
- Offline play: a service worker generated at build time precaches the whole game under a versioned cache (`fish-fight-v1.0.3`).
- Safe updates: new releases install in the background and never interrupt a match. On the main menu they apply automatically; on the game-over screen an "Update now" button appears; during a match players are told to finish first. A confirmation shows after updating.
- Update checks on launch, when returning to the game, and at most hourly.
- Version shown on the main menu and in Settings.
- Save backups: an older-version or corrupt save is copied to a backup key before it is migrated or replaced.
- Release checks (`npm run release:check`) and CI that verify the version bump, changelog, service worker version, precache list and manifest.
- Cache headers for Netlify / Cloudflare Pages (`public/_headers`).

## [0.1.0] - 2026-10-19

### Added
- Playable game: Phases 1–3 of the design document (growth, AI, next-game rewards, Ocean of Plenty).
- Points bank: every game's score is saved on the device and shown on the home screen.
- Upgrade Fish shop: exchange points for advanced fish that earn ×1.25 to ×3 feeding points.
- Save format v2 with migration from v1.
