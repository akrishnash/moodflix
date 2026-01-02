/**
 * Free AI Service - Supports multiple free AI providers
 * 
 * Options:
 * 1. Hugging Face Inference API (Free tier available)
 * 2. Groq (Free tier with fast responses)
 * 3. Together AI (Free tier)
 * 4. OpenAI (if API key is provided)
 */

interface AIProvider {
  name: string;
  generateRecommendations(mood: string): Promise<any[]>;
}

class HuggingFaceProvider implements AIProvider {
  name = "Hugging Face";
  private apiKey: string | undefined;
  // Updated models that work with the new router endpoint (requires API key)
  private models = [
    "meta-llama/Llama-3.2-3B-Instruct", // Recommended for free tier
    "microsoft/Phi-3-mini-4k-instruct", // Alternative option
    "Qwen/Qwen2.5-1.5B-Instruct", // Alternative option
  ];

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
  }

  async generateRecommendations(mood: string): Promise<any[]> {
    // Hugging Face now requires API key for inference API
    // The old free endpoint is deprecated (410 Gone)
    if (!this.apiKey) {
      throw new Error("Hugging Face API key required (free endpoint deprecated)");
    }

    const prompt = `Based on the user's mood: "${mood}", suggest 3-5 entertainment options.
Mix of Movies, TV Shows, and YouTube video topics.
For each, provide a title, type (Movie, TV Show, or YouTube Video), a brief description, and a reason why it fits the mood.
Return ONLY a JSON object with a key "recommendations" containing an array of objects with keys: title, type, description, reason.
Example: { "recommendations": [{"title": "The Office", "type": "TV Show", "description": "A mockumentary sitcom...", "reason": "It's lighthearted and funny..."}] }`;

    // Try each model until one works
    for (const model of this.models) {
      try {
        // Use the new router endpoint (old api-inference endpoint is deprecated)
        const endpoint = `https://api-inference.huggingface.co/models/${model}`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`, // Required
        };

        const response = await fetch(endpoint, {
          headers,
          method: "POST",
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: {
              max_new_tokens: 500,
              return_full_text: false
            }
          }),
        });

        if (!response.ok) {
          // Hugging Face may return 503 when model is loading
          if (response.status === 503) {
            console.log(`Model ${model} is loading, trying next model...`);
            continue;
          }
          // Handle 410 Gone (deprecated endpoint) or 404 (model not found)
          if (response.status === 410 || response.status === 404) {
            console.log(`Model ${model} not available, trying next model...`);
            continue;
          }
          // Handle 401 (authentication error)
          if (response.status === 401) {
            throw new Error("Hugging Face API key invalid or expired");
          }
          // For other errors, try next model
          const errorText = await response.text().catch(() => "");
          console.log(`Model ${model} failed with ${response.status}, trying next model...`);
          continue;
        }

        const data = await response.json();
        
        // Handle case where model is loading (returns error object)
        if (data.error) {
          if (data.error.includes("loading") || data.error.includes("Loading")) {
            console.log(`Model ${model} is loading, trying next model...`);
            continue;
          }
          console.log(`Model ${model} returned error: ${data.error}, trying next model...`);
          continue;
        }
        
        let content = "";
        
        if (Array.isArray(data)) {
          content = data[0]?.generated_text || JSON.stringify(data[0]);
        } else if (typeof data === "string") {
          content = data;
        } else {
          content = data.generated_text || JSON.stringify(data);
        }
        
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.log(`Model ${model} response doesn't contain JSON, trying next model...`);
          continue;
        }

        try {
          const parsed = JSON.parse(jsonMatch[0]);
          const recommendations = parsed.recommendations || (Array.isArray(parsed) ? parsed : []);
          if (Array.isArray(recommendations) && recommendations.length > 0) {
            console.log(`✅ Successfully used Hugging Face model: ${model}`);
            return recommendations;
          }
        } catch (e) {
          console.log(`Model ${model} JSON parsing failed, trying next model...`);
          continue;
        }
      } catch (error: any) {
        // Network errors or authentication errors - don't try other models
        if (error.message.includes("API key")) {
          throw error;
        }
        // Network errors - try next model
        console.log(`Model ${model} failed with error: ${error?.message}, trying next model...`);
        continue;
      }
    }
    
    // If all models failed, throw error
    throw new Error("All Hugging Face models failed");
  }
}

class GroqProvider implements AIProvider {
  name = "Groq";
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
  }

  async generateRecommendations(mood: string): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error("Groq API key not configured");
    }

    const prompt = `Based on the user's mood: "${mood}", suggest 3-5 entertainment options.
Mix of Movies, TV Shows, and YouTube video topics.
For each, provide a title, type (Movie, TV Show, or YouTube Video), a brief description, and a reason why it fits the mood.
Return ONLY a JSON object with a key "recommendations" containing an array of objects with keys: title, type, description, reason.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        method: "POST",
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Free fast model
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Groq API error: ${response.status} ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Groq");

      const parsed = JSON.parse(content);
      const recommendations = parsed.recommendations || (Array.isArray(parsed) ? parsed : []);
      
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        return recommendations;
      }
      
      throw new Error("Invalid response format from Groq");
    } catch (error: any) {
      // Re-throw with cleaner message
      if (error.name === 'AbortError') {
        throw new Error("Groq request timeout");
      }
      throw error;
    }
  }
}

class TogetherAIProvider implements AIProvider {
  name = "Together AI";
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.TOGETHER_API_KEY;
  }

  async generateRecommendations(mood: string): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error("Together AI API key not configured");
    }

    const prompt = `Based on the user's mood: "${mood}", suggest 3-5 entertainment options.
