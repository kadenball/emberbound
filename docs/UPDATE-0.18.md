# 0.18 — The road goes somewhere

Journey scenery previously repeated the same large regional building every 1,150 world units, independently of the actual encounters. Each region now keeps that building once at its entrance and then passes five distinct landmarks aligned with its five remaining encounter positions. The map cards preview selected new locations.

| Region | Landmarks after the entrance |
| --- | --- |
| Woods | A hollow root crossing, inspection weigh-station, slop dispatch, carrion canteen tree and municipal kettle works |
| Freezer | A fish-bone crossing, soft-serve depot, defrost authority, frozen-records office and dough proofing tunnel |
| Laundry | A drain aqueduct, glove pawnshop, hamper freight rack, damp staff bunks and executive plumbing |
| Candy | Licorice suspension supports, jaw moulds, dessert loading equipment, chocolate confessional and calorie customs |
| Junkyard | An unsafe wheel crossing, cutlery archive, payroll clock office, scrap clinic and cargo depot |
| Royal keep | A complaint archive, court of overbite, banquet-tax station, boot-shaped collection agency and the royal waiting room |

![The six woodland stops](../artifacts/journey-roster-1.png)

![The six laundry stops](../artifacts/journey-roster-3.png)

The new geometry uses different silhouettes and physical premises: suspended fish ribs, dangling gloves, staff bunk drawers, a giant payroll clock, cutlery sticking out of cabinets, and boots occupied by debt collectors. Small physical plaques distinguish site names from combat instructions. Each cleared stop dims its lamp, closes its worker hatch and displays a place-specific aftermath such as “ROOT CAUSE: VIOLENCE,” “ASSETS LIQUIDATED” or “BANQUET REDISTRIBUTED.” Those states follow existing encounter progress and therefore follow retry/bookmark restoration too.

Weathering is masked to the actual silhouette so streaks, scrapes and mould do not spill into open air or cover the playable lane. A single reusable scratch canvas paints that weathering into the existing terrain cache. Large landmarks are not stored as thirty permanent full-resolution textures. Distant repeated structures are faded to separate them from the new foreground destinations. The original repeated foreground building, generic connecting buildings, bunting and spare crossing patches no longer stamp across journeys; actual encounter bridges and interactable props retain their roles.

The walking surface now starts at world Y=350, above the normal upper movement limit of 360. Background foundations sit at Y=344, and a root mouth that initially dipped into the lane was corrected during visual review. Rear water channels use regional muted colours, and edge grime has irregular gaps. This gives the existing large play spaces a clearer separation between scenery and walkable floor.

This continues the [Super Meat Boy / Castle Crashers comparison](LEVEL-DESIGN-RESEARCH.md): coherent places and readable play support the larger adventure. **Combat rules, encounter spacing and travel distances were not changed.** The scenery pass does not prove improved travel pacing or human enjoyment, and the 0.17 Heavy-only exploit remains unresolved.

## Capture and validation

`node scripts/capture-journeys.mjs` produces six route contact sheets, six actual map-preview images, six staged phone-sized battle fixtures and six staged cleared-stop fixtures. It also measures cached Canvas submission cost and the frames that build new terrain chunks during a simulated camera sweep. The fixtures deliberately position actors and set encounter/clear state to inspect art; they are not actual-play or native-device performance evidence.

All six route sheets were reviewed. Final laundry/royal sheets and phone-sized battle/aftermath images were checked after adding the weathering, correcting the glove merchandise and aligning the root foundation. Existing browser gameplay tests provide separate actual-input captures of fights, warnings, sabotage and retries on the new terrain. See [validation](VALIDATION.md) for completed checks and benchmark conditions.

Artifacts: `artifacts/journey-roster-{1..6}.png`, `journey-preview-{1..6}.png`, `journey-fight-{1..6}.png`, `journey-after-{1..6}.png`, and `journey-render-timings.json`.

Remaining work includes human wayfinding and atmosphere review, travel pacing, whether background machinery is mistaken for interactive props, broader combat exploits, listening review, physical-device performance/controllers and native iOS release verification. See the [quality target](QUALITY-TARGET.md).
