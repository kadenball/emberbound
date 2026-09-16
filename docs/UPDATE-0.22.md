# 0.22 — Staff take the blame

The king's summoned employees previously added pressure but barely changed the player's attack plan. They now carry his royal protection. Stamped receipts link living staff to the crown, His Majesty raises his paperwork, and both objective and boss HUD explain the counter. Ordinary melee and powers cannot damage the protected king, even during the short recovery after summoning.

There are two ways through:

- Clear the staff with any loadout. When the last one falls, the protection ends and the king receives a fresh **2.2-second** opening.
- Bowl an employee into the protected king. The impact breaks the seal, applies damage using the existing **1.75× jammed multiplier**, and creates a **3.2-second** “Return to sender” stagger. The remaining employees stay alive, but cannot sustain the broken seal. Pan and Candy Heavy supply a direct bowling move; other moves/styles can also bowl.

The crown wobbles during the stagger, paper scraps scatter, and the cue changes to the opening. Overhead warnings retain priority. Already launched attacks still resolve, so the counter does not erase the need to read the floor. New staff meetings can re-establish protection. Existing fight retries restore the encounter's entry state and rewards.

![Protected king during actual input-driven play](../artifacts/royal-protected-iphone.png)

The [432-run audit](COMBAT-AUDIT-0.22.json) reuses 0.20's earned profiles, seeds and all four steering policies without modifications. Heavy-only wins fall **30 → 25 / 108**, including **19 → 14 / 54** boss chapters. All five changed outcomes are final-king runs: **5 → 0 / 9** Heavy-only wins. Mixed stays **104/108**, including **53/54** boss chapters and **9/9** king runs. Light stays 0/108; Light + power stays 28/108. No run times out.

The mixed king-chapter median increases from **32.7 to 43.4 seconds**, including the approach fights and performance handling used by the script. That increase reflects more fighting, not proof of better pacing. The unchanged mixed policy already prioritizes nearby enemies; no special new king knowledge was inserted into the probe. Human fun, target-choice clarity and whether the bowling counter is worth setting up remain unverified. Heavy-only still wins fourteen other boss runs, often with low health, and Light + power still wins three king runs. A win count alone does not establish that a strategy is an exploit.

Five targeted simulation tests cover rejection, normal clearance, real body collision, a player-input pan counter and stale/non-summoned guards. The browser scenario reaches the king through production combat inputs, captures the protected state, continues those inputs and observes staff clearance. It pauses simulation at those two states for captures without changing health, positions, enemies or rewards. The first browser attempt attached to a separate Vite module instance and never steered the live game; using the actual loaded module URL fixes the test harness. The final three-platform focused run passes.

This develops the [two-reference comparison](LEVEL-DESIGN-RESEARCH.md) through a specific endgame decision and an original bureaucratic joke. Final release verification is in [current validation](VALIDATION.md); the full-game quality goal remains open.