Mix of Movies, TV Shows, and YouTube video topics.
For each, provide a title, type (Movie, TV Show, or YouTube Video), a brief description, and a reason why it fits the mood.
Return ONLY a JSON object with a key "recommendations" containing an array of objects with keys: title, type, description, reason.`;

    try {
      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        method: "POST",
        body: JSON.stringify({
          model: "meta-llama/Llama-3-8b-chat-hf", // Free tier model
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: AbortSignal.timeout(20000), // 20 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Together AI API error: ${response.status} ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Together AI");

      const parsed = JSON.parse(content);
      const recommendations = parsed.recommendations || (Array.isArray(parsed) ? parsed : []);
      
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        return recommendations;
      }
      
      throw new Error("Invalid response format from Together AI");
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error("Together AI request timeout");
      }
      throw error;
    }
  }
}

class OpenAIProvider implements AIProvider {
  name = "OpenAI";
  private client: any;

  constructor() {
    const OpenAI = require("openai");
    this.client = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }

  async generateRecommendations(mood: string): Promise<any[]> {
    const prompt = `Based on the user's mood: "${mood}", suggest 3-5 entertainment options.
Mix of Movies, TV Shows, and YouTube video topics.
For each, provide a title, type (Movie, TV Show, or YouTube Video), a brief description, and a reason why it fits the mood.
Return ONLY a JSON object with a key "recommendations" containing an array of objects with keys: title, type, description, reason.`;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from OpenAI");

      const parsed = JSON.parse(content);
      return parsed.recommendations || parsed;
    } catch (error) {
      console.error("OpenAI error:", error);
      throw error;
    }
  }
}

class OracleVectorSearchProvider implements AIProvider {
  name = "Oracle Vector Search";
  private apiUrl: string;

  constructor() {
    // Get Python API URL from environment, default to localhost:8000
    // On Railway, if Python API runs in same service, use localhost:8000
    let apiUrl = process.env.MOVIE_RECOMMENDATION_API_URL || "http://localhost:8000";
    // Strip any leading = and whitespace (common mistake when setting env vars)
    apiUrl = apiUrl.trim().replace(/^=+/, '').trim();
    // Ensure it's a valid URL
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = `http://${apiUrl}`;
    }
    this.apiUrl = apiUrl;
  }

  async generateRecommendations(mood: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: mood,
          top_k: 5, // Get top 5 recommendations
          content_type: "Movie", // Focus on movies from our database
        }),
        // Reasonable timeout - Python API should respond quickly
        signal: AbortSignal.timeout(10000), // 10 seconds
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => `Status ${response.status}`);
        throw new Error(`Python API error: ${response.status} - ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      
      // Convert Oracle Vector Search format to expected format
      const recommendations = data.recommendations?.map((rec: any) => ({
        title: rec.title,
        type: rec.content_type === "YouTube Clips" ? "YouTube Video" : "Movie",
        description: rec.description || rec.overview || "",
        reason: rec.similarity_score 
          ? `Similarity: ${rec.similarity_score.toFixed(2)}. Matches your mood: "${mood}".`
          : `Recommended based on your mood: "${mood}".`,
      })) || [];

      if (recommendations.length > 0) {
        return recommendations;
      }
      
      throw new Error("No recommendations returned from Oracle Vector Search");
    } catch (error: any) {
      // Provide more informative error for debugging
      const errorMsg = error?.message || String(error);
      if (error.name === 'AbortError') {
        throw new Error("Oracle Vector Search timeout");
      }
      throw new Error(`Oracle Vector Search: ${errorMsg}`);
    }
  }
}

// Fallback recommendations if all AI providers fail
function getFallbackRecommendations(mood: string): any[] {
  const moodLower = mood.toLowerCase();
  
  // Nostalgic / 90s content
  if (moodLower.includes("nostalgic") || moodLower.includes("90s") || moodLower.includes("90's") || moodLower.includes("nineties")) {
    return [
      { title: "Friends", type: "TV Show", description: "Classic 90s sitcom about six friends in New York.", reason: "Iconic 90s show that perfectly captures the era." },
      { title: "The Matrix", type: "Movie", description: "Groundbreaking sci-fi action film from 1999.", reason: "Quintessential 90s movie that defined the decade." },
      { title: "90s Music Videos", type: "YouTube Video", description: "Compilation of classic 90s music videos.", reason: "Take a trip down memory lane with 90s hits." },
      { title: "Titanic", type: "Movie", description: "Epic romance set aboard the ill-fated ship (1997).", reason: "One of the biggest movies of the 90s." },
      { title: "Seinfeld", type: "TV Show", description: "The show about nothing that defined 90s comedy.", reason: "Classic 90s sitcom that never gets old." }
    ];
  }
  
  // Sad / down
  if (moodLower.includes("sad") || moodLower.includes("down") || moodLower.includes("depressed")) {
    return [
      { title: "The Pursuit of Happyness", type: "Movie", description: "A struggling salesman becomes homeless but never gives up.", reason: "Inspiring story that shows resilience and hope." },
      { title: "Parks and Recreation", type: "TV Show", description: "A mockumentary about local government employees.", reason: "Uplifting and funny, perfect for lifting your spirits." },
      { title: "Cute Animal Compilations", type: "YouTube Video", description: "Adorable animals being cute.", reason: "Instant mood booster with wholesome content." }
    ];
  }
  
  // Happy / excited
  if (moodLower.includes("happy") || moodLower.includes("excited") || moodLower.includes("energetic") || moodLower.includes("optimistic")) {
    return [
      { title: "La La Land", type: "Movie", description: "A musical about two artists falling in love in Los Angeles.", reason: "Vibrant, energetic, and full of joy." },
      { title: "Brooklyn Nine-Nine", type: "TV Show", description: "Comedy about detectives in a New York precinct.", reason: "Hilarious and upbeat, matches your positive energy." },
      { title: "Epic Fail Compilations", type: "YouTube Video", description: "Funny fails and bloopers.", reason: "Light-hearted entertainment that keeps the good vibes going." }
    ];
  }
  
  // Scared / horror
  if (moodLower.includes("scared") || moodLower.includes("horror") || moodLower.includes("thriller")) {
    return [
      { title: "Get Out", type: "Movie", description: "A psychological horror film about a young man visiting his girlfriend's family.", reason: "Thrilling and thought-provoking without being too intense." },
      { title: "Stranger Things", type: "TV Show", description: "Supernatural mystery set in the 1980s.", reason: "Perfect blend of suspense and nostalgia." },
      { title: "True Crime Documentaries", type: "YouTube Video", description: "Mysterious and intriguing crime stories.", reason: "Engaging mysteries that satisfy your curiosity." }
    ];
  }
  
  // Default recommendations
  return [
    { title: "The Office", type: "TV Show", description: "A mockumentary sitcom about office workers.", reason: "Classic comedy that works for any mood." },
    { title: "Inception", type: "Movie", description: "A mind-bending sci-fi thriller about dreams.", reason: "Engaging and thought-provoking entertainment." },
    { title: "TED Talks", type: "YouTube Video", description: "Inspiring talks on various topics.", reason: "Educational and inspiring content." }
  ];
}

export class AIService {
  private providers: AIProvider[];

  constructor() {
    // Oracle Vector Search uses your actual movie database - try it first if available
    // Since Python API is confirmed running, include it by default
    const includeOracleVectorSearch = 
      process.env.ENABLE_ORACLE_VECTOR_SEARCH !== 'false' && // Allow explicit disable
      (process.env.MOVIE_RECOMMENDATION_API_URL || process.env.RAILWAY_ENVIRONMENT);
    
    // Prioritize providers: Oracle Vector Search first (uses your database), then fast external APIs
    this.providers = [
      // Oracle Vector Search first - uses your actual movie database (best results!)
      ...(includeOracleVectorSearch ? [new OracleVectorSearchProvider()] : []),
      // Groq is fastest external API - try second if available
      ...(process.env.GROQ_API_KEY ? [new GroqProvider()] : []),
      // Together AI is also fast and reliable
      ...(process.env.TOGETHER_API_KEY ? [new TogetherAIProvider()] : []),
      // OpenAI is high quality if configured
      ...(process.env.AI_INTEGRATIONS_OPENAI_API_KEY ? [new OpenAIProvider()] : []),
      // Hugging Face with API key (less reliable)
      ...(process.env.HUGGINGFACE_API_KEY ? [new HuggingFaceProvider()] : []),
    ];
    
    // Log which providers are available
    const availableProviders = this.providers.map(p => p.name).join(", ");
    if (availableProviders) {
      console.log(`✅ AI Providers available: ${availableProviders}`);
    } else {
      console.log("⚠️  No AI providers configured - using fallback recommendations");
    }
  }

  async generateRecommendations(mood: string): Promise<any[]> {
    // Try each provider in order until one succeeds
    for (const provider of this.providers) {
      try {
        const recommendations = await provider.generateRecommendations(mood);
        
        if (Array.isArray(recommendations) && recommendations.length > 0) {
          console.log(`✅ Generated recommendations using ${provider.name}`);
          return recommendations;
        }
      } catch (error: any) {
        // Silently try next provider - only log if it's the last one
        const isLastProvider = this.providers.indexOf(provider) === this.providers.length - 1;
        if (isLastProvider) {
          console.log(`⚠️  ${provider.name} unavailable, using fallback recommendations`);
        }
        continue;
      }
    }

    // If all providers fail, use fallback (always works)
    return getFallbackRecommendations(mood);
  }
}

export const aiService = new AIService();

