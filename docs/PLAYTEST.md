# Playtest the combat redesign

Status: no external human sessions have been conducted for this build. Automated campaign runs and browser checks cannot answer whether players enjoy this build. This kit makes that next evaluation repeatable without adding analytics or uploading anyone’s data.

## Short session (15–20 minutes)

Use several fresh players if available, including at least two people playing together. Include a real Android phone and an iPhone, landscape with two thumbs. Record device/model, OS, input method, build version, difficulty, prior beat-em-up familiarity, and whether the player has seen this build before. Ask permission before recording video. Keep names out of shared notes.

1. Start the woodland chapter with a fresh profile or the starting weapon. Let the player try it without coaching for two minutes. Do they find Heavy and Jump? Can they explain why an attack missed?
2. Ask them to launch and follow a foe into the air, then bowl one into its friends. Note whether they can repeat either deliberately. Separate unclear instructions from missed inputs and awkward finger reach.
3. Try the pan and starter side by side. Later try the sock and popsicle through legitimate progression or an isolated test profile. Ask what each changes and which situation it helps with. Do not overwrite their ordinary saved progress.
4. Complete the bridge and cart encounters. Observe whether the changing lane and objective are apparent, whether the cart stalls without explanation, and whether quiet travel feels like relief or waiting.
5. From the world map, try Madame’s practice chapter. Without explaining the solution, ask what the open drum and laundry bundles suggest. After a failed attempt, can the player identify a counter? Can they evade a spin and recognize a recovery opening?
6. Start local co-op. Check both players remain visible, recognize their own character, share an encounter, and revive a fallen partner. Verify a held revive button does not unexpectedly spend magic after finishing. Reconnect a controller after a disconnect pause.
7. Ask whether they want to replay, continue, change weapon, or stop. Let them choose. Then ask which moment they would describe to a friend.

If a launch/juggle input is hard to learn, demonstrate **Heavy → Jump → Light** once and try again. With a pan or sock, use **Dodge → Heavy → Jump → Light**, since their regular heavy has a different purpose. This distinction itself may need clearer teaching.

## Creature/animation check for 0.7

Before reading the field guide, ask the player to identify enemies by shape and predict their behavior. Can they distinguish a rat pounce from a boar charge, a low brute wave from a high swat, and a healer from the front line? Observe motion clarity during crowded fights and check whether impact flashes obscure warnings. Ask whether each hero feels visually distinct during movement, Heavy, jump and power. Check menu music after touch, mute, backgrounding and battle transitions on real devices.

## FILTH questions

Can a player explain FILTH and intentionally earn a meltdown without reading this document? Does the orange control-resistance ring make sense? Have them splash Wren’s puddle and choose whether to leave Bram’s decoy as bait or pop it. Can they recognize that brutes ignore it? After a defeat, can they predict the payout and the next surgery permit? Record whether the gross-out jokes are memorable or simply distracting. Check whether Ash’s recoil feels useful or steals control.

## Observation sheet

Copy one row per meaningful event, using local notes or a spreadsheet.

| Time / encounter | Intended action | What happened | Player’s explanation | Visible input / warning problem | Follow-up |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

After the session, ask for 1–5 ratings for: movement responsiveness, ability to predict hits, usefulness of different moves, enemy clarity, weapon differences, memorable humor, and desire to play again. Also collect the player’s own words; a score alone does not explain what to change.

Track unprompted heavy/juggle/bowling use, perceived input drops, unexplained damage, repeated deaths, time stuck at a cart/gate, boss cycles understood, button occlusion, and physical thumb strain. Do not turn these into a required move checklist during normal play.

## Compare fairly

If a separate 0.3 build is available, alternate the order players receive the two builds and use equivalent progress. Keep it separate from the normal installed app so save data is not lost or downgraded. The saved 0.3 audit file is a numerical baseline, not an executable old build. Small groups offer qualitative guidance, not statistical proof.

