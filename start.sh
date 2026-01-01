#!/bin/bash
# Startup script for Railway - runs both Python API and Express server

echo "=========================================="
echo "Starting Movie Recommendation Services"
echo "=========================================="

# Check if Python is available
# Try python3 first, then python, then check if it's in PATH
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
elif [ -f /nix/store/*/bin/python3 ]; then
    # Nixpacks installs Python in /nix/store
    PYTHON_CMD=$(find /nix/store -name python3 -type f -executable 2>/dev/null | head -1)
    if [ -z "$PYTHON_CMD" ]; then
        PYTHON_CMD=""
    fi
else
    echo "WARNING: Python not found. Starting Express server only..."
    PYTHON_CMD=""
fi

# Debug: Show Python location if found
if [ ! -z "$PYTHON_CMD" ]; then
    echo "Found Python at: $PYTHON_CMD"
    $PYTHON_CMD --version || echo "Python version check failed"
fi

# Start Python Movie Recommendation API in background if Python is available
if [ ! -z "$PYTHON_CMD" ]; then
    echo "[1/2] Starting Python Movie Recommendation API..."
    $PYTHON_CMD movie_recommendation_api.py > /tmp/python_api.log 2>&1 &
    PYTHON_PID=$!
    
    # Wait for Python API to start and check if it's running
    sleep 3
    
    # Check if Python process is still running
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo "WARNING: Python API process died. Check /tmp/python_api.log for errors."
        echo "Continuing with Express server only..."
        cat /tmp/python_api.log 2>/dev/null || true
    else
        echo "Python API started successfully (PID: $PYTHON_PID)"
        echo "Python API logs:"
        tail -n 5 /tmp/python_api.log 2>/dev/null || echo "  (logs not available yet)"
    fi
else
    PYTHON_PID=""
fi

# Start Express server (foreground)
echo "[2/2] Starting Express server..."
exec cross-env NODE_ENV=production node dist/index.cjs

