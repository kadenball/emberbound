# 0.7 — Different beasts, different problems

The common upright plush template has been replaced. This is an anatomy, animation and enemy-behavior pass, with the requested menu recording included.

## Creature identities

| Fighter | Anatomy and motion | Combat behavior |
| --- | --- | --- |
| Ash | Squat furnace-lizard, swaying tail, wide jaw, short legs | Piercing flame-fart jet with recoil |
| Wren | Tall sewer bird, bent neck, long jointed legs, flapping wing | Freezing vomit and splashable puddle |
| Bram | Broad slug-toad, five crawling limbs, swaying eye stalks | Explosive decoy and connected-blast healing |
| Ratchet rat | Low quadruped, tail, large ear and snapping jaw | Warns from farther out, commits to a pounce and pauses on landing |
| Syringe mosquito | Floating striped abdomen, fast wings and needle snout | Strafes across lanes and fires aimed shots at player height |
| Knuckle mildew | Broad ape body with long jointed arms and large hands | Raises arms; low pounds send a travelling wave, high swats threaten jumpers |
| Hermit bastard | Hermit crab, trash shell, six legs and large claw | Scuttles between lanes, guards, then ripostes repeated frontal lights |
| Bloat tick | Swollen abdomen and many skittering legs | Retreats off-lane and places two staggered adjacent hazards |
| Road-hog roast | Four-legged tusked boar with mane and snout | Commits to a lane charge with a recovery window |
| Malpractice jelly | Pulsing bell and independently waving tentacles | Floats behind injured allies and channels 18-HP healing |
| Socktopede | Segmented body and phase-offset crawling legs | Curves toward the back, warns, then commits to a rapid dash |

All six bosses also have mechanic-specific anatomy: a kettle beast, snow stack, walking washer drum, bat, wheeled forklift and crowned tooth-worm. Existing boss phases and counters remain.

## Animation and effects

The renderer uses simulation attack startup, active and recovery times for body anticipation, torso thrust and weapon follow-through. Species have different gaits, appendage motion, idle breathing and attack poses. Jump tilt, landing squash, roll/knockdown rotation, spin turns, extended kicks and hurt recoil support the action. Starter equipment remains visually distinct between heroes; discovered weapons render on all three rigs.

New bounded effects include colored hit stars with white cores, heavy impact flecks, vertical launcher streaks, expanding slam rings, cast rings, dash streaks, shattered guard pieces and flying teeth/stuffing on death. Attacks retain readable trails. Enemy low shockwaves use a different color from player quakes, with a warning lane before the pound. Wren's stream now originates at the bird's beak.

Normal fights permit one more simultaneous committed attacker than before; Relaxed retains the old budget. Pounces/dashes lock direction after their warning, stop at arena bounds and expose recovery. They can be interrupted during anticipation. No enemy HP increase or save reset was used.

## Requested menu music

The supplied `.mp4` file was actually a saved Udio page. Its embedded audio link provided **Ashtro - Epic Quest Begins**, approximately 2:11. The track is bundled as `public/audio/menu-theme.mp3`, loops through camp/menu screens after the first user gesture, stops in battle, and obeys Music and background/pause controls. Battle music remains synthesized. Full decoding and actual Chromium/WebKit playback passed. See [source provenance](../public/audio/SOURCE.md).

## Verification

- **93 simulation tests passed**, including eight new behavior/effect contracts. The four initial red tests confirmed absent rat pounces, absent ground waves, straight-line crab movement and only one tick hazard. Final tests also check locked pounce aim, interruptibility, jump evasion of low waves and bounded effect expiry.
- **51 browser tests passed**, six inapplicable combinations skipped. The three new platform combinations check actual menu audio playback, looping, Music off/on, battle stop and camp resume.
- All nine hero/style campaigns finish with earned progression and at most three attempts per chapter. The public-input policy now retreats across Madame's spin instead of pursuing it. It uses no HP edits, teleportation or skipped encounters.
- **432 fresh-equipment simulations**, zero timeouts. Attack-only won 0/108; attack/power 3/108; attack/power/dodge 35/108; the varied policy 75/108. [Raw audit](GAMEPLAY-AUDIT-0.7.json). The policy changed, so this is not a controlled comparison or evidence of human enjoyment.
- Android debug APK and unsigned release AAB built at version 0.7.0/code 7, including release lint. iOS web assets synced and project/plists parsed; no native iOS compile or physical-device testing on this Linux host.

[Creature roster](../artifacts/creature-roster.png) and [animation recording](../artifacts/creature-animation.webm) use staged motion-study poses in the production renderer. They are visual-review artifacts, not human playtest footage. The hero menu and mobile screenshots in `artifacts/creatures-*.png` use actual UI. Recorded captures reported zero page errors.
