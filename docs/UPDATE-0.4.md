# 0.4 — The game of bad decisions

This build implements the combat and encounter redesign from [the research plan](GAMEPLAY-RESEARCH-AND-PLAN.md). The opening woodland chapter teaches the new mechanics; the same systems carry across all twelve existing chapters. This is an implementation milestone, not a claim that human playtesting has established parity with Castle Crashers.

## Changes you can play

- Light and heavy attacks have separate startup, contact, and recovery phases. Each swing hits a given enemy once. A late input tap is queued for up to 220 ms; holding light remains supported. Dodging cancels an attack. A connected launcher can be jump-cancelled into an air follow-up.
- Heavy → Jump → Light launches and juggles. Light ×2 → Heavy bowls enemies. Jump → Heavy dives into a landing flomp. At level 3, Light ×3 → Heavy spins; level 5 strengthens the dodge launcher, and level 7 enlarges the diving flomp. Grounded light attacks no longer automatically become every special move.
- Bowling bodies hit enemies and break supplies. Spring cushions redirect them toward another foe. Bodies tumble, shed stuffing, and can cancel a picnic. Knockdowns and short get-up protection prevent endless easy stun loops.
- The pan is slower and bowls harder; the popsicle is fast, short, and better for aerial follow-ups; the sock pulls a distant enemy out of formation. Other weapons retain distinct reach, healing, splash, or spin properties. Weapon moves take precedence over generic heavy recipes; Dodge → Heavy can still launch with a pan or sock.
- Raiders, committed brutes, guards, and the new masked flanker form different combinations. Guards stop frontal light hits until opened with heavy, bypassed from behind/above, or hit with magic. Brutes can finish a committed swing through light hits. Ordinary attackers share a limited attack budget instead of all striking simultaneously.
- Six authored journey routes contain 36 encounters; the six boss chapters contain another 18. Reinforcement groups, napping and dropping entrances, narrow bridges, picnic/bowling setups, cart escorts, stashes, levers, barrels, springs, and vents change the task along the road. A cart stops if abandoned or blocked by an upright enemy and must reach its destination before the encounter clears.
- Madame Spin-Cycle opens her drum and sucks along a marked lane. Heavy-hit a laundry bundle into it to jam the drum and earn an attack opening. Missing that opportunity leads to a moving spin cycle and recovery. Other bosses use burp volleys/leaps, cascading ice hazards, delayed candy bombs, scrap charges, or royal reinforcements and volleys. Armor reduces damage between openings; bosses remain damageable.
- World map → **Try Madame’s boss fight** starts a separate practice run without campaign unlock requirements. Practice rewards do not alter the save. It includes the boss chapter’s approach encounters.
- **World map → Bring a friend** enables two players on one device. Partners have independent input, health, magic, weapons, attacks, and hit protection. The camera follows both and limits separation. Hold MAGIC beside a downed friend for two seconds to restuff them; damage interrupts this channel. A cleared encounter also revives them. Both down means defeat.
- Co-op shares discovered ownership, XP, and gold with this device’s save; P1’s equipped weapon persists. One gamepad belongs to P2; two gamepads get one player each. P1 can use touch/keyboard while P2 uses a controller or arrows/numpad. Disconnecting a controller pauses co-op. There is no online connection in this build.
- Attack poses now reflect anticipation/contact/recovery, with distinct launch, pull, dive, spin, knockdown, nap, and tumble poses. Player foot rings and P1/P2 labels aid tracking. Heavy impacts, shields, launches, springs, bowling, drum jams, and revives have distinct sounds. Six regional musical phrases and a boss phrase replace the single battle loop. Routine light-hit numbers are suppressed and floating text is capped.
- Settings → **Relaxed battles** lowers incoming damage by 40%, increases mana regeneration, and provides more healing after encounters. Applies when starting a chapter. Old saves load this setting as off; existing progression remains compatible.

## Evidence and limits

The behavior suite covers startup/recovery, one-hit contacts, input queues, jump-cancel juggling, committed enemy attacks, spring bowling, guard breaking, laundry jams, reinforcement completion, bridge bounds, cart delivery, co-op controls, revival, defeat, ownership, and save compatibility. Three continuous campaign simulations finish all twelve chapters using earned progression and affordable upgrades. A separate two-player simulation finishes the opening chapter. These are scripted inputs, not human sessions.

[The 432-run audit](GAMEPLAY-AUDIT-0.4.json) uses fresh base equipment for each chapter, three heroes and three seeds. The first three strategies retain the original steering, with cart navigation added so they can handle the new objective. The fourth adds deliberate heavy moves, jumping, danger avoidance, and laundry bowling. The original [0.3 baseline](GAMEPLAY-AUDIT-DATA.json) is retained.

| Strategy | Wins / 108 | Losses | Timeouts | Mean winning duration |
| --- | ---: | ---: | ---: | ---: |
| Light attacks with steering | 0 | 108 | 0 | — |
| Light + magic with steering | 0 | 108 | 0 | — |
| Light + magic + dodge | 77 | 31 | 0 | 106.0 s |
| Deliberate moves and defense | 93 | 15 | 0 | 69.4 s |

The deliberate strategy’s winning boss runs see a median of six completed boss actions. In the old baseline, light+magic saw a median of one. Strategies differ in several inputs, so this does not isolate any one mechanic’s effect. The first two strategies’ losses may also indicate an overly demanding normal mode for some players; higher failure rates are not a success criterion. These results establish useful counters and completed behaviors, not enjoyment, fair human difficulty, or a five-minute human chapter duration.

Use [the playtest kit](PLAYTEST.md) to decide what to tune next. [Online co-op design](ONLINE-COOP-PLAN.md) records a future implementation milestone. Physical Android/iOS touch and controller sessions, native iOS compilation, and store release checks remain outstanding; browser emulation does not replace them.
