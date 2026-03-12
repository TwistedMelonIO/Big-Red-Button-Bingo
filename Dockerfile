# ============================================
# Stage 1: Build frontend
# ============================================
FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ============================================
# Stage 2: Build server
# ============================================
FROM node:20-alpine AS server-build

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm ci
COPY server/ ./
RUN npm run build

# ============================================
# Stage 3: Production image
# ============================================
FROM node:20-alpine AS production

# Install build dependencies for native modules and clean up afterwards
RUN apk add --no-cache python3 make g++ && \
    apk add --no-cache sqlite

WORKDIR /app

# Install production deps for server
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm ci --omit=dev

# Copy built artifacts
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=client-build /app/client/dist ./client/dist

# Create data directory
RUN mkdir -p /app/data

# Environment defaults
ENV PORT=3000
ENV OSC_PORT=8001
ENV OSC_INTERFACE=0.0.0.0
ENV DATA_DIR=/app/data

EXPOSE 3000
# NOTE: OSC uses UDP — expose with -p 8001:8001/udp in docker run
EXPOSE 8001/udp

WORKDIR /app/server
CMD ["node", "dist/index.js"]
