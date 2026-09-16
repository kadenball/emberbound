# Selected soundtrack provenance

## Preserved main-menu recording

Track: **Ashtro - Epic Quest Begins**, Udio. Selected by the user on 2026-09-07.

The supplied file in Downloads was an HTML Udio song page with an `.mp4` filename. Its embedded public audio URL was used to download the actual MP3:

https://storage.googleapis.com/udio-artifacts-c33fe3ba-3ffe-471f-92c8-5dfef90b3ea3/samples/6e3e5e2d5e01485d8044943df08c2827/2/The%2520Untitled.mp3

The 130.859-second source was transcoded to stereo MP3 at 160 kbit/s, with an 80 ms entrance fade and one-second ending fade to soften the loop seam. No speech, notes or extra instruments were added. It is bundled in the web and native builds; gameplay does not contact Udio or Google Storage.

Source SHA256: `9c90de2eb24b74f5f8ba8228ac196bd2578c485ad6742b2a567a0ce96e14565a`

Packaged MP3 SHA256: `a566a24bfbc390e930b95425a2eddd0e4ac40a31e924bb486a9a939cec196907`

## User-created in-game recordings — 0.31

The user supplied ten public Udio song links on 2026-09-08 and requested replacement of all music except the main menu. All ten public MP3 sources downloaded successfully and have distinct SHA256 hashes. Original bytes and source metadata are preserved in `music/source/udio/`; no audio was captured from a browser or extracted from another game.

| Recording | Udio song |
| --- | --- |
| Battle Awaits — Ashtro | [3Yv8yevmFkLLHu44BiJ4XK](https://www.udio.com/songs/3Yv8yevmFkLLHu44BiJ4XK) |
| Triumphant Echoes — Ashtro | [hgy6Wcpmyp3538s8kPNAwi](https://www.udio.com/songs/hgy6Wcpmyp3538s8kPNAwi) |
| Anthem of Triumph — Ashtro | [1GsZQvdgSnaL4J53XdfYwi](https://www.udio.com/songs/1GsZQvdgSnaL4J53XdfYwi) |
| Eternal Echoes — Ashtro | [t77bXLtSx9uiAXhVPSYrd1](https://www.udio.com/songs/t77bXLtSx9uiAXhVPSYrd1) |
| Cinematic Triumph — Ashtro | [jt1g77QDM9x2m45xSzx1VS](https://www.udio.com/songs/jt1g77QDM9x2m45xSzx1VS) |
| Rhapsody in Motion — Ashtro | [oCwuKR4XLUPf1ymyHHYJWJ](https://www.udio.com/songs/oCwuKR4XLUPf1ymyHHYJWJ) |
| Echoes of Harmony — Ashtro | [7zUw84pciFR76MTUP5EBvW](https://www.udio.com/songs/7zUw84pciFR76MTUP5EBvW) |
| Symphonic Breaks — Ashtro | [catXm13jdaMr1mzqkn6Ssr](https://www.udio.com/songs/catXm13jdaMr1mzqkn6Ssr) |
| Breaking the Silence — Ashtro | [aDLD6J5RGd6uLPfAProQbn](https://www.udio.com/songs/aDLD6J5RGd6uLPfAProQbn) |
| Static Harmony — Ashtro | [attHhyK21AqDQRTRq6Dbxr](https://www.udio.com/songs/attHhyK21AqDQRTRq6Dbxr) |

The ten recordings cover twelve chapters in the supplied order for chapters 1–10. Chapter 11 reprises **Triumphant Echoes**; chapter 12 reprises **Static Harmony**. The app shares the same bundled files for those reprises, so it does not download or duplicate them. Titles shown in the game match the recordings.

Full tracks are mastered toward -18 LUFS / -1.5 dBTP, encoded as stereo 44.1 kHz MP3 at 160 kbit/s, with an 80 ms entrance fade and 750 ms ending fade. No notes, vocals, extra instruments, tempo changes or pitch changes are added. Twenty-four short entrance, rage, victory and defeat cues use excerpts of the corresponding regional boss track, with short edge fades. Their exact source links and excerpt starts are recorded in `cues/manifest.json`. The old synthetic win/lose melodies are removed; gameplay impact and warning effects remain.

`chapters/manifest.json` records the twelve chapter assignments, files and hashes. `music/source/udio/mastering.json` records the source and mastered hashes and loudness analysis inputs. `scripts/music/import-udio.py` downloads the public sources; `scripts/music/install-udio.py` reproduces mastering and installation. The previous chapter recordings and cues are archived under `music/archive/pre-udio-0.30/`, outside the packaged app. Older original MIDI and composition tools remain as project history.

The main-menu MP3 is byte-for-byte unchanged. Gameplay uses bundled local files and makes no requests to Udio or Google Storage. Download/decode and signal checks do not substitute for a human listening review of the cue edits and loop seams.
