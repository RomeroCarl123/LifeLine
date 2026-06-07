# LifeLine Android Build

This client is prepared for Android with Capacitor.

## Local Emulator Backend

The Android build uses `.env.android`:

```env
VITE_API_URL=http://10.0.2.2:4000/api
VITE_SOCKET_URL=http://10.0.2.2:4000
```

`10.0.2.2` lets an Android emulator reach the backend running on your computer.
For a physical phone, replace it with your computer LAN IP address, such as
`http://192.168.1.20:4000`.

## Commands

From `client`:

```bash
npm run android:sync
npm run android:open
```

Then build or run the app from Android Studio.

To build a debug APK from the terminal:

```bash
cd android
.\gradlew.bat assembleDebug
```

The APK will be created under `android/app/build/outputs/apk/debug/`.

## Required Local Tools

Install Android Studio with:

- Android SDK
- Android SDK Platform Tools
- A Java JDK, with `JAVA_HOME` set

If `gradlew.bat assembleDebug` says Java is missing, install a JDK through
Android Studio or separately, then set `JAVA_HOME` and reopen the terminal.
