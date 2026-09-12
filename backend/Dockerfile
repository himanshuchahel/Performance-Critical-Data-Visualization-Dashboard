# syntax=docker/dockerfile:1
# Multi-stage production build for DataForge backend

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Only copy package.json and build from builder; install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create required directories with correct permissions
RUN mkdir -p /app/uploads /app/uploads/temp /app/logs && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose existing backend port
EXPOSE 3001

# Health check using existing endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

CMD ["node", "dist/server.js"]
