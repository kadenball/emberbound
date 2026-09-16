# 0.24 — Keep the mess in your pocket

The actual Android APK exposed two issues absent from browser-sized screenshots. Older WebViews reserve a native strip beside the display cutout; its parent background was white. The native window and WebView parent now use the game's dark green while preserving Capacitor's protected layout.

A quick Home/return also let combat continue. Android called `onPause`, then resumed before `onStop` emitted the inactive `appStateChange` the game listened for. The native log showed `No listeners found for event pause`. The game now handles Capacitor's earlier `pause` event to pause combat, clear held input, stop audio and persist the bookmark. Returning still requires an explicit resume. Existing inactive/visibility handling remains for longer interruptions and browser use.

`npm run test:android` exercises the installed debug APK through its real Capacitor WebView and SharedPreferences. The baseline 0.23 run reproduced the Home/return failure twice, including after waiting for the resume tap to complete. The final 0.24 run passes all eight checks: native launch; menu audio transport; hero/settings in SharedPreferences; offline Jump/Power touches; Android Back; quick Home/return with paused chapter transport; exact saved profile across force-stop/relaunch; and resumed hero without duplicate banked XP/gold. This is a first-chapter bookmark with zero banked XP/gold, not a complete native campaign. Earlier harness failures involved off-screen touch coordinates, asynchronous menu navigation and a stale DOM during scrolling; those were test-driver faults, not storage failures.

![Actual Android app after saved-adventure recovery](../artifacts/native-0.24.0-resumed.png)

The native home and resumed-battle captures were inspected; the cutout area is dark and controls remain within the reserved viewport. The `foreground-paused` capture caught Android's launcher/app transition and is not a settled-window visual reference. The pause assertion itself uses the live WebView, and the subsequent save/continue actions succeed.

This is Android 16/API 36, Pixel 6 profile, x86_64, WebView 133.0.6943.137, 866×412 CSS viewport at DPR 2.625. Emulator 37.1.11 boots with the host GPU, Vulkan disabled and no audio output; the initial software-renderer boot crashed inside bundled SwiftShader before app installation. Advancing media transport does not establish audible output. Physical-phone timing, heat, battery, audio, controller behavior and native iOS remain unverified. [Reproduction instructions](../scripts/native/README.md), [baseline failure](ANDROID-SMOKE-0.23.0.json), [passing native report](ANDROID-SMOKE-0.24.0.json).

The [Super Meat Boy / Castle Crashers comparison](LEVEL-DESIGN-RESEARCH.md) continues to guide readable failure, quick retries, memorable gross places and useful combat progression. This release improves interruption reliability; it does not change level design or establish equivalent enjoyment. The remaining combat and pacing findings from 0.23 still apply.

Validation also exposed an intermittent zero-signal result in the existing WebKit mixer fixture. It failed once in the sequential browser selection and once in three isolated repetitions; diagnostic runs did not reproduce it. Audio source is unchanged. This remains open in [validation](VALIDATION.md).
