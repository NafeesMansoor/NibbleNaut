# NibbleNaut (formerly Fish Fight) PWA: Version Control, Service Worker Updates, and Release Management

## 1. Standing Rules

Treat version control and PWA update management as mandatory parts of NibbleNaut development, not optional maintenance tasks.

- Follow semantic versioning: `MAJOR.MINOR.PATCH`.
- Bump the version on every push that changes the deployed application.
- Never deploy an application change without updating its version.
- Every production release must generate a detectable service worker update.
- Existing players must receive the latest version without manually clearing browser caches or reinstalling the PWA.
- Never allow an update to unexpectedly interrupt an active game session.
- Preserve player progress, settings, unlocked content, and other persistent data across application updates.
- Do not introduce breaking changes to saved game data without a migration strategy.
- Never increase the major version without asking me first.
- Keep the Git history understandable, with versioned commits that double as a release log.

These rules apply to NibbleNaut whether it is deployed through GitHub Pages, another static host, or a hosting platform with automated deployments.

## 2. Version Bump on Every Push

Use semantic versioning as follows.

| Change type | Version rule | Examples |
|---|---|---|
| Patch | `X.Y.Z+1` | Bug fixes, balancing adjustments, configuration changes, asset corrections, small gameplay fixes |
| Minor | `X.Y+1.0` | New game mechanics, fish species, game modes, progression systems, major UI features |
| Major | Requires explicit approval | Breaking changes, significant architectural changes, or a major release milestone |

Examples during development:

- `0.1.0` → Initial playable prototype.
- `0.1.1` → Fix fish collision detection.
- `0.1.2` → Adjust food spawning and correct a scoring bug.
- `0.2.0` → Introduce a new game mode.
- `0.2.1` → Fix a defect in the new mode.
- `0.3.0` → Introduce a progression or reward system.
- `1.0.0` → First stable public release, once approved.

Use `1.0.0` for the first stable public release. During development, use `0.x.y` versions until the release is ready.

### Required workflow

Before every push:

1. Determine the appropriate version bump.
2. Update the single authoritative application version.
3. Ensure the service worker's version or cache identifier changes.
4. Update the changelog or release notes.
5. Run the relevant tests and build checks.
6. Commit with the new version in the commit message.
7. Push and verify the deployed release.

Commit examples:

- `v0.1.1: Fix fish collision detection`
- `v0.1.2: Improve food spawning`
- `v0.2.0: Add survival game mode`

Do not create a new version merely to make an unrelated, non-deployed documentation edit appear to be an application release. However, any push that changes the deployed application must follow the version-bump rule.

### Version consistency

Maintain one authoritative version source, preferably a version file or build configuration.

Expose the current version in the application where practical, such as in the settings, pause menu, or an About section. Generate the service worker cache identifier from this version during the build, or explicitly synchronize it as part of the release workflow.

Do not allow the displayed version, build version, and service worker version to drift apart.

## 3. Service Worker Cache Versioning

Use versioned cache names, for example:

- `fish-fight-v0.1.0`
- `fish-fight-v0.1.1`
- `fish-fight-v0.2.0`

Every application version that changes deployed files must produce a detectable change to `sw.js`.

**Important:** Browsers normally detect service worker updates by comparing the fetched service worker script with the existing script. A changed cache name alone is not sufficient if the service worker source itself remains unchanged.

Therefore:

- Embed the current version or a generated build identifier in `sw.js`.
- Ensure that a release changes the service worker script whenever the application version changes.
- Never rely exclusively on a deployment timestamp that may not change the actual service worker contents.
- Ensure the hosting platform does not serve an indefinitely stale copy of `sw.js`.

Configure the web server to revalidate `sw.js` rather than serving it from a long-lived immutable cache. Use appropriate cache headers for the HTML entry point and other release-sensitive files.

## 4. How PWA Updates Reach Players

Implement the following update lifecycle.

### Step 1: Check for updates on launch

