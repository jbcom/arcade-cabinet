# Android 1.0 Release Notes

Date: 2026-04-22

## Release Shape

Arcade Cabinet 1.0 ships as one Capacitor Android app built from the same Vite `dist` output used for GitHub Pages.

- Package id: `com.arcade.cabinet`
- Web output: `dist`
- Target SDK: 36
- Default artifacts:
  - Debug smoke APK: `arcade-cabinet-debug.apk`
  - Play upload bundle: `arcade-cabinet-release.aab`

## Local Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm exec cap sync android
cd android && ./gradlew assembleDebug
pnpm android:release:aab
```

The AAB script passes the package version as `versionName` and reads `ANDROID_VERSION_CODE`, defaulting to `1` for local builds.

## Signing

Release signing is environment-driven so local debug work does not require a committed keystore:

- `ANDROID_RELEASE_STORE_FILE`
- `ANDROID_RELEASE_STORE_PASSWORD`
- `ANDROID_RELEASE_KEY_ALIAS`
- `ANDROID_RELEASE_KEY_PASSWORD`

When all four are present, Gradle signs the release bundle. If they are absent, Gradle can still produce an unsigned release bundle for CI artifact inspection before Play App Signing upload configuration is finalized.

## 16 KB Page Size

The cabinet is a TypeScript/WebView app and does not add project-owned native libraries. The 1.0 verification gate is:

```bash
find android/app/build -name "*.so" -print
```

Expected result: no project-owned `.so` files. If a future Capacitor plugin adds native libraries, run the Android 16 KB compatibility check before release.

## Large Screens And Resize

The Android activity declares `resizeableActivity="true"` and handles orientation, size, density, UI mode, and layout configuration changes. Game state must remain local and recoverable across resize/rotate through the shared cabinet runtime.

Smoke matrix:

- Phone portrait: launch, select cartridge, start, pause, resume.
- Phone landscape: start, rotate, pause, return to cabinet.
- Tablet: gallery readable, labels not clipped, game viewport fills screen.
- Foldable/resizable emulator: resize while in a game, pause and return to cabinet.

## Privacy And Data Safety

Default 1.0 policy:

- No ads.
- No analytics.
- No accounts.
- No in-app purchases.
- No leaderboards.
- No cloud saves.
- No network telemetry.
- No personal data collection.

Local data stored on device:

- Shared cabinet settings.
- Per-game best score/progress.
- Last selected session mode.
- One active run per game.

Android backups are disabled for the app so local game progress is not exported through device backup by default.
