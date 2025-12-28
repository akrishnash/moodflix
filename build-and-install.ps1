# Build and Install Script for MoodCurator Android App (PowerShell)
# This script builds the APK and installs it on a connected device

Write-Host ""
Write-Host "🎬 MoodCurator - Build and Install Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if device is connected
Write-Host "📱 Checking for connected devices..." -ForegroundColor Yellow
$devices = adb devices | Select-String "device$"
if (-not $devices) {
    Write-Host "❌ No Android device connected!" -ForegroundColor Red
    Write-Host "Please connect your device via USB and enable USB debugging." -ForegroundColor Yellow
    exit 1
}

$device = ($devices -split '\s+')[0]
Write-Host "✅ Device found: $device" -ForegroundColor Green
Write-Host ""

# Navigate to android directory
Set-Location android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to navigate to android directory" -ForegroundColor Red
    exit 1
}

# Clean previous build (optional, uncomment if needed)
# Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
# .\gradlew.bat clean

# Build the APK
Write-Host "🔨 Building APK..." -ForegroundColor Yellow
.\gradlew.bat assembleDebug

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

$apkPath = "app\build\outputs\apk\debug\app-debug.apk"

if (-not (Test-Path $apkPath)) {
    Write-Host "❌ APK not found at $apkPath" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Install on device
Write-Host "📲 Installing on device..." -ForegroundColor Yellow
adb install -r $apkPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Installation successful!" -ForegroundColor Green
    Write-Host "🎉 The app has been installed on your device!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now open MoodCurator from your app drawer." -ForegroundColor Cyan
} else {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..




