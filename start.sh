#!/bin/bash
# Startup script for Railway - runs both Python API and Express server

echo "=========================================="
echo "Starting Movie Recommendation Services"
echo "=========================================="

# Check if Python is available
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
    echo "Found Python at: $(command -v python3)"
    python3 --version || echo "Python version check failed"
else
    echo "WARNING: Python not found. Starting Express server only..."
    PYTHON_CMD=""
fi

# Start Python Movie Recommendation API in background if Python is available
if [ -n "$PYTHON_CMD" ]; then
    echo "[1/2] Starting Python Movie Recommendation API..."
    echo "Python API will log to /tmp/python_api.log"
    $PYTHON_CMD movie_recommendation_api.py > /tmp/python_api.log 2>&1 &
    PYTHON_PID=$!
    
    # Wait for Python API to start
    echo "Waiting for Python API to start..."
    sleep 8
    
    # Check if Python process is still running
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo "ERROR: Python API process died. Showing logs:"
        cat /tmp/python_api.log 2>/dev/null || echo "No logs available"
    else
        echo "Python API started successfully (PID: $PYTHON_PID)"
        echo "Checking if API is responding..."
        sleep 2
        # Try to check if API is responding (curl may not be available, so use python)
        if $PYTHON_CMD -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=2)" 2>/dev/null; then
            echo "✅ Python API is responding on port 8000"
        else
            echo "⚠️  Python API may not be ready yet. Showing recent logs:"
            tail -n 30 /tmp/python_api.log 2>/dev/null || echo "No logs available"
        fi
    fi
fi

# Start Express server (foreground)
echo "[2/2] Starting Express server..."
exec node dist/index.cjs
