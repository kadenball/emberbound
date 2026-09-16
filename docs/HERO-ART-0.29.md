# Playable character artwork — 0.29

`public/characters/ash.png`, `public/characters/wren.png` and `public/characters/bram.png` were generated with the built-in OpenAI image generation tool on 2026-09-08 for this project. These are original designs for the existing heroes, not extracted art from a reference game or toy. The exact final prompts and generation mode are recorded in [PROMPTS.json](../public/characters/PROMPTS.json).

Each original PNG is 1536 × 1024 with its generated alpha preserved. There are eight painted poses per hero: idle, two opposite strides, airborne, attack windup, attack contact, power and recoil. No separate portrait-only illustration is used. The character-select cards, dialogue portraits, menu scene and combat renderer all consume the same sheets.

`src/hero-art.ts` defines measured frame boundaries, feet anchors, hand sockets and per-species scale. The sheets are drawn directly through Canvas; the generated pixels are not recolored, keyed out or stretched into a different anatomy. Runtime squash, breathing, weapon rotation, launcher/slam motion, spinning and rolling supplement the painted key poses. Eight poses are not a full hand-animated frame set for every combo. Ordinary enemies and bosses retain their existing procedural artwork.

The startup loader decodes the local assets before caching portraits. There is no runtime generation service or external asset host. Missing/corrupt art falls back to the existing procedural character so menus and saved games remain usable. The sheets add 6.34 MiB to packaged assets and about 18 MiB of decoded RGBA pixels, excluding browser overhead and portrait caches.

[Final rendered pose sheet](../artifacts/hero-poses-029.png) and [character selection](../artifacts/heroes-029-desktop.png). The pose sheet is a renderer fixture; browser tests separately exercise real gameplay inputs.
