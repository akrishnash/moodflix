# Multi-stage Dockerfile for Railway - optimized for size with Debian slim
# Build stage: Install dependencies and build
FROM node:18-slim AS builder

# Install Python and build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/* && \
    python3 -m pip install --upgrade pip setuptools wheel --break-system-packages

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
FROM node:18-slim AS production

# Install only Python runtime (no build tools)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/* && \
    python3 -m pip install --upgrade pip setuptools wheel --break-system-packages

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install only production dependencies and aggressively clean
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/* /root/.npm

# Install Python dependencies (CPU-only torch to save space)
RUN python3 -m pip install --no-cache-dir -r requirements.txt --break-system-packages && \
    python3 -m pip cache purge && \
    rm -rf /root/.cache/pip

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy only necessary runtime files
COPY start.sh ./
COPY movie_recommendation_api.py ./
COPY recommend_movies.py ./

# Remove any unnecessary files
RUN rm -rf /tmp/* /var/tmp/* && \
    find /app -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true && \
    find /app -type f -name "*.pyc" -delete 2>/dev/null || true

# Expose port
EXPOSE ${PORT:-5000}

# Make start.sh executable
RUN chmod +x start.sh

# Start both services
CMD ["bash", "start.sh"]
