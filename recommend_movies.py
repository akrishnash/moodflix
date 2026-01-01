"""
Movie Recommendation System using Oracle 26ai Vector Search

This script:
1. Takes a user prompt/query
2. Generates an embedding for the prompt using the same model (all-MiniLM-L6-v2)
3. Performs vector similarity search in Oracle 26ai
4. Returns top movie recommendations
"""

import oracledb
import os
import sys
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional

# Import connection and config functions from process_kaggle
sys.path.insert(0, os.path.dirname(__file__))
from process_kaggle import get_oracle_connection, load_config

# Initialize the sentence transformer model (same as used for movies)
print("Loading sentence transformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully!")

def generate_prompt_embedding(prompt: str) -> str:
    """
    Generate embedding for user prompt and convert to Oracle VECTOR format.
    
    Args:
        prompt: User's movie preference prompt
        
    Returns:
        String representation of vector for Oracle TO_VECTOR function
    """
    # Generate embedding using the same model
    embedding = model.encode(prompt, show_progress_bar=False)
    
    # Convert to list and then to string format for Oracle
    embedding_list = embedding.tolist()
    embedding_str = str(embedding_list)  # Format: '[val1, val2, ...]'
    
    return embedding_str

def search_similar_movies(
    connection, 
    prompt_embedding: str, 
    top_k: int = 10,
    content_type: Optional[str] = None
) -> List[Dict]:
    """
    Search for similar movies using vector similarity in Oracle 26ai.
    
    Args:
        connection: Oracle database connection
        prompt_embedding: String representation of prompt embedding vector
        top_k: Number of top recommendations to return
        content_type: Filter by content type ('Movie' or 'YouTube Clips'), None for all
        
    Returns:
        List of dictionaries containing movie recommendations
    """
    cursor = connection.cursor()
    
    # Build the query with optional content_type filter
    content_filter = ""
    if content_type:
        content_filter = f"AND content_type = '{content_type}'"
    
    # Oracle 26ai vector similarity search using VECTOR_DISTANCE
    # Lower distance = more similar
    # We use COSINE distance for semantic similarity
    # Create the query vector once and reuse it
    query = f"""
        WITH query_vector AS (
            SELECT TO_VECTOR(:1) as vec FROM DUAL
        )
        SELECT 
            m.id,
            m.title,
            m.description,
            m.search_blob,
            m.url,
            m.content_type,
            VECTOR_DISTANCE(m.embedding, q.vec, COSINE) as distance
        FROM movie_search m, query_vector q
        WHERE m.embedding IS NOT NULL {content_filter}
        ORDER BY VECTOR_DISTANCE(m.embedding, q.vec, COSINE) ASC
        FETCH FIRST :2 ROWS ONLY
    """
    
    try:
        cursor.execute(query, (prompt_embedding, top_k))
        results = cursor.fetchall()
        
        recommendations = []
        for row in results:
            # Handle CLOB types - convert to string if needed
            description = row[2]
            if hasattr(description, 'read'):
                description = description.read()
            elif description is None:
                description = ""
            else:
                description = str(description)
            
            search_blob = row[3]
            if hasattr(search_blob, 'read'):
                search_blob = search_blob.read()
            elif search_blob is None:
                search_blob = ""
            else:
                search_blob = str(search_blob)
            
            recommendations.append({
                'id': row[0],
                'title': row[1] if row[1] else "",
                'description': description,
                'search_blob': search_blob,
                'url': row[4] if row[4] else None,
                'content_type': row[5] if row[5] else 'Movie',
                'similarity_score': 1 - row[6] if row[6] is not None else None  # Convert distance to similarity (1 - distance)
            })
        
        return recommendations
        
    except Exception as e:
        print(f"Error during vector search: {e}")
        # Fallback: try without VECTOR_DISTANCE if it's not supported
        print("Trying alternative query format...")
        try:
            # Alternative: Use WITH clause to avoid duplicate TO_VECTOR calls
            query_alt = f"""
                WITH query_vec AS (
                    SELECT TO_VECTOR(:1) as qvec FROM DUAL
                )
                SELECT 
                    m.id, m.title, m.description, m.search_blob, m.url, m.content_type,
                    VECTOR_DISTANCE(m.embedding, q.qvec, COSINE) as distance
                FROM movie_search m, query_vec q
                WHERE m.embedding IS NOT NULL {content_filter}
                ORDER BY VECTOR_DISTANCE(m.embedding, q.qvec, COSINE) ASC
                FETCH FIRST :2 ROWS ONLY
            """
            cursor.execute(query_alt, (prompt_embedding, top_k))
            results = cursor.fetchall()
            
            recommendations = []
            for row in results:
                # Handle CLOB types - convert to string if needed
                description = row[2]
                if hasattr(description, 'read'):
                    description = description.read()
                elif description is None:
                    description = ""
                else:
                    description = str(description)
                
                search_blob = row[3]
                if hasattr(search_blob, 'read'):
                    search_blob = search_blob.read()
                elif search_blob is None:
                    search_blob = ""
                else:
                    search_blob = str(search_blob)
                
                recommendations.append({
                    'id': row[0],
                    'title': row[1] if row[1] else "",
                    'description': description,
                    'search_blob': search_blob,
                    'url': row[4] if row[4] else None,
                    'content_type': row[5] if row[5] else 'Movie',
                    'similarity_score': 1 - row[6] if len(row) > 6 and row[6] is not None else None
                })
            
            return recommendations
        except Exception as e2:
            print(f"Alternative query also failed: {e2}")
            raise
    finally:
        cursor.close()

