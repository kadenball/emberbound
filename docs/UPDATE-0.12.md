# 0.12 — Pocket the mess

Long chapters previously lost their active checkpoint when the app closed. They now save one adventure bookmark on the device, at the trailhead, at each fight entrance, and immediately after each non-final fight clears. Closing between encounters no longer forces a replay of the completed fight.

## Returning to an adventure

- **Continue the mess** on the home screen or map restores the saved chapter, hero, weapon, fighting style, difficulty, upgrades, co-op partner, entry resources, cleared scenery, loot and random state. It opens paused so the player can get ready.
- **Pocket the mess · Save & quit** waits for the storage write before returning home. A failed write leaves the run paused and offers another try.
- Continuing during a fight restores its entry checkpoint, not the middle of an attack. Loot obtained after that checkpoint rolls back. Cleared-road checkpoints retain the completed fight and its rewards. Reopening counts as a retry, so closing the app cannot grant the no-retry mastery star.
- The card shows the saved loadout even if the player browses a different hero or equipment at camp. Restoring uses the bookmarked loadout; camp upgrades do not rewrite the in-progress run.
- Starting another campaign run presents the saved chapter and explains that replacement drops its unbanked loot. Practice neither replaces nor settles the campaign bookmark. **Return to camp** from an active run still abandons it; its explanation is visible beside that choice.
- Victory and accepted defeat remove the bookmark in the same saved record as the payout. Queued writes retain order. A malformed or incompatible bookmark is rejected separately from banked progression. If the profile cannot be read at all, the app offers a read retry and blocks writes instead of overwriting it with a fresh profile.

## Format and storage

`src/fight-bookmark.ts` validates an explicit, versioned format with Zod 4.5.4. Arrays restore the simulation's hit sets; only allowed fields reach the engine. Bounds, entity references, stage/XP consistency and checkpoint phase are checked. The existing version-2 profile format gains an optional bookmark string; version-1 progression migration remains. A rules revision can invalidate incompatible future bookmarks without resetting the profile.

The existing Preferences record stores both profile and bookmark. The runtime updates on checkpoint changes, pause/lifecycle events, and every eight active seconds to retain retry-time accounting. Explicit Save & quit awaits completion. This follows the plugin's supported JSON-string storage path; browser storage is its web fallback. References: [Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences), [Zod schemas](https://zod.dev/api). Zod's MIT license is bundled in `public/licenses/Zod-MIT.txt`.

## Ending and phone polish

The final boss integration flow now covers entrance, escalation, defeat, all five ending dialogue pages, the crown weapon, six recovered teeth, bookmark removal and a fresh-runtime reload. It uses accelerated normal combat inputs from a plausible late-campaign profile; it does not replay the preceding eleven chapters or establish human difficulty/fun. The new check exposed cramped landscape results. A two-column result layout now keeps rewards and exit controls visible together; the pause menu also fits its new save option and abandonment explanation.

## Evidence

- 131 simulation tests pass. Every entry and cleared-road checkpoint encountered by the nine hero/style earned-progression campaign probes must deserialize successfully. Focused tests compare disk restoration with in-memory retry, continue a restored co-op journey and boss chapter, preserve sabotage wrecks, reject invalid data, and verify ordered bookmark/payout writes.
- Browser checks cover mid-chapter reload, unchanged banked rewards, restored loadout after browsing another hero, save/quit, replacement/abandonment, co-op restoration, failed writes, and failed reads. These test real UI flows; the later-fight setup uses accelerated legitimate simulation inputs.
- `artifacts/bookmark-{home,resume,choice}-{desktop,android,iphone}.png` capture those flows. The iPhone-sized home/resume views were visually inspected.
- `artifacts/finale-{defeat,story,result}-{desktop,android,iphone}.png` capture the final chapter flow. The landscape result was visually inspected; automated bounds checks cover its primary action and loot text.

Native physical-device process termination, storage-pressure behavior and lifecycle performance still require device verification. Music, combat feel and sustained human enjoyment remain unproven. See [validation](VALIDATION.md) and [the full open target](QUALITY-TARGET.md).
