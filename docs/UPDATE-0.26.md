# 0.26 — Express disaster

Every journey previously used the same HOT SLOP box and the same passive delivery action: stay close while it moves, clear nearby enemies. The delivery now doubles as an optional combat tool. A grounded Heavy from behind kicks it into a one-second rush. It carries on without its escort until the impulse runs out, hits each enemy once per rush, and knocks unprepared ground enemies down. Planted brutes, defiant enemies and bosses stop it. The axle cools for 2.4 seconds before another launch, with a visible recharge bar. Ordinary escort behavior remains available.

The rush starts at roughly 505 world units/second and decays toward the ordinary 145. Hits deal 32 plus 5 per region; damage does not increase with repeated overlaps. Cart impacts do not grant free player combo healing or FILTH. The cart clamps to its destination, settles on arrival and retains the existing single 40-gold/35-XP delivery reward. Reaching the destination still leaves the remaining enemy waves to defeat. Optional bookmark fields accept rush/cooldown/contact state while preserving old cart records.

Each region now carries something different:

| Region | Cargo |
| --- | --- |
| Woods | A pot of living day-old soup and a bouncing ladle |
| Freezer | Cursed soft serve on an iced coffin |
| Laundry | A sock hiding in a witness-protection hamper |
| Candy | A layered cake with teeth and a flickering candle |
| Junkyard | Loose forks rattling in a scrap crate |
| Keep | Crowned tooth mail with dangling paperwork |

Wheels turn with actual distance; body bounce, tilt and dust follow movement and the rush. Cargo and quest labels explain launching, cooldown and arrival. The laundry story now refers to the witness hamper rather than the old generic slop cart.

![Soup delivery during a real-input rush](../artifacts/cargo-0-rush-android.png)
![Sock witness protection](../artifacts/cargo-4-rush-android.png)
![Royal tooth mail ready to launch](../artifacts/cargo-10-ready-android.png)

All six designs were inspected in phone-sized captures. The browser fixture reaches each cart using the existing combat driver and normal steering, freezes behind it, then advances on a real Heavy input: keyboard on desktop, touch on Android-sized Chromium and iPhone-sized WebKit. It verifies more than 100 world units of rush travel and captures the moving cargo. It edits no HP, positions, waves or enemy states. These are controlled input captures, not physical-device or human-play evidence.

Five simulation checks cover the launch input, front/Light rejection, one hit per enemy, momentum without an escort, a braced-brute roadblock, cooldown, destination clamping and one-time rewards. All 209 simulation tests pass, including nine earned hero/style campaigns. The 18 regional browser checks pass. The first browser attempt had three Android failures because the capture driver resumed before dispatching the touch, allowing the cargo to roll away; waiting for the real Heavy event fixes that test race.

An early implementation unintentionally changed ordinary escort blocking from the existing circular proximity check. That was restored before final verification. The final [432-run matched audit](COMBAT-AUDIT-0.26.json) retains 0.25's profiles, seeds and policies, with **no changed win/loss outcomes**: Light 0/108, Heavy 25/108, Light + power 22/108, mixed 103/108, no timeouts. Its steering does not deliberately optimize cart use, so it does not measure the new option's best strategy or human value. The broader exploit, pacing, audio and native-release findings remain open in [validation](VALIDATION.md).
