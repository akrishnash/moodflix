# Dockerfile for Railway - supports both Node.js and Python
FROM node:18

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
RUN npm install

# Install Python dependencies
RUN python3 -m pip install --upgrade pip && \
    python3 -m pip install -r requirements.txt

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port (Railway sets PORT env var)
EXPOSE ${PORT:-5000}

# Start both services
CMD ["bash", "start.sh"]

