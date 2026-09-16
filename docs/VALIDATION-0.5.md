# Local validation — 0.5.0, 2026-09-07

| Check | Result |
| --- | --- |
| Strict TypeScript and optimized Vite build | Passed |
| Combat/save regression tests | 13 passed |
| Jump/evasion regression tests | 8 passed |
| Campaign content, equipment, XP, props and enemy identities | 14 passed |
| 0.4 combat/objective/co-op contracts | 15 passed |
| Style unlocks, counters, quakes, air kicks, elemental finishers and new enemy pressure | 11 passed |
| Continuous campaigns | 9 passed: all 12 chapters for every hero/style combination |
| Continuous co-op opening chapter | 1 passed |
| Desktop Chromium browser flows | 14 passed |
| Android-sized Chromium browser flows | 16 passed |
| iPhone-sized WebKit browser flows | 15 passed |
| Inapplicable browser combinations | 6 explicitly skipped |
| Android debug APK and release AAB | Built successfully; release AAB unsigned |
| Android release lint | Passed with the dependency-supplied baseline |
| Capacitor Android/iOS assets and plugin sync | Passed |
| Xcode project syntax | Parsed successfully; no native iOS compile on this Linux host |
| Strategy audit | 432 completed simulations; zero timeouts |

**71 simulation tests and 45 passing browser tests.** The nine continuous campaigns carry earned XP, currency and weapons, and buy affordable upgrades. They cover 108 hero/style/chapter combinations without teleports, HP edits, skipped waves or private-method calls. The steering policy uses ordinary combat actions; focused technique tests separately cover each new move's behavior. Campaign completion does not by itself prove a style is optimally balanced or enjoyable.

New contracts cover old-save style defaults, invalid style rejection, level-gated counters, once-per-counter consumption, quake/shockwave thresholds, bounded lifting air dashes, connected-heavy jump cancels, once-per-swing elemental refunds, no refund on a whiff, nature healing requiring a hit, shield ripostes, high archer shots and half-health boss volleys. Browser tests select a style, use its magic/finisher prompt, reload to check persistence, inspect locked techniques, and check narrow layouts. Existing keyboard, multi-touch, controller assignment, co-op, save, pause, item and practice tests still pass.

Visual inspection of `artifacts/redesign-mobile.png` confirms smaller fighters and a wider view while retaining readable HUD/touch buttons. `artifacts/scale-before-0.4.png` preserves the preceding mobile framing. Battle framing uses 780 vertical units instead of 675; hero art scale is 0.76 instead of 1.05. The resulting landscape on-screen height is about 37% smaller. Screenshots of six regions, bosses and the armory are refreshed through the capture scripts. Developer scene fixtures are not human playthrough screenshots. Canvas submission timings in the redesign fixtures are around 0.5–0.7 ms median and 0.6–1.2 ms p95 on this headless desktop, not physical-device FPS.

The [0.5 audit](GAMEPLAY-AUDIT-0.5.json) retains the previous four steering policies with fresh gear for each run. Deliberate moves win 77/108, compared with 93/108 in 0.4; light/magic/dodge wins 39/108, compared with 77/108. No strategy times out. These are engineering probes, not human difficulty ratings, and higher bot failure rates alone are not a definition of fun. Prior raw data and validation reports are retained.

Android application ID: `com.emberbound.game`; version 0.5.0, version code 5, minimum SDK 24, target SDK 36. iOS marketing/build versions are 0.5.0/5. The source archive includes updated code, tests, notes and assets. `scripts/package.py` verifies every bundled web asset in both native packages against `dist/`, then writes checksums. Preview: `http://localhost:4173`.

The Fedora host uses installed WebKit compatibility libraries with optional host media-codec validation bypassed; actual WebKit tests ran. No dependencies were added for this update.

Not verified: human enjoyment or difficulty, physical phone/controller sessions, native iOS compilation, hosted CI, store signing/publication, sustained thermal/battery/frame-pacing behavior. Smaller touch-screen characters need observation on real devices. Online co-op remains unimplemented. See [the playtest kit](PLAYTEST.md), [release instructions](RELEASE.md), and [0.5 changes](UPDATE-0.5.md).
