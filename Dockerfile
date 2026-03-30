# Build stage
FROM node:20-alpine AS builder

# Build arguments for environment variables
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_PAYMENT_SUCCESS_URL=http://localhost:9556/payment/success
ARG VITE_PAYMENT_FAIL_URL=http://localhost:9556/payment/fail
ARG VITE_APP_TITLE=VPN User Panel
ARG VITE_MOCK_AUTH=false

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY public/ ./public/
COPY src/ ./src/
COPY index.html ./

# Create .env.production file with build arguments
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env.production && \
    echo "VITE_PAYMENT_SUCCESS_URL=${VITE_PAYMENT_SUCCESS_URL}" >> .env.production && \
    echo "VITE_PAYMENT_FAIL_URL=${VITE_PAYMENT_FAIL_URL}" >> .env.production && \
    echo "VITE_APP_TITLE=${VITE_APP_TITLE}" >> .env.production && \
    echo "VITE_MOCK_AUTH=${VITE_MOCK_AUTH}" >> .env.production

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (host proxies 9556:80)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]