# Multi-stage Dockerfile for Railway - optimized for size
# Build stage: Install dependencies and build
FROM node:18 AS builder

# Install Python and pip (needed for Python API)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m pip install --upgrade pip setuptools wheel --break-system-packages

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Install Python dependencies
RUN python3 -m pip install --no-cache-dir -r requirements.txt --break-system-packages

# Copy source files needed for build
COPY . .

# Build the application
RUN npm run build

# Production stage: Only include runtime files
FROM node:18 AS production

# Install Python and pip for runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m pip install --upgrade pip setuptools wheel --break-system-packages

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install only production dependencies and clean cache
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Install Python dependencies
RUN python3 -m pip install --no-cache-dir -r requirements.txt --break-system-packages && \
    python3 -m pip cache purge

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy only necessary runtime files
COPY start.sh ./
COPY movie_recommendation_api.py ./
COPY recommend_movies.py ./

# Expose port
EXPOSE ${PORT:-5000}

# Start both services
CMD ["bash", "start.sh"]
