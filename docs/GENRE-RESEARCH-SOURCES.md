# Beat-em-up design research: source notes

Research date: 2026-09-07. Purpose: understand why Emberbound feels less enjoyable than Castle Crashers and identify what to improve before expanding content again. This document records genre evidence; the accompanying project audit should establish which problems exist in our actual implementation.

## Main finding

The strongest recurring lesson is to improve the decisions, reactions, and surprises inside an encounter before increasing the number or length of encounters. This is our synthesis of the developer accounts below, not a measured universal rule. Castle Crashers combines expressive combat, cooperative adventure, progression, and staged absurdity. Merely matching its list of features does not recreate those relationships.

## Evidence from original sources

### 1. Castle Crashers: mechanics and level quality take precedence over extra ideas

In a direct interview, The Behemoth's Dan Paladin describes addressing weak areas first: satisfaction with player mechanics precedes attention to the adventure, and levels receive attention when they fail to support the game. Both developers acknowledge having far more ideas than they could implement. Tom Fulp describes Guardian Heroes as an influence in spirit, especially cartoon chaos, while Paladin names River City Ransom. They describe comedy as something deliberately staged, including dramatic camera presentation interrupted by an animal gag.

**Implication for Emberbound:** finish one convincing encounter sequence before expanding the campaign further. Our scruffy toys need physical comic performances and surprising consequences, beyond amusing names and facial features.

