# Level identity: Super Meat Boy × Castle Crashers

Research date: 2026-09-08. The reference here is the original **2010 Super Meat Boy**, alongside Castle Crashers. This extends the earlier [genre research](GENRE-RESEARCH-SOURCES.md). Recommendations below are original design proposals, not claims that the reference games use these exact mechanics.

## What the references actually support

| Reference | Primary evidence | Translation for Emberbound — our inference |
| --- | --- | --- |
| Super Meat Boy: difficulty and learning | McMillen and Refenes describe removing lives, reducing respawn delay, using short levels, and keeping the goal visible. The completion replay celebrates improvement through repeated attempts. Their in-game editor made rapid level iteration possible. [Developer-authored 2011 postmortem](https://www.gamedeveloper.com/audio/postmortem-team-meat-s-i-super-meat-boy-i-) | Long chapters still need short, understandable challenges, visible immediate destinations, and inexpensive retries. Walking through a larger empty space does not inherit Meat Boy's difficulty design. |
| Super Meat Boy: coherent grotesque setting | Team Meat's own description connects haunted hospitals, salt factories, needles, saws, and crumbling caves with a vulnerable meat protagonist. It explicitly describes cartoon blood trails rather than realistic injury. [Publisher-controlled original game page](https://store.steampowered.com/app/40800/Super_Meat_Boy/) | Give each place a disgusting purpose, material, and hazard that belong together. Toy stuffing, mould, grease, teeth, and filthy household machinery can form our own consistent world. |
| Castle Crashers: adventure, performance, and readability | Paladin says they prioritize weak mechanics and levels before extra ideas. Fulp describes staging a dramatic camera pause around an animal gag. They also acknowledge complaints about foreground obstruction and excessive magic. [Direct 2008 interview with Paladin and Fulp](https://www.gamedeveloper.com/design/taunting-the-behemoth-tom-fulp-and-dan-paladin-cry-out) | Environmental jokes should unfold as actions with a payoff. Strong silhouettes and readable warnings must survive the extra grime and spectacle. Their tolerance for visual chaos is a preference, not proof it will work on a small touchscreen. |
| Castle Crashers: reasons to explore and grow | The official feature description connects collectible weapons and companions, attribute allocation, progression-linked attacks, and cooperative adventure. [The Behemoth's Steam description](https://store.steampowered.com/app/204360/Castle_Crashers/) | Put useful discoveries in memorable places and immediately provide a situation where a new move or weapon matters. More unlock names alone will not produce combat depth. |

These sources establish developer intentions and shipped features. They do not establish that our current implementation is fun or matches either reference's quality.

## Five concrete changes

1. **Give every region an unmistakable physical premise.** Use giant broken household structures, asymmetrical silhouettes, layered depth, stained surfaces, hanging scraps, and visible destinations. Keep the playable floor less busy than the scenery. Proposed regional briefs:

   | Region | Landmark and material story | Playable consequence |
   | --- | --- | --- |
   | Woods | A picnic ground swallowed by a leaking municipal kettle; tea stains and mouldy cloth | Vent bursts cut across the picnic path |
   | Freezer | A freezer mortuary where expired dough still breathes; cracked ice and freezer burns | Alternating cold leaks force a lane choice |
   | Laundry | A flooded laundromat shrine; lint dams and socks hanging like offerings | A rinse outlet pulses across the crossing |
   | Candy | A condemned confectionery chapel; fly-covered syrup and rotting wafer masonry | Syrup machinery telegraphs sticky danger zones |
   | Junkyard | A scrapyard digestive system; oily conveyors and discarded safety notices | Stamping machinery creates attack and movement windows |
   | Keep | A rain-soaked cardboard palace built over an overflowing public toilet | Failing royal plumbing interrupts the throne approach |

2. **Author a rhythm inside the long journey.** Sequence reveal → isolated mechanic → mixed fight → optional discovery → escalating set piece → aftermath. Change lane demands and scenery composition at those transitions. The current `STAGES` construction in [content.ts](../src/content.ts) still gives journeys six regularly spaced encounters; that is a useful scheduling scaffold, but insufficient authorship by itself.

3. **Make scenery participate in fights.** Start with clearly announced, periodically active region hazards and a safe lane. Let players bait enemies into them where collision rules support it. Teach the hazard alone before adding complementary enemy roles. Show anticipation, active danger, and cooling aftermath; the artwork and damaging shape must agree.

4. **Stage a gag the player causes.** For example, bowl a rat into an inspection bell; the inspector stamps the destroyed snack stand “PASSED” and then falls through it. Build anticipation, impact, reaction, and a lasting scene change. Keep repeat-run interruptions skippable and avoid jokes that conceal an active threat.

5. **Make failure explain a useful next attempt.** Keep retries close to the failed challenge, preserve already-earned progression correctly, and show the last meaningful danger source. Reward optional mastery routes with a distinct weapon or practical advantage. Do not increase health, enemy count, or travel time merely to extend the struggle.

## Review criteria

Compare actual gameplay captures at a phone-sized viewport. Can a player identify the region without its title, see their feet and incoming danger, predict a hazard after its first demonstration, and describe a funny event they caused? Observe whether the new layout changes their choices and whether they willingly retry. Test those questions with people; simulation survival rates and screenshots cannot answer them alone.

## Implementation follow-through, 0.11

The comparison led to a concrete change: all six journey encounter sequences now differ, and each contains a workplace sabotage that the player causes through Heavy attacks or bowling. The inspector urn, defrost cabinet, staff toilet, chocolate font, time clock and royal stamp have separate disasters and persistent wrecks. Warning geometry is shared with collision; some attacks can be jumped while overhead hazards require lane changes. Existing encounter checkpoints restore failed sabotage and rewards. Details and evidence: [0.11](UPDATE-0.11.md). This addresses the action/reaction and readable-failure recommendations; it does not resolve the larger question of human enjoyment or all journey pacing.

## Applying both references to boss combat, 0.13

Rechecked Team Meat's developer postmortem and The Behemoth's official feature description on 2026-09-08. These are complementary references, not a request to turn a lane-based brawler into a precision platformer.

| Question for our game | Super Meat Boy comparison | Castle Crashers comparison | Current evidence / next gap |
| --- | --- | --- | --- |
| Can a loss teach the next attempt? | Short, clearly understood attempts and fast retry | Combat choices should remain readable amid spectacle | Persistent encounter retries; overhead ice/stamps now match their drawings. Human recognition still needs observation. |
| Does defense involve a decision? | Distinct hazard patterns with consistent collision | Different encounters and combat tools | Low sweets versus biting dentures; low versus raised forks. The new mixed probe changes lanes, but Heavy-only still succeeds too often. |
| Does a location have a memorable identity? | Gross setting tied to its vulnerable protagonist | Staged gags with anticipation and payoff | Region machines, lasting wrecks and boss performances. Repeated scenery scaffolds and long-road pacing still need stronger authorship. |
| Is progression more than a number? | Mastery grows through player learning | Weapons, attributes and unlocked attacks support adventure | Earned-equipment campaign probes complete; deliberate combo value and weapon tradeoffs need human comparison and further exploit work. |
| Does spectacle help play? | The player must understand a failure quickly | Camera staging and comedy can make an encounter memorable | Denture bite, falling stamp and raised-fork animation share combat state. Phone captures exposed a combo overlay obstruction, now moved into the upper HUD. |

Implementation and the candid before/after audit are in [0.13](UPDATE-0.13.md). More gross decoration alone does not satisfy either reference.

## Adventure-loop follow-through, 0.16

The current [controller pass](UPDATE-0.16.md) connects the retry/progression systems to the input device used during combat. Map selection, purchases, story, boss performances and fight retries now accept controller input, preserve visible focus, and require held combat buttons to be released when a menu closes. This applies the low-friction retry and complete-adventure principles above; it is not additional research evidence or a claim that either reference uses the same implementation. Journey pacing and human enjoyment remain open.

## Journey-place follow-through, 0.18

The repeated foreground building has been replaced by thirty distinct landmarks aligned to encounter positions. Regional entrances remain, and each later stop has a physical premise and a cleared-workplace aftermath. The road edge and building foundations now respect the upper movement lane. This implements the location-identity recommendation; it does not implement a new travel rhythm or verify human engagement. The [0.18 change report](UPDATE-0.18.md) separates staged art fixtures, actual browser gameplay and the remaining pacing work.

## Committed attacks and earned openings, 0.19

The brute now holds its visible attack direction through frontal hits. A prepared combo finisher, rear hit or bowled body breaks the stance; evasion still creates an opening. Its low and high attacks have different arm anticipation and matching floor warnings. Melee also now damages enemies during missed-rush recovery, correcting an invisible exception to the advertised punish window. This applies Meat Boy's consistent, readable consequences and Castle Crashers' meaningful use of different tools. It is an implementation inference from the existing sources, not new research or evidence of equivalent quality. The [matched audit](UPDATE-0.19.md) records the mixed balance result rather than claiming spam is solved.

## Optional road choices, 0.20

A [timing probe](PACING-0.19.json) of six 0.19 Ash journeys (earned profiles, seed 140, ordinary mixed inputs) classified 13–17 seconds per run as travel, with the longest uninterrupted travel span at 4.3 seconds. These are precise scripted runs, not human campaign timings. The next change makes existing supplies a decision: twelve regional booths offer a short, visible hazard cycle and an optional reward, while leaving a safe passing route. This combines the readable hazard/learning principle with a reason to explore and grow. The [route-choice audit](UPDATE-0.20.md) compares rushing, reading and skipping without changing combat inputs or inventing player health. Human pacing and enjoyment remain unverified.

## Sound serving both references, 0.21

The comparison continues to guide distinct decisions: Super Meat Boy's readable failure/quick-return principle argues for danger sounds that survive crowded action, while Castle Crashers' performed encounters and characterful adventure argue for regional musical punctuation. The new mix lowers the score during warnings, bounds repeated impact voices and gives each region its own entrance, rage and victory cues. This is our design application of the sources above; it does not assert either reference uses this particular mixer. A sampled browser signal, actual boss UI transport checks and a staged recording provide implementation evidence. They cannot establish comparable energy, comedy, enjoyment or listening quality. See [the audio pass](UPDATE-0.21.md).

## Final-boss target choices, 0.22

The king's staff now carry his protection through visible receipt links. Clearing them opens him normally; bowling an employee into him breaks the seal for a longer stagger. This applies the Castle Crashers lesson that familiar combat tools should matter in an authored encounter, alongside Super Meat Boy's requirement that the visible state explain the consequence. It does not assume either reference has this exact mechanic. The [0.22 report](UPDATE-0.22.md) records an unchanged-input comparison, real UI captures and the remaining uncertainty about human discoverability and pacing.

## Progression preserves learned tools, 0.23

The combo audit found a conflict with the reference lessons: weapon/style overrides could remove the advertised bowling or spin recipe, and expired hit counts could help start a later chain. The new rules preserve the shared recipes, add Scrapper's quake on a directional finisher, and show the live chain and available action. This applies the Castle Crashers progression principle and the Super Meat Boy consistency/feedback principle from the existing research. It does not establish that this directional input feels good on two thumbs. See the [0.23 report](UPDATE-0.23.md) and its separate scripted evidence.

## Count Snackula follow-through, 0.25

The Count now serves low sweets and then a committed overhead bite in each attack, keeping his body guarded until both finish. HUD cues follow the next unresolved hazard; the attack positions do not track an escaping player. This applies the Super Meat Boy lesson of a readable sequence with a learnable response and the Castle Crashers lesson of a distinctive boss performance with room to use combat tools: aerial head attacks stay available during the serving, and the opened body rewards the recovery window. His jaw chatters and spits crumbs. No health increase or forced survival gate guarantees a minimum number of patterns. [Changes and matched strategy evidence](UPDATE-0.25.md); human enjoyment remains unverified.

## Delivery follow-through, 0.26

All six regional deliveries now offer a deliberate action: a Heavy from behind launches their load through unprepared enemies. Planted brutes stop it, the axle cools before another launch, and each region has distinct cargo and motion. The player causes the comic consequence instead of only walking beside a repeated box. This applies the Castle Crashers action/reaction and regional-adventure interpretation, while the visible roadblock/cooldown keeps the consequence readable in the Super Meat Boy interpretation. Ordinary escorting remains available. [Implementation and limits](UPDATE-0.26.md); this does not yet redesign the repeated journey spacing or establish human enjoyment.

## Audio interruption follow-through, 0.27

Unexpected loss of enabled audio now pauses combat, and restoring the audio device does not resume the fight automatically. This supports the readable-warning and fair-retry principles in the comparison: a player should not silently miss cues while combat continues. Explicit resume also retries interrupted audio contexts. Browser and Android emulator recovery evidence, the controlled interrupted-state fixture, and the still-unexplained earlier startup silence are separated in [0.27](UPDATE-0.27.md).

## Enemy attacks become playthings, 0.28

The bloat tick’s delayed blasts now have physical sacs that a grounded Light can punt, with the original fuse retained and the second danger still pending. This applies the Castle Crashers interpretation of comic action/reaction and different combat tools, alongside the Super Meat Boy interpretation of a readable threat with consistent timing and collision. An initial Heavy version was rejected after a matched strategy audit rewarded more Heavy-only play. The [final change and comparison](UPDATE-0.28.md) preserve separate evidence for a new option and the still-unproven questions of human fun and overall challenge. This is application of the existing primary-source research, not a new claim about either reference game’s mechanics.

## Creature identity and moving workplaces, 0.29

The latest pass applies the Castle Crashers interpretation through distinct character silhouettes, expressive power poses and player-triggered workplace consequences. Three original textured hero sheets replace the repeated procedural faces in both portraits and combat. The Super Meat Boy interpretation remains about readable motion and consistent response: separate windup/contact poses follow actual attack timing, and jumping clears the new rinse/conveyor force without changing the hazard's timer or collision rules. A distinct brake makes the lasting consequence visible. The matched audit does not show harder combat, and the eighteen paired scripted journeys do not establish human pacing. Neither the regular encounter spacing nor ordinary enemy art was redesigned by this pass. [Implementation, evidence and limits](UPDATE-0.29.md).
