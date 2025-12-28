# AI Agent Recommendations for Movie Recommendations

This document outlines the best AI agents and services for generating movie, TV show, and entertainment recommendations based on user mood.

## Current Implementation

The app currently supports multiple AI providers with automatic fallback:

1. **Groq** (Primary - Fast & Free)
   - Model: `llama-3.1-8b-instant`
   - Pros: Very fast responses, free tier available
   - Cons: May have rate limits on free tier
   - Best for: Real-time recommendations

2. **Together AI** (Secondary)
   - Model: `meta-llama/Llama-3-8b-chat-hf`
   - Pros: Good quality, free tier available
   - Cons: Slightly slower than Groq
   - Best for: Backup provider

3. **Hugging Face** (Fallback)
   - Model: `mistralai/Mistral-7B-Instruct-v0.2`
   - Pros: Works without API key for some models
   - Cons: Can be slow, may require API key for better performance
   - Best for: Last resort fallback

4. **OpenAI** (Premium)
   - Model: `gpt-4o`
   - Pros: Highest quality recommendations
   - Cons: Requires paid API key
   - Best for: Production with budget

## Recommended AI Agents for Movie Recommendations

### 1. **OpenAI GPT-4o / GPT-4 Turbo** ⭐ Best Quality
- **Why**: Excellent understanding of context, mood, and entertainment preferences
- **Use Case**: Production apps with budget
- **Cost**: ~$0.01-0.03 per request
- **Setup**: 
  ```env
  AI_INTEGRATIONS_OPENAI_API_KEY=your_key_here
  AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
  ```

### 2. **Anthropic Claude (via Together AI or direct)** ⭐ Best for Context
- **Why**: Excellent at understanding nuanced moods and providing detailed explanations
- **Use Case**: When you need detailed reasoning for recommendations
- **Cost**: Varies by provider
- **Models**: `claude-3-opus`, `claude-3-sonnet`

### 3. **Groq (Llama 3.1)** ⭐ Best Free Option
- **Why**: Fast, free tier, good quality
- **Use Case**: Development and production with budget constraints
- **Cost**: Free tier available
- **Setup**:
  ```env
  GROQ_API_KEY=your_key_here
  ```

### 4. **Google Gemini Pro** ⭐ Good Balance
- **Why**: Good quality, competitive pricing, understands media context well
- **Use Case**: Alternative to OpenAI
- **Cost**: Free tier available, then pay-as-you-go
- **Setup**: Add to `ai-service.ts`:
  ```typescript
  class GeminiProvider implements AIProvider {
    async generateRecommendations(mood: string) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `Based on mood: "${mood}", suggest 3-5 entertainment options...` }]
            }]
          })
        }
      );
      // Parse response...
    }
  }
  ```

### 5. **Perplexity AI** ⭐ Best for Real-time Data
- **Why**: Can access current movie/TV show data, ratings, and reviews
- **Use Case**: When you need up-to-date recommendations with real data
- **Cost**: Free tier available
- **Note**: Great for combining AI with real-time movie database queries

### 6. **Cohere** ⭐ Good for Classification
- **Why**: Excellent at understanding sentiment and mood classification
- **Use Case**: When you need to classify moods accurately
- **Cost**: Free tier available

## Specialized Movie Recommendation Services

### 7. **TMDB (The Movie Database) API** ⭐ Essential for Real Data
- **Why**: Provides actual movie/TV show data, posters, ratings, genres
- **Use Case**: Combine with AI for accurate recommendations with real metadata
- **Cost**: Free (with API key)
- **Setup**:
  ```env
  TMDB_API_KEY=your_key_here
  ```
- **Integration**: Use AI to understand mood, then query TMDB for actual movies matching that mood

### 8. **OMDB API** (Open Movie Database)
- **Why**: Comprehensive movie database with ratings, plots, metadata
- **Use Case**: Alternative to TMDB
- **Cost**: Free tier (1,000 requests/day)

## Recommended Architecture

### Option 1: AI + Movie Database (Recommended)
```
User Mood → AI Agent (GPT-4/Groq) → Extract Mood Keywords/Genres 
→ Query TMDB API → Return Real Movies with Posters
```

