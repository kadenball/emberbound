# 0.5 — More room, more bad habits

## Scale and maps

Battle camera framing now uses 780 vertical world units instead of 675. At the same landscape aspect ratio, about 16% more of the road is visible horizontally. Hero artwork scales from 1.05 to 0.76, with ordinary enemies, brutes and bosses reduced proportionately. Combined, fighters occupy about 37% less screen height in landscape. The landscape, props, HUD and thumb buttons retain their own dimensions; the world feels larger around the fighters. Portrait minimum world width increases from 960 to 1100.

This changes relative scale and sightlines, not chapter length or movement speed. Attack arcs still depict world-space reach, and foot rings, health bars, airborne projectiles and warnings follow the new scale. The previous mobile view is retained as `artifacts/scale-before-0.4.png`; `artifacts/redesign-mobile.png` shows the updated view.

## Progression that changes move sequences

At level 2, choose a fighting style in **Forge → Armory & combos**. All three are visible from the start, so upcoming techniques can be inspected. Switching at camp is free. The selected style is saved, shared by local partners, and works with all three heroes. Existing saves default to Scrapper without losing XP, items or upgrades.

| Style | Level 2 | Level 4 | Level 6 | Level 8 |
| --- | --- | --- | --- | --- |
| Scrapper | Late dodge primes a stronger heavy counter | Light ×2 → Heavy becomes a wide ground quake | Quakes send a travelling ground wave | Counter quakes reach farther and launch |
| Acrobat | Jump → Dodge → Light gives a lifting dash and flying kick | Jump-cancel any connected ground heavy | Five-hit aerial juggle cap and extra magic from air follow-ups | Two lifting air dashes per jump |
| Hexer | Magic primes an elemental heavy for three seconds | A connected infused swing refunds 12 MP once | Wider elemental finisher | Elemental finishers also launch |

Scrapper quakes and Hexer infusions take precedence over normal weapon-heavy moves. Acrobat kicks require the short air-dash window. Ordinary attacks and baseline combos remain available. Alternating connected move types within three seconds rewards extra MP, capped at four variety steps; repeating one move or whiffing does not build this bonus. Taking damage breaks that rhythm. A close, late dodge also earns a small magic reward; Scrapper uses the resulting counter window from level 2 onward.

Hexer elemental finishers differ by hero: Ash has a stronger radial fire hit, Wren freezes, and Bram pulls the affected enemies inward. Those are gameplay effects rather than only recolored particles. Bram’s normal spell now heals only when it connects with an enemy in normal mode; relaxed mode retains safe healing.

## Harder, more varied fights

- Specific later encounters gain a complementary reinforcement: a shield protecting a cart attacker, a bomber covering a bridge, or a ranged threat behind a melee group. These are authored additions, not a universal enemy-count multiplier.
- Selected later groups include a visible **★ VETERAN**. Veterans recover faster between attacks; veteran archers fire a spread. Enemy base HP has not been increased.
- Shields answer repeated frontal light bonks with a telegraphed **LID SLAP**. Heavy, magic and attacks from behind remain counters.
- Archers commit to the height they observed during their windup. High shots and their aiming lines appear at that elevation, so changing lane or dropping below the shot matters.
- Brutes can choose a raised **↑! / FLY SWAT** if they saw an airborne target. Repeated hopping is no longer a universal defense.
- Bosses visibly unravel at half health. The burp boss widens its volley, ice and candy bosses expand hazard patterns, Madame and Frank extend their moving hazards, and all bosses leave less idle time between cycles. Existing vulnerability/recovery windows remain.
- Normal mode provides 3 HP after an encounter instead of 8, with fewer random health drops, a longer dodge cooldown, and modest region-based incoming damage growth. Stashes, nature attacks that connect, upgrades and deliberate defense matter more. Relaxed recovery remains available in settings.
- Corrected the forge’s spirit upgrade to grant its advertised +8 spell damage per rank.

## Evidence

The same 432-run fresh-equipment probe completes without timeouts. Its deliberate-move strategy wins 77/108 runs, versus 93/108 in 0.4; median winning health falls from 95.7% to 82.7%. Light/magic/dodge wins 39/108, versus 77/108 previously. The first two strategies still lose every run. These are precisely steered scripts with fresh gear in every chapter, not human difficulty ratings or proof of enjoyment. See `GAMEPLAY-AUDIT-0.5.json`; both previous raw audits remain available.

Continuous campaign tests carry earned rewards and affordable upgrades through all twelve chapters for each of the nine hero/style combinations. Separate tests verify unlock thresholds, counter consumption, quake waves, bounded air-dash lift, heavy jump cancels, elemental refund limits, connected healing, shield ripostes, high arrows, and boss escalation.

Physical touch/controller play and human feedback are still needed to tune the smaller visual scale and difficulty. No human sessions are claimed. Use `PLAYTEST.md`, adding a check that players can distinguish high shots from low shots and describe what changed when their next style technique unlocked.
