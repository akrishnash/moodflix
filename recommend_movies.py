"""
Movie Recommendation System using Oracle 26ai Vector Search

This script:
1. Takes a user prompt/query
2. Generates an embedding for the prompt using Hugging Face Inference API (all-MiniLM-L6-v2)
3. Performs vector similarity search in Oracle 26ai
4. Returns top movie recommendations

Uses Hugging Face Inference API instead of local PyTorch model to reduce Docker image size.
"""

import oracledb
import os
import sys
import numpy as np
import requests
from typing import List, Dict, Optional

# Import connection and config functions from process_kaggle
sys.path.insert(0, os.path.dirname(__file__))
from process_kaggle import get_oracle_connection, load_config

# Hugging Face API configuration
HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
HF_API_TOKEN = os.getenv('HUGGINGFACE_API_KEY', '')  # Optional, but recommended for higher rate limits

def generate_embedding_via_api(text: str) -> np.ndarray:
    """
    Generate embedding using Hugging Face Inference API.
    Returns 384-dimensional vector (same as all-MiniLM-L6-v2 model).
    """
    headers = {
        "Content-Type": "application/json",
    }
    if HF_API_TOKEN:
        headers["Authorization"] = f"Bearer {HF_API_TOKEN}"
    
    try:
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": text},
            timeout=30
        )
        
        if response.status_code == 503:
            # Model is loading, wait and retry once
            import time
            time.sleep(5)
            response = requests.post(
                HF_API_URL,
                headers=headers,
                json={"inputs": text},
                timeout=30
            )
        
        response.raise_for_status()
        embedding = np.array(response.json())
        
        # Ensure it's 1D array of 384 dimensions
        if embedding.ndim > 1:
            embedding = embedding.flatten()
        
        if len(embedding) != 384:
            raise ValueError(f"Expected 384 dimensions, got {len(embedding)}")
        
        return embedding
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Hugging Face API error: {e}")

def generate_prompt_embedding(prompt: str) -> str:
    """
    Generate embedding for user prompt and convert to Oracle VECTOR format.
    
    Args:
        prompt: User's mood/query string
        
    Returns:
        String representation of embedding vector for Oracle TO_VECTOR() function
    """
    embedding = generate_embedding_via_api(prompt)
    embedding_list = embedding.tolist()
    return str(embedding_list)

def search_similar_movies(prompt: str, top_k: int = 10, content_type: Optional[str] = None) -> List[Dict]:
    """
    Search for similar movies using vector similarity in Oracle 26ai.
    
    Args:
        prompt: User's mood/query string
        top_k: Number of recommendations to return
        content_type: Filter by content type ('Movie' or 'YouTube Clips'), None for all
        
    Returns:
        List of movie dictionaries with similarity scores
    """
    connection = None
    try:
        # Get database connection
        connection = get_oracle_connection()
        cursor = connection.cursor()
        
        # Generate embedding for the prompt
        print(f"Generating embedding for prompt: '{prompt[:50]}...'")
        prompt_embedding_str = generate_prompt_embedding(prompt)
        
        # Build SQL query with optional content_type filter
        if content_type:
            query = f"""
                SELECT id, title, description, content_type, url,
                       VECTOR_DISTANCE(embedding, TO_VECTOR(:1)) as similarity_score
                FROM movie_search
                WHERE content_type = :2
                ORDER BY similarity_score ASC
                FETCH FIRST :3 ROWS ONLY
            """
            cursor.execute(query, (prompt_embedding_str, content_type, top_k))
        else:
            query = """
                SELECT id, title, description, content_type, url,
                       VECTOR_DISTANCE(embedding, TO_VECTOR(:1)) as similarity_score
                FROM movie_search
                WHERE content_type IN ('Movie', 'YouTube Clips')
                ORDER BY similarity_score ASC
                FETCH FIRST :2 ROWS ONLY
            """
            cursor.execute(query, (prompt_embedding_str, top_k))
        
        results = cursor.fetchall()
        
        # Convert results to list of dictionaries
        movies = []
        for row in results:
            movie_id, title, description, content_type_val, url, similarity_score = row
            
            # Handle CLOB description
            if hasattr(description, 'read'):
                description_str = description.read()
            else:
                description_str = str(description) if description else ""
            
            movies.append({
                'id': movie_id,
                'title': str(title) if title else "Unknown",
                'description': description_str[:500] if description_str else "",  # Truncate long descriptions
                'content_type': str(content_type_val) if content_type_val else "Movie",
                'url': str(url) if url else None,
                'similarity_score': float(similarity_score) if similarity_score else 0.0
            })
        
        cursor.close()
        return movies
        
    except Exception as e:
        print(f"Error searching movies: {e}")
        if connection:
            connection.rollback()
        raise
    finally:
        if connection:
            connection.close()

def recommend_movies(prompt: str, top_k: int = 10, content_type: Optional[str] = None) -> List[Dict]:
    """
    Main function to get movie recommendations based on user prompt.
    
    Args:
        prompt: User's mood/query (e.g., "sci-fi movie with space exploration")
        top_k: Number of recommendations (default: 10)
        content_type: Filter by 'Movie' or 'YouTube Clips' (default: None for all)
        
    Returns:
        List of recommended movies with metadata
    """
    print(f"Getting recommendations for: '{prompt}'")
    recommendations = search_similar_movies(prompt, top_k, content_type)
    print(f"Found {len(recommendations)} recommendations")
    return recommendations

if __name__ == "__main__":
    # Test the recommendation system
    test_prompt = "sci-fi movie with space exploration"
    print(f"Testing with prompt: '{test_prompt}'")
    results = recommend_movies(test_prompt, top_k=5)
    
    for i, movie in enumerate(results, 1):
        print(f"\n{i}. {movie['title']} ({movie['content_type']})")
        print(f"   Similarity: {movie['similarity_score']:.4f}")
        print(f"   Description: {movie['description'][:100]}...")