Change one problem at a time. For example: shorten a confusing heavy’s anticipation, enlarge a warning that users miss, move a touch button that overlaps a thumb’s path, or reduce a mixed fight’s simultaneous threats. Repeat the relevant session after a change. Do not simply add HP, corridors, or enemies to increase duration.

## Release gates this test cannot replace

Native installation and lifecycle checks, audio interruptions, thermal/frame-pacing runs, safe-area checks, real controller mapping, accessibility review, and Android/iOS signing/release validation belong to the release checklist. See RELEASE.md. The supplied unsigned bundle and debug APK are test artifacts.

## 0.9 retry review

Lose in the second or later encounter, then retry. Did you understand what hit you and choose a different response? Did the restart feel quick enough? Can you distinguish retrying the fight from accepting defeat? Check that cleared encounters, pre-fight equipment and health return, while failed-fight discoveries do not duplicate. Repeat in local co-op and on a narrow phone screen. A retry should teach a useful next attempt; a nearly empty starting health bar may reveal that between-fight supplies need further design work. Check that the no-retry third-star condition motivates mastery without obstructing campaign completion.

## 0.10 boss performance review

Watch each entrance once, then skip it. Does the boss look and move like its attack mechanic? Do the half-health body changes make the escalation clear without hiding the next danger? Try pausing during a performance, then resume; retry a lost boss and confirm its entrance stays skipped. Check the moving drum, separate forklift forks/wheels, shedding cake frosting and crown fall at phone scale. Listen for whether attack cues support the chapter music or become tiring. Report any spot where lettering, foreground objects or impact flashes obscure a tell. The game freezes combat during scenes; judge whether the interruption adds character or breaks the rhythm.

## 0.11 reference comparison and workplace review

Compare the opening woodland sabotage with the two reference principles: does its hazard teach a clear response after one attempt (Super Meat Boy), and does turning the inspector against the crew feel like a memorable performed joke (Castle Crashers)? Let the player approach without coaching. Can they distinguish the bell from a shutdown lever, explain the Heavy/bowling alternatives, and anticipate friendly fire? Observe whether they activate it during the fight or only notice it after the crew dies. If it feels like cleanup work, record that rather than treating completion as success. Repeat with the freezer's overhead ice and laundry's moving rinse; do players choose a different defense? Check the full roller corridor warning under touch controls. Retry after triggering a machine and verify the warning, bell and reward return correctly.

## 0.12 bookmark and ending review

Clear a fight, save and quit before reaching the next one, then close and reopen the app. The completed fight should stay cleared. Quit during a later fight and confirm Continue restarts that fight with its entry health and loadout, without banking or duplicating its failed-attempt loot. Try both normal app switching and OS process termination on physical Android/iOS devices. Repeat with a local co-op partner and reconnect the controller before unpausing. Check that Save & quit and Return to camp communicate their different consequences, and that the replacement choice is understandable.

On a landscape phone, complete the king and read the ending without skipping. Can the player see the crown weapon reward and the next action without searching below the fold? Does the last joke feel like a payoff to the story? The automated test proves UI progression and durable reward storage; it cannot answer those questions.

## 0.13 readable counters and exploit review

Without coaching, compare low candy blasts with the open dentures, then Frank's low and raised forks. After one failure, can the player explain which attack can be jumped and which needs a lane change? Try landing under the kettle's visibly high burp and sidestepping the royal stamp. Check whether the instruction, feet, object and impact stay readable under the player's thumbs. Listen for whether the new crunch/stamp sounds clarify timing or fatigue the mix.

Ask an experienced player to beat Candy and Frank by repeatedly using Heavy. The automated audit still succeeds this way in every sampled run; do not present that exploit as fixed. Then use deliberate combos, movement and powers with the same gear. Record whether the additional choices feel worthwhile, not just faster. The desired comparison is Meat Boy's understandable mastery combined with Castle Crashers' varied adventure—not a higher death count by itself.

## 0.14 weak points and earned healing

