# 0.17 — Your insurance does not cover this

The malpractice jelly previously healed a whole nearby group after a generic windup, only when close enough to the player to pass the normal attack check. Its warning resembled a damaging melee attack, and it had no attack when left alone. The new support behavior creates a visible target choice and a counter window.

- **Triage:** a jelly selects one injured ally within 310 world units, independent of the player's distance. The 1.25-second stitch locks that patient and restores up to 32 HP once. It cannot repair itself, other jellies or dead allies, and it waits before casting again.
- **Cut the thread:** Heavy, powers and bowling interrupt the channel, including during crowd-control resistance. Pulling or bowling the patient out of range also severs it. The jelly pauses for two seconds before it can cast again. Light damage still hurts it but does not itself cancel the stitch.
- **A readable performance:** a moving green seam links the actual patient, with traveling stitches and a progress ring. The jelly puts on a crooked paper cap and works a needle with its tentacle. The ordinary orange damage marker is reserved for its attack. Casting, cutting and completing the repair have separate sound cues; the interruption reads “CLAIM DENIED!”
- **A crew role:** jellies enter behind the front line, follow allies and retreat from nearby players. Once their crew is gone, they approach and commit to a short tentacle slap. Its rectangular warning matches the damage bounds; sidestepping or a late jump avoids it, and a recovery window follows.
- **Durable fights:** the optional locked-patient field passes through the bookmark format. Older entries without it still load. Rewards, equipment ownership and retry settlement rules are unchanged.

![A stitch forming during a real laundry encounter](../artifacts/triage-stitch-desktop.png)

The intended comparison remains Super Meat Boy's learnable tells alongside Castle Crashers' varied combat roles and physical comedy. The new choice is whether to pressure the medic, separate its patient or finish the patient before the stitch completes. Human play still needs to establish whether that decision is clear and worthwhile.

## Evidence and limits

Seven new simulation checks cover delayed single-patient healing, target locking, healthy allies, range/death cancellation, Heavy/power versus Light, defiance, the isolated slap and bookmark compatibility. Additional isolated-jelly browser fixtures check its warning and a real late-jump input on each browser target; an immediate jump can land before the slap. The existing support test now advances a real channel instead of injecting a one-frame heal. The campaign probe now recognizes the visible stitch as a priority target and uses Heavy to interrupt; all nine hero/style campaigns still complete with earned progression.

A browser driver uses the saved, earned chapter-five profile from the previous audit. It supplies actual combat inputs, pauses on a naturally occurring stitch for a screenshot, then resumes and verifies a damaging interruption. It does not edit enemy HP, positions or waves. See `artifacts/triage-{stitch,cut}-{desktop,android,iphone}.png` and [current validation](VALIDATION.md).

The matched 432-run [audit](COMBAT-AUDIT-0.17.json) reuses 0.14's equipment profiles and seeds. The three restricted combat policies retain their previous steering; the mixed probe has the new visible-target response, so changes to mixed outcomes are not a controlled measure of the AI change alone.

| Policy | Wins / 108 | Boss wins / 54 | Change in total wins from 0.14 |
| --- | ---: | ---: | ---: |
| Light only | 0 | 0 | 0 |
| Heavy only | 31 | 17 | 0 |
| Light + power | 24 | 21 | −2 |
| Mixed | 106 | 53 | −1 |

There were no timeouts. Outcomes shift between individual chapters; Heavy-only becomes successful in some laundry samples and loses in some scrapyard samples. This pass **does not establish a reduction in the overall Heavy-only exploit**. Mixed losses are Ash in chapter one/seed 7 and Wren in Madame's chapter/seed 7. Campaign tests use earned progression and up to three attempts, rather than claiming every fixed-profile run must win.

Journey pacing, broader combat exploits, human play/listening, physical-device performance/controllers and native iOS release work remain open in the [quality target](QUALITY-TARGET.md).
