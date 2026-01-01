# Dockerfile for Railway - supports both Node.js and Python
# Updated: 2026-01-01 - Added --break-system-packages for Debian PEP 668
FROM node:18

# Install Python and pip (with proper cleanup)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m pip install --upgrade pip setuptools wheel --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
RUN npm ci --only=production

# Install Python dependencies (--break-system-packages needed for Debian/Ubuntu PEP 668)
RUN python3 -m pip install --no-cache-dir -r requirements.txt --break-system-packages

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port (Railway sets PORT env var)
EXPOSE ${PORT:-5000}

# Start both services
CMD ["bash", "start.sh"]

