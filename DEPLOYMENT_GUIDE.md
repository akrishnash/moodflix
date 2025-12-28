# 🚀 Free Backend Deployment Guide

## Quick Deploy Options (Choose One)

### Option 1: Vercel (Easiest - 5 minutes) ⭐ RECOMMENDED

**Steps:**
1. Push your code to GitHub (if not already)
2. Go to [vercel.com](https://vercel.com) and sign up (free)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects settings
6. Add environment variables (if needed):
   - `NODE_ENV=production`
   - `GROQ_API_KEY=your_key` (optional)
7. Click "Deploy"

**Done!** You'll get: `https://your-app.vercel.app`

**Update Android app:**
Change `BASE_URL` in `RetrofitClient.kt` to your Vercel URL.

---

### Option 2: Railway (Best Features - 10 minutes)

**Steps:**
1. Push code to GitHub
2. Go to [railway.app](https://railway.app) and sign up
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Railway auto-detects Node.js
6. Add environment variables:
   - `NODE_ENV=production`
   - `PORT` (auto-set, don't change)
   - `GROQ_API_KEY=your_key` (optional)
7. Railway automatically deploys!

**Done!** You'll get: `https://your-app.up.railway.app`

**Update Android app:**
Change `BASE_URL` in `RetrofitClient.kt` to your Railway URL.

---

### Option 3: Render (Free Database - 10 minutes)

**Steps:**
1. Push code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Render auto-detects settings
6. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
7. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=10000` (Render uses this)
8. Click "Create Web Service"

**Done!** You'll get: `https://your-app.onrender.com`

**Note:** Free tier spins down after 15 min inactivity (first request takes ~30 seconds)

**Update Android app:**
Change `BASE_URL` in `RetrofitClient.kt` to your Render URL.

---

## 📱 Update Android App After Deployment

After you get your deployment URL, update:

**File:** `android/app/src/main/java/com/moodcurator/app/data/api/RetrofitClient.kt`

```kotlin
// Replace with your deployment URL
private const val BASE_URL = "https://your-app.vercel.app"
// OR
private const val BASE_URL = "https://your-app.up.railway.app"
// OR
private const val BASE_URL = "https://your-app.onrender.com"
```

**Important:** Use `https://` not `http://` for deployed backends!

---

## 🔧 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Code is pushed to GitHub
- [ ] `package.json` has `start` script (✅ already has it)
- [ ] `build` script works (✅ already configured)
- [ ] Environment variables are ready (optional)

---

## 🎯 My Recommendation

**For quickest setup:** Use **Vercel**
- Easiest to set up
- No credit card needed
- Automatic HTTPS
- Great free tier

**For best features:** Use **Railway**
- Real server (no cold starts)
- Free database option
- Better for production

**For free database:** Use **Render**
- Includes free PostgreSQL
- Good for apps needing storage

---

## 🚀 Ready to Deploy?

1. **Choose a platform** (I recommend Vercel)
2. **Follow the steps above**
3. **Get your URL**
4. **Update Android app**
5. **Test!**

**Need help?** I can guide you through any platform! Just let me know which one you want to use. 🎉




