#!/bin/bash
# Startup script for Railway - runs both Python API and Express server

# Start Python Movie Recommendation API in background
echo "Starting Python Movie Recommendation API..."
python movie_recommendation_api.py &
PYTHON_PID=$!

# Wait a moment for Python API to start
sleep 2

# Start Express server (foreground)
echo "Starting Express server..."
npm start

# When Express exits, kill Python process
echo "Shutting down Python API..."
kill $PYTHON_PID 2>/dev/null

