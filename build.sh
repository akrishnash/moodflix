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
    python3 -m pip install --upgrade pip
    python3 -m pip install -r requirements.txt
    echo "Python dependencies installed successfully"
elif command -v python &> /dev/null; then
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    echo "Python dependencies installed successfully"
else
    echo "WARNING: Python not found. Skipping Python dependencies."
    echo "Python API will not be available."
fi

echo "=========================================="
echo "Build Complete"
echo "=========================================="

