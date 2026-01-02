"""
FastAPI service for movie recommendations using Oracle 26ai Vector Search.

This service can be deployed on Railway alongside the Express server.
The Express server can call this API to get movie recommendations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import sys

# Import recommendation functions
# Try to import, but allow API to start even if it fails (for health checks)
try:
    sys.path.insert(0, os.path.dirname(__file__))
    from recommend_movies import recommend_movies
    RECOMMENDATIONS_AVAILABLE = True
except Exception as e:
    print(f"WARNING: Could not import recommend_movies: {e}")
    print("API will start but /recommend endpoint will not work until this is fixed.")
    RECOMMENDATIONS_AVAILABLE = False
    recommend_movies = None

app = FastAPI(
    title="Movie Recommendation API",
    description="Semantic movie recommendations using Oracle 26ai Vector Search",
    version="1.0.0"
)

# CORS middleware - allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    prompt: str
    top_k: Optional[int] = 10
    content_type: Optional[str] = "Movie"  # "Movie", "YouTube Clips", or None for all

class MovieRecommendation(BaseModel):
    id: int
    title: str
    description: str
    similarity_score: Optional[float] = None
    url: Optional[str] = None
    content_type: str

class RecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]
    prompt: str
    count: int

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Movie Recommendation API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get movie recommendations based on a natural language prompt.
    
    Args:
        request: RecommendationRequest with prompt, top_k, and content_type
        
    Returns:
        RecommendationResponse with list of movie recommendations
    """
    try:
        # Validate input
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
        if request.top_k and (request.top_k < 1 or request.top_k > 50):
            raise HTTPException(status_code=400, detail="top_k must be between 1 and 50")
        
        # Get recommendations
        recommendations = recommend_movies(
            prompt=request.prompt,
            top_k=request.top_k or 10,
            content_type=request.content_type
        )
        
        if not recommendations:
            raise HTTPException(
                status_code=404, 
                detail="No recommendations found. Please try a different prompt."
            )
        
        # Convert to response format
        movie_recommendations = []
        for rec in recommendations:
            movie_recommendations.append(MovieRecommendation(
                id=rec['id'],
                title=rec['title'],
                description=rec.get('description', '')[:500],  # Limit description length
                similarity_score=rec.get('similarity_score'),
                url=rec.get('url'),
                content_type=rec.get('content_type', 'Movie')
            ))
        
        return RecommendationResponse(
            recommendations=movie_recommendations,
            prompt=request.prompt,
            count=len(movie_recommendations)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in recommendation API: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/recommend")
async def get_recommendations_get(
    prompt: str,
    top_k: Optional[int] = 10,
    content_type: Optional[str] = "Movie"
):
    """
    GET endpoint for movie recommendations (for easier testing).
    
    Args:
        prompt: Natural language movie preference
        top_k: Number of recommendations (default: 10, max: 50)
        content_type: Filter by type ("Movie", "YouTube Clips", or None)
    """
    request = RecommendationRequest(
        prompt=prompt,
        top_k=top_k,
        content_type=content_type
    )
    return await get_recommendations(request)

if __name__ == "__main__":
    import uvicorn
    
    # Use a fixed port for Python API (8000) since Node.js server uses PORT env var
    # Both services run in the same container, so Python API uses localhost:8000
    port = int(os.getenv("PYTHON_API_PORT", 8000))
    
    uvicorn.run(
        "movie_recommendation_api:app",
        host="0.0.0.0",
        port=port,
        reload=False  # Set to True for development
    )

