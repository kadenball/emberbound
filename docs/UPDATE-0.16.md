# 0.16 — Keep your hands on the controller

Controllers previously worked during combat but could not operate the adventure menus. The menu navigator now covers chapter selection, heroes, local party setup, surgery, styles, weapons, settings, story pages, boss performances, rewards and fight retries. Keyboard arrows and Enter use the same navigation.

- A cream stitched outline shows focus and follows scrolling. Directional movement skips disabled choices. Focus survives hero, equipment and upgrade redraws. Native Tab remains available.
- D-pad or left stick moves; A / × confirms; B / ○ goes back. Selecting an available chapter enters it. Start pauses and resumes; Esc and P work in gameplay and pause.
- Confirm and Back act once per press. Two controllers pressing together produce one menu action per frame. A held confirm cannot purchase several surgeries or skip several story pages.
- Returning to combat waits for held attack buttons, keyboard keys and movement controls to be released. Selecting a retry or skipping a boss introduction cannot become an accidental jump or spent power.
- A disconnected controller pauses solo and cooperative games. Settings return to the paused adventure. Back from the first intro page returns to the map without marking the story seen; later pages move backward. Back on defeat highlights the explicit exit choice and preserves the retry bookmark.
- The armory begins on an available style or weapon choice, falling back to the adventure button when nothing can be changed. Surgery prefers an available upgrade, then the armory link.

![Controller focus on a phone-sized hero selection screen](../artifacts/controller-heroes-iphone.png)

This is a usability follow-through on the [Super Meat Boy / Castle Crashers comparison](LEVEL-DESIGN-RESEARCH.md): retrying an understood challenge should take little friction, and a cooperative adventure needs usable progression and equipment menus. This pass does not establish human enjoyment or change combat balance. The latest balance audit remains 0.14; the six authored arena environments remain from 0.15.

Behavioral browser coverage exercises held inputs, simultaneous controllers, story cancellation, native keyboard focus, settings, purchases, equipment, disconnect/resume, and bookmark-preserving retries. A separate real-input simulation driver reaches boss entrance, rage and defeat while controller presses operate scenes, aftermath, rewards and the next chapter. The forced-defeat menu fixture deliberately invokes the production damage path to test retry UI; it is not a natural-play difficulty measurement.

See [current validation](VALIDATION.md) for completed checks and [quality target](QUALITY-TARGET.md) for remaining work. Physical controllers and native device lifecycle still require device testing. Journey pacing, combat exploits, sound identity, human play/listening review and native iOS release verification remain open.
