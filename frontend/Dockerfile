# Frontend Dockerfile - Multi-stage build for production
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_NODE_ENV=production
ARG VITE_ENABLE_ANALYTICS=true
ARG VITE_HIPAA_COMPLIANCE=true

# Set environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS
ENV VITE_HIPAA_COMPLIANCE=$VITE_HIPAA_COMPLIANCE

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install security updates
RUN apk update && apk upgrade

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy environment template for runtime configuration
COPY env.template.js /usr/share/nginx/html/env.template.js
COPY entrypoint.sh /entrypoint.sh

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

# Change ownership of nginx directories
RUN chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html

# Create directories for nginx to write pid file
RUN mkdir -p /var/run/nginx && \
    chown -R nginx-user:nginx-user /var/run/nginx

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
