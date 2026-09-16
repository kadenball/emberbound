# Local validation — 0.7.0, 2026-09-08

- **93 simulation tests passed:** combat/save 13, jump 8, equipment/content 14, combat/co-op 15, styles 11, FILTH/exploit regressions 14, creature/effect contracts 8, campaigns/co-op chapter 10.
- **51 browser tests passed:** desktop Chromium 16, Android-sized Chromium 18, iPhone-sized WebKit 17; six inapplicable combinations skipped. Includes MP3 playback after a real gesture, loop flag, Music on/off, battle transition and menu resume.
- Strict TypeScript, production Vite build and Capacitor Android/iOS sync passed.
- Android `assembleDebug bundleRelease lintRelease` passed, version 0.7.0/code 7. Debug APK installable; release AAB unsigned. Existing dependency lint baseline retained.
- Xcode project syntax and iOS plists parsed. No native iOS compile/signing on this Linux host.
- Entire packaged menu MP3 decoded successfully with ffmpeg. Recording provenance and hashes are in `public/audio/SOURCE.md`.
- 432 fresh-equipment strategy simulations completed with no timeouts: 0/108 attack-only wins, 3/108 attack/power, 35/108 attack/power/dodge, 75/108 varied moves. See `GAMEPLAY-AUDIT-0.7.json`.
- Creature roster, motion-study recording and actual menu/mobile captures inspected; zero recorded page errors. The motion study is a staged renderer fixture.
- `scripts/package.py` byte-checks production web/audio assets inside the APK and AAB against `dist` before packaging. SHA256 checksums accompany the APK, unsigned AAB and source archive.

Campaign tests carry earned progression, boss permits and capped defeat payouts, with at most three attempts per chapter. The steering policy now retreats during Madame's spin. Focused tests isolate creature behavior and damage boundaries; neither test type establishes human enjoyment. Previous validation remains in `VALIDATION-0.6.md`.

Physical-device performance/thermal behavior, native iOS compilation and signing, real-device interruption handling and external human playtests remain unverified. Browser emulation and desktop recordings do not replace those checks. See `PLAYTEST.md` and `RELEASE.md`.
