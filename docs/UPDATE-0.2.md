# 0.2 — Bad teeth, better brawls

The original compact solo campaign now has a faster pace and an original ugly-cute, handmade plush aesthetic throughout its characters, world, interface, and app icon.

## Faster play

| Mechanic | 0.1 | 0.2 |
| --- | --- | --- |
| Ash movement | 220 units/s | 320 units/s |
| Wren movement | 240 units/s | 345 units/s |
| Bram movement | 190 units/s | 280 units/s |
| Attack recovery, first/second hit | 0.28 s | 0.18 s |
| Third-hit recovery | 0.47 s | 0.29 s |
| Movement retained during attack | 45% | 85% |
| Dodge cooldown | 0.95 s | 0.65 s |
| Dodge speed | 610 units/s | 760 units/s |
| Passive magic recovery | 7 MP/s | 12 MP/s |
| Spell cooldown | 1.1 s | 0.75 s |

Enemy movement and attack recovery also speed up; attack warnings remain readable. A shorter hit-stop, faster music, and footstep dust support the quicker pace.

## Jumping

Space or I / gamepad A / the new Jump button. J and gamepad X attack; K and gamepad Y cast magic. Dodge stays on Shift/L and gamepad B.

Jumping preserves control along both ground axes. Height uses independent gravity and velocity; it does not change the character’s lane. Jumping clears low melee attacks, low projectiles, and boss ground slams while high enough. It is not universal invulnerability.

An airborne attack deals 35% extra melee damage, respects lane and reach, and arms a one-time belly-flop area attack for landing. Holding jump does not auto-hop or fly. Grounded shadows, stretched/squashed poses, flopping limbs, landing dust, sound effects, and HUD text communicate height and landing.

## Handmade nonsense

All player characters and enemies are original procedural plush monsters with fabric grain, asymmetric eyes, crooked individual teeth, loose stitches, floppy ears, and silly weapons. Heroes use a spatula, lollipop, and plunger. Bosses wear badly fitted cardboard crowns. Expressions, idle movement, defeat quips, menu descriptions, and equipment names follow the comic tone.

The three environments now have layered fabric hills, a stream, plank crossings, stitched trees, nosy mushrooms, ice-cream landmarks, crooked cardboard towers, scrap bunting, humorous signs, and foreground details. The map thumbnails show the actual renderer’s environments rather than placeholder mountain symbols. The original Fuggler toy aesthetic was a visual reference; no branded characters, toy photos, logos, or assets are shipped.

Existing saves remain compatible: internal hero, upgrade, chapter, and save-schema identifiers are unchanged. Android/iOS versions increase to 0.2.0, build 2.

## Rendering

Fabric patterns are shared, hero portraits and level thumbnails are cached, and only the current environment’s two large scenery layers are retained. Those cached layers scroll at different speeds to preserve depth, while actors, particles, airborne shadows, and foreground movement remain animated.

On this host, a 120-frame desktop Chromium check in the first ambush improved from a 41.1 ms mean frame interval before scenery caching to 20.3 ms afterward (median 33.4 → 16.7 ms). This is an illustrative headless-browser comparison, not a physical-device frame-rate guarantee. Sustained mobile profiling is still required.

Native iOS compilation and physical Android/iOS testing remain unverified in this Linux workspace. See RELEASE.md for release prerequisites.
