# 0.31 — Your soundtrack

All ten Udio links supplied by the user downloaded successfully as distinct, playable MP3 recordings by **Ashtro**. Each source is approximately 130.86 seconds. The original bytes and their hashes remain in `music/source/udio/`.

Every non-menu score in the packaged game now comes from these recordings. The twelve chapters use the following assignments; the last two are reprises sharing existing files rather than extra downloads:

| Chapter | Recording |
| --- | --- |
| 1 — The Whispering Wood | Battle Awaits |
| 2 — The Picnic of Doom | Triumphant Echoes |
| 3 — Frostfall Pass | Anthem of Triumph |
| 4 — Freezer Burn | Eternal Echoes |
| 5 — Laundry Lagoon | Cinematic Triumph |
| 6 — The Rinse Pit | Rhapsody in Motion |
| 7 — The Crumble Works | Echoes of Harmony |
| 8 — The Last Supper-ish | Symphonic Breaks |
| 9 — Junkdrawer Junction | Breaking the Silence |
| 10 — Employee of the Bonk | Static Harmony |
| 11 — The Hollow Keep | Triumphant Echoes |
| 12 — The Throne of Bad Decisions | Static Harmony |

The eighteen old boss-performance music cues are replaced with excerpts from the regional boss recording, and six defeat excerpts are added. Entrance, rage, victory and defeat each play once per scene transition. The old synthesized win/lose melodies are removed. Combat impacts, creature sounds and warning effects remain as gameplay feedback.

Tracks are mastered toward a consistent -18 LUFS / -1.5 dBTP and encoded as stereo 44.1 kHz MP3 at 160 kbit/s, with short beginning/end fades. No instruments, notes, voices, pitch changes or tempo changes are added. Short cues have their own edge fades. Exact source links, assignments, edit offsets and hashes are in the [audio provenance](../public/audio/SOURCE.md), chapter/cue manifests, and source mastering report.

The main-menu recording is **byte-for-byte unchanged**, verified against SHA256 `a566a24bfbc390e930b95425a2eddd0e4ac40a31e924bb486a9a939cec196907`. It retains the automatic-start attempt added in 0.30 and respects the saved music setting. All recordings are bundled for offline play; the game makes no Udio requests. The old soundtrack remains archived outside the app under `music/archive/pre-udio-0.30/`.

This build also includes the previous pass's 24 new hero attack poses, 32 painted enemy poses, blood, repeated-Heavy counters and eighteen additional interactive districts. [0.30 gameplay and art changes](UPDATE-0.30.md), [validation](VALIDATION.md). A staged production-mixer recording is available at `artifacts/audio-review-0.31.mp3` for listening review; no human listening judgment is implied by decode or signal tests.
