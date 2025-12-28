# 🆓 Free AI Setup for Testing - Quick Guide

Your app already works with **Hugging Face (no API key required)**! But here are the best free options for testing:

## ✅ Option 1: Hugging Face (Zero Setup - Already Working!)

**Status**: ✅ Already configured! Works without API key.

**How it works**: The app will automatically use Hugging Face if no other API keys are set.

**Pros**:
- ✅ No signup required
- ✅ No API key needed
- ✅ Works immediately

**Cons**:
- ⚠️ Can be slower (may take 10-30 seconds)
- ⚠️ Rate limits on free tier

**Test it now**: Just run your app! It will use Hugging Face automatically.

---

## 🚀 Option 2: Groq (Recommended - Fast & Free)

**Best for**: Fast testing with good quality responses

**Setup (2 minutes)**:
1. Go to https://console.groq.com/
2. Sign up (free, no credit card)
3. Click "API Keys" in the dashboard
4. Click "Create API Key"
5. Copy your key

**Add to your `.env` file** (create it in project root if it doesn't exist):
```env
GROQ_API_KEY=your_groq_key_here
```

**Pros**:
- ⚡ Very fast (1-2 seconds)
- ✅ Free tier: 14,400 requests/day
- ✅ Good quality responses
- ✅ Easy setup

**Cons**:
- Requires signup (but free)

---

## 🎯 Option 3: Together AI (Free Tier)

**Setup**:
1. Go to https://together.ai/
2. Sign up (free)
3. Get API key from dashboard
4. Add to `.env`:
```env
TOGETHER_API_KEY=your_together_key_here
```

**Pros**:
- ✅ Free tier available
- ✅ Good quality

**Cons**:
- Slightly slower than Groq

---

## 📝 Quick Setup Steps

### Step 1: Create `.env` file

In your project root (`E:\Mood-Flix-1`), create a file named `.env`:

```env
# Choose one or more (app will try them in order):
GROQ_API_KEY=your_key_here
# OR
TOGETHER_API_KEY=your_key_here
# OR
HUGGINGFACE_API_KEY=your_key_here  # Optional, works without it too
```

### Step 2: Restart your server

```bash
npm run dev
```

### Step 3: Test it!

The app will automatically:
1. Try Groq first (if API key is set)
2. Try Together AI (if API key is set)
3. Try Hugging Face (works without key)
4. Use fallback recommendations (if all fail)

---

## 🎬 Testing Without Any Setup

**Right now, your app works with Hugging Face (no setup needed)!**

Just run:
```bash
npm run dev
```

Then test your app - it will use Hugging Face automatically. Responses may take 10-30 seconds, but it works!

---

## 🔍 How to Check Which AI is Being Used

Check your server console logs. You'll see:
```
Trying Hugging Face...
Successfully generated recommendations using Hugging Face
```

Or:
```
Trying Groq...
Successfully generated recommendations using Groq
```

---

## 💡 Recommendation for Testing

**For quick testing**: Use **Groq** (2-minute setup, very fast)
**For zero setup**: Use **Hugging Face** (already working, just slower)

---

## 🆘 Troubleshooting

**"All AI providers failed"**:
- Check your internet connection
- Check server console for error messages
- The app will use fallback recommendations (still works!)

**Hugging Face is slow**:
- This is normal for free tier
- Set up Groq for faster responses (see Option 2)

**API key not working**:
- Make sure `.env` file is in project root
- Restart server after adding API key
- Check for typos in the key

---

## 📊 Comparison

| Provider | Setup Time | Speed | Quality | Free Tier |
|----------|-----------|-------|---------|-----------|
| Hugging Face | 0 min ✅ | Slow | Good | Unlimited |
| Groq | 2 min | Fast ⚡ | Very Good | 14,400/day |
| Together AI | 2 min | Medium | Good | Limited |

**Best for testing**: Groq (fast + free + easy)