Try Snackula and Frank without explaining the new solution first. Does the wafer shell suggest hitting the head? Does the front plate versus engine gland suggest moving behind Frank? After a clang, can the player explain why the attack failed, and does the successful counter feel rewarding? Check whether the delayed close bite gives a readable reason to break off an aerial attack. Observe whether avoiding damage feels like a choice or a long wait.

With Jawbreaker, compare plain Heavy swings with a ground Light ×2 → Heavy finisher. Can the player deliberately get the six-HP heal, recognize a whiff or blocked hit, and use a counter or elemental finisher instead? Check that the live hint is useful without covering incoming attacks. Repeat with a crowd and a co-op partner. The audit now reduces Heavy-only boss wins from 26/54 to 17/54; repeat wins remain possible, and the test cannot establish human enjoyment.

## 0.15 arena identity and clarity

Show each boss room without its chapter title first. Can the player identify a distinct place and describe what happens there? Let them approach the room normally: does the entrance feel like reaching a destination? Compare the map's journey and boss cards before entering. Check that the upper lane clearly belongs to the walkable floor and that the hero, jump height, warning boundary and rear/head counter remain readable under touch controls.

Watch each boss defeat through its aftermath. Does the stopped machinery and changed sign register without distracting from the boss performance? Ask which setting they remember afterward and whether any background device wrongly suggested an interactive object or damaging hazard. Judge the actual phone image and movement; the staged roster and desktop submission timings cannot answer those questions.

## 0.16 controller adventure loop

Use a physical controller from home through hero choice, a chapter intro, fight, pause/settings, defeat/retry and rewards. Try the same flow with keyboard arrows, Tab, Enter and Esc. Can the player see the focused option, reach every available upgrade/weapon and understand that confirming a map card enters the chapter? Check offscreen choices scroll into view on portrait and landscape phones.

Hold confirm across the last story page and a retry. Hold a power button while resuming. Neither should become a combat action until released and pressed again. Press confirm on both local controllers together while purchasing a surgery. Disconnect and reconnect during solo and co-op combat, then explicitly resume. Check actual Xbox/PlayStation button mapping, Bluetooth reconnect timing and whether pausing preserves audio and save state. These checks are still needed on real hardware despite simulated-browser coverage.

## 0.17 malpractice review

Let a player encounter a jelly without explaining its new stitch. Can they identify which ally will recover health and choose between interrupting the medic, separating the pair or finishing the patient? Check the green thread and its progress ring amid laundry hazards, sparks and both players. Compare Light with Heavy or power during the cast. Is “CLAIM DENIED!” a satisfying consequence, and does the heal sound convey a lost opportunity without becoming irritating?

Leave a jelly until last. Does its cocked tentacle and orange rectangular warning predict the slap? Try a lane change and a late jump; jumping immediately at the beginning of the windup can land too soon. Check whether pursuing support enemies adds useful decisions or makes the encounter drag. The aggregate Heavy-only audit is unchanged, so also ask experienced players to seek repeatable trivial strategies with identical equipment.

## 0.18 journey identity and wayfinding

Play a complete journey without showing its contact sheet first. Can the player describe a sequence of places, remember where a weapon was found, and recognize a location when returning after a retry? Ask what the glove shop, payroll clock or complaint archive suggests before explaining it. Check whether any background apparatus falsely promises an interaction; report that even if the location looks good.

Observe whether the upper walking lane feels separate from the foundations, whether a bridge entrance reads clearly, and whether the worker shutters/aftermath signs register after a clear. Compare with the preceding repeating-building captures if useful. Longer landmarks do not themselves make long travel fun: record sections that feel like waiting, stretches where the next destination is unclear, and whether the player wants to continue.

## 0.19 — Planted fists and punishable recovery

Try the opening chapter with an ordinary starter weapon and again after finding the pan. When the knuckle brute plants its feet, can you tell it will keep swinging through frontal hits? Try a rear Heavy, a previously prepared Light ×2 → Heavy finisher, and bowling another foe into it. A new two-light recipe takes most of the short windup, so do not treat the finisher as a guaranteed reaction from neutral. Is preparing the counter worthwhile, or is evading and punishing the end more satisfying?

