#!/bin/bash
# Build script for Railway - ensures both Node.js and Python dependencies are installed

set -e

echo "=========================================="
echo "Building Application"
echo "=========================================="

# Install Node.js dependencies
echo "[1/2] Installing Node.js dependencies..."
npm install

# Install Python dependencies if Python is available
echo "[2/2] Installing Python dependencies..."
if command -v python3 &> /dev/null; then
    # Try to ensure pip is available
    python3 -m ensurepip --upgrade 2>/dev/null || true
    # Try different pip commands
    if python3 -m pip --version &>/dev/null; then
        python3 -m pip install --upgrade pip
        python3 -m pip install -r requirements.txt
    elif pip3 --version &>/dev/null; then
        pip3 install --upgrade pip
        pip3 install -r requirements.txt
    else
        echo "WARNING: pip not available for python3"
    fi
    echo "Python dependencies installed successfully"
elif command -v python &> /dev/null; then
    python -m ensurepip --upgrade 2>/dev/null || true
    if python -m pip --version &>/dev/null; then
        python -m pip install --upgrade pip
        python -m pip install -r requirements.txt
    elif pip --version &>/dev/null; then
        pip install --upgrade pip
        pip install -r requirements.txt
    else
        echo "WARNING: pip not available for python"
    fi
    echo "Python dependencies installed successfully"
else
    echo "WARNING: Python not found. Skipping Python dependencies."
    echo "Python API will not be available."
fi

echo "=========================================="
echo "Build Complete"
echo "=========================================="

