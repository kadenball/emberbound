# Art integration — 0.30

Generated with the **built-in imagegen tool** for this project on 2026-09-08. No CLI/API fallback was used. Exact generation and alpha-extraction prompts are preserved in [PROMPTS-0.30.json](../public/characters/PROMPTS-0.30.json). Hero identity references are the project's original 0.29 sheets; the ordinary enemies are original designs. No game or toy artwork was extracted.

| Final packaged path | Size | Content |
| --- | --- | --- |
| `public/characters/ash-attacks.png` | 1536 × 1024 RGBA | Eight furnace-lizard attacks |
| `public/characters/wren-attacks.png` | 1536 × 1024 RGBA | Eight sewer-bird attacks |
| `public/characters/bram-attacks.png` | 1536 × 1024 RGBA | Eight slug-toad attacks |
| `public/characters/enemies-melee.png` | 1254 × 1254 RGBA | Rat, crab, brute and boar; four poses each |
| `public/characters/enemies-ranged.png` | 1254 × 1254 RGBA | Mosquito, tick, nurse and centipede; four poses each |

Ash and Wren's first generated attack sheets had baked checkerboard backgrounds. Built-in alpha extraction produced the final transparent versions. All final files retain their generated pixels and alpha; originals remain under the Codex generated-images directory. [Exact original paths and hashes](ART-MANIFEST-0.30.json). Corner alpha is zero in all five packaged files.

`hero-art.ts` uses measured source cells, ground anchors and hand sockets. `atlas-bounds.ts` measures the largest connected sprite within a loose cell and its convex outline so drawing bounds exclude neighboring fragments; this changes runtime source coordinates, not the packaged image. It runs at decode time rather than per frame. `enemy-art.ts` uses species-specific source rows, scales and movement transforms. A missing image falls back to the existing vector renderer. Original hero sheets continue to supply portraits, locomotion, jump, power and recoil.

The five new sheets add 10.65 MiB of encoded files and 30 MiB of decoded pixels, before browser overhead. This is a finite key-pose system with procedural movement, not a fully painted frame-by-frame animation for every action. Bosses still use the previous procedural art.

`district-art.ts` adds eighteen code-native landmarks to the established canvas environment renderer. Each has a distinct premise and structure, including refrigerated body drawers, hanging butcher cuts, washing-drum operating theatres, organ hoppers and a courthouse mouth. Existing material weathering and regional scenery surround them. The new routes also own gameplay lane widths and interactive machinery; the landmarks themselves stay above the movement lane.

`capture-030.mjs` produces staged animation/enemy sheets, district rosters and phone-sized full-renderer fixtures under `artifacts/`. Those are visual review fixtures. `attacks-030.spec.ts` separately drives actual controls for jab, uppercut and dive across all three heroes and browser projects, and uses real combat inputs to observe blood in the opening fight.