Compare the two arm windups: the low pound loads both fists, while the high swat raises one above its head. Can you distinguish them without reading? Jump the low wave; leave the high swat's lane. Does the snapped impact look synchronized with the hit and sound? Can the green rear seam and foot rings be read among other enemies?

After a rat, boar or centipede misses a rush, hit its recovery with melee. That interval previously rejected melee while allowing magic. Does the new opening feel earned, and does it accidentally create a stronger repetition loop? The audit shows more Heavy-only boss-chapter wins despite fewer journey wins; do not infer overall balance success from this change.

## 0.20 — Complimentary benefits, conditional survival

Approach a supply booth without coaching. Can you tell it is optional, identify its marked bay and see where to pass safely? The first booth is on the upper edge, the second on the lower edge. Try rushing it, waiting beside the bay for an open shutter, and walking past. Which choice feels appropriate at full health versus low health? Does the existing 25-HP/25-teeth reward justify stopping?

Compare a low spore/cutter/drain/taffy booth with an overhead press/stamp. Can the player explain which can be jumped? Closed shutters reject hits, so jumping out is an escape rather than a way to collect through the shutter. Check that the cutter's full swept corridor, active blade position and overhead impact are readable. The road drain should not pull someone off the main passing lane.

Claim a booth after clearing a fight, then close and reopen the app before the next fight. Confirm the receipt, health, unbanked run gold and cleared status remain and that the same booth cannot pay again. Try both co-op players hitting it together. Distinguish an optional detour from a new chore: record whether the player enjoys the decision or finds waiting irritating, and whether service signage or reward feedback obscures other action.

## Sound and musical payoff — 0.21

Listen to `artifacts/audio-review-0.21.mp3` for a short staged mix preview, then compare it with a real first-boss fight and a later regional boss. The recording is not a gameplay session. At ordinary phone-speaker and headphone volumes, can the player identify a machine warning during clustered hits without looking at the floor? Does the rage cue add urgency while preserving the next tell? Does victory sound satisfying or interrupt the aftermath? Check menu music from a cold launch, both sound toggles independently, repeated pause/resume, app background/foreground and an audio interruption on real Android and iPhone hardware. Record device and volume; browser signal tests do not answer these questions.

## The king delegates blame — 0.22

In the final chapter, observe the first staff meeting without explaining the receipt links. Does the player recognize that hits on the protected king are rejected, and switch targets? Let them clear the staff with their chosen weapon. Then show that a Pan or Candy Heavy can bowl an employee into the king while his seal is active; other styles/moves can also bowl. Does aiming the employee feel intentional and worth the longer opening? Ordinary staff clearance grants 2.2 seconds; the bowling counter grants a 3.2-second stagger with the existing jammed damage multiplier. Check whether lingering floor warnings remain understandable during that opportunity. Record whether the staff interlude adds a satisfying decision or simply delays the boss; the scripted timing increase does not answer that.

## Learned recipes and directional finishers — 0.23

Use Scrapper with a starter weapon, then a sock, pan and royal brush at appropriate earned progression. Does two connected Lights → Heavy reliably feel like bowling, and three → Heavy like a spin? At level 4, try three connected Lights → Down + Heavy: hold the joystick down (or S / ↓) while tapping Heavy. Can players deliberately choose between spin and quake without accidentally changing lanes into danger? Can they read the three chain dots and shrinking timer during a fight, and understand why a new chain starts after expiry? At level 8, try a perfect dodge → Down + Heavy for the counter quake. Compare keyboard, controller and two-thumb touch use; the current browser evidence only exercises simultaneous touches on Android-sized Chromium. Check P2 HUD readability while P1's chain appears. Record failed intended inputs and whether the 0.32-second Heavy buffer feels responsive or too eager.
