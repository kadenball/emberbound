# Local validation — 0.3.0, 2026-09-07

| Check | Result |
| --- | --- |
| Strict TypeScript + optimized Vite build | Passed |
| Combat and save regression tests | 13 passed |
| Jump physics, evasion, aerial attacks, and landing regression tests | 8 passed |
| Expansion mechanics, weapon discovery, levels, migration, gates, hazards, and boss identities | 14 passed |
| Complete hero/chapter simulations | 36 passed: all three heroes across all twelve chapters |
| Desktop Chromium browser flows | 8 passed |
| Android-sized Chromium browser flows | 10 passed |
| iPhone-sized WebKit browser flows | 9 passed |
| Inapplicable/device-specific duplicate browser combinations | 6 explicitly skipped |
| Android debug APK | Compiled successfully |
| Android release AAB | Compiled successfully; unsigned |
| Android release lint | Passed with the dependency's supplied baseline |
| Xcode project + privacy/property-list syntax | Parsed successfully |
| Dependency audit | 0 known vulnerabilities reported |

There are 71 simulation tests and 27 passing browser tests. Campaign simulations start each hero/chapter combination with base stats and equipment, then use real movement, melee, magic, dodges, loot collection, level gains, and lever interactions. They do not teleport, alter HP, skip encounters, or invoke private combat methods. These tests establish reachability and basic balance coverage, not human playtesting quality.

Browser tests cover desktop/mobile menus, keyboard and touch actions, multi-touch, jump/attack behavior, pause/resume, twelve chapter layouts, the armory, enemy guide, exact combo unlock text, old-save migration, equipment persistence, and a real weapon pickup followed by defeat and reload. Save fixtures are installed before app initialization so lifecycle writes cannot overwrite the test setup.

Screenshots in `artifacts/` show the title, campaign map, normal/mobile gameplay, armory, enemy guide, all six environments, and all six boss arenas. `scripts/capture-expansion.mjs` is a developer scene capture, separate from the unmodified-input campaign tests. Its timings measure desktop drawing command submission only; they are not end-to-end frame times or physical-device FPS.

`scripts/package.py` verifies that every web asset in the APK and AAB matches `dist/` byte-for-byte. It collects the APK, unsigned AAB, source archive, and SHA-256 checksums.

Preview: `http://localhost:4173`. Android application ID: `com.emberbound.game`; version `0.3.0`, version code `3`, minimum SDK `24`, target SDK `36`. Save schema 2 migrates schema 1 under the original storage key.

The Fedora host's optional WebKit media-codec validation was bypassed after installing its required compatibility libraries; actual WebKit browser tests ran. The game uses synthesized Web Audio rather than decoded media. See [RELEASE.md](RELEASE.md).

Not validated here: physical devices, an Android emulator, native iOS compilation, hosted CI, release signing/publication, sustained frame pacing, battery/thermal behavior, process-kill recovery during active chapters, and broad human balance testing. Native iOS compilation requires macOS/Xcode. Active chapters are not saved mid-run; victory/defeat banks rewards, while quitting or process termination forfeits the active run's unbanked progress.
