# 0.23 — Keep your bad habits

Some progression upgrades silently displaced previously learned attacks. Scrapper's level-four quake took over the two-Light bowling finisher; pan/sock weapon rules ran before shared combos; the royal brush changed its displayed move to spin while parts of contact handling still followed its earlier launcher kind. The live hint duplicated those rules and could advertise an unavailable move. Expired chain counts also survived until the next connected Light, allowing old hits to help form a new chain.

The new rules preserve common recipes and give the quake a separate input:

| Action | Result |
| --- | --- |
| Two connected Lights → Heavy | Bowl, with every weapon |
| Three connected Lights → Heavy, level 3+ | Spin, with every weapon |
| Three connected Lights → Down + Heavy, Scrapper level 4+ | Ground quake; its travelling wave still unlocks at level 6 |
| Perfect dodge → Down + Heavy, Scrapper level 8+ | Counter quake without needing a prior Light chain |
| Plain standing Heavy | Weapon's normal move: launch, pan/candy bowl, sock pull or brush spin |
| Dodge → Heavy | Launcher; existing counter/level bonuses apply |

Airborne attacks and primed Hexer finishers keep their own inputs and priority. Hold the stick down, S or ↓ when tapping the directional Heavy. Its direction is captured with the tap, so releasing Down during recovery does not change the queued finisher. Heavy's recovery buffer increases from 0.22 to 0.32 seconds. Hit-stop still returns unconsumed input to the caller; the real input adapter retains those taps.

Attack execution and the live hint now use the same move resolver. Three stitched chain dots show connected hits, a shrinking bar shows the remaining window, and the hint presents the regular finisher alongside the directional alternative. Expiry clears the chain count. The optional chain display moves P2's HUD down while visible. The move journal, weapon descriptions and help explain the updated recipes. The royal brush now applies the spin's actual body-bowling effects and weapon-adjusted timing consistently with its animation.

![Chain display in an isolated browser input fixture](../artifacts/chain-ready-android.png)

Twelve new simulation checks cover all eight weapons' learned recipes, actual connected-Light setup, buffered directional input, expiry, royal brush contact physics and the level-eight counter. The browser fixture supplies a healthy target for three real Light hits, pauses for a capture, then executes the directional Heavy. Android-sized Chromium uses simultaneous joystick and Heavy touches; desktop Chromium and iPhone-sized WebKit use keyboard input. This verifies input plumbing and presentation, not a human campaign session or native two-thumb comfort. Phone-sized ready captures were inspected.

The final [432-run audit](COMBAT-AUDIT-0.23.json) keeps the previous profiles, seeds and all four policies. Light remains **0/108**; Heavy remains **25/108**, with boss wins **14 → 13/54**; Light + power remains **28/108**, including **21/54** boss chapters; mixed changes **104 → 103/108**, with boss wins **53 → 51/54**. No timeouts occur. Individual wins and losses move in both directions; these numbers are not proof of improved difficulty or enjoyment. All nine earned hero/style campaign probes still complete.

This pass makes learned tools and feedback consistent with the [reference comparison](LEVEL-DESIGN-RESEARCH.md). Human combo value, input comfort, pacing and reference-level quality remain open. Final checks and platform limitations are in [current validation](VALIDATION.md).

The full browser run passed 149 checks but its three jaw-warning captures failed: the existing mixed player reached Count Snackula's aftermath before his second volley. The visual probe now withholds attacks once the boss appears until the jaw warning and impact have been observed, while still using normal defensive inputs. It changes no health, position or attack phase and does not change the matched combat audit. All twelve boss-counter browser checks then passed. The earlier kill remains a campaign-pacing observation, not something this test adjustment solves.