When NibbleNaut launches:

1. Register the service worker.
2. Check for a newer service worker using `registration.update()`.
3. Handle registration errors without preventing the game from starting.
4. Avoid repeated, unnecessarily frequent update checks.

Also consider checking for updates when the player returns to the application after a long period away.

### Step 2: Install the new version

When a new service worker is detected:

1. Download the required application assets.
2. Use appropriate revalidation or cache-bypassing requests for release-sensitive files.
3. Populate the new version's cache.
4. Confirm that required assets have been cached successfully.
5. Do not delete the existing working cache before the new cache is ready.

If installation fails, retain the previously working application and allow the browser to retry.

### Step 3: Activate the new service worker

After the new worker has installed successfully:

- Activate it according to the chosen update strategy.
- Use `self.skipWaiting()` where appropriate to avoid unnecessarily prolonged waiting.
- Use `clients.claim()` after activation when the new worker is ready to control eligible open clients.
- Delete obsolete NibbleNaut caches only after the new cache is successfully installed and activated.

Only delete caches owned by NibbleNaut. Never delete unrelated caches belonging to other applications on the same origin.

### Step 4: Handle the update safely

NibbleNaut is an interactive game, so an update must not unexpectedly terminate an active match.

Implement an update-aware application lifecycle:

- If the player is on the title screen, settings screen, or another safe screen, apply the update and reload as appropriate.
- If the player is in an active match, notify them that an update is ready and defer the reload until the match ends or the player returns to a safe screen.
- If the player explicitly chooses to restart for an update, save any recoverable progress first.
- If the game is paused, use a safe transition before applying the update.
- Avoid repeated reloads, duplicate event handlers, and update loops.

Where `controllerchange` is used, implement a guard so that one service worker update causes at most one automatic reload per page session.

Do not reload the page simply because the first service worker takes control on a fresh installation. There is no old application version to replace in that situation.

### Step 5: Communicate the update

Provide a small, unobtrusive notification when an update is ready.

Suggested message:

**NibbleNaut update ready**

A new version is available. Finish your current match to update.

Offer an appropriate action such as `Update Now` when it is safe to reload. Otherwise, defer the action until the current match ends.

After the update is applied, show a brief confirmation such as:

**NibbleNaut updated successfully.**

Do not display an update notification when no update is available.

## 5. Caching Strategy for NibbleNaut

Choose caching strategies according to the type of resource.

| Resource | Recommended strategy | Reason |
|---|---|---|
| Application shell and HTML | Network-first with cached fallback, or another deployment-safe strategy | Supports fresh releases while retaining offline access |
| Versioned CSS and JavaScript | Cache-first | Stable, predictable assets within a release |
| Fish sprites, animations, sound effects, and other game assets | Cache-first when versioned | Fast gameplay and offline availability |
| Essential offline game assets | Precache during installation | The game should not become unplayable offline |
| Frequently changing remote configuration | Network-first with validated cached fallback | Supports fresh settings while retaining resilience |
| Optional remote leaderboards or online services | Network-first or direct network requests | Online data should not be confused with local game state |
| Cross-origin APIs and CDN resources | Explicitly configured, or bypass the service worker where appropriate | Avoid serving stale external responses unexpectedly |

Use hashed asset filenames when the build system supports them. A content-hashed filename can safely be cached for a long period because changed content receives a new filename.

Do not use cache-first for mutable HTML, unversioned application scripts, or remote data that must remain fresh.

The offline experience must not depend on a successful network request after the initial installation.

## 6. Preserve Game Progress and Player Data

NibbleNaut must distinguish application files from player data.

Application caches may be replaced during an update. Player data must be stored separately.

Depending on the existing architecture, use IndexedDB or another appropriate persistent browser storage mechanism for:

- Player settings and preferences.
- High scores and personal bests.
- Unlocked fish, skins, or other progression.
- Achievements and milestones.
- Saved progression and recoverable session state, where supported.

