# 0.19 — Union-mandated back pain

The knuckle brute's committed windup previously resisted ordinary stun, but launcher, bowling, pull and freeze effects could still cancel it from the front. Repeated Heavy attacks therefore bypassed its defining threat. Melee also silently skipped enemies during `recovery`, including the end of a missed rush, despite the game advising players to punish that opening.

## A stance with answers

The brute now plants its feet and commits to its chosen direction and height. Frontal hits still deal their full existing damage and award normal hit resources, but cannot launch, pull, freeze, bowl or push the planted brute. Outside that short windup, ordinary launchers and weapon effects work as before. No enemy HP, player damage, upgrade price or player attack duration was increased.

Three deliberate counters break the stance:

- A Heavy or power hit from behind the committed direction.
- A prepared finisher, including Light ×2 → Heavy, a Scrapper counter or a Hexer infusion. Two fresh light swings consume most of the windup: this rewards preparation, not an assumed guaranteed reaction from neutral.
- Another enemy bowled into the brute. Environmental explosions and machinery can also break it.

A successful break cancels the swing and produces an opening, a green rupture effect, a tearing sound and “BACK PAIN!” or “UNION BREAK!” feedback. Existing prolonged-control defiance still prevents displacement while active. Plain frontal damage receives a “PLANTED! GET BEHIND!” response. Players can also evade: a late jump clears the low pound, while the high swat requires another lane. Defeating the brute still ends its threat normally.

The low pound now loads both fists; the high swat raises one above its head. Both snap to their impact pose when the simulation applies the strike, then retract through a longer visual follow-through. The feet stay planted, wrist wraps and a strained green back seam emphasize the stance, and its floor warning distinguishes the nearby fist area from the low traveling wave. Foot rings show the windup's progress. Bestiary, help, nearby encounter guidance and defeat advice explain the responses.

![Staged animation pose study](../artifacts/brute-animation-study.png)

## Recovery is an opening

Melee now reaches enemies in recovery, matching the existing magic path. This includes the end of a missed rat, boar or centipede rush and getting up after knockdown. The existing repeated-control escape remains. This corrects an invisible damage exception; it is not intended as a general difficulty increase.

## Matched combat evidence

`node scripts/audit-combat.mjs docs/COMBAT-AUDIT-0.19.json docs/COMBAT-AUDIT-0.17.json`

All 432 runs reuse 0.17's equipment profiles, originally earned for 0.14, with the same three seeds. **The steering policies were not changed in this pass.** They supply normal inputs without HP edits, teleportation or wave skipping. Each boss-chapter result includes its two approach fights, not just the isolated boss duel.

| Policy | 0.17 chapter wins / 108 | 0.19 chapter wins / 108 | 0.17 boss-chapter wins / 54 | 0.19 boss-chapter wins / 54 |
| --- | ---: | ---: | ---: | ---: |
| Light | 0 | 0 | 0 | 0 |
| Heavy | 31 | 30 | 17 | 19 |
| Light + power | 24 | 26 | 21 | 21 |
| Mixed | 106 | 106 | 53 | 53 |

No timeouts occurred. Heavy-only journey wins fell **14 → 11**, while boss-chapter wins rose **17 → 19**. Heavy-only Laundry Lagoon wins fell 4 → 0 and Rinse Pit wins 6 → 3, but other chapters became more winnable. These combined changes do not establish a single cause for every result. The broader Heavy-only weakness remains; the modest aggregate change is not evidence that combat is now sufficiently challenging or fun.

## Verification and limits

Simulation coverage exercises five ordinary frontal Heavy weapons, actual two-light finisher setup, rear strikes, body collisions, late jumping versus a high swat, and melee punishment during rush recovery. The durable-enemy repetition check now includes both brute and shield creatures and accepts a completed enemy attack as evidence of escape, as well as defiance. Earned-progression campaigns still cover all nine hero/style combinations and cooperative chapter play.

Browser coverage captures a naturally occurring stance in an opening chapter driven only by normal mixed-policy inputs, then completes the chapter. Separate, explicitly staged isolated-brute fixtures use keyboard Light → Light → Heavy and production combo/damage logic to capture a break. `scripts/capture-brute.mjs` makes the staged pose study; it is not gameplay or performance evidence. See [validation](VALIDATION.md) for final check results and [playtest questions](PLAYTEST.md) for what automated checks cannot establish.

Artifacts: `artifacts/brute-{planted,broken}-{desktop,android,iphone}.png` and `artifacts/brute-animation-study.png`.

This follows the [Super Meat Boy / Castle Crashers comparison](LEVEL-DESIGN-RESEARCH.md): visible commitment, useful counters and coherent consequences. Human enjoyment, reaction/readability testing, broader combat exploits, travel pacing, music review and native-device/iOS release quality remain open in the [full quality target](QUALITY-TARGET.md).
