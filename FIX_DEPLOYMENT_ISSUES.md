# Fixing Deployment Issues

## Issues Found in Logs

1. ❌ **Python API not starting** - No "Starting Python Movie Recommendation API..." message
2. ❌ **Oracle Vector Search not being tried** - Only Hugging Face is attempted
3. ❌ **start.sh not executing** - Railway using `npm start` directly

## Fixes Applied

### 1. Updated `package.json`
- Changed `start` script to use `bash start.sh` instead of direct node command

### 2. Updated `server/ai-service.ts`
- OracleVectorSearchProvider now **always tries** (not conditional)
- Added better logging to see what's happening
- Added timeout to fail fast if Python API isn't running
- Better error messages

### 3. Updated `start.sh`
- More robust error handling
- Checks if Python is available
- Logs Python API output to `/tmp/python_api.log`
- Express server starts even if Python fails

### 4. Created `nixpacks.toml`
- Ensures Railway detects both Node.js and Python
- Installs both npm and pip dependencies

## What to Check in Railway

### After Redeploy, Look for These in Logs:

**✅ Success:**
```
==========================================
Starting Movie Recommendation Services
==========================================
[1/2] Starting Python Movie Recommendation API...
Loading sentence transformer model...
Model loaded successfully!
Python API started successfully (PID: ...)
[2/2] Starting Express server...
```

**When requesting recommendations:**
```
Trying Oracle Vector Search with URL: http://localhost:8000...
Oracle Vector Search returned 5 recommendations
Successfully generated recommendations using Oracle Vector Search
```

**❌ If Python API fails:**
```
WARNING: Python API process died. Check /tmp/python_api.log for errors.
```

### Common Issues:

#### Issue 1: Python not detected
**Solution:** The `nixpacks.toml` should fix this. If not:
- Check Railway build logs
- Verify `requirements.txt` exists
- Railway should auto-detect Python from `requirements.txt`

#### Issue 2: Python dependencies not installed
**Check logs for:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
- Verify `requirements.txt` has all dependencies
- Check Railway build phase logs
- Ensure `pip install -r requirements.txt` runs

#### Issue 3: Python API starts but crashes
**Check logs for:**
- Oracle connection errors
- Model loading errors
- Port conflicts

**Solution:**
- Verify Oracle environment variables
- Check `/tmp/python_api.log` in Railway logs
- Ensure PORT environment variable is set (Railway sets this)

#### Issue 4: Oracle Vector Search still not trying
**Check logs for:**
- Should see "Trying Oracle Vector Search with URL: ..."
- If not, check if `MOVIE_RECOMMENDATION_API_URL` is set

**Solution:**
- The provider now always tries (no conditional)
- If you see "Oracle Vector Search API not available", Python API isn't running

## Environment Variables Checklist

Make sure these are set in Railway:
- ✅ `ORACLE_USER`
- ✅ `ORACLE_PASSWORD`
- ✅ `ORACLE_TNS` (e.g., `movierecdb_tp`)
- ✅ `MOVIE_RECOMMENDATION_API_URL=http://localhost:8000`
- ✅ `TNS_ADMIN` (if using wallet)

## Next Steps

1. **Wait for Railway to redeploy** (automatic after push)
2. **Check Railway logs** for the new startup messages
3. **Test your frontend** - should now try Oracle Vector Search first
4. **If Python API fails**, check `/tmp/python_api.log` in logs

## Expected Behavior Now

1. **Startup:** Both Python and Express should start
2. **Recommendations:** Should try Oracle Vector Search first
3. **If Python fails:** Falls back to other AI providers gracefully
4. **Logs:** Much more detailed about what's happening

## Still Not Working?

If Python API still doesn't start:
1. Check Railway build logs for Python installation
2. Verify `nixpacks.toml` is in repository
3. Check if Railway detected Python (should see pip install in build logs)
4. Consider deploying Python API as separate Railway service