Do not delete player data as part of service worker cache cleanup.

If the save-data structure changes between releases:

1. Detect the existing data schema version.
2. Run a controlled migration.
3. Preserve existing data whenever possible.
4. Handle migration errors without silently overwriting the player's progress.
5. Test upgrades from previous supported versions.

Do not assume browser storage is permanent or guaranteed to survive user-initiated clearing of site data.

## 7. Offline and Update Failure Handling

Test the following scenarios:

- First installation while online.
- First launch while offline after a successful installation.
- Launch with a newer release available.
- Failed service worker installation.
- Interrupted asset downloads.
- Loss of connectivity during an update.
- Returning to the game after several releases.
- An update becoming available during an active match.
- A failed reload or activation.
- A player returning to a previously open tab.
- A migration from an older save-data schema.

A failed update must not leave the player with a blank screen, an endless loading state, or a permanently broken cache.

When possible, retain the last working application until the replacement is ready.

## 8. Automated Version and Deployment Checks

Add automated checks to the existing development workflow.

Before allowing a production deployment, verify that:

- The version is valid semantic versioning.
- The version is greater than the last deployed version.
- The version bump matches the intended change type.
- The service worker contains the current version or generated build identifier.
- The release produces a detectable change to `sw.js`.
- Required precache assets exist.
- The production build succeeds.
- The manifest and service worker paths are correct.
- No essential game asset is accidentally excluded from the offline cache.
- The application does not contain unintended development or debugging settings.

Use Git tags for stable releases where appropriate, and maintain a `CHANGELOG.md` containing the version, release date, and important changes.

If a deployment fails, investigate and correct the release rather than pretending that the new version is live.

## 9. Release Verification After Every Push

After each production deployment, verify the live application.

1. Confirm the deployed version.
2. Open the PWA in a clean browser session.
3. Check that the new service worker is detected and installed.
4. Confirm that a previously installed PWA can update.
5. Verify that the old cache is cleaned up only after the new version is ready.
6. Test a game session to ensure gameplay is unaffected.
7. Confirm that saved progress and settings remain intact.
8. Test offline startup after a successful installation.
9. Check the browser console for service worker, cache, or runtime errors.

Do not report a deployment as successfully updated until the deployed application has been verified.

## 10. Implementation Requirements for the Coding Agent

Before changing code, inspect the existing NibbleNaut repository and identify:

- The current application structure and entry point.
- Whether a service worker already exists.
- Whether a PWA manifest is configured.
- The current versioning mechanism.
- The existing build and deployment process.
- The current asset and caching strategy.
- How gameplay state and persistent data are managed.
- How the game identifies an active match, pause state, game-over state, and safe reload points.

Adapt the implementation to the existing architecture instead of blindly copying code from another PWA.

Do not create duplicate service workers, competing cache systems, or a second version source.

Preserve the existing game design and functionality. Make the smallest coherent set of changes necessary to implement reliable release versioning and update management.

If there is no existing service worker, implement one appropriate to NibbleNaut's actual hosting configuration.

If the current architecture cannot safely support immediate activation, prefer a controlled update flow that preserves active gameplay rather than forcing an unsafe reload.

## 11. Acceptance Criteria

The work is complete only when:

- Every deployed application change has an appropriate version bump.
- Every release changes the service worker script when necessary.
- Previously installed PWAs detect new releases.
- Fresh installations receive the correct release assets.
- Failed installations do not destroy the last working application.
- Players are not unexpectedly removed from active matches.
- Persistent player data survives normal application updates.
- Obsolete application caches are removed safely.
- Offline gameplay works to the extent supported by the game design.
- Automated checks detect missing or inconsistent version bumps.
- Release verification and rollback considerations are documented.
- The Git history and changelog clearly identify each version.

**Standing instruction:** Apply these rules to all future NibbleNaut releases. Do not remove, weaken, or bypass the version bump, cache invalidation, or update-safety requirements without my explicit approval.