# 0.13 — Mind the dentures

The boss counter pass follows both reference games: Super Meat Boy's readable failure/retry loop, and Castle Crashers' varied adventure and performed comedy. It does **not** establish equivalent quality or solve our remaining Heavy-spam exploit. The [source-backed comparison](LEVEL-DESIGN-RESEARCH.md) and [open quality target](QUALITY-TARGET.md) remain the design criteria.

## Playable changes

- Falling freezer ice and the royal stamp now catch jumping players. Their previous collision treated them as low explosions despite drawing objects overhead. Move out of the marked lane. Warning ellipses and collision use the same geometry; the stamp covers a wide but shallow lane, leaving room above and below it.
- Count Snackula alternates low candy volleys with a mixture of sweets and snapping dentures. The jaws open before biting and visibly snap closed at impact. Low sweets say **JUMP**; jaws say **MOVE**. Distinct shapes and words accompany the colors.
- Enraged Forklift Frank begins with raised forks, then alternates raised and low charges. Raised forks require a lane change; low forks can be jumped. The articulated forks, lane boundaries, floating instruction and boss HUD agree through windup and charge. The active collision rectangle is visible.
- The kettle captures the player's jump height when its burp windup starts. A high volley travels at that committed height even after the player lands. The aim lines and HUD distinguish high from low burps.
- Ice breaks into shards, the stamp slams down, and dentures close with separate synthesized impact sounds. A brief impact remains visible after damage resolves, without dealing damage again or granting post-impact perfect-dodge rewards.
- Boss HUD instructions prioritize a pending overhead hazard over a recovery invitation. The combo counter now sits in the upper HUD on landscape screens, leaving the boss and floor clearer.
- Older valid bookmarks without explicit hazard kinds retain the intended overhead meaning. Persistent retry/reward rules remain covered by regression tests.

## What the combat audit actually found

`node scripts/audit-combat.mjs docs/COMBAT-AUDIT-0.13.json docs/COMBAT-AUDIT-0.12.json`

There are 432 runs per version: three heroes, twelve stages, three seeds and four combat policies. The profiles were earned by a normal-input Scrapper campaign probe, then reused unchanged for the new version. Restricted policies can still complete mandatory scenery after fights, avoiding artificial objective timeouts. No HP/position edits or skipped waves are used. The mixed policy was taught to respond to the newly visible counters, so this compares viable strategies, not identical input recordings. All policies use scripted, precise targeting; this is not a human playtest.

| Combat policy | 0.12 chapter wins / 108 | 0.13 chapter wins / 108 | 0.13 boss wins / 54 |
| --- | ---: | ---: | ---: |
| Light only | 0 | 0 | 0 |
| Heavy only | 42 | 43 | 26 |
| Light + magic | 26 | 26 | 21 |
| Mixed movement and attacks | 107 | 107 | 54 |

No timeouts occurred. Heavy-only still wins all nine sampled Candy and all nine Frank chapters. These results **do not support claiming an overall difficulty increase**. The pass fixes misleading collisions and introduces different readable responses; late-game attrition, boss openings and the value of deliberate combos need further work. Simply raising boss HP would conceal that design problem.

Raw profiles and results: [before](COMBAT-AUDIT-0.12.json), [after](COMBAT-AUDIT-0.13.json). Campaign regression separately covers all nine hero/style combinations carrying earned rewards.

## Review the actual presentation

Browser tests drive normal combat inputs from the audit's earned chapter profiles, hold a real warning and its subsequent impact, and capture desktop, Android-sized Chromium and iPhone-sized WebKit. The test asserts that the overhead instruction appears and the combo HUD stays above the fight. These are browser viewports, not physical-device evidence.

Captures in `artifacts/counter-{ice,jaw,forks,stamp}-{warning,impact}-{desktop,android,iphone}.png`. The phone jaw, raised-fork and stamp captures were inspected; the combo overlay obstruction found there caused the HUD adjustment. New sound effects have not received human listening review.

See [validation](VALIDATION.md) for final build/test results and remaining native-release limitations.
