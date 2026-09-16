# 0.10 — Management has a body

The six bosses previously shared a short anatomy branch and mostly generic rocking/hit poses. Each now has its own larger silhouette and state-driven performance:

- The kettle has fleshy feet, a pressure lid, a separate spout and a burping collapse.
- The Doughman has a loaf torso, kneaded fists, icicle teeth and an exposed, many-eyed yeast seam at half health.
- Madame has articulated cabinet legs and an independently rotating drum, with a sock tongue during inhale and a visible jammed load.
- Snackula has wafer wings, layered cake flesh, candle eyes, shedding frosting and a melted defeat.
- Frank has a fleshy operator, rotating wheels, articulated toothed forks, an engine fire and wheels that leave without him.
- The king has a receipt-wrapped worm body, a separate crown and an envelope-like collapse.

Every real boss encounter begins with a short, skippable introduction. Half health triggers a single visible breakdown and then a fresh attack windup. Existing regional enrage attacks remain; this pass does not claim six new combat systems. Combat freezes during these performances, while hit flashes, particles and floating text continue fading. Retrying the boss restores the checkpoint and skips the entrance.

Defeating the boss starts a comic exit before the chapter can win. A lethal projectile follows the same sequence as a melee kill. Summoned royal minions are dismissed without extra kill/XP awards. The existing victory settlement then banks once before aftermath dialogue. Skip buttons and ordinary combat actions can shorten scenes; keyboard/touch pause still freezes the game.

Bosses now have individual synthesized sound cues for their attacks, plus shared breakdown/fall stingers. Falling ice, candy blasts, royal notices and kettle belly-flop markers receive matching hazard art. These are original procedural effects; listening and mix review remain unverified. The twelve chapter recordings and user-selected menu track are unchanged.

The boss health display adds a half-health marker and current counter instruction. Camera framing includes the boss during performances, and display-font loading precedes cached scenery rendering so initial sign lettering is consistent.

`boss-performance.webm` and the six-boss roster/breakdown/defeat images are staged art studies. The `boss-entrance-*`, `boss-rage-*` and `boss-defeat-*` captures come from the actual UI using a test-only driver that supplies normal combat inputs in accelerated fixed steps. That integration test starts from a plausible saved first-boss loadout; it does not edit health, teleport actors or skip waves. It holds scenes for inspecting their real controls, then checks crown-tooth progression and reward banking. This is not real-time human play or proof of full-campaign enjoyment.
