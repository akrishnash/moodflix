#!/bin/bash

# Build and Install Script for MoodCurator Android App
# This script builds the APK and installs it on a connected device

set -e  # Exit on error

echo "🎬 MoodCurator - Build and Install Script"
echo "=========================================="
echo ""

# Check if device is connected
echo "📱 Checking for connected devices..."
if ! adb devices | grep -q "device$"; then
    echo "❌ No Android device connected!"
    echo "Please connect your device via USB and enable USB debugging."
    exit 1
fi

DEVICE=$(adb devices | grep "device$" | head -n1 | cut -f1)
echo "✅ Device found: $DEVICE"
echo ""

# Navigate to android directory
cd android || exit 1

# Clean previous build to avoid cached resource issues
echo "🧹 Cleaning previous build..."
./gradlew.bat clean

# Build the APK
echo "🔨 Building APK..."
./gradlew.bat assembleDebug

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found at $APK_PATH"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Install on device
echo "📲 Installing on device..."
adb install -r "$APK_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo "🎉 The app has been installed on your device!"
    echo ""
    echo "You can now open MoodCurator from your app drawer."
else
    echo "❌ Installation failed!"
    exit 1
fi

