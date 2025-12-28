# Building the MoodCurator Android App

## Option 1: Using Android Studio (Recommended)

1. **Open Android Studio**
   - If you don't have it, download from: https://developer.android.com/studio

2. **Open the Project**
   - File → Open
   - Navigate to the `android` folder
   - Click OK

3. **Wait for Gradle Sync**
   - Android Studio will automatically download dependencies
   - This may take a few minutes on first run

4. **Build the Project**
   - Build → Make Project (or Ctrl+F9)
   - Or Build → Build Bundle(s) / APK(s) → Build APK(s)

5. **Run the App**
   - Connect an Android device or start an emulator
   - Click the Run button (▶️) or press Shift+F10

## Option 2: Using Command Line

### Prerequisites
- Java JDK 17 or later installed
- Android SDK installed
- Gradle installed (or use the wrapper)

### Build Steps

1. **Navigate to the android directory:**
   ```powershell
   cd android
   ```

2. **Create Gradle Wrapper (if needed):**
   ```powershell
   gradle wrapper --gradle-version 8.2
   ```

3. **Build the APK:**
   ```powershell
   .\gradlew.bat assembleDebug
   ```

4. **The APK will be generated at:**
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

5. **Install on device:**
   ```powershell
   .\gradlew.bat installDebug
   ```
   (Requires device connected via USB with USB debugging enabled)

## Troubleshooting

### "Gradle not found"
- Install Gradle: https://gradle.org/install/
- Or use Android Studio (it includes Gradle)

### "SDK not found"
- Install Android SDK through Android Studio
- Or set ANDROID_HOME environment variable

### Build Errors
- Make sure Java 17+ is installed
- Sync Gradle in Android Studio: File → Sync Project with Gradle Files
- Clean build: `.\gradlew.bat clean` then rebuild

### Network Issues
- Check your internet connection (Gradle needs to download dependencies)
- If behind a proxy, configure it in `gradle.properties`

## Quick Start (Android Studio)

1. Open `android` folder in Android Studio
2. Wait for sync
3. Click Run (▶️)

That's it! Android Studio handles everything else.