def recommend_movies(
    prompt: str, 
    top_k: int = 10,
    content_type: Optional[str] = 'Movie'
) -> List[Dict]:
    """
    Main function to get movie recommendations based on user prompt.
    
    Args:
        prompt: User's movie preference description
        top_k: Number of recommendations to return (default: 10)
        content_type: Filter by content type ('Movie' or 'YouTube Clips'), None for all
        
    Returns:
        List of movie recommendation dictionaries
    """
    print(f"\n{'=' * 60}")
    print("Movie Recommendation System")
    print("=" * 60)
    print(f"User Prompt: \"{prompt}\"")
    print(f"Requesting top {top_k} recommendations...")
    
    try:
        # Generate embedding for the prompt
        print("\nGenerating embedding for prompt...")
        prompt_embedding = generate_prompt_embedding(prompt)
        print("Embedding generated successfully!")
        
        # Connect to Oracle
        print("\nConnecting to Oracle database...")
        connection = get_oracle_connection()
        print("Connected successfully!")
        
        # Search for similar movies
        print("\nSearching for similar movies using vector similarity...")
        recommendations = search_similar_movies(
            connection, 
            prompt_embedding, 
            top_k=top_k,
            content_type=content_type
        )
        
        connection.close()
        
        print(f"\nFound {len(recommendations)} recommendations!")
        return recommendations
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return []

def print_recommendations(recommendations: List[Dict]):
    """Pretty print movie recommendations."""
    if not recommendations:
        print("\nNo recommendations found.")
        return
    
    print(f"\n{'=' * 60}")
    print(f"Top {len(recommendations)} Movie Recommendations")
    print("=" * 60)
    
    for i, movie in enumerate(recommendations, 1):
        print(f"\n{i}. {movie['title']}")
        print(f"   ID: {movie['id']}")
        if movie.get('similarity_score') is not None:
            print(f"   Similarity Score: {movie['similarity_score']:.4f}")
        if movie.get('description'):
            desc = movie['description'][:200] + "..." if len(movie.get('description', '')) > 200 else movie.get('description', '')
            print(f"   Description: {desc}")
        if movie.get('url'):
            print(f"   URL: {movie['url']}")
        print(f"   Type: {movie.get('content_type', 'Movie')}")

def main():
    """Interactive command-line interface for movie recommendations."""
    print("=" * 60)
    print("Movie Recommendation System")
    print("=" * 60)
    print("\nEnter your movie preferences (or 'quit' to exit):")
    
    while True:
        try:
            prompt = input("\n> ").strip()
            
            if prompt.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            if not prompt:
                print("Please enter a movie preference.")
                continue
            
            # Get recommendations
            recommendations = recommend_movies(prompt, top_k=10, content_type='Movie')
            
            # Print results
            print_recommendations(recommendations)
            
            print("\n" + "=" * 60)
            print("Enter another prompt or 'quit' to exit:")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"\nError: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    # Check if prompt is provided as command-line argument
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
        recommendations = recommend_movies(prompt, top_k=10, content_type='Movie')
        print_recommendations(recommendations)
    else:
        # Run interactive mode
        main()

