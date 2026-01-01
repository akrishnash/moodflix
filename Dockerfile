# Multi-stage Dockerfile for Railway - ultra-optimized for size
# Build stage: Install dependencies and build
FROM node:18-alpine AS builder

# Install Python and build dependencies in Alpine
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-setuptools \
    py3-wheel \
    build-base \
    python3-dev

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Install Python dependencies (without cache)
# Alpine requires --break-system-packages for PEP 668
RUN python3 -m pip install --no-cache-dir --upgrade pip --break-system-packages && \
    python3 -m pip install --no-cache-dir -r requirements.txt --break-system-packages

# Copy source files needed for build
COPY . .

# Build the application
RUN npm run build

# Production stage: Only include runtime files
FROM node:18-alpine AS production

# Install only Python runtime (no build tools)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install only production dependencies and aggressively clean
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/* /root/.npm

# Install Python dependencies (no cache, no build deps where possible)
# Alpine also requires --break-system-packages for PEP 668
RUN python3 -m pip install --no-cache-dir --upgrade pip --break-system-packages && \
    python3 -m pip install --no-cache-dir -r requirements.txt --break-system-packages && \
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
CMD ["sh", "start.sh"]
