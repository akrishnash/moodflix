@echo off
REM Build and Install Script for MoodCurator Android App (Windows)
REM This script builds the APK and installs it on a connected device

echo.
echo 🎬 MoodCurator - Build and Install Script
echo ==========================================
echo.

REM Check if device is connected
echo 📱 Checking for connected devices...
adb devices | findstr /R "device$" >nul
if %errorlevel% neq 0 (
    echo ❌ No Android device connected!
    echo Please connect your device via USB and enable USB debugging.
    exit /b 1
)

for /f "tokens=1" %%i in ('adb devices ^| findstr /R "device$"') do set DEVICE=%%i
echo ✅ Device found: %DEVICE%
echo.

REM Navigate to android directory
cd android
if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to android directory
    exit /b 1
)

REM Clean previous build (optional, uncomment if needed)
REM echo 🧹 Cleaning previous build...
REM call gradlew.bat clean

REM Build the APK
echo 🔨 Building APK...
call gradlew.bat assembleDebug

REM Check if build was successful
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)

set APK_PATH=app\build\outputs\apk\debug\app-debug.apk

if not exist "%APK_PATH%" (
    echo ❌ APK not found at %APK_PATH%
    exit /b 1
)

echo ✅ Build successful!
echo.

REM Install on device
echo 📲 Installing on device...
adb install -r "%APK_PATH%"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Installation successful!
    echo 🎉 The app has been installed on your device!
    echo.
    echo You can now open MoodCurator from your app drawer.
) else (
    echo ❌ Installation failed!
    exit /b 1
)

cd ..




