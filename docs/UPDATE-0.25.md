# 0.25 — First the sweets. Then the teeth.

Count Snackula previously opened his body as soon as he released the low sweets, while overhead dentures only appeared on an alternating later volley. The 0.23 visual probe could win before capturing that later attack and needed to withhold offense to observe it. The encounter now commits a complete two-part serving:

1. Four low sweets sweep across the locked target lane, reversing direction on the next serving. Rage expands this to six. Jump or leave their marked shapes.
2. After the last sweet, a 0.74-second gap precedes overhead dentures in the locked target lane and at the Count's feet. Change lanes; jumping alone cannot clear their height. Neither marker follows the escaping player.
3. His wafer body stays guarded through the serving. After the bite and its impact display finish, he opens for 1.65 seconds. Aerial head strikes remain available throughout, preserving a riskier way to attack early.

His health, damage multipliers and earned loadouts are unchanged. This adds no invulnerability gate requiring a minimum number of patterns. The new `volley` state is accepted by bookmark validation; existing state names remain compatible. Rage still cancels pending attacks for its performance and begins a fresh serving afterward.

His jaw now chatters and spits crumbs during the serving. The quest and boss hints follow the next unresolved danger: low sweets first, then teeth, then the recovery opening. Defeat advice explains the sequence. The head marker, wafer armor and recovery animation continue to follow the actual defense state.

![Low sweets with the later bite marked](../artifacts/counter-jaw-sweets-android.png)
![Lane-change warning after the sweets](../artifacts/counter-jaw-warning-android.png)
![Open wafer body during recovery](../artifacts/counter-jaw-opening-iphone.png)

These are paused captures from a browser driver using normal combat inputs and an earned campaign loadout. The driver no longer withholds offense for the Count and does not edit boss health, position, phases or waves. The extended test captures sweets, jaw warning, impact and recovery on desktop Chromium, Android-sized Chromium and iPhone-sized WebKit. The recovery capture waits for the unfolding animation rather than stopping at its first frame. The inspected phone captures show the requested sequence, not physical-phone input comfort or a human playthrough.

The [432-run matched audit](COMBAT-AUDIT-0.25.json) reuses 0.23's profiles, seeds and four policies without editing the steering. Count Snackula's Light-plus-power wins fall **6/9 → 0/9**, while mixed remains **9/9** and Heavy remains **0/9**. His full chapter's median mixed-run time changes **34.3 → 34.8 seconds**. Across all chapters, Light wins **0/108**, Heavy **25/108**, Light-plus-power **22/108** (previously 28), and mixed **103/108**. All runs terminate and all nine earned-progression hero/style campaigns complete. These are narrow policy comparisons, not proof that the game is fun or all exploits are solved.

This follows both parts of the [reference comparison](LEVEL-DESIGN-RESEARCH.md): a readable response sequence, plus a boss performance that leaves room for different combat tools. The broader pacing, human enjoyment, physical-device/native iOS and intermittent WebKit audio findings remain open. See [validation](VALIDATION.md).
