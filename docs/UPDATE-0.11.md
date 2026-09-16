# 0.11 — Clock someone out

The journeys previously repeated picnic → bridge → bowling → cart → ambush → bowling in all six regions. Each journey now has a different sequence and one substantial workplace sabotage, with a visible control, a dangerous consequence and a persistent wreck. Six chapters and their existing lengths remain; this update changes encounters within them.

## Fight the workplace

Bowl an enemy into the brass bell for immediate sabotage, or land three committed Heavy hits. Light attacks cannot activate it. The basic bowling input is Light ×2 → Heavy; the pan bowls with a ground Heavy. Both the crew and the workplace must be dealt with before the encounter clears. Heavy remains available after the crew dies, so the objective cannot run out of usable bodies.

The bell starts a single disaster with at least 1.1 seconds of warning. These are hazards, not friendly spells: players can be hit too. Each pulse hits an actor at most once. Art and collision use the same geometry and timeline. Rinse/roller corridors are marked before moving.

| Region | Workplace and consequence | Response |
| --- | --- | --- |
| Woods | An inspector in a tea urn rings through three steam bursts, then rubber-stamps the wreck as passed | Jump the low bursts or leave their lane |
| Freezer | Emergency defrost sheds falling ice in alternating lanes; the expired employee stays in the broken cabinet | Change lanes; jumping does not clear overhead ice |
| Laundry | A giant toilet swirls its staff into a rinse wave that sweeps across the floor | Jump across the low wave or use the floor edge |
| Candy | A ruined chocolate font spits syrup into alternating lanes; caught enemies briefly freeze | Jump the pools or move between lanes |
| Junkyard | A frantic time clock releases a staff compactor through a marked corridor | Leave its lane; it catches jumps |
| Keep | A huge royal stamp flattens the complaint lane | Move clear of the overhead stamp |

Bowling activation pays 65 gold / 50 XP; manual sabotage pays 35 gold / 30 XP, once after the machine breaks. A failed-fight retry restores the exact entry machinery, bell, hit sets and rewards. Existing settlement rules still prevent duplicated banked payouts. The field guide and active HUD explain the interaction, and a machine-caused defeat names the regional danger and its counter.

## What came from the references

The comparison is recorded with primary evidence in [level-design research](LEVEL-DESIGN-RESEARCH.md). Team Meat's readable, short failure loops inform the warning geometry, escape options and existing encounter retries. The Behemoth's performed environmental comedy and adventure variety inform the player-caused workplace disaster and regional encounter order. These are our design translations, not claims that either reference game contains these exact mechanics. No reference artwork, characters or recordings were copied.

## Evidence and limits

- 121 simulation tests pass, including seven new sabotage contracts and existing earned-progression campaigns for all nine hero/style combinations.
- `tests/e2e/sabotage.spec.ts` drives actual production simulation inputs through the woods encounter, holding instruction/warning/disaster/wreck milestones for the real UI. It verifies continued progress into the cart encounter on all three browser profiles. It accelerates time; it is not a human play session.
- `artifacts/sabotage-{ready,warning,disaster,wreck}-{desktop,android,iphone}.png` are those UI captures. The iPhone-sized disaster capture was visually inspected.
- `scripts/capture-sabotage.mjs` produces eighteen explicitly staged regional art fixtures, `artifacts/workplace-{1..6}-{ready,running,wrecked}.png`. Laundry and junkyard fixtures were visually inspected; no page errors were recorded. These staged images do not establish campaign playability.
- New warning and break sounds supplement the existing regional cues. No human listening or mix review has been performed.

This pass adds tactical interactions and different journey sequences. It does not establish Castle Crashers or Super Meat Boy quality. Most travel spacing still uses the existing scaffold; human review must determine whether sabotage creates satisfying decisions or feels like an extra chore after a fight. See [validation](VALIDATION.md) and [the open quality target](QUALITY-TARGET.md).
