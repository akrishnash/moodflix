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
  // Try multiple model options - use a simpler, more reliable free model
  private models = [
    "microsoft/Phi-3-mini-4k-instruct", // Lightweight, fast, free
    "Qwen/Qwen2.5-1.5B-Instruct", // Alternative free model
    "meta-llama/Llama-3.2-3B-Instruct", // Fallback option
  ];

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
  }

  async generateRecommendations(mood: string): Promise<any[]> {
    const prompt = `Based on the user's mood: "${mood}", suggest 3-5 entertainment options.
Mix of Movies, TV Shows, and YouTube video topics.
For each, provide a title, type (Movie, TV Show, or YouTube Video), a brief description, and a reason why it fits the mood.
Return ONLY a JSON object with a key "recommendations" containing an array of objects with keys: title, type, description, reason.
Example: { "recommendations": [{"title": "The Office", "type": "TV Show", "description": "A mockumentary sitcom...", "reason": "It's lighthearted and funny..."}] }`;

    // Try each model until one works
    for (const model of this.models) {
      try {
        // Use the inference API endpoint (works better than router for free models)
        const endpoint = `https://api-inference.huggingface.co/models/${model}`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (this.apiKey) {
          headers["Authorization"] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(endpoint, {
          headers,
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        });

        if (!response.ok) {
          // Hugging Face free tier may return 503 when model is loading
          if (response.status === 503) {
            console.log(`Model ${model} is loading, trying next model...`);
            continue; // Try next model
          }
          // Handle 410 Gone (deprecated endpoint) or 404 (model not found)
          if (response.status === 410 || response.status === 404) {
            console.log(`Model ${model} not available, trying next model...`);
            continue; // Try next model
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
          console.log(`Model ${model} returned error, trying next model...`);
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
        // Network errors or other issues - try next model
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Groq");

      const parsed = JSON.parse(content);
      return parsed.recommendations || parsed;
    } catch (error) {
      console.error("Groq error:", error);
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Together AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Together AI");

      const parsed = JSON.parse(content);
      return parsed.recommendations || parsed;
    } catch (error) {
      console.error("Together AI error:", error);
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
  private enabled: boolean;

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
    
    // Enable Oracle Vector Search unless explicitly disabled
    // On Railway, if Python API is in same service, localhost:8000 works fine
    const isExplicitlyDisabled = process.env.DISABLE_ORACLE_VECTOR_SEARCH === 'true';
    this.enabled = !isExplicitlyDisabled;
    
    console.log(`Oracle Vector Search Provider initialized with URL: ${this.apiUrl} (enabled: ${this.enabled})`);
  }

  async generateRecommendations(mood: string): Promise<any[]> {
    // Skip if disabled
    if (!this.enabled) {
      throw new Error("Oracle Vector Search is disabled");
    }

    try {
      console.log(`Trying Oracle Vector Search with URL: ${this.apiUrl}...`);
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
        // Add timeout to fail fast if Python API isn't running
        signal: AbortSignal.timeout(5000), // Reduced to 5 seconds for faster fallback
      });

      if (!response.ok) {
        let errorText = "";
        try {
          const errorData = await response.json();
          errorText = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
          errorText = await response.text();
        }
        throw new Error(`Python API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log(`Oracle Vector Search API response:`, JSON.stringify(data).substring(0, 200));
      console.log(`Oracle Vector Search returned ${data.count || data.recommendations?.length || 0} recommendations`);
      
      // Convert Oracle Vector Search format to expected format
      const recommendations = data.recommendations?.map((rec: any) => ({
        title: rec.title,
        type: rec.content_type === "YouTube Clips" ? "YouTube Video" : "Movie",
        description: rec.description || "",
        reason: `Similarity score: ${rec.similarity_score?.toFixed(2) || "N/A"}. This movie matches your preference for "${mood}".`,
      })) || [];

      if (recommendations.length > 0) {
        console.log(`✅ Successfully generated ${recommendations.length} recommendations using Oracle Vector Search`);
        return recommendations;
      }
      
      throw new Error(`No recommendations returned. API response: ${JSON.stringify(data)}`);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      if (error.name === 'AbortError' || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('fetch failed')) {
        // Connection errors are expected if Python API isn't running - just log briefly
        console.log(`Oracle Vector Search API not available at ${this.apiUrl} (Python API may not be running)`);
      } else {
        console.error(`Oracle Vector Search error: ${errorMsg}`);
      }
      throw error;
    }
  }
}

// Fallback recommendations if all AI providers fail
function getFallbackRecommendations(mood: string): any[] {
  const moodLower = mood.toLowerCase();
  
  // Simple keyword-based fallback
  if (moodLower.includes("sad") || moodLower.includes("down") || moodLower.includes("depressed")) {
    return [
      { title: "The Pursuit of Happyness", type: "Movie", description: "A struggling salesman becomes homeless but never gives up.", reason: "Inspiring story that shows resilience and hope." },
      { title: "Parks and Recreation", type: "TV Show", description: "A mockumentary about local government employees.", reason: "Uplifting and funny, perfect for lifting your spirits." },
      { title: "Cute Animal Compilations", type: "YouTube Video", description: "Adorable animals being cute.", reason: "Instant mood booster with wholesome content." }
    ];
  } else if (moodLower.includes("happy") || moodLower.includes("excited") || moodLower.includes("energetic")) {
    return [
      { title: "La La Land", type: "Movie", description: "A musical about two artists falling in love in Los Angeles.", reason: "Vibrant, energetic, and full of joy." },
      { title: "Brooklyn Nine-Nine", type: "TV Show", description: "Comedy about detectives in a New York precinct.", reason: "Hilarious and upbeat, matches your positive energy." },
      { title: "Epic Fail Compilations", type: "YouTube Video", description: "Funny fails and bloopers.", reason: "Light-hearted entertainment that keeps the good vibes going." }
    ];
  } else if (moodLower.includes("scared") || moodLower.includes("horror") || moodLower.includes("thriller")) {
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
    this.providers = [
      // Try Oracle Vector Search first (uses our actual movie database)
      // Always try it if MOVIE_RECOMMENDATION_API_URL is set, or default to localhost:8000
      new OracleVectorSearchProvider(),
      // Then Groq (fast and free)
      ...(process.env.GROQ_API_KEY ? [new GroqProvider()] : []),
      // Then Together AI
      ...(process.env.TOGETHER_API_KEY ? [new TogetherAIProvider()] : []),
      // Then Hugging Face (works without API key for some models)
      new HuggingFaceProvider(),
      // Finally OpenAI if configured
      ...(process.env.AI_INTEGRATIONS_OPENAI_API_KEY ? [new OpenAIProvider()] : []),
    ];
  }

  async generateRecommendations(mood: string): Promise<any[]> {
    // Try each provider in order until one succeeds
    for (const provider of this.providers) {
      try {
        console.log(`Trying ${provider.name}...`);
        const recommendations = await provider.generateRecommendations(mood);
        
        if (Array.isArray(recommendations) && recommendations.length > 0) {
          console.log(`Successfully generated recommendations using ${provider.name}`);
          return recommendations;
        }
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        console.log(`${provider.name} failed: ${errorMsg.substring(0, 200)}`);
        console.log(`${provider.name} failed, trying next provider...`);
        continue;
      }
    }

    // If all providers fail, use fallback
    console.log("All AI providers failed, using fallback recommendations");
    return getFallbackRecommendations(mood);
  }
}

export const aiService = new AIService();