Source: [Brandon Sheffield interviews Tom Fulp and Dan Paladin, Game Developer/Gamasutra](https://www.gamedeveloper.com/design/taunting-the-behemoth-tom-fulp-and-dan-paladin-cry-out). Primary testimony within an editorial interview, published in 2008. This describes developer priorities and intentions, not experimental evidence that a particular joke works for every audience.

### 2. Castle Crashers: progression expands a connected combat system

The official Remastered manual documents alternating light/heavy attacks, an uppercut that launches an enemy, and jumping after that enemy to continue an aerial juggle. Magic combines with other controls to produce different abilities. Skill points can increase four attributes; investment in magic unlocks abilities and reduces recharge time. Weapons can be found in enemies, treasure, shops, and other locations, with bonuses, penalties, critical effects, and level requirements. Animal Orbs add companion bonuses.

**Implication:** an unlock should enable a useful new action or build decision. An attack called “uppercut” needs airborne enemy behavior and follow-up opportunities if it is to deliver the same kind of expressive payoff. Equipment should create understandable tradeoffs and exploration goals.

Source: [Castle Crashers Remastered official Xbox game manual](https://dlassets-ssl.xboxlive.com/public/content/0f963681-f296-4987-9cd1-ff050274c99e/GameManual/1c1beeac-5bf2-441f-b9b8-0135239c89e6/en-US/index.html). Primary shipped-game documentation. Do not infer exact animation timing, hidden combo rules, balance quality, or every platform's behavior from this manual.

### 3. Castle Crashers: cooperative adventure is a central part of the comparison

The Behemoth's official site foregrounds playing locally or online with up to three friends. Its publisher-controlled Steam description advertises collectible characters, weapons, companions, skill allocation, and progression-linked attacks alongside drop-in cooperative play.

**Implication:** a solo game with weapon collection can share ingredients while still offering a substantially different social experience. If cooperative slapstick is part of the user's reference experience, missing co-op is a real gap. It is also a substantial feature, especially online, and should follow a satisfying solo combat foundation rather than serve as a promised quick repair.

Sources: [The Behemoth official game overview](https://www.thebehemoth.com/), [Castle Crashers publisher Steam page](https://store.steampowered.com/app/204360/Castle_Crashers/). Primary feature marketing; verifies feature presence, not causal explanations for enjoyment. No review scores or sales figures are used as proof of a design principle.

### 4. Streets of Rage 4: enemies should make the player think

Lead designer Jordi Asensio describes intentionally restricting simultaneous enemies on the standard difficulties so encounters remain comprehensible and memorable. Main programmer Cyrille Lagarigue says the challenge should make players consider positioning, use their moves, and learn enemy patterns; otherwise play can collapse into moving forward and mashing attack. Character differences allow players to choose different tempos, such as an agile fighter or a slower grappler. The team also describes integrated editing, hitbox inspection, and frame stepping to shorten iteration.

**Implication:** give a small set of enemies distinct tactical jobs, then compose combinations that change the right response. A fixed numeric enemy cap is not a universal prescription; readability and the number of simultaneous demands matter more than copying this game's count.

Source: [Nintendo Life's direct interview with the Streets of Rage 4 developers](https://www.nintendolife.com/news/2020/12/feature_the_making_of_streets_of_rage_4_by_the_people_who_made_it_happen). Use the named developers' answers as primary testimony, not the publication's introductory praise. Historical development choices, not a benchmark for the current patched game.

### 5. Streets of Rage 4: combat depth comes from interacting move and enemy roles

In PlayStation's developer interview, Asensio describes designing enemies around complementary threats: one keeps a player occupied, another attacks exposed backs, and another counters jumping. Specials introduce a recoverable-health risk: successful aggression can reclaim their cost, but being hit loses that opportunity. Character moves have distinct purposes, including defense, combo extension, and positional control. Developers describe substantial iteration on enemy appearances and boss AI to preserve level rhythm. The interview also describes music composed around specific scenes and cooperative adjustments that encourage coordinated combos.

**Implication:** every new move needs a reason to choose it over the default attack, and enemies must create those reasons. Sound and animation should communicate these distinctions. Level design should arrange purposeful encounters instead of relying only on more enemies or health.

Source: [PlayStation interviews Dotemu, Lizardcube, Guard Crush Games, and composer Olivier Deriviere](https://blog.playstation.com/2020/04/30/streets-of-rage-4-how-three-studios-revived-a-legendary-series/), April 30, 2020. Primary interview. The direct article URL was verified during the project audit. Do not copy its health-cost system automatically into our faster mobile game.

### 6. TMNT: Shredder's Revenge: generosity, choreography, and comedy support each other

Tribute Games narrative designer Yannick Belzil explains that less demanding lane alignment made strikes feel more reliable. Chained attacks lead into finishers and juggling; fighting fills a special-attack resource, encouraging engagement. The team used quick arrivals of small, relatively easy groups to sustain forward flow. Enemies also appear through distinctive animations or start as characters idling in the scenery, creating comic vignettes and avoiding repetitive entrances. Each playable character received individual run, attack, and reaction animations to express personality. Boss animation, scenery, and voice acting carry comedy alongside combat.

**Implication:** use forgiving contact detection while preserving meaningful positioning. Make attack outcomes and enemy entrances entertaining in themselves. A funny toy world should include enemies arguing over snacks, bursting out of laundry, or losing their stuffing during defeat—not just more background decorations.

Source: [Yannick Belzil's developer-authored deep dive, Game Developer](https://www.gamedeveloper.com/design/deep-dive-how-tmnt-s-shredder-s-revenge-was-built-from-nostalgia-and-new-ideas), February 7, 2023. First-person development account. Statements about satisfaction are the team's observations, not controlled player-study results. The example toy gags above are original proposals for Emberbound.

### 7. Animation needs to express the move's identity

Tribute's account of making Splinter describes developing his special around an identifiable character action and distinct impact poses, then adding color, shading, smoke, and effects. His ranged astral attack also distinguishes his move set from the other characters.

**Implication:** begin each attack with a readable body action and consequence. Particles and camera shake can reinforce a hit, but they cannot supply a missing anticipation, strike, recoil, or recovery pose.

Source: [Tribute Games on designing playable Splinter, PlayStation Blog](https://blog.playstation.com/2022/02/10/master-splinter-is-coming-to-tmnt-shredders-revenge/), February 10, 2022. First-party promotional development breakdown, including animator credit and production images. It supports the described production process; the final sentence above is our design judgment.

### 8. Progression should change play without interrupting the rhythm

Asensio describes the Streets of Rage 4 Survival expansion as adding new ways to play alongside new content. Perks developed from stat boosts into elemental effects, tradeoffs, and synergies, followed by months of testing. Enemy generation uses categories and constraints rather than unrestricted random combinations. Alternative move sets provide additional long-term discovery.

**Implication:** a small number of visibly different weapon effects and useful combo branches can offer stronger choices than numerous incremental upgrades. Random waves still need encounter-design rules.

Source: [Jordi Asensio's developer-authored Survival design article, PlayStation Blog](https://blog.playstation.com/2021/07/01/streets-of-rage-4s-new-survival-mode-launches-july-15-find-out-how-it-was-created/), July 1, 2021. Describes a roguelite expansion; its run progression is not evidence that our campaign should become a roguelite.

## Proposed direction for Emberbound

These are testable design proposals, not claims that the reference games use these exact settings.

1. **Make one excellent short slice.** Rework a three-to-five-minute sequence with an introductory encounter, a mixed tactical fight, a toy-based interactive event, a reward, and a distinct boss payoff. Preserve the larger campaign but use the slice to establish the standard before propagating changes.
2. **Make the enemy a physical object.** Provide visible stagger, launch, falling, knockdown, and recovery. Let a deliberate finisher create positioning opportunities; consider bouncing an enemy into another enemy or a prop. Keep a clear, fair route out of being surrounded.
3. **Give the player early decisions.** The basic opening should already support reliable light attacks, a deliberate launcher or shove, an aerial follow-up, and defense. Progression can extend those possibilities. Avoid withholding essentially all expressive actions behind several levels of repetition.
4. **Choose three complementary enemy roles first.** A readable basic brawler, a flanker, and a slow committed attacker can establish spacing and timing. Teach each separately, then combine them. Do not allow every solution to collapse into holding attack until an automatic shield breaker appears.
5. **Make the plush premise systemic.** Trial one signature interaction, such as yanking stuffing to disarm an enemy or using a spring toy to launch a foe. Connect an animation gag, a tactical effect, and a reward. Avoid adding another isolated gauge before this proves enjoyable.
6. **Support these actions on touch controls.** Test whether movement, defense, and deliberate combo choices remain comfortable with two thumbs. Extra keyboard buttons are not proof of a viable mobile control scheme.
7. **Treat playtesting as the acceptance check.** Compare the current build and new slice with a few new players. Observe whether they discover multiple useful actions, understand why hits miss or damage occurs, remember a distinctive moment, and voluntarily replay. Track repetitive inputs and dead travel time as diagnostic signals, not as proxies for enjoyment. Passing code tests verifies behavior, not fun.

## Limits and open questions

This research read official documentation, developer-authored accounts, and original developer interviews. It did not independently play or capture all three commercial games, measure their animation frames, verify exact hit-stop values, or conduct user studies. No numerical claim about the correct hit-stop, enemy count, stage length, or input latency follows from these sources. The user's actual preference may weight solo mastery, group chaos, exploration, or comedy differently; the project audit and an enjoyable playable slice should make that distinction concrete.
