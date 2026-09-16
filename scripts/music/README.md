# Current soundtrack — user Udio recordings, 0.31

Run `python scripts/music/import-udio.py` to fetch the ten public songs selected by the user, then `python scripts/music/install-udio.py` to master and install them. Original sources, source links and hashes live in `music/source/udio/`. The installer preserves the menu recording and archives the superseded chapter/cue assets before replacement. The app now uses ten recordings for twelve chapters, plus 24 scene excerpts. [Full provenance](../../public/audio/SOURCE.md).

The composition/rendering instructions below describe the superseded original soundtrack. Its audio archive is `music/archive/pre-udio-0.30/`; MIDI and tools remain available as project history. Running the old composition scripts would replace the selected recordings, so they are not part of the current build.

# Chapter music

Twelve original 32-bar compositions are authored in `compose.py`, with editable two-cycle MIDI in `music/midi/` and offline playback MP3s in `public/audio/chapters/`. The manifest records titles, tempo, meter, duration and SHA256. Boss scores use separate arrangements; Blood Sugar Waltz uses 3/4; Bite the Throne recalls the opening motif.

Rendering uses [GeneralUser GS](https://github.com/mrbumpy409/GeneralUser-GS) instrument samples through [TinySoundFont](https://github.com/schellingb/TinySoundFont). The game ships rendered MP3s, not a synthesizer or SoundFont. The instrument bank is external material; composition authorship does not mean every sample was created for this game. The author's license and provenance caveat are retained in `public/licenses/GeneralUser-GS.txt`; TinySoundFont's MIT notice is alongside it.

Reproduction requires Python 3, g++, and ffmpeg. Download the following into `$HOME/.local/share/emberbound-tools/music` (or set `EMBERBOUND_MUSIC_TOOLS`):

- `GeneralUser-GS.sf2`, from GeneralUser-GS revision `684543d5e5efaef08d02be50dcda8d552478fa60`.
- `tsf.h` and `tml.h`, from TinySoundFont revision `853a0a171759f1ddba0de1442133a75912bbeffa`.

Compile `render.cpp` with that directory as the include path, producing `render-score` in the same directory, then run `python scripts/music/compose.py` from the project. The composer renders two cycles and retains the second to preserve release tails across the loop. ffmpeg applies a short echo, -18 LUFS target, -1.5 dBTP ceiling and 8 ms edge fades, then encodes 160 kbit/s stereo MP3. Human listening is still required to judge transitions, balance and musical quality.

The separately selected Udio menu recording is documented in `public/audio/SOURCE.md`. Bangers display type comes from Google Fonts revision `5e35378e6bda803962ee6fd257e444a7d459660d`; its OFL license is retained in `public/licenses/Bangers-OFL.txt`.

## Regional performance cues — 0.21

Run `python scripts/music/cues.py` after building the same renderer. It imports composition definitions without rendering the chapter loops again. Eighteen editable MIDI files live in `music/cues/`; MP3s and their manifest live in `public/audio/cues/`. Each region uses its boss score's tonic and instrument patches for an entrance call, a faster dissonant rage cue and a major victory cadence with a short comic answer. These are original short compositions; the same sampled-instrument licenses above apply. Cue mastering targets -18 LUFS and -2 dBTP before MP3 encoding, with a 300 ms ending fade.

`src/audio.ts` routes both music and synthesized effects through a shared compressor. Music has separate chapter/menu and cue gains. Scene gains change between travel, combat, performances and results. Important effects temporarily reduce music; repeated effects are rate-limited and warning voices have reserved capacity. Pause stops scheduled effects and pauses media. Music mute discards a pending performance cue so it cannot replay later out of context.

Media sources are connected before the initial menu URL is assigned. A local WebKit regression test caught preloaded menu audio reporting playback while remaining at time zero and producing no samples. Assigning the URL after routing resolves that reproduction. This is local browser evidence, not a claim about every Safari version or native iPhone. Browser checks sample the actual mixed signal as well as checking media controls. See [MDN's media-element routing documentation](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaElementSource) and [compressor documentation](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode).

With the Vite server on port 4173, `node scripts/capture-audio.mjs` records a staged sequence through the production mixer to `artifacts/audio-review-0.21.mp3`. It is available for human listening, not evidence that anyone has judged its quality. The decoded sample measurements in `docs/AUDIO-AUDIT-0.21.json` do not measure intersample peaks or establish perceptual warning clarity.
