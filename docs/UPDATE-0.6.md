# 0.6 — Unlicensed bodily functions

This update targets repeatable low-effort strategies and gives each hero an original gross-out combat setup. Twelve chapters, their world scale, weapons, and three level-gated fighting styles remain intact.

## Powers and combat

- **Ash — Ass Afterburner:** a piercing flame fart fires in the aimed direction and kicks Ash backward 45 world units. The sprite faces away from the jet during its cast pose. Meltdown produces three fire lanes and increased damage.
- **Wren — Projectile Regret:** a freezing vomit burst leaves a five-second puddle. Ground Heavy splashes it for a second area hit. Meltdown enlarges the splash and increases damage. A visible stream and embedded teeth make the puddle recognizable.
- **Bram — Emotional Support Tumour:** a six-second, two-hit toothy decoy attracts raiders, shields, flankers and chargers. Brutes, ranged enemies, bosses and enemies in defiance ignore the lure. Enemy melee/shots can break it; Heavy detonates it early. A blast that hits an enemy heals its owner 5 HP once. Meltdown gives it three hits, greater radius and damage. Idle casting does not heal.
- **FILTH:** 16 charge per qualifying connected move outside the last three credited types; timed dodges and mess explosions also qualify. Repeated light attacks and whiffs cannot fill it. At 100%, the existing Power button uses a free enhanced cast and empties the meter. Both players have their own meter. No extra touch button.
- **MAD AS HELL:** after more than 2.1 seconds of accumulated control, ordinary enemies shake free for 2.4 seconds. Orange rings and a label explain resistance to stun, freeze, launch, pull and bowling. Damage still works. The accumulated control measure decays while the enemy is free.
- Healing and ordinary power refunds now pay once per connected swing, regardless of crowd size. Variety refunds exclude the last three credited types. Normal passive guts regeneration is 2.5/sec; Relaxed keeps 7/sec. Summoned royal retinue no longer drop XP, currency or healing.

## Progression and presentation

The first permanent upgrade rank is available immediately; each unique boss clear unlocks the next rank up to five. Previously purchased upgrades are preserved. Currency is presented as loose teeth, the forge is Back-alley surgery, and the armory explains FILTH alongside Anger Issues, Floor Allergy and Gut Rot fighting styles. New display lettering, stitched cards, acid-green meter and incident/post-mortem results support the coarse comic tone. Powers have new synthesized fart/gurgle/squeak cues.

Wins retain all earned XP, teeth and weapons. Defeat retains weapon finds, loses teeth and banks only the difference between a quarter of that run’s XP and the best quarter-haul already claimed from a failed run in that chapter. Example: a failed 200-XP run pays 50; another 200 pays 0; a later failed 300 pays 25. Completed replays still pay. Practice pays nothing; abandoning a live chapter still forfeits unbanked rewards. Version 1/2 saves migrate with their progress intact and a validated new failure-history field.

## Evidence and limits

The first red regression reproduced one Jawbreaker swing healing 15 against five foes versus 3 against one. Another reproduced cash purchasing later ranks without a boss clear. Final focused tests cover those fixes, capped failed payouts across serialization, boss permits, each hero power, finite decoys, once-only explosion healing, charge consumption, repeated-light charge denial, actual repeated sock inputs allowing an enemy response, defiance expiry, summoned rewards, lure exceptions and projectile interception.

All **85 simulation tests** pass. Nine campaign tests cover every hero/style combination through twelve chapters, carrying actual earned progression and allowing at most three attempts per chapter through the capped payout function. The steering policy now splashes nearby messes and saves powers for boss recovery/jam windows. It still uses public combat inputs, without HP edits, teleportation or skipped encounters. These changes mean cross-version policy results are not a controlled experiment.

Final fresh-equipment audit: four policies × three seeds × three heroes × twelve chapters = **432 runs, no timeouts**:

| Scripted policy | Wins / 108 |
| --- | ---: |
| Attack only | 0 |
| Attack + power | 3 |
| Attack + power + dodge | 36 |
| Varied moves, setups and boss openings | 77 |

Raw results: [GAMEPLAY-AUDIT-0.6.json](GAMEPLAY-AUDIT-0.6.json). Scripts have precise steering; these rates are neither human difficulty ratings nor proof of fun. The initial decoy implementation let Bram distract brutes/ranged enemies; that audit exposed an overly strong attack/power loop. Restricting the lure and slowing normal passive regeneration reduced that route’s wins. Human replay desire, humor and touch feel still need testing.

Browser checks: 48 passed, 6 inapplicable combinations skipped. Android 0.6.0/code 6 debug APK and unsigned release AAB built with release lint; iOS assets synced and project syntax parsed. No native iOS compile or physical-device test on this Linux host.

Screenshots `artifacts/filth-{heroes,surgery,progression,mobile}.png` use real UI. The three hero power images are staged simulation fixtures, as recorded in `artifacts/filth-captures.json`.
