# Why Emberbound is not fun enough yet — research and improvement plan

Date: 2026-09-07. Build audited: 0.3.0. Requested comparison: Castle Crashers and other side-scrolling action games, especially beat ’em ups.

## Conclusion

Emberbound needs stronger moment-to-moment combat and authored adventure pacing before another content expansion. The previous update increased chapter length, enemy types, weapons, and progression without sufficiently improving how those systems interact. The result can satisfy a feature checklist while asking players to repeat the same solution.

This conclusion combines developer testimony, inspection of our implementation, actual game screenshots, and 324 scripted combat simulations. It is not a claim that we have measured human enjoyment or reproduced a commercial game's combat timing. The existing passing tests established functionality and reachability; they did not establish fun.

## What the reference games teach us

| Reference | Relevant lesson | Primary evidence |
| --- | --- | --- |
| Castle Crashers | Player-directed light/heavy branches connect launching, jumping, and aerial follow-ups. | [Official Remastered manual](https://dlassets-ssl.xboxlive.com/public/content/0f963681-f296-4987-9cd1-ff050274c99e/GameManual/1c1beeac-5bf2-441f-b9b8-0135239c89e6/en-US/index.html) |
| Castle Crashers development | Repair weak mechanics and levels before pursuing the backlog of extra ideas. | [Dan Paladin and Tom Fulp interview](https://www.gamedeveloper.com/design/taunting-the-behemoth-tom-fulp-and-dan-paladin-cry-out) |
| Streets of Rage 4 | Complementary enemy threats and moves with distinct purposes create tactical choices. | [Developer interview](https://blog.playstation.com/2020/04/30/streets-of-rage-4-how-three-studios-revived-a-legendary-series/) |
| TMNT: Shredder’s Revenge | Reliable contact, fast encounter flow, and comic enemy entrances support immediate enjoyment. | [Yannick Belzil’s development account](https://www.gamedeveloper.com/design/deep-dive-how-tmnt-s-shredder-s-revenge-was-built-from-nostalgia-and-new-ideas) |
| Castle Crashers co-op | Local and online cooperative play is a substantial part of its offered experience. | [Publisher-controlled game page](https://store.steampowered.com/app/204360/Castle_Crashers/) |

These games support different tastes. Streets of Rage's deliberate positioning is not a reason to slow our game indiscriminately. Castle Crashers' cooperative chaos is not a reason to obscure the player's character. Our target should be fast, readable, expressive slapstick. See [source notes](GENRE-RESEARCH-SOURCES.md) for eight original sources, attribution, and limitations.

## What our current game actually rewards

A reproducible probe ran three policies against every hero/chapter combination using three random seeds. Every run started with base equipment and no forge upgrades, then acquired loot and levels normally. Steering tracks the nearest enemy and aligns lanes precisely. It also searches nearby chests and operates required levers. No health overrides, skipped encounters, private combat calls, or production modifications were used.

| Scripted policy | Wins / runs | Losses | Timeouts |
| --- | --- | --- | --- |
| Basic attacks; no spells, jump inputs, or dodges | 105 / 108 | 3 | 0 |
| Basic attacks plus available magic; no jump inputs or dodges | 108 / 108 | 0 | 0 |
| Same attacks/magic plus the existing test bot's defensive behavior | 108 / 108 | 0 | 0 |

With the attack-and-magic policy, the median boss executed just one attack across 54 boss-chapter runs; eight bosses executed none. The simple offense policy was faster on average than the defensive policy, but that comparison concerns these specific scripts, not optimal human strategies.

The simulated journey chapters averaged about 24–30 seconds each with attack/magic, despite their larger world lengths. Boss chapters averaged about 10–16 seconds including their preliminary waves. These are 60-Hz simulated frame durations including hit-stop, not CPU runtime or predicted first-time player completion times. Precision steering is an important advantage. Automatic spring jumps are possible even though no jump button is used. End-of-wave and level-up healing also make final HP a poor standalone challenge metric.

**Interpretation:** successful basic play is desirable, but our additional actions have weak practical value when one generic approach overwhelms almost every encounter. Making enemies take more damage to kill would risk stretching the same repetitive loop. The next iteration needs clearer choices, punishable mistakes, and a satisfying mastery payoff.

Reproduce with `node scripts/audit-gameplay.mjs`. [Full data](GAMEPLAY-AUDIT-DATA.json).

## Ranked implementation gaps

### 1. Combat does too much automatically

In [engine.ts](../src/engine.ts), `attack()` advances a fixed three/four-hit chain while Attack remains held. The chain automatically reaches a shield-breaking finisher, so a shield frequently changes damage taken without requiring a different decision. Auto-facing selects nearby targets. Launching exists, but ordinary melee does not compare player and enemy height; airborne enemies remain hittable through the same ground attack check. There is no complete player-controlled launch, chase, juggle, knockdown, and recovery system.

Ordinary hits apply 0.30 seconds of stagger while the first two swings recover in 0.18 seconds and finishers in 0.29 seconds before weapon speed modifiers. Repeated attacks can therefore prevent a nearby enemy's AI from recovering. This is a concrete contributor to the offense-heavy simulation results, although spacing and knockback still matter.

**First change:** establish distinct light attack, deliberate finisher/launcher, aerial follow-up, and defensive escape roles. Make the basic opening expressive immediately. Preserve easy entry and an optional simple-input mode, while deliberate choices earn better control, damage, safety, or score. Rework stagger and recovery together with enemy counterplay; do not just increase HP.

### 2. Hits need coherent physical timing and reactions

Melee damage resolves immediately inside `attack()`, before the renderer shows the swing. `attackTime` primarily animates the aftermath; it does not define an attack's active collision window. Most moves share the same underlying swing. Every enemy hit receives the same configured hit-stop value, and the audio system has a common hit sound. There are useful shake, particles, squash, and launch effects already, but the relationship between body motion, contact, sound, and target response remains shallow. See [engine.ts](../src/engine.ts), [plush.ts](../src/plush.ts), and [audio.ts](../src/audio.ts).

There is also a responsiveness concern: [input.ts](../src/input.ts) buffers a short tap until a simulation update, while [main.ts](../src/main.ts) consumes it even when the attack is still cooling down. A tap during recovery can disappear rather than queue for the next valid attack. This is code evidence, not a measured device latency result.

**First change:** give moves explicit startup/contact/recovery states, a short bounded input queue, readable recoil, knockdown/get-up behavior, and animation-aligned effects. Differentiate light slaps, heavy pan impacts, guard clangs, launches, and landing thumps. Keep responsiveness high; adding animation must not make every input sluggish. Verify on touch hardware.

### 3. The stages repeat a template

[content.ts](../src/content.ts) generates all journeys from regularly spaced encounter positions. `startWave()` uses the same count formula and cycles a region's enemy pool. `createProps()` repeats the same spring, barrel, lever/gate, and chest pattern. Scenery is richer, but the navigable space remains one constant-width road with the same depth bounds. Opening a gate is usually a nearby attack, rather than a distinct situation to solve.

**First change:** author an encounter sequence with changes in threat, geography, and objective. Examples: a narrow bridge where knockback matters, enemies bursting from a laundry pile, a moving cart sequence, a shortcut with optional loot, a brief quiet reveal, and a boss introduction. Preserve the eventual longer adventure by adding different experiences along it. Avoid extending travel distance or repeating an encounter solely to meet a duration target.

### 4. Bosses share too much structure and end too quickly

Every boss uses the same approach logic, stomp warning, and baseline attack cadence, then adds region-specific volleys, hazards, reinforcements, or a charge in `bossAttack()`. Those differences are real, but the shared underlying fight and low number of completed attacks limit discovery and learning.

**First change:** rebuild one boss around a unique, readable behavior cycle. For Madame Spin-Cycle, trial suction lanes that pull loose props, a spin/ricochet hazard, and a jammed-drum vulnerability the player can create. Teach each behavior before combining them. Provide room to evade and attack, a visible response to success, and a quick retry. Determine phase length through playtesting, not an arbitrary health multiplier or long invulnerability waits.

### 5. Funny appearance needs funny behavior

Our identity is strongest in the scruffy creatures, household weapons, scenery, and names. Most enemy behavior still looks like approaching and swinging. Faces on background objects and floating joke text add character, but offer few situations players cause and retell.

**Proposed signature: plush bowling.** A deliberate heavy finisher rolls a soft enemy into others and breakable scenery. A spring redirects it; a pan changes its bounce; a guard's lid can block or deflect it. Exaggerated squeaks, flailing limbs, and loose stuffing communicate the same physical event that changes the fight. This is an original proposal, not a feature claimed from a reference game. Start with one understandable interaction; avoid adding several disconnected meters and systems.

### 6. Equipment and heroes need stronger playstyle differences

Weapon perks exist, but all weapons use the same main attack loop. Many later items are broadly stronger, while attack-speed differences are small. All heroes share that loop; their spells and stats provide most of their mechanical identity. XP unlocks are automatic and cannot by themselves make repeating the opening enjoyable.

**Next change:** make a small set of meaningful alternatives: a slow wide pan that bowls enemies, a quick short-range tool that excels at air follow-ups, and a stretchy sock that repositions a foe. Give discoveries an immediate demonstration and an understandable tradeoff. Differentiate hero movement/reaction/attack poses alongside their spells. Retain banked progress and avoid asking players to grind before the basic combat becomes expressive.

### 7. Readability, audio, and mobile usability need actual device observation

Current scenes use large overlapping actors, prominent background faces, floating damage/joke text, and four touch actions. The score is a single repeating melody whose tempo changes between camp and combat. These are implementation facts; precisely which visual or audio element bothers this user needs observation.

**Next change:** clarify feet/shadows and the active combat plane; keep warning shapes distinct from decorations; show priority feedback instead of stacking every number; give characters and boss phases identifiable sounds and musical changes. Prototype deliberate combat inputs with two thumbs before committing to another button or gesture. Check missed inputs, occluded targets, safe areas, and frame pacing on real Android/iOS devices.

### 8. Co-op is a real missing experience

The game is entirely solo. It cannot currently provide friends rescuing each other, sharing discoveries, or creating collaborative slapstick. Whether this is the user's largest missing ingredient remains unknown.

**Later milestone:** cooperative combat after the revised solo encounter proves satisfying. Plan player separation, shared-camera limits, revive, cooperative interactions, enemy scaling, and persistence ownership. Online play also requires authority, synchronization, disconnection handling, and latency testing. An AI companion would not substitute for the social experience. Do not present multiplayer as a quick toggle or use it to postpone fixing solo combat.

## Concrete next build: one excellent short chapter

Rework a single approximately five-minute chapter as a testable slice, keeping the existing campaign available. The target length is provisional; a player should remember changes in events, not a longer corridor.

| Beat | Purpose |
| --- | --- |
| A brawler interrupts a ridiculous toy picnic | Teach responsive movement, a reliable hit, and a funny reaction |
| One slow attacker and one flanker arrive separately | Teach commitment, spacing, and defense without overwhelming the player |
| A mixed fight around a spring and breakable snack stand | Make deliberate launch/bowling useful; show a player-created comic chain reaction |
| A weapon discovery and short side route | Offer a clear playstyle choice, then a safe place to try it |
| A changing traversal event | Refresh the rhythm and use an earlier lesson in a different situation |
| Madame Spin-Cycle’s encounter and tooth reward | Deliver a distinct fight, comic payoff, and a reason to continue |

Build order: (1) combat timing/input/physical states, (2) three complementary enemies and one plush interaction, (3) the authored route and boss, (4) sound/animation/readability polish, then (5) player observation and iteration. Propagate the successful design across the other chapters afterward. A wholesale engine replacement is not justified by the current evidence; changing tools alone would not improve the decisions or pacing.

## How we will judge whether it is better

Use engineering checks to protect behavior, and player observation to assess enjoyment. Neither replaces the other.

- Have several new players try the current and revised slice in alternating order, including real two-thumb mobile play. A small group provides qualitative direction, not statistical proof.
- Watch whether players discover and deliberately reuse multiple useful moves, rather than being forced through a checklist of tutorial commands.
- Ask what caused their last hit or miss. Unclear answers point to animation, alignment, warning, or input problems.
- Record a fight where positioning or a counter changes the outcome. A basic strategy may remain viable on easy difficulty; skilled play should offer a clear and satisfying advantage.
- Observe whether players create and remember a comic event, try a different weapon, voluntarily replay, or want to continue.
- Track input drops, damage sources, repeated actions, boss attacks seen, and time spent waiting/travelling. Use these to explain behavior, not as numerical definitions of fun.
- Keep the existing jump, save, equipment, and native build checks. Revise encounter tests when design changes, without treating higher bot failure rates as the goal.

The next milestone should demonstrate enjoyable combat and a memorable small adventure. More chapters become valuable when they carry that quality.
