# 🧪 Quick Test Guide - Free AI Agent

## ✅ Your App Already Works!

**Good news**: Your app is already configured to work with **Hugging Face (FREE, no API key needed)**!

## 🚀 Test It Right Now (No Setup)

1. **Start your server**:
   ```bash
   npm run dev
   ```

2. **Open your app** (web or Android)

3. **Enter a mood** like:
   - "I'm feeling sad"
   - "I want something exciting"
   - "I'm in the mood for comedy"

4. **Wait 10-30 seconds** (Hugging Face free tier can be slow)

5. **You should see recommendations!** ✅

---

## ⚡ Want Faster Responses? (2-Minute Setup)

### Option 1: Groq (Recommended - Fastest Free Option)

1. **Sign up** (free, no credit card):
   - Go to: https://console.groq.com/
   - Click "Sign Up" (use Google/GitHub for quick signup)

2. **Get API Key**:
   - After login, click "API Keys" in sidebar
   - Click "Create API Key"
   - Copy the key (starts with `gsk_...`)

3. **Add to `.env` file** (in project root):
   ```env
   GROQ_API_KEY=gsk_your_key_here
   ```

4. **Restart server**:
   ```bash
   npm run dev
   ```

5. **Test again** - responses will be **1-2 seconds** instead of 10-30! ⚡

---

## 📋 What Happens Behind the Scenes

Your app tries AI providers in this order:

1. **Groq** (if API key is set) - ⚡ Fast (1-2 sec)
2. **Together AI** (if API key is set) - Medium speed
3. **Hugging Face** (always available) - 🐌 Slow (10-30 sec) but FREE
4. **Fallback recommendations** (if all fail) - Instant

---

## 🔍 Check Which AI is Being Used

Look at your **server console** (where you ran `npm run dev`). You'll see:

```
Trying Hugging Face...
Successfully generated recommendations using Hugging Face
```

Or if you set up Groq:
```
Trying Groq...
Successfully generated recommendations using Groq
```

---

## 🎯 Recommended Setup for Testing

**For immediate testing**: Just run the app! Hugging Face works without setup.

**For better experience**: Set up Groq (2 minutes, free, fast):
- Sign up: https://console.groq.com/
- Get API key
- Add to `.env`: `GROQ_API_KEY=your_key`
- Restart server

---

## 🆘 Troubleshooting

### "All AI providers failed"
- ✅ **Don't worry!** The app will use fallback recommendations
- Check your internet connection
- Check server console for error messages

### Hugging Face is very slow
- ✅ **This is normal** for free tier (10-30 seconds)
- Set up Groq for faster responses (see above)

### API key not working
- Make sure `.env` file is in project root (not in `server/` folder)
- Restart server after adding API key
- Check for typos in the key
- Make sure there are no spaces: `GROQ_API_KEY=key` not `GROQ_API_KEY = key`

### Model is loading (Hugging Face)
- Wait 30-60 seconds and try again
- Hugging Face free tier needs to load models on first use
- Consider using Groq for faster, more reliable responses

---

## 📊 Free Tier Limits

| Provider | Free Tier | Speed | Setup |
|----------|-----------|-------|-------|
| **Hugging Face** | Unlimited | Slow (10-30s) | ✅ Zero setup |
| **Groq** | 14,400 requests/day | Fast (1-2s) | 2 min setup |
| **Together AI** | Limited | Medium | 2 min setup |

---

## ✅ Summary

**Right now**: Your app works with Hugging Face (no setup needed, just slower)

**For better testing**: Set up Groq (2 minutes, free, fast):
1. https://console.groq.com/ → Sign up
2. Get API key
3. Add to `.env`: `GROQ_API_KEY=your_key`
4. Restart server

**That's it!** 🎉




