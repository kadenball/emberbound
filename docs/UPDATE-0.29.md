# 0.29 — Better monsters, moving workplaces

The playable heroes no longer share the same simple eye-and-mouth construction. Ash has a scorched plush body and crooked furnace grin; Wren has a long collapsing bird neck, chipped beak and exhausted eye; Bram is a low, sprawling swamp creature with button eyes and a smiling tumour. Three original transparent sheets supply **24 painted key poses** across character selection, dialogue, the menu scene and live combat.

The simulation selects idle, opposing strides, jump, windup, contact, power and recoil. Weapons follow measured hand sockets, including Wren's starting lollipop and Bram's plunger. Landing squash, breathing, rolls, spins and launcher/slam transforms supplement those poses. Ash bends over to fart toward the aimed flame jet; Wren's vomit starts at the new beak. Hero combat dimensions, damage, progression and timing are unchanged. This is an eight-pose foundation per creature, not a complete hand-animated set for every move; ordinary enemy and boss art retain the previous rendering. [Assets, provenance and exact prompts](HERO-ART-0.29.md).

Laundry's rinse now carries grounded feet, loose drops and physical stink sacs. Junkyard has two belts moving in opposite directions with a stationary lane between them. Jump clears the moving surface; a distinct red stop button stops the linked floor and machine hazard, leaving an **UNPAID BREAK** sign. It reuses the existing lever and its one-time reward. The stopped state survives a saved road bookmark; old bookmarks without a flow control keep the added floor stationary. Terrain causes no direct damage and planted brutes resist displacement.

The [matched 432-run combat audit](COMBAT-AUDIT-0.29.json) uses the same earned profiles, seeds and policies as 0.28:

| Policy | 0.28 wins | 0.29 wins | 0.29 boss wins |
| --- | ---: | ---: | ---: |
| Light | 0/108 | 0/108 | 0/54 |
| Heavy | 25/108 | 27/108 | 13/54 |
| Light + power | 23/108 | 22/108 | 15/54 |
| Mixed | 103/108 | 103/108 | 51/54 |

Every simulation terminates, and this runner exits cleanly. The art pass does not change simulation code. The floor adds a choice, but this audit does **not** demonstrate harder combat: Heavy gains two net wins and mixed outcomes stay the same.

A separate matched set of eighteen earned-profile journeys finishes before and after the moving-floor change. Median time in the rinse encounter changes from 4.85 to 5.28 simulated seconds; the belt encounter changes from 6.03 to 6.50. Whole-journey medians shorten slightly. These accelerated scripted inputs are not human pace or fun measurements. Chapter lengths and the regular encounter spacing are unchanged. [Baseline](ROUTE-PACING-0.28.json), [current](ROUTE-PACING-0.29.json), [validation](VALIDATION.md).

The reference comparison remains concrete: Castle Crashers informs expressive creature identities, combat tools and comic consequences; Super Meat Boy informs readable silhouettes, consistent movement responses and quick recovery from mistakes. The current work applies those lessons to distinct hero poses and jumpable moving surfaces. It does not establish comparable polish or enjoyment. [Research and remaining gaps](LEVEL-DESIGN-RESEARCH.md).
