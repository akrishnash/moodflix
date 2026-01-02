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

# Use Railway volume or local cache for model storage
# This prevents re-downloading the model on every deployment
MODEL_CACHE_DIR = os.getenv('MODEL_CACHE_DIR', os.path.expanduser('~/.cache/huggingface'))

# Initialize the sentence transformer model (same as used for movies)
# Model will be downloaded from Hugging Face on first use (free)
# and cached in MODEL_CACHE_DIR
print(f"Loading sentence transformer model (will cache in {MODEL_CACHE_DIR})...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder=MODEL_CACHE_DIR)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    print("Falling back to default cache location...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Model loaded successfully!")
