# Building and releasing Emberbound

The project produces a real Android app and contains an iOS Xcode project. Building a web release or a debug APK does not establish readiness for the app stores.

## Toolchain

- Node.js 22 or later; install exact dependencies with `npm ci`.
- Android: Java 21, Android SDK platform 36, build tools 35/36, and the included Gradle 8.14.3 wrapper.
- iOS: macOS and Xcode 26 or later. Capacitor uses Swift Package Manager; CocoaPods is unnecessary for this project.

The current requirements were checked against [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup) and [Google’s Android tools page](https://developer.android.com/studio).

Tools downloaded for this workspace:

```text
$HOME/Android/Sdk
$HOME/.local/share/emberbound-tools/jdk21
$HOME/.cache/ms-playwright
```

`android/local.properties` is machine-local and ignored. Other machines should set their SDK location through Android Studio, `ANDROID_HOME`, or their own `local.properties`.

## Android

```bash
npm ci
npm run mobile:sync
cd android
./gradlew assembleDebug bundleRelease --no-daemon
```

On this workspace Java 25 is the system default; select the downloaded compatible JDK for Gradle:

```bash
JAVA_HOME=$HOME/.local/share/emberbound-tools/jdk21 ./gradlew assembleDebug bundleRelease --no-daemon
```

Outputs:

- `android/app/build/outputs/apk/debug/app-debug.apk` — signed with the local development key, installable for testing.
- `android/app/build/outputs/bundle/release/app-release.aab` — **unsigned** unless release signing is configured.

Install to a connected test device with `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`. Do not publish the debug build.

Release signing reads these environment variables without storing secrets in the project:

```text
EMBERBOUND_KEYSTORE       absolute path to your release keystore
EMBERBOUND_STORE_PASSWORD keystore password
EMBERBOUND_KEY_ALIAS      signing key alias
EMBERBOUND_KEY_PASSWORD   signing key password
```

Set these in the release environment or use Android Studio’s signed-bundle wizard. Run `bundleRelease` afterward. Keep the release key backed up privately. Choose your final unique application ID before first publication; the current placeholder is `com.emberbound.game`. Increment `versionCode` for later uploads.

## iOS

On a Mac:

```bash
npm ci
npm run mobile:sync
npm run ios
```

In Xcode, resolve the Swift packages, select your development team and unique bundle identifier, select an iPhone/iPad target, and run. For a release, select a generic iOS device, use Product → Archive, then validate and distribute through Organizer using your signing account.

The app includes a privacy manifest with the app-owned UserDefaults reason `CA92.1`, matching the [Preferences plugin documentation](https://capacitorjs.com/docs/apis/preferences). No analytics, tracking domains, remote accounts, or personal-data collection are implemented. Review the complete archive’s privacy report and answer the store’s declarations from that archive before submitting.

iPhone orientations are landscape left/right. iPad supports flexible orientations. Android requests sensor landscape; the UI also handles portrait and resized windows. Status bars are hidden, Android uses immersive navigation, and both native shells keep the screen awake while open.

## Validation and limits

Verified locally:

- Strict TypeScript compilation and optimized web build.
- Combat, save validation, upgrade economy, boss completion, and all 36 hero/chapter combinations through simulation.
- Actual browser UI flows in Chromium and WebKit at desktop and mobile sizes, including reload persistence, short taps, pausing, and native Chromium multi-touch events.
- Android debug APK and unsigned release AAB compilation, including release lint.
- Original icons/splash assets generated for both platforms and iOS project/plist syntax inspected.

The Fedora host required ICU 74 and JPEG 8 compatibility libraries for Playwright WebKit. Its optional media-codec host validation was bypassed with `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` after those libraries were installed. The game now uses synthesized combat audio and a bundled MP3 menu track. Version 0.7 browser checks verify real MP3 playback in Chromium and WebKit. Browser tests ran in real WebKit; this does **not** constitute an iOS native build or physical Safari validation. Standard Ubuntu/macOS CI should install Playwright’s supported dependencies normally.

Not verified here:

- iOS compilation/signing; no macOS/Xcode is available on this Linux host.
- Physical Android/iOS devices or an Android emulator. This environment has no `/dev/kvm` hardware acceleration.
- Sustained frame rate, battery/thermal performance, controller mappings on physical hardware, interruption recovery during OS termination, screen-reader usability, and broad human gameplay/balance testing.
- Hosted CI, store upload, signing, review, or public deployment.

## Before a public release

1. Play every chapter on a midrange Android phone and supported iPhones/iPads, with audio, touch, gamepad, safe areas, and airplane mode.
2. Run long sessions and measure frame pacing, memory, battery, thermals, and suspend/resume behavior. Test storage-full errors and chapter saves across force-stop/relaunch.
3. Run the iOS build and both native test suites in CI, then run closed beta testing and tune difficulty from player feedback.
4. Finalize the product name, bundle IDs, version numbers, signing, screenshots, support contact, privacy disclosure, and store content/age declarations.
5. Validate signed archives, distribute through internal testing, and resolve issues before public publication.

The current content is a twelve-chapter solo/local-co-op campaign. Online co-op, localization, achievements, and cloud saves remain unimplemented. A device-local bookmark now persists fight entrances and cleared roads; process termination and storage pressure still need native-device verification. Local co-op and the five-button touch layout still need observation on physical devices. See PLAYTEST.md and ONLINE-COOP-PLAN.md.
