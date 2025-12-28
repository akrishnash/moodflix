# Quick Setup Guide

## Step 1: Configure Server URL

Open `app/src/main/java/com/moodcurator/app/data/api/RetrofitClient.kt` and update the `BASE_URL`:

**For Android Emulator:**
```kotlin
private const val BASE_URL = "http://10.0.2.2:5000"
```

**For Physical Device:**
1. Find your computer's IP address:
   - Windows: Open Command Prompt and run `ipconfig`
   - Mac/Linux: Open Terminal and run `ifconfig`
2. Update the BASE_URL:
   ```kotlin
   private const val BASE_URL = "http://YOUR_IP_ADDRESS:5000"
   ```
   Example: `http://192.168.1.100:5000`

## Step 2: Start Backend Server

From the project root directory (not the android folder), run:

```bash
npm run dev
```

Make sure the server is running on port 5000 (or update the port in RetrofitClient.kt).

## Step 3: Build and Run

1. Open Android Studio
2. Open the `android` folder
3. Wait for Gradle sync
4. Connect device/emulator
5. Click Run (▶️)

## Troubleshooting

**Can't connect to server?**
- Emulator: Use `10.0.2.2` (this is the special IP for localhost)
- Physical device: Make sure phone and computer are on the same WiFi network
- Check that the backend server is actually running
- Verify the port number matches (default is 5000)

**Build errors?**
- Sync Gradle: `File > Sync Project with Gradle Files`
- Clean project: `Build > Clean Project`
- Rebuild: `Build > Rebuild Project`






