# 0.14 — Hit the uninsured bits

The previous pass fixed misleading hazards but left Heavy-only winning all sampled Snackula and Frank fights. This update gives those bosses different anatomical defenses, removes healing from unearned Jawbreaker heavies, and rewards deliberate counters. Boss HP and player upgrade values were not increased.

## Different openings

**Count Snackula** folds wafer plates around his body while attacking or preparing an attack. Ground attacks and low spells clang off them; aerial strikes, high shots and a diving Flomp reach his exposed head. His shell opens during recovery, when ground attacks work normally. The head has a visible marker, the wafer plates unfold, and the introduction, HUD and defeat advice explain the counter.

On alternate volleys, a larger set of dentures bites the area immediately in front of him after the scattered sweets. Its 2.05-second warning leaves time to move lanes; jumping does not evade teeth descending from above. Delaying this bite separates it from the earlier candy impacts so that the previous hit's invulnerability does not routinely absorb it. Aerial offense therefore needs breaks to read the floor.

**Forklift Frank** has a riveted front plate and an exposed engine gland at the rear. Front attacks clang off during his active states. Moving behind him earns a stronger opening; attacks from either side work during his dizzy recovery. His existing low/raised forks still demand different defenses. A 36-unit rendering depth allowance keeps a nearby same-lane hero visible against the large boss body; it changes no collision or movement rule.

Accepted head/rear hits during active states deal 0.85× nominal damage, compared with the former universal 0.35× active-boss multiplier. Recovery remains 1.1×. These are deliberate opportunities to keep attacking rather than mandatory long waits behind an invulnerable health bar.

## Earn the heal

Jawbreaker previously called its healing a finisher perk but paid three HP for every ordinary Heavy. It now pays **six HP for an earned finisher**: build a ground Light ×2 → Heavy recipe, use a successful Scrapper counter, or connect a Hexer elemental finisher. Plain Heavy swings do not heal. The weapon description and live combo hint explain this. Rewards remain once per swing across a crowd, and blocked hits grant neither healing nor hit-based magic/FILTH credit.

Piercing shots award FILTH for their first damaging target even if an earlier target blocked them, and cannot award it repeatedly as they travel. Optional finisher/projectile reward flags are included in bookmark validation; older bookmarks still deserialize. All nine earned-progression hero/style campaign probes complete.

## Matched strategy evidence

Command: `node scripts/audit-combat.mjs docs/COMBAT-AUDIT-0.14.json docs/COMBAT-AUDIT-0.13.json`

The same 36 earned chapter profiles, three seeds and four combat policies are used: **432 runs per build**. Restricted policies can finish mandatory scenery after combat. No HP/position edits, invulnerability grants or skipped waves are used. The mixed policy was updated to use the visible aerial/rear counters, so these are not identical input recordings. Scripted precision does not establish human difficulty or enjoyment.

| Policy | 0.13 chapter wins / 108 | 0.14 chapter wins / 108 | 0.13 boss wins / 54 | 0.14 boss wins / 54 |
| --- | ---: | ---: | ---: | ---: |
| Light only | 0 | 0 | 0 | 0 |
| Heavy only | 43 | 31 | 26 | 17 |
| Light + magic | 26 | 26 | 21 | 21 |
| Mixed | 107 | 107 | 54 | 54 |

No timeouts occurred. Heavy-only Snackula wins fell **9 → 3** and Frank wins **9 → 6**, out of nine each. Mixed play won all those samples. Repetition still wins some fights; this is measurable progress, not proof that the exploit or broader game balance is solved. Raw results: [0.13](COMBAT-AUDIT-0.13.json), [0.14](COMBAT-AUDIT-0.14.json).

## Presentation and tests

New simulation coverage checks blocked rewards, actual jumping/head hits, front versus rear attacks, open recovery, diving hits, earned combo healing and one-time projectile credit. The existing crowd-healing test now primes a real finisher fixture and asserts a nonzero heal, avoiding a vacuous zero-equals-zero pass.

Browser tests use earned profiles, first perform an ordinary blocked Heavy through real inputs, then use the normal mixed policy to land a head/rear hit while the defense is active. They capture both states in desktop Chromium, Android-sized Chromium and iPhone-sized WebKit. The blocked-wafer and rear-counter phone images were inspected. These tests do not use HP/position edits. Capture paths: `artifacts/defense-{wafer,rear}-{blocked,counter}-{desktop,android,iphone}.png`.

Final build/test results are in [validation](VALIDATION.md). Human pacing, music review, repeated scenery, remaining combat exploits and native iOS/device release evidence are still open in [the full quality target](QUALITY-TARGET.md).
