# 0.20 — Your benefits may bite

The two ordinary supply crates in each journey previously paid 25 gold and 25 HP without a local challenge. They now sit in twelve optional benefits booths, guarded by the region's own machinery. The first booth uses an upper bay; the second uses a lower bay. The middle passing lane stays outside the hazard. Weapon finds retain their existing placement and rules.

| Region | Booth | Readable danger |
| --- | --- | --- |
| Woods | Complimentary tea bags | Low spore fumes |
| Freezer | Expired staff benefits | A moving cutter inside a marked corridor |
| Laundry | Lunch lost property | A local suction warning followed by low fumes |
| Candy | Communion snacks | Rising taffy |
| Junkyard | Compensation station | An overhead press |
| Keep | Your taxes, reheated | An overhead tax stamp |

![Staged active booth designs](../artifacts/supply-roster.png)

## A short optional decision

A nearby booth starts with a full one-second warning. Its shutters close during the 0.75-second hazard, followed by a 1.45-second quiet interval before the next warning. Get close to an open shutter and bonk it to collect the existing reward. A remote long-reach swing cannot collect from outside the bay. A bowled body can reach a booth, but closed shutters also reject that impact. The player can choose to grab during the warning, wait beside the bay, escape a low hazard with a jump or simply pass. Overhead presses catch jumps.

Collision and animation use the same clock. The cutter's warning covers the union of its swept hit shape, and its active position has a separate marker. The press descends during the end of its warning and is down when damage becomes active. Road-drain suction only affects someone already entering its bay, so it cannot gradually pull a waiting player off the middle route. Help, local captions, nearby objective text and supply-specific defeat advice describe the available responses; these booths have no shutdown lever to search for.

Claiming the booth stops its machinery and leaves a receipt. Co-op claims pay once, healing the player who reaches it first. A successful claim between fights updates the cleared-road checkpoint and its autosave key, including the reward and disabled booth. Reopening cannot collect the same reward again. Claims made during an active fight follow that fight's existing retry rules. Older bookmarks without road machinery still deserialize with their ordinary crates.

## Route-choice evidence

`scripts/audit-supplies.mjs` reuses 0.19's earned profiles across all six journeys, three heroes and three seeds. The three policies share combat inputs; they differ only when deciding how to approach an optional booth. No player health/position edits or wave skipping are used.

| Choice | Wins / 54 journeys | Booths claimed / 108 | Total supply-hazard damage | Timeouts |
| --- | ---: | ---: | ---: | ---: |
| Rush with the existing mixed probe | 51 | 108 | 1,102 HP | 0 |
| Wait for the opening | 53 | 108 | 0 HP | 0 |
| Skip the detour | 53 | 0 | 0 HP | 0 |

This demonstrates a working choice under scripted steering: the reward can be earned without taking supply damage, and it is not required to finish. It does not establish whether people enjoy the wait or find the reward worthwhile. Raw evidence: [162-run route audit](SUPPLY-AUDIT-0.20.json).

The separate, unchanged **432-run combat audit** still gives Heavy-only **30/108** wins, including **19/54 boss chapters**. Light wins 0/108; Light + power 28/108; mixed 104/108, including 53/54 boss chapters. All runs terminate. Compared with 0.19, two mixed journey wins become losses when the existing probe rushes supplies; Heavy-only totals do not change. This is not a broader combat-balance fix. See [raw combat audit](COMBAT-AUDIT-0.20.json).

## Review and tests

Simulation checks cover the safe passing lane in all six regions, first warning, one hit per cycle, closed-shutter rejection, claim timing, remote-swing limits, low versus overhead danger, co-op payment, older bookmarks and durable claims. All nine earned-progression hero/style campaigns and cooperative chapter play remain covered.

A browser test reaches the first booth through a normally played woodland chapter, captures warning/active/claimed states, checks the actual reward, reloads the runtime and continues the saved adventure. It uses input-only steering; the six-region art roster is explicitly staged. Phone-sized warning and claimed captures were inspected; duplicate claim lettering was removed. A separate staged lower-edge royal booth fixture checks the floor and scenery layers. Final results are in [validation](VALIDATION.md).

Artifacts: `artifacts/supply-{warning,active,claimed}-{desktop,android,iphone}.png` `artifacts/supply-roster.png` and `artifacts/supply-lower-keep.png`.

This follows the [Super Meat Boy / Castle Crashers comparison](LEVEL-DESIGN-RESEARCH.md) through readable risk and a useful discovery. The full quality target remains open: human pacing/comedy/enjoyment, broader combat exploits, soundtrack/SFX listening, physical-device/controller/lifecycle performance and native iOS release verification still need evidence.
