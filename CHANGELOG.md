# Changelog

All notable changes to Fish Fight. Versions follow [semantic versioning](https://semver.org/); see `docs/PWA.md` for the release rules.

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
