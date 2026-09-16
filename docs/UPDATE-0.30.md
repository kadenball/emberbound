# 0.30 — Read your shit

The menu attempts to play the selected recording automatically after applying saved sound settings. Android and iOS Capacitor already configure their web views to allow media without a gesture; the game had unnecessarily waited for one. A music-off preference remains off. Ordinary browsers can still reject audible autoplay: the first real menu gesture retries it. [Chrome's autoplay policy](https://developer.chrome.com/blog/autoplay), [Apple's media policy configuration](https://developer.apple.com/documentation/webkit/wkwebviewconfiguration/mediatypesrequiringuseractionforplayback).

## Heavy has answers

Two successful, closely repeated frontal ground Heavies make a creature read the pattern. It flashes **READ YOUR SHIT!**, briefly resists control and reduces further raw Heavy damage. Ordinary enemies commit their own telegraphed response; bosses create a pink ground blast with 0.65 seconds of warning and shorten their recovery. Jump late, leave the ring, earn a Light-Light-Heavy finisher, attack from the rear, or fight in the air. A single Heavy retains its damage and utility. Actual combo finishers, air strikes and rear hits do not trigger this read. The help screen and defeat advice explain it.

A regression test exposed an escape-input problem: an earlier buffered ground Heavy could turn a new jump into a dive. Jump now discards that old Heavy buffer; a fresh Heavy tap in the air still dives. Six boss-region tests exercise the real jump escape from the committed counter, alongside first-hit damage, a connected Light-Light-Heavy recipe and ordinary brute retaliation.

The previous Heavy probe tapped only every 40 frames. That missed the user's exploit. The new probe also taps every other frame and separately stops moving whenever a target is within striking reach. Both still approach distant targets and handle mandatory scenery after enemies die; neither is a literally stationary whole-campaign test.

| Scripted policy | 0.29, old earned profiles | 0.30, same profiles | 0.30, newly earned profiles |
| --- | ---: | ---: | ---: |
| Rapid Heavy | 71/108 | 0/108 | 0/108 |
| Rapid Heavy, planted within reach | 43/108 | 0/108 | 0/108 |
| Original slower Heavy | 27/108 | 0/108 | 0/108 |
| Light + power | 22/108 | 15/108 | 16/108 |
| Mixed attacks and evasions | 103/108 | 98/108 | 100/108 |

Rapid Heavy's boss wins fall from 32/54 to zero. Mixed boss wins are 51/54 with matched equipment and 52/54 with fresh progression. No evaluation run retries, changes health, teleports or skips encounters; all terminate. Fresh profile generation can use three entry-checkpoint retries per attempt and up to three chapter attempts, with actual capped defeat payouts. An intermediate counter-only build, before expanding routes, already reduced rapid Heavy to 4/108 wins and zero boss wins while mixed remained 103/108. The final numbers include both the counter and longer routes. These probes support a specific exploit fix, not a claim that human fun or every possible dominant strategy is solved.

[Old rapid-spam baseline](HEAVY-SPAM-AUDIT-0.29.json), [counter-only comparison](HEAVY-SPAM-AUDIT-0.30-first.json), [final rapid-spam audit](HEAVY-SPAM-AUDIT-0.30.json), [matched four-policy audit](COMBAT-AUDIT-0.30.json), [fresh progression audit](COMBAT-AUDIT-0.30-FRESH.json), [fresh rapid-spam audit](HEAVY-SPAM-AUDIT-0.30-FRESH.json).

## Painted attacks, creatures and blood

Three additional transparent hero atlases add **24 attack poses**: jab load/contact, uppercut load/contact, sweep load/contact, dive and flying kick per hero. These supplement the previous 24 locomotion, jump, power, attack and hurt poses. The simulation selects move families and phases; hand sockets carry equipped weapons, and procedural anticipation, recovery, spin, landing squash and move-specific trails supplement the painted poses.

Two new atlases add **32 ordinary-enemy poses**, four each for rats, shell crabs, sock brutes, porcupine boars, mosquitoes, bloat ticks, jelly nurses and centipedes. Each has idle, movement, windup and contact art. Existing pounces, scuttles, charges, aimed shots, sacs and stitches drive it. Knockdown, bowling, freeze, death fading, broken guards, vulnerable brute backs and royal protection retain visible cues. The six bosses keep their existing bespoke procedural art and performances.

Actual damaging hits emit directional blood droplets; landed droplets leave fading dark-red stains beneath actors. Armor clangs do not bleed. The cosmetic simulation does not consume gameplay RNG or affect collision, rewards or saves. It caps live droplets at 220 and stains at 130; stains expire after 35 seconds and retry clears them. [Artwork and provenance](ART-0.30.md).

## Eighteen more districts

Every journey grows from six encounters to nine: **72 total encounters**, across the existing twelve chapters, six regions and six bosses. Journeys are now **10,430–13,080 world units**. These are eighteen extra encounters, not eighteen new chapters or bosses.

| Region | New physical destinations |
| --- | --- |
| Woods | Root Butcher, Maggot Motel, Compost Choir |
| Freezer | Freezer Morgue, Ice-Lolly Sawmill, Defrost Funeral |
| Laundry | Surgical Spin Ward, Hairball Reservoir, Lost Limb Counter |
| Candy | Gelatin Guttery, Tooth-Pull Taffy Line, Sugar Crash Ward |
| Junkyard | Organ Recycler, Rusted Rib Press, Redundancy Shredder |
| Royal | Royal Disposal Yard, Inheritance Grinder, Last Appeal |

Each district has an authored two- or three-wave enemy composition, its own physical architecture, regional weathering, a live machine hazard and a bonkable shutoff lever. Barrels and springs add positioning opportunities. Narrow service lanes alternate with wider rooms; spacing varies within and across regions. Later fights combine support, ranged, braced and charging enemies introduced earlier. The new machinery is created on first entry and checkpointed, so an older valid adventure bookmark gains it when reaching the district. Bookmark validation now follows the authored encounter count rather than assuming six.

Castle Crashers remains the reference for expressive attack identities, enemy combinations and useful progression; Super Meat Boy informs readable warnings, consistent jump responses and quick retries. This pass applies those lessons without copying their characters or maps. Human pacing, animation fluidity and enjoyment still need direct play review. [Earlier reference research](LEVEL-DESIGN-RESEARCH.md), [validation](VALIDATION.md), [open full-game target](QUALITY-TARGET.md).
