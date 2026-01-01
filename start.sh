#!/bin/sh
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
    $PYTHON_CMD movie_recommendation_api.py > /tmp/python_api.log 2>&1 &
    PYTHON_PID=$!
    
    # Wait for Python API to start
    sleep 5
    
    # Check if Python process is still running
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo "WARNING: Python API process died. Check /tmp/python_api.log for errors."
        cat /tmp/python_api.log 2>/dev/null || true
    else
        echo "Python API started successfully (PID: $PYTHON_PID)"
    fi
fi

# Start Express server (foreground)
echo "[2/2] Starting Express server..."
exec node dist/index.cjs
