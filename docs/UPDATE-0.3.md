# 0.3 — The drawer of terrible ideas

The crown has lost six teeth. Ash, Wren, and Bram must retrieve them from six spectacularly unqualified bosses.

## A longer campaign

Twelve sequential, replayable chapters span six regions. Each region has a long journey with six or seven encounters, followed by a three-encounter boss chapter. Journey maps are 6,800–8,300 world units, compared with 2,850 in 0.2. There are 57 encounters in total. The map records chapter stars and recovered crown teeth.

| Region | Journey | Boss chapter | Boss behavior beyond the telegraphed stomp |
| --- | --- | --- | --- |
| Wobbly Woods | The Whispering Wood | The Picnic of Doom | Sir Burps-a-Lot fires burp volleys; more projectiles at half health |
| Brain-Freeze Country | Frostfall Pass | Freezer Burn | The Abominable Doughman drops timed ice bombs in alternating lanes |
| The Lost Sock Marsh | Laundry Lagoon | The Rinse Pit | Madame Spin-Cycle spreads volleys and calls support gremlins |
| Sugar-Rush Industries | The Crumble Works | The Last Supper-ish | Count Snackula chains delayed explosions across the road |
| The Rusty Rump | Junkdrawer Junction | Employee of the Bonk | Forklift Frank charges his locked direction, then adds projectiles |
| Cardboard Royalty | The Hollow Keep | The Throne of Bad Decisions | His Royal Toothiness combines bombs, volleys, and reinforcements |

The new marsh, factory, and junkyard have original landmarks rather than recolored forest props. All six boss arenas have additional set dressing. Terrain streams in visible 1,024-unit chunks; increasing chapter length does not allocate a full-length terrain texture.

## Enemies and scenery

Seven ordinary enemy types have distinct behavior and accessories: spoon raiders, fork throwers, plunger brutes, lid-carrying shield guards, stink-bomb chefs, charging sock rockets, and support gremlins. Shield guards resist frontal light hits; aerial attacks, magic, and finishers counter them. Chargers commit to a lane, bombers leave delayed ground hazards, and healers mend nearby allies.

Attack nearby scenery with the normal attack button:

- Golden stashes contain regional weapons. Later stashes sit farther along the journey and near the road edges.
- Snack stashes restore 30 health and award 25 gold.
- Bean barrels blast nearby enemies once, without damaging the hero.
- Levers open their linked striped gates.
- Walking onto a spring cushion launches a higher jump.
- Timed vents hurt both heroes and enemies. Jump over their fumes and delayed bombs.

The in-game field guide explains all counters and interactions.

## Combat progression and equipment

XP is earned immediately for kills, gate interactions, and chapter completion. Combat level is capped at 10; each level adds 2 melee power and 6 maximum health, grants healing, and refills magic. These are shared campaign levels across all heroes.

| Level | New move | Input |
| --- | --- | --- |
| 1 | Three-hit bonk; aerial slap and belly-flop | Hold Attack; Jump → Attack |
| 3 | Spin of shame, a fourth hit with damage all around | Continue the attack chain |
| 5 | Panic uppercut, a guard-breaking follow-up | Dodge → Attack shortly after the roll |
| 7 | Extinction flomp, double landing radius and damage | Jump → Attack → Land |

The armory contains starting equipment plus seven finds: Pan of poor choices, Brain-stick, Sock of last resort, Jawbreaker, Unreasonably large fork, The tooth fairy’s problem, and the final boss’s Royal toilet brush. Weapons vary in power, recovery speed, reach, and perks: knockback, freeze, mana gain, healing, shield damage, or splash damage. New weapons equip immediately; replaying a stash containing an owned weapon awards 35 gold. Any owned weapon can be equipped at camp.

Victory and defeat bank gold, XP, and discovered weapons once. Quitting an active battle forfeits unbanked rewards. There is no mid-chapter resume after process termination; pause resumes the current in-memory battle.

## Existing progress

Save schema 2 retains the original `emberbound.save.v1` storage key so older installations can find their data. Old wood and pass victories map to the corresponding journey/boss pairs. The old keep victory maps to the final region, and a completed old campaign leaves every new chapter available. Gold, XP, settings, hero choice, and forge upgrades carry over. Existing XP now grants combat levels according to the new curve. Invalid weapon IDs are rejected; only owned weapons can be equipped.

Android/iOS project versions are 0.3.0, build 3. The Android testing APK and unsigned release bundle are rebuilt from the current web assets. Native iOS compilation and physical-device release testing still require the environments described in [RELEASE.md](RELEASE.md).
