# Checking if Python API is Running

## What to Look For in Railway Logs

### ✅ Python API Started Successfully:

You should see these messages:
```
==========================================
Starting Movie Recommendation Services
==========================================
[1/2] Starting Python Movie Recommendation API...
Loading sentence transformer model...
Model loaded successfully!
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
Python API started successfully (PID: ...)
[2/2] Starting Express server...
```

### ❌ Python API Failed:

You might see:
```
WARNING: Python API process died. Check /tmp/python_api.log for errors.
```

Or:
```
WARNING: Python not found. Starting Express server only...
```

## How to Check

1. **Go to Railway Dashboard** → Your Service → **Logs**
2. **Scroll to the beginning** of the latest deployment
3. **Look for** "Starting Python Movie Recommendation API..."
4. **If you don't see it**, Python isn't starting

## Common Issues

### Issue 1: Python Not Detected
**Symptoms:** No Python startup messages
**Solution:** 
- Check if `nixpacks.toml` is in your repo
- Verify Railway detected Python (check build logs)
- Ensure `requirements.txt` exists

### Issue 2: Python Dependencies Missing
**Symptoms:** Python starts but crashes immediately
**Check logs for:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
- Verify `requirements.txt` has all dependencies
- Check Railway build phase installed Python packages

### Issue 3: Oracle Connection Fails
**Symptoms:** Python API starts but recommendations fail
**Check logs for:**
```
Oracle connection failed
Error connecting to Oracle Cloud
```

**Solution:**
- Verify Oracle environment variables are set correctly
- Check if Railway IP is whitelisted in Oracle Cloud

## Quick Test

After deployment, when you request recommendations, check logs for:

**If Python API is working:**
```
Trying Oracle Vector Search with URL: http://localhost:8000...
Oracle Vector Search returned 5 recommendations
Successfully generated recommendations using Oracle Vector Search
```

**If Python API is NOT working:**
```
Trying Oracle Vector Search with URL: http://localhost:8000...
Oracle Vector Search API not available at http://localhost:8000 (Python API may not be running)
Hugging Face failed, trying next provider...
```

## Next Steps

1. **Check Railway logs** for Python startup messages
2. **If Python isn't starting**, check build logs for Python installation
3. **If Python starts but crashes**, check `/tmp/python_api.log` in logs
4. **Share the logs** so we can diagnose the issue

