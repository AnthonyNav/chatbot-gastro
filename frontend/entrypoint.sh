#!/bin/sh

# Entrypoint script for Docker container
# Handles runtime environment variable injection

set -e

echo "🏥 Starting GastroChatbot Frontend..."

# Replace environment variables in nginx configuration
if [ -n "$VITE_API_URL" ]; then
    echo "🔧 Configuring API URL: $VITE_API_URL"
    sed -i "s|\$VITE_API_URL|$VITE_API_URL|g" /etc/nginx/conf.d/default.conf
fi

# Create runtime environment configuration
cat > /usr/share/nginx/html/env-config.js << EOF
window.ENV = {
  VITE_API_URL: "${VITE_API_URL:-http://localhost:3001/api}",
  VITE_NODE_ENV: "${VITE_NODE_ENV:-production}",
  VITE_ENABLE_ANALYTICS: "${VITE_ENABLE_ANALYTICS:-true}",
  VITE_ENABLE_EMERGENCY_MODE: "${VITE_ENABLE_EMERGENCY_MODE:-true}",
  VITE_HIPAA_COMPLIANCE: "${VITE_HIPAA_COMPLIANCE:-true}",
  VITE_EMERGENCY_PHONE: "${VITE_EMERGENCY_PHONE:-911}",
  VITE_POISON_CONTROL: "${VITE_POISON_CONTROL:-01-800-0147-47}",
  VITE_CRUZ_ROJA: "${VITE_CRUZ_ROJA:-066}",
  VITE_DEFAULT_LANGUAGE: "${VITE_DEFAULT_LANGUAGE:-es}",
  VITE_APP_NAME: "${VITE_APP_NAME:-GastroChatbot}",
  VITE_APP_VERSION: "${VITE_APP_VERSION:-1.0.0}",
  DEPLOYMENT_TIME: "$(date -Iseconds)"
};
EOF

echo "✅ Environment configuration created"

# Validate nginx configuration
echo "🔍 Validating Nginx configuration..."
nginx -t

echo "🚀 Starting Nginx..."

# Execute the main command
exec "$@"
