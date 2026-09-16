# Local validation — 0.4.0, 2026-09-07

| Check | Result |
| --- | --- |
| Strict TypeScript + optimized Vite build | Passed |
| Combat/save regression tests | 13 passed |
| Jump physics, evasion and deliberate diving attacks | 8 passed |
| Equipment, levels, migration, props, hazards and boss identities | 14 passed |
| Combat redesign, objectives, bowling, boss jam and co-op contracts | 15 passed |
| Continuous campaign simulations | 3 passed; each completes all twelve chapters with earned progression |
| Continuous two-player opening chapter | 1 passed |
| Desktop Chromium browser flows | 12 passed |
| Android-sized Chromium browser flows | 14 passed |
| iPhone-sized WebKit browser flows | 13 passed |
| Inapplicable browser combinations | 6 explicitly skipped |
| Android debug APK + release AAB | Compiled successfully; release bundle unsigned |
| Android release lint | Passed with dependency-supplied baseline |
| iOS assets/plugins synchronization | Passed |
| Xcode project, property lists and privacy manifest syntax | Parsed successfully |
| Strategy audit | 432 completed simulations, zero timeouts; raw data retained |

Totals: **54 simulation/regression tests, 39 passing browser tests**. Continuous campaign simulations use real movement/combat inputs, bank earned XP/weapons/currency, and buy affordable upgrades between chapters. They do not teleport, edit HP, skip waves, or invoke private combat methods. Focused contract tests use isolated state fixtures to exercise specific collisions and transitions.

Browser coverage includes real touch/keyboard input, simultaneous movement and jump/attack, five nonoverlapping touch targets, local party selection, independent P2 magic, one/two-controller assignment, held Start pausing once, practice without unlock mutation, menus, twelve chapter layouts, old-save migration, equipment persistence, and a real pickup followed by defeat/reload. Gamepads are browser fixtures, not physical controllers. The full browser run passed after fixing Jump being intercepted by the old absolute-position button layout.

The 0.3 validation record is retained in [VALIDATION-0.3.md](VALIDATION-0.3.md). The new [audit](GAMEPLAY-AUDIT-0.4.json) and its [interpretation](UPDATE-0.4.md) compare scripted strategies, not human enjoyment. No human playtest sessions were conducted. Use [PLAYTEST.md](PLAYTEST.md) for the next evaluation.

`artifacts/redesigned-gameplay.png`, `redesign-mobile.png`, and `local-coop.png` use actual menus/input. The bridge, bowling, laundry and six-region scene captures use developer fixtures for visual inspection. In the three redesign scenes, headless desktop Canvas command submission measured roughly 0.5–0.7 ms median and 0.6–1.2 ms p95. This excludes end-to-end display/input latency and is not physical-device FPS. See the capture script and timing JSON for the method.

`scripts/package.py` checks every web asset in both native packages against `dist/` byte-for-byte, then creates the APK, unsigned AAB, source archive and SHA-256 checksums. Preview: `http://localhost:4173`. Android application ID `com.emberbound.game`; version `0.4.0`, code `4`, minimum SDK `24`, target SDK `36`. iOS marketing/build versions are also 0.4.0/4. Save schema remains 2 with a backward-compatible optional relaxed-mode setting.

The Fedora host’s optional WebKit media-codec validation was bypassed after installing its required compatibility libraries; actual WebKit tests executed. No dependencies were added for 0.4. Audio uses Web Audio synthesis.

Not validated here: physical devices/controllers, Android emulator, native iOS compilation, hosted CI, store signing/publication, sustained frame pacing, thermal/battery behavior, process-kill recovery during active chapters, or human difficulty/fun. Native iOS compilation needs macOS/Xcode. Active chapters have no mid-run save; victory/defeat banks rewards, while leaving or process termination forfeits unbanked progress. Online co-op remains a design document, with no server or network implementation.
