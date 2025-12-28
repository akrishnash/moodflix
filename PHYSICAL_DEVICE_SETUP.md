# Physical Device Setup - Quick Guide

## ✅ Configuration Updated!

Your Android app is now configured to connect to your computer at:
**http://192.168.2.107:5000**

## Step 1: Verify Server is Running

Make sure your backend server is running:
```bash
npm run dev
```

You should see:
```
serving on port 5000
```

## Step 2: Test Connection from Phone

**On your phone's browser**, open:
```
http://192.168.2.107:5000
```

If you see the MoodCurator web app, the connection works! ✅

If you get "Can't reach this page" or timeout:
- Make sure phone and computer are on the **same WiFi network**
- Check Windows Firewall (see Step 3)

## Step 3: Windows Firewall (If Connection Fails)

If your phone can't connect, Windows Firewall may be blocking port 5000.

### Quick Fix - Allow Port 5000:

**Option 1: PowerShell (Run as Administrator)**
```powershell
New-NetFirewallRule -DisplayName "Node.js Server Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

**Option 2: Windows Firewall GUI**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port "5000" → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "Node.js Server" → Finish

## Step 4: Rebuild Android App

After updating the configuration, rebuild the app:

```bash
cd android
./gradlew.bat clean
./gradlew.bat assembleDebug
```

Or use your build script:
```bash
./build and install.sh
```

## Step 5: Install and Test

1. Install the APK on your phone
2. Open the MoodCurator app
3. Enter a mood like "I'm feeling sad"
4. Wait 10-30 seconds for AI recommendations

## Troubleshooting

### "Network error occurred" in app
- ✅ Check phone and computer are on same WiFi
- ✅ Test `http://192.168.2.107:5000` in phone browser
- ✅ Check Windows Firewall allows port 5000
- ✅ Verify server is running (`npm run dev`)

### "Can't reach this page" in browser
- Check WiFi network names match
- Try disabling Windows Firewall temporarily to test
- Check if your router blocks device-to-device communication

### App shows "Loading..." forever
- Check server console for errors
- AI may be taking time (Hugging Face: 10-30 seconds)
- Check Logcat in Android Studio for errors

## Your Configuration

- **Computer IP**: 192.168.2.107
- **Server Port**: 5000
- **App URL**: http://192.168.2.107:5000
- **Device Type**: Physical Android Device

## Quick Test Checklist

- [ ] Server running (`npm run dev`)
- [ ] Phone and computer on same WiFi
- [ ] Can access `http://192.168.2.107:5000` from phone browser
- [ ] Windows Firewall allows port 5000
- [ ] App rebuilt with new configuration
- [ ] App installed on phone

If all checked, the app should work! 🎉




