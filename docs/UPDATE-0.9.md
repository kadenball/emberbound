# 0.9 — Restuff. Get even.

Long chapters previously sent a defeated player back to the beginning. The new primary defeat action restarts the current encounter immediately. Earlier fights remain cleared. The checkpoint restores the exact beginning of the failed fight: health and mana, equipment, attack state, enemies and their entrances, random generator, traps, switches, cart, pickups, XP, gold and statistics. Failed-attempt loot resets. The snapshot is cloned again on each retry so one attempt cannot mutate the next.

This is an in-memory checkpoint, not a mid-chapter disk save. It disappears when the chapter is left, the page reloads, or the app process closes. It supplies no free heal. If the entry condition is difficult, the player can accept defeat and restart the chapter using the existing permanent progression.

Defeat now displays a comic incident report with the final culprit, actual last-hit damage and a specific counter. Attribution survives delayed bombs and projectiles; high brute swats, low shockwaves, chargers, ordinary enemies, regional machinery and all six bosses receive relevant advice. Ignored damage does not replace the report. The retry action receives keyboard focus, supports Enter, and is prominent on touch screens. A short encounter trail shows fights already cleared.

A failed fight stays provisional while the player decides. Retry restores the fight and banks nothing. Accepting defeat by returning to camp or restarting the chapter keeps discovered weapons, loses run gold and applies the existing capped quarter-XP defeat reward. A victory banks the final restored haul once and unlocks the next chapter before any aftermath dialogue. Repeated settlement cannot duplicate rewards. Practice never writes run rewards.

Elapsed adventure time includes failed attempts. A clean, fast clear is required for the third mastery star; retries still permit the other two stars and all ordinary victory rewards. Prior saved medals are retained.

Tests include a real-input chapter completion after retrying its second fight, repeated snapshot isolation, co-op restoration, exact reward rollback, non-farming settlement, damage attribution and mastery boundaries. Desktop/mobile captures use a real opening-fight loss and the actual retry UI, not an injected game-over state.

This change applies the fast-retry lesson from the [reference-game comparison](LEVEL-DESIGN-RESEARCH.md). It does not establish that the campaign's pacing, difficulty or comedic timing has reached the requested quality. Native device and human play review remain necessary.
