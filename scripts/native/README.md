# Packaged Android smoke test

`npm run test:android` connects to the installed debug APK on the dedicated `emberbound_api36` AVD. It rejects physical devices, another AVD, and an APK version that differs from package.json. The script changes this test AVD's hero, music preference and adventure bookmark; do not use it for a personal playthrough. It disables guest Wi-Fi/data during the battle and reenables both on exit. It never clears app data.

Setup on this Linux workspace:

```sh
$HOME/Android/Sdk/cmdline-tools/latest/bin/sdkmanager 'emulator' 'system-images;android-36;google_apis;x86_64'
$HOME/Android/Sdk/cmdline-tools/latest/bin/avdmanager create avd -n emberbound_api36 -k 'system-images;android-36;google_apis;x86_64' -d pixel_6
$HOME/Android/Sdk/emulator/emulator -avd emberbound_api36 -no-window -no-boot-anim -no-snapshot -gpu host -feature -Vulkan -no-audio -memory 2048 -cores 2 -port 5554
```

Wait for `adb -s emulator-5554 shell getprop sys.boot_completed` to return `1`, install the current debug APK with `adb -s emulator-5554 install -r artifacts/emberbound-debug.apk`, and dismiss Android's first-use immersive-mode explanation if shown. Run from the repository root:

```sh
npm run test:android
```

The harness attaches through Playwright's experimental Android WebView API, dispatches real touch events through CDP, and uses ADB for Back/Home/process stop. Settings checkboxes use Playwright's check/uncheck actions and one short movement uses keyboard input. Assertions read rendered UI and the debug app's actual `CapacitorStorage.xml` SharedPreferences; no gameplay state or native events are injected. It verifies bundled offline combat, audio transport, native settings, pause on a quick Home/return, save-and-quit, full profile persistence across process death, and an explicitly resumed bookmark without duplicate banked rewards. JSON results go to `docs/ANDROID-SMOKE-<version>.json`; screenshots go to `artifacts/native-<version>-*.png`.

This is one API 36 x86_64 emulator, WebView 133, landscape Pixel 6 profile. `-no-audio` means advancing media transport is not evidence of audible output. It does not establish physical-phone frame rate, touch comfort, thermal/battery behavior, controller compatibility, other Android/WebView combinations or native iOS behavior. Run browser tests after stopping the emulator on memory-constrained hosts.

Official references: [Android command-line emulator](https://developer.android.com/studio/run/emulator-commandline), [AVD manager](https://developer.android.com/tools/avdmanager), [Playwright Android API](https://playwright.dev/docs/api/class-android), [WebView attachment](https://playwright.dev/docs/api/class-androidwebview).
