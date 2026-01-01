# Fixing Python Detection in Railway

## Current Issue

Railway is not detecting Python, so the Python API doesn't start.

## Solutions Applied

### 1. Added `runtime.txt`
- Specifies Python 3.11
- Railway should detect this

### 2. Updated `nixpacks.toml`
- Explicitly requests Python 3.11
- Installs both npm and pip dependencies

### 3. Added `build.sh`
- Custom build script that installs Python dependencies
- Handles cases where Python might not be in PATH

### 4. Updated `start.sh`
- Better Python detection (checks multiple locations)
- Shows Python version for debugging

## Alternative: Manual Railway Configuration

If automatic detection still doesn't work, you can manually configure Railway:

### Option 1: Set Build Command in Railway Dashboard

1. Go to Railway Dashboard → Your Service → Settings
2. Under "Build", set:
   - **Build Command**: `bash build.sh`
   - **Start Command**: `bash start.sh`

### Option 2: Use Railway's Environment Variables

Railway might need explicit Python setup. Try adding to Railway environment variables:
- `PYTHON_VERSION=3.11`
- `PIP_REQUIRE_VIRTUALENV=false`

### Option 3: Check Railway Build Logs

1. Go to Railway Dashboard → Your Service → Deployments
2. Click on the latest deployment
3. Check "Build Logs" tab
4. Look for:
   - Python installation messages
   - pip install messages
   - Any Python-related errors

## What to Check

After redeploy, look for in logs:

**✅ Python detected:**
```
Found Python at: /path/to/python3
Python 3.11.x
[1/2] Starting Python Movie Recommendation API...
```

**❌ Python not detected:**
```
WARNING: Python not found. Starting Express server only...
```

## If Python Still Not Detected

### Check Railway Build Logs

Look for:
- "Installing Python dependencies..."
- "pip install -r requirements.txt"
- Any Python-related errors

### Manual Fix in Railway

1. **Go to Railway Dashboard** → Your Service → Settings
2. **Check "Build" section**
3. **Verify build command** is set correctly
4. **Check if Railway detected Python** (should show in build logs)

### Last Resort: Separate Services

If Python still doesn't work in the same service:
1. Create a **separate Railway service** for Python API
2. Deploy `movie_recommendation_api.py` there
3. Update `MOVIE_RECOMMENDATION_API_URL` to point to the new service URL

## Testing

After redeploy:
1. Check logs for "Found Python at: ..."
2. Check logs for "Starting Python Movie Recommendation API..."
3. Test recommendations - should try Oracle Vector Search first

