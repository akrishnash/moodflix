# Solutions to Reduce Docker Image Size

## Current Problem
Image is 8.1GB, limit is 4GB. Main culprits:
- PyTorch (~2-3GB)
- sentence-transformers dependencies (~1-2GB)
- Node.js dependencies (~500MB-1GB)

## Solution 1: Use Hugging Face Inference API (Best for Size)

Replace local model with API calls:

### Benefits:
- **No PyTorch needed** → Saves ~2-3GB
- **No model download** → Saves ~90MB
- **Free tier**: 30,000 requests/month
- **Image size**: ~1-2GB (under limit!)

### Implementation:
```python
# Instead of local model, use API
import requests

def get_embedding(text: str) -> List[float]:
    response = requests.post(
        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={"inputs": text}
    )
    return response.json()
```

### Free Alternatives:
1. **Hugging Face Inference API** - 30k requests/month free
2. **Cohere Embed API** - Free tier available
3. **OpenAI Embeddings** - $0.0001 per 1K tokens (very cheap)

## Solution 2: Use Railway Volumes (Keeps Current Approach)

Keep PyTorch but use Railway volumes for model cache:

1. Create volume in Railway (1GB free)
2. Mount at `/app/model-cache`
3. Set `MODEL_CACHE_DIR=/app/model-cache`
4. Model downloads once, persists

**Note**: This doesn't reduce image size, just prevents re-downloads.

## Solution 3: Use Lighter Embedding Model

Replace `sentence-transformers` with alternatives:

### Option A: Use `transformers` with `sentencepiece` only
- Still needs PyTorch, but might be slightly smaller
- Not much savings

### Option B: Use `gensim` Word2Vec
- No PyTorch needed!
- Lighter but less accurate
- Image size: ~500MB-1GB

## Recommended: Solution 1 (Hugging Face API)

**Why:**
- Biggest size reduction (removes PyTorch entirely)
- Free tier is generous
- No model management needed
- Faster cold starts

**Trade-off:**
- Requires internet connection
- API rate limits (but free tier is generous)

## Quick Implementation

I can modify the code to use Hugging Face Inference API instead of local model. This would:
- Remove PyTorch dependency
- Reduce image to ~1-2GB
- Keep same functionality
- Use free Hugging Face API

Would you like me to implement this?

