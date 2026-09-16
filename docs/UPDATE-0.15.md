# 0.15 — Management has redecorated

The last gameplay captures still showed boss arenas built from enlarged journey props. This pass replaces that repeated backdrop with six authored destinations, while keeping attack warnings and the whole playable lane clear.

![Six authored arena environments, shown without combat for art review](../artifacts/arena-roster.png)

| Boss | New setting and visual identity |
| --- | --- |
| Sir Burps-a-Lot | A municipal boiler swallowed by roots: copper pipework, hanging tea bags, a pressure gauge and slow steam. “Boil before burying.” |
| The Abominable Doughman | A freezer mortuary with tagged dough shrouds, a cracked cold-store window, icicles and a rotating ventilation fan. “Use by: the apocalypse.” |
| Madame Spin-Cycle | A flooded laundry shrine: mismatched drums, huge votive socks, circulating lost laundry and a rear sludge channel. “Confess. Rinse. Repeat.” |
| Count Snackula | A condemned candy chapel with sugar-glass teeth, wafer buttresses, syrup tanks, broken pews and a tooth chandelier. |
| Forklift Frank | A compactor bay with a swaying magnetic load of crushed vehicles, rear rollers, an abandoned punch clock and reinforced framing. |
| His Royal Toothiness | A monumental porcelain throne, tissue-roll columns, unpaid-bill banners and overflowing royal plumbing. “Flush your complaints.” |

Dark recessed backgrounds, distinct materials and restrained floor detail separate scenery from the heroes and danger markers. The freezer has cracks, laundry has tide stains, the junkyard has tire marks, and the royal bathroom has worn tiles. The new floor begins above the upper movement limit; machinery is vertically compressed into the background so a player at the top of the lane does not appear to stand inside a cabinet.

The room entrance suppresses intersecting journey landmarks instead of cutting a repeated building in half. Room flooring and foreground foundations meet without a strip of the old outdoor ground showing through. Existing supplies, levers, springs and combat interactions retain their roles.

The machinery stops and a regional aftermath sign appears when its boss dies. Boss map cards now preview the corresponding room, making a boss destination visually different from its journey chapter.

## Relation to the references

This follows the [Super Meat Boy / Castle Crashers comparison](LEVEL-DESIGN-RESEARCH.md): a place needs a coherent physical premise and readable gameplay, and an encounter benefits from a recognizable setup and aftermath. These are original setting designs. A stronger backdrop does not establish reference-game quality or solve remaining combat/pacing issues.

## Rendering and evidence

Static art uses the existing bounded terrain cache; the pass adds no large image downloads or separate full-level texture. A small dynamic layer animates the room's machinery behind actors. Gameplay rules and progression were not changed, so the [0.14 combat audit](COMBAT-AUDIT-0.14.json) remains the latest balance evidence.

`node scripts/capture-arenas.mjs` produces the six-room roster, six full renderer fixtures, the actual six boss-card preview images, and cached Canvas draw submission timings. These are explicitly **staged art fixtures**, not real play or physical-device FPS evidence. Actual-input boss screenshots come from the browser suite. Desktop measurements retain two terrain chunks in every sampled room. See [final validation](VALIDATION.md) for measurements and checks.

Artifacts:

- `artifacts/arena-roster.png`: six rooms together, without characters for comparison.
- `artifacts/arena-region-{1..6}.png`: production renderer fixtures with a boss, hero and warning.
- `artifacts/arena-preview-{1..6}.png`: the room previews used by the map cards.
- `artifacts/arena-render-timings.json`: measured draw submission cost and capture errors.
- Existing `counter-*-iphone.png` and `defense-*-iphone.png`: real-input boss warning/counter captures using the new rooms.

The roster and phone Candy fight were visually inspected. That review led to the transition cleanup, floor alignment and continuous foreground foundation. Human atmosphere/wayfinding review, journey scenery and travel pacing, native-device performance, music listening and native iOS release work remain open.
