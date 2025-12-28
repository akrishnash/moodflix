# Free AI Setup Guide for MoodCurator

The app now supports multiple free AI providers! You can use any of these options:

## Option 1: Groq (Recommended - Fast & Free)
1. Sign up at https://console.groq.com/
2. Get your API key from the dashboard
3. Set environment variable: `GROQ_API_KEY=your_key_here`

## Option 2: Together AI (Free Tier Available)
1. Sign up at https://together.ai/
2. Get your API key
3. Set environment variable: `TOGETHER_API_KEY=your_key_here`

## Option 3: Hugging Face (Works without API key for some models)
1. Optional: Sign up at https://huggingface.co/ for better rate limits
2. Get your API key (optional but recommended)
3. Set environment variable: `HUGGINGFACE_API_KEY=your_key_here` (optional)

## Option 4: OpenAI (If you have an API key)
1. Set environment variable: `AI_INTEGRATIONS_OPENAI_API_KEY=your_key_here`

## How It Works

The app will automatically try providers in this order:
1. Groq (if configured)
2. Together AI (if configured)
3. Hugging Face (works without key, but better with one)
4. OpenAI (if configured)
5. Fallback recommendations (if all fail)

## Setting Environment Variables

### For Local Development:
Create a `.env` file in the project root:
```
GROQ_API_KEY=your_groq_key_here
TOGETHER_API_KEY=your_together_key_here
HUGGINGFACE_API_KEY=your_hf_key_here
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_key_here
```

### For Production:
Set these as environment variables in your hosting platform.

## No API Key? No Problem!

The app will work with Hugging Face's free tier (no API key required) and has intelligent fallback recommendations if all AI services fail.




