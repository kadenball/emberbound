# Local validation — 0.6.0, 2026-09-07

- **85 simulation tests passed:** baseline combat/save (13), jump (8), content/equipment (14), combat/co-op (15), styles (11), gross powers/exploit regressions (14), nine complete hero/style campaigns plus one co-op opening chapter (10).
- **48 browser tests passed:** desktop Chromium 15, Android-sized Chromium 17, iPhone-sized WebKit 16; six inapplicable combinations explicitly skipped. Includes real defeat retaining a weapon while losing currency, boss permit UI, FILTH HUD, persisted styles, touch, gamepads, lifecycle, save migration and responsive layouts.
- Strict TypeScript, Vite production build and Capacitor Android/iOS sync passed.
- Android `assembleDebug bundleRelease lintRelease` passed: version 0.6.0, code 6. Release bundle is unsigned. Existing dependency lint baseline retained.
- Xcode project and iOS plists parsed successfully. Native iOS compilation and signing require a Mac and were not performed here.
- 432 fresh-equipment strategy simulations completed without timeouts. Wins: attack-only 0/108; attack/power 3/108; attack/power/dodge 36/108; varied strategy 77/108. See [raw audit](GAMEPLAY-AUDIT-0.6.json).
- Final menu/mobile and staged power captures reported zero page errors. Mobile capture includes all five touch actions and FILTH. Production APK/AAB assets are byte-checked against `dist` by `scripts/package.py`; packaged files have SHA256 checksums.

Campaign tests use real combat inputs, earned loot/XP, boss permits and capped defeat payouts, with at most three attempts per chapter. The policy learned mess detonation and saves power for vulnerable boss windows. Unit fixtures separately isolate specific powers and exploit boundaries. Neither harness demonstrates human enjoyment.

No physical Android/iOS device tests, native iOS build, store submission, online co-op or external human sessions were performed. WebKit ran with the previously documented compatibility libraries and optional host-validation bypass. Browser emulation does not establish device performance, thermal behavior or native lifecycle correctness.

See [update details](UPDATE-0.6.md), [human playtest kit](PLAYTEST.md) and [release requirements](RELEASE.md). Previous validation is retained in `VALIDATION-0.5.md`.
