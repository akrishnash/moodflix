# Using Railway Volumes for Model Storage

## Option 1: Railway Volumes (Recommended - Free)

Railway provides **persistent volumes** that survive deployments. This means the model only downloads once and is reused.

### Setup Steps:

1. **In Railway Dashboard:**
   - Go to your service → **Volumes** tab
   - Click **"Create Volume"**
   - Name: `model-cache`
   - Mount Path: `/app/model-cache`
   - Size: 1GB (enough for the model)

2. **Update Environment Variable:**
   ```
   MODEL_CACHE_DIR=/app/model-cache
   ```

3. **The model will:**
   - Download on first run (from Hugging Face - free)
   - Cache in the volume
   - Reuse on subsequent deployments (no re-download)

## Option 2: Use Hugging Face Inference API (Free Tier)

Instead of running the model locally, use Hugging Face's free API:

### Benefits:
- No PyTorch needed (saves ~2GB)
- No model download needed
- Free tier: 30,000 requests/month

### Implementation:
We'd need to modify `recommend_movies.py` to use the API instead of local model.

## Option 3: Use a Lighter Embedding Library

Replace `sentence-transformers` with a library that doesn't need PyTorch:

### Options:
1. **`sentencepiece` + `transformers` (CPU-only)**
2. **`gensim` with Word2Vec** (lighter, but less accurate)
3. **Hugging Face `transformers` with `sentencepiece`** (still needs PyTorch)

## Current Status

The code is already set up to:
- Download model from Hugging Face (free) on first use
- Cache in `MODEL_CACHE_DIR` (configurable via env var)
- Use Railway volume if mounted

## Quick Fix: Use Railway Volume

1. Create volume in Railway dashboard
2. Set `MODEL_CACHE_DIR=/app/model-cache` env var
3. Model downloads once, persists across deployments

This doesn't reduce image size, but prevents re-downloading the model.

