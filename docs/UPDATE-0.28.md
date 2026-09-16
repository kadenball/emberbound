# 0.28 — Not my problem

The bloat tick previously produced two generic blast markers. It now retches physical, toothy stink sacs. A **grounded Light contact** punts a live sac along the direction of the swing. The original fuse keeps burning; there is no homing or fuse reset. A sac can be returned once. Jumping or leaving the original blast area still works, and the other sac remains a separate danger.

Returned sacs roll at an initial 620 world units/second with drag, and burst against the crew for 40 + 6 per region. Their damage uses the existing enemy defense rules. They do not hurt either partner, grant combo hits, fill FILTH or heal the player. The fuse marker and blast area move with the sac; a green arrow and “CREW ONLY” label distinguish a returned one. A pending ground blast cannot be confused with a boss’s overhead attack: only explicitly physical tick sacs accept a punt. Optional bookmark fields preserve their motion without rejecting old records.

The tick’s belly expands during its committed windup, its mouth loads the sac, and the throw has a retching recoil and spit. Sacs have stitched skins, uneven teeth, a shrinking fuse, accelerating wobble, motion streaks and a ruptured-skin/cloud aftermath. They render above the feet layer so standing over one cannot hide it. Three separate synthesized sounds cover retch, punt and burst; the retch reserves warning voices and ducks the score. The quest hint, bestiary, laundry bridge lesson and defeat advice explain Light punting. Chapter compositions and the selected menu track are unchanged.

## Balance changed the input choice

The first implementation used Heavy. A matched audit showed it incidentally improved a strategy the user already found too easy. The final implementation uses the short Light contact window instead, giving the fast attack a useful defensive role while keeping Heavy focused on launches, guards, carts and finishers.

| Policy, 108 runs each | 0.26 baseline wins | Initial Heavy-punt wins | Final Light-punt wins |
| --- | ---: | ---: | ---: |
| Light | 0 | 0 | 0 |
| Heavy | 25 | 31 | 25 |
| Light + power | 22 | 22 | 23 |
| Mixed | 103 | 103 | 103 |

The [final 432-run audit](COMBAT-AUDIT-0.28.json) reuses every profile, seed and input policy from [0.26](COMBAT-AUDIT-0.26.json). The only changed win/loss outcome is Bram’s chapter 11, seed 140, Light-plus-power run changing from loss to win. Boss-chapter wins remain 0/54, 13/54, 15/54 and 51/54 respectively; no run times out. The [initial Heavy-punt audit](COMBAT-AUDIT-0.28-HEAVY-PUNT.json) is preserved. These scripts do not deliberately optimize punting and do not establish human enjoyment or that spam is solved.

## Gameplay and visual evidence

Thirteen new simulation checks cover committed targets and staggered fuses, actual attack startup/contact, one return, invalid Heavy/air/rear/lane/expired/boss attempts, one-time enemy damage, co-op safety, jumping, the other hostile sac, no false perfect-dodge reward and bookmark compatibility. All **224 simulation tests across 24 files pass**, including nine campaigns with earned hero/style progression. One old defeat-advice assertion was updated to the new “two stink sacs” wording; its culprit and ignored-damage assertions remain.

The browser fixture reaches the laundry encounter using normal combat inputs and earned profiles, follows the committed target with normal movement, then freezes for a real keyboard or touch Light input. It faces away from the wounded thrower to avoid ending the encounter during the swing before flight can be captured. It edits no HP, positions, enemy state or waves. All nine focused combinations of three heroes and three browser targets pass. These are controlled input/visibility fixtures, not physical-device or human-play evidence.

![Bram punts while the second sac stays hostile](../artifacts/stink-moss-returned-iphone.png)

Phone captures show the physical sacs, correct action label, retained second warning and returned direction. Full-suite, native-package and final capture results are recorded in [validation](VALIDATION.md). The complete quality target remains [open](QUALITY-TARGET.md).

A separate probe exposed an update-order edge case: a returned sac killing a boss could start the defeat performance while another blast or enemy swing still killed the player in the same simulation step. Both variants now have regression tests that failed before the guard and pass afterward. The world update stops at the performance boundary, and its danger loop stops after a boss defeat. The final matched audit retains the same outcomes after this fix.

[Listen to the three isolated effects](../artifacts/stink-sounds-0.28.mp3): retch, punt, burst, recorded through the production master mixer with music disabled. The 3.36-second recording decodes and peaks at −23.5 dBFS; all three [sampled effect windows](AUDIO-EFFECTS-0.28.json) contain nonzero signal. That is signal evidence, not human listening or perceptual balance validation.

The final full browser run after the defeat guard passes **185 checks**, skips ten inapplicable cases and has no failures. The audit’s 432 simulations all terminate and its complete report was checked, but the Node runner remained alive after printing its summaries; its cleanup process was stopped after five minutes. [Validation](VALIDATION.md) distinguishes that nonzero runner exit from the terminal simulation evidence.
