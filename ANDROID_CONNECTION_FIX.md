# Android App Connection Fix

## Your Computer's IP Address
**192.168.2.107**

## Quick Fix Steps

### Step 1: Check if you're using Emulator or Physical Device

**If using Android Emulator:**
- Keep: `http://10.0.2.2:5000` ✅ (already set)

**If using Physical Device:**
- Change to: `http://192.168.2.107:5000`

### Step 2: Update RetrofitClient.kt

Open: `android/app/src/main/java/com/moodcurator/app/data/api/RetrofitClient.kt`

**For Emulator (current):**
```kotlin
private const val BASE_URL = "http://10.0.2.2:5000"
```

**For Physical Device:**
```kotlin
private const val BASE_URL = "http://192.168.2.107:5000"
```

### Step 3: Verify Server is Running

Make sure your backend server is running:
```bash
npm run dev
```

You should see:
```
serving on port 5000
```

### Step 4: Test Connection

**For Physical Device:**
1. Make sure your phone and computer are on the **same WiFi network**
2. On your phone's browser, try: `http://192.168.2.107:5000`
3. If it loads, the connection works!

**For Emulator:**
- The connection should work automatically with `10.0.2.2`

### Step 5: Rebuild and Test

```bash
cd android
./gradlew.bat clean
./gradlew.bat assembleDebug
```

Or use your build script:
```bash
./build and install.sh
```

## Troubleshooting

### "Network error occurred" or "Failed to connect"

1. **Check server is running:**
   - Open browser: `http://localhost:5000`
   - Should see the web app

2. **For Physical Device:**
   - Verify same WiFi network
   - Check Windows Firewall (may need to allow port 5000)
   - Try disabling firewall temporarily to test

3. **For Emulator:**
   - Make sure you're using `10.0.2.2:5000`
   - Not `localhost` or `127.0.0.1`

4. **Check Logcat:**
   - In Android Studio, open Logcat
   - Filter by "Retrofit" or "OkHttp"
   - Look for connection errors

### Error Messages Now Visible

The app now shows error messages in the UI, so you'll see:
- "Network error occurred" - Can't reach server
- "Failed to generate recommendations" - Server error
- Connection timeout errors

## Quick Test

1. **Server running?** → `http://localhost:5000` in browser
2. **App shows error?** → Check the error message in the app
3. **No response?** → Check Logcat in Android Studio

## Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect (Physical) | Use `192.168.2.107:5000` and same WiFi |
| Can't connect (Emulator) | Use `10.0.2.2:5000` |
| Timeout | Check server is running, increase timeout in RetrofitClient |
| CORS error | Shouldn't happen, but check server allows all origins |




