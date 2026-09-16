# Local validation — 0.9.0, 2026-09-08

- **110 simulation tests passed.** Ten new retry/settlement cases cover real encounter checkpoints, repeated snapshot isolation, health/equipment/loot/switch restoration, both co-op players, capped defeat settlement, exactly-once victory banking, practice isolation, damage attribution and the clean-run mastery star. One test reaches the second fight using real combat inputs, causes a loss, retries, completes the chapter using real inputs and banks its final haul.
- Existing campaign coverage still completes all twelve chapters for each hero/style combination with carried progression and at most three attempts per chapter. Those simulation tests do not go through the UI.
- **58 browser checks passed**, eight inapplicable combinations skipped, across desktop Chromium, Android-sized Chromium and iPhone-sized WebKit. Each platform exercises a real opening-fight loss, relevant counter text and immediate retry without changing the saved profile. Desktop uses Enter; mobile uses touch. A separate real-run case verifies that found weapons bank only after defeat is accepted and survive reload.
- Existing browser checks cover story skip/replay/persistence, Music controls, menu/chapter playback, all twelve chapter MP3 decodes, controls, local party and settings.
- Strict TypeScript, production Vite build and Capacitor Android/iOS sync passed.
- Android `assembleDebug bundleRelease lintRelease` passed, version 0.9.0/code 9. The debug APK is installable; the release AAB remains unsigned. Existing dependency lint baseline retained.
- Xcode project syntax and iOS plists parse. Native iOS build/signing cannot be verified on this Linux host.
- Normal desktop and landscape-mobile defeat captures use a real opening encounter loss and actual retry, with zero recorded page errors. Desktop, landscape and portrait reports were visually inspected. Portrait padding was tightened after spotting a clipped footer; all three real-loss captures were repeated after that CSS-only change, with zero page errors.
- `scripts/package.py` checks every bundled web/audio byte against the current production build before packaging. Download checksums are written alongside the artifacts.

Checkpoints last only in the current in-memory chapter. Reloading or closing the app does not resume them. Health restores to the exact encounter-entry condition; this avoids a death-to-heal exploit but needs human review for frustrating low-health starts.

These checks establish tested behavior, not human enjoyment, musical quality, native iOS readiness or parity with the named reference games. See [the open quality target](QUALITY-TARGET.md), [0.9 changes](UPDATE-0.9.md), [playtest kit](PLAYTEST.md) and [release instructions](RELEASE.md). Prior validation is retained in `VALIDATION-0.8.md`.