**Benefits**:
- AI understands nuanced moods
- Real movie data with accurate metadata
- Actual poster images
- Ratings and reviews

### Option 2: Pure AI (Current Implementation)
```
User Mood → AI Agent → Generate Recommendations
```

**Benefits**:
- Simple implementation
- Works without external movie database
- Can suggest YouTube videos and other content

**Limitations**:
- May suggest non-existent or incorrect titles
- No real poster images
- No ratings/reviews

## Implementation Recommendations

### For Production (Best Quality)
1. **Primary**: OpenAI GPT-4o or Anthropic Claude
2. **Fallback**: Groq (Llama 3.1)
3. **Movie Data**: TMDB API for real movie information
4. **Poster Images**: TMDB poster URLs

### For Development/Free Tier
1. **Primary**: Groq (Llama 3.1) - Free and fast
2. **Fallback**: Together AI or Hugging Face
3. **Movie Data**: TMDB API (free tier)
4. **Poster Images**: TMDB poster URLs

### Hybrid Approach (Recommended)
1. Use AI to understand mood and extract:
   - Genres (action, comedy, thriller, etc.)
   - Mood keywords (uplifting, dark, funny, etc.)
   - Time period preferences
   - Intensity level

2. Query TMDB API with these parameters:
   ```typescript
   const tmdbResponse = await fetch(
     `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genres}&sort_by=popularity.desc`
   );
   ```

3. Use AI again to rank/filter results based on mood match

## Environment Variables Setup

Add to your `.env` file:

```env
# Primary AI Provider (Recommended: Groq for free, OpenAI for quality)
GROQ_API_KEY=your_groq_key_here
# OR
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_key_here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# Fallback Providers
TOGETHER_API_KEY=your_together_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here

# Movie Database (Recommended)
TMDB_API_KEY=your_tmdb_key_here
```

## Getting API Keys

1. **Groq**: https://console.groq.com/ (Free tier available)
2. **OpenAI**: https://platform.openai.com/ (Pay-as-you-go)
3. **Together AI**: https://together.ai/ (Free tier available)
4. **TMDB**: https://www.themoviedb.org/settings/api (Free)
5. **Anthropic**: https://console.anthropic.com/ (Pay-as-you-go)
6. **Google Gemini**: https://makersuite.google.com/app/apikey (Free tier)

## Performance Comparison

| Provider | Speed | Quality | Cost | Best For |
|----------|-------|---------|------|----------|
| Groq | ⚡⚡⚡ | ⭐⭐⭐ | Free | Development, Fast responses |
| OpenAI GPT-4o | ⚡⚡ | ⭐⭐⭐⭐⭐ | $$$ | Production, Best quality |
| Together AI | ⚡⚡ | ⭐⭐⭐⭐ | Free | Backup, Good quality |
| Hugging Face | ⚡ | ⭐⭐⭐ | Free | Last resort |
| Gemini Pro | ⚡⚡ | ⭐⭐⭐⭐ | Free/$$ | Alternative to OpenAI |

## Next Steps

1. **Add TMDB Integration**: Fetch real movie data and posters
2. **Implement Hybrid Approach**: AI mood analysis + TMDB queries
3. **Add Caching**: Cache popular mood → movie mappings
4. **Add User Preferences**: Learn from user selections to improve recommendations
5. **Add Rating System**: Let users rate recommendations to improve AI prompts

## Example: Enhanced AI Service with TMDB

```typescript
class EnhancedAIService {
  async generateRecommendations(mood: string) {
    // Step 1: Use AI to extract mood characteristics
    const moodAnalysis = await this.analyzeMood(mood);
    // Returns: { genres: ['comedy', 'drama'], keywords: ['uplifting', 'feel-good'] }
    
    // Step 2: Query TMDB with AI-extracted parameters
    const movies = await this.queryTMDB(moodAnalysis);
    
    // Step 3: Use AI to rank and explain why each movie fits the mood
    const rankedMovies = await this.rankByMood(movies, mood);
    
    return rankedMovies;
  }
}
```

This approach gives you the best of both worlds: AI understanding of nuanced moods + real movie data with accurate metadata.




