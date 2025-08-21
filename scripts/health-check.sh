#!/bin/bash

# GastroChatbot Health Check Script
# Comprehensive health monitoring for medical compliance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
FRONTEND_URL="${FRONTEND_URL:-http://localhost:8080}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres:password@localhost:5432/gastro_chatbot}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

# Logging
LOG_FILE="/var/log/gastrochatbot/health-check.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Functions
log_info() {
    echo -e "${BLUE}[INFO] $TIMESTAMP: $1${NC}"
    echo "[INFO] $TIMESTAMP: $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $TIMESTAMP: $1${NC}"
    echo "[SUCCESS] $TIMESTAMP: $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING] $TIMESTAMP: $1${NC}"
    echo "[WARNING] $TIMESTAMP: $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR] $TIMESTAMP: $1${NC}"
    echo "[ERROR] $TIMESTAMP: $1" >> "$LOG_FILE"
}

# Health check functions
check_frontend() {
    log_info "Checking frontend health..."
    
    if curl -f -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/health" | grep -q "200"; then
        log_success "Frontend is healthy"
        return 0
    else
        log_error "Frontend health check failed"
        return 1
    fi
}

check_backend() {
    log_info "Checking backend API health..."
    
    response=$(curl -f -s "$BACKEND_URL/api/health" 2>/dev/null || echo "")
    
    if echo "$response" | grep -q "healthy"; then
        log_success "Backend API is healthy"
        
        # Check specific endpoints
        check_backend_endpoints
        return 0
    else
        log_error "Backend API health check failed"
        return 1
    fi
}

check_backend_endpoints() {
    log_info "Checking critical backend endpoints..."
    
    endpoints=(
        "/api/chat/health"
        "/api/diseases/health"
        "/api/emergency/health"
        "/api/auth/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s -o /dev/null "$BACKEND_URL$endpoint"; then
            log_success "Endpoint $endpoint is responding"
        else
            log_warning "Endpoint $endpoint is not responding"
        fi
    done
}

check_database() {
    log_info "Checking database connectivity..."
    
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            log_success "Database is accessible"
            
            # Check database health
            check_database_health
            return 0
        else
            log_error "Database connectivity failed"
            return 1
        fi
    else
        log_warning "psql not available, skipping database check"
        return 0
    fi
}

check_database_health() {
    log_info "Checking database health metrics..."
    
    # Check active connections
    connections=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs)
    log_info "Active database connections: $connections"
    
    if [ "$connections" -gt 100 ]; then
        log_warning "High number of database connections: $connections"
    fi
    
    # Check database size
    db_size=$(psql "$DATABASE_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | xargs)
    log_info "Database size: $db_size"
}

check_redis() {
    log_info "Checking Redis connectivity..."
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli -u "$REDIS_URL" ping | grep -q "PONG"; then
            log_success "Redis is accessible"
            
            # Check Redis metrics
            check_redis_metrics
            return 0
        else
            log_error "Redis connectivity failed"
            return 1
        fi
    else
        log_warning "redis-cli not available, skipping Redis check"
        return 0
    fi
}

check_redis_metrics() {
    log_info "Checking Redis metrics..."
    
    # Check memory usage
    memory_used=$(redis-cli -u "$REDIS_URL" info memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
    log_info "Redis memory usage: $memory_used"
    
    # Check connected clients
    clients=$(redis-cli -u "$REDIS_URL" info clients | grep "connected_clients" | cut -d: -f2 | tr -d '\r')
    log_info "Redis connected clients: $clients"
}

check_docker_containers() {
    log_info "Checking Docker containers..."
    
    if command -v docker &> /dev/null; then
        containers=$(docker ps --filter "label=com.gastrochatbot.service" --format "table {{.Names}}\t{{.Status}}")
        
        if [ -n "$containers" ]; then
            log_info "Docker containers status:"
            echo "$containers"
            
            # Check for unhealthy containers
            unhealthy=$(docker ps --filter "health=unhealthy" --filter "label=com.gastrochatbot.service" --format "{{.Names}}")
            
            if [ -n "$unhealthy" ]; then
                log_error "Unhealthy containers detected: $unhealthy"
                return 1
            else
                log_success "All containers are healthy"
                return 0
            fi
        else
            log_warning "No GastroChatbot containers found"
            return 0
        fi
    else
        log_warning "Docker not available, skipping container check"
        return 0
    fi
}

check_ssl_certificates() {
    log_info "Checking SSL certificates..."
    
    if [[ "$FRONTEND_URL" == https* ]]; then
        domain=$(echo "$FRONTEND_URL" | sed 's/https:\/\///' | sed 's/\/.*//')
        
        expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
        
        if [ -n "$expiry_date" ]; then
            expiry_timestamp=$(date -d "$expiry_date" +%s)
            current_timestamp=$(date +%s)
            days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            log_info "SSL certificate expires in $days_until_expiry days"
            
            if [ "$days_until_expiry" -lt 30 ]; then
                log_warning "SSL certificate expires soon: $expiry_date"
            else
                log_success "SSL certificate is valid"
            fi
        else
            log_error "Could not check SSL certificate"
        fi
    else
        log_info "HTTPS not configured, skipping SSL check"
    fi
}

check_medical_compliance() {
    log_info "Checking medical compliance requirements..."
    
    # Check audit logging
    if curl -f -s "$BACKEND_URL/api/compliance/audit-status" | grep -q "active"; then
        log_success "Audit logging is active"
    else
        log_error "Audit logging check failed"
    fi
    
    # Check data encryption
    if curl -f -s "$BACKEND_URL/api/compliance/encryption-status" | grep -q "enabled"; then
        log_success "Data encryption is enabled"
    else
        log_error "Data encryption check failed"
    fi
    
    # Check emergency system
    if curl -f -s "$BACKEND_URL/api/emergency/system-status" | grep -q "operational"; then
        log_success "Emergency system is operational"
    else
        log_error "Emergency system check failed"
    fi
}

generate_health_report() {
    log_info "Generating health report..."
    
    report_file="/var/log/gastrochatbot/health-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "overall_status": "$overall_status",
  "checks": {
    "frontend": $frontend_status,
    "backend": $backend_status,
    "database": $database_status,
    "redis": $redis_status,
    "containers": $containers_status,
    "ssl": $ssl_status,
    "compliance": $compliance_status
  },
  "metrics": {
    "response_time_frontend": $(curl -w "%{time_total}" -o /dev/null -s "$FRONTEND_URL" 2>/dev/null || echo "null"),
    "response_time_backend": $(curl -w "%{time_total}" -o /dev/null -s "$BACKEND_URL/api/health" 2>/dev/null || echo "null")
  },
  "recommendations": []
}
EOF
    
    log_success "Health report generated: $report_file"
}

# Main execution
main() {
    log_info "🏥 Starting GastroChatbot health check..."
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Initialize status variables
    frontend_status="false"
    backend_status="false"
    database_status="false"
    redis_status="false"
    containers_status="false"
    ssl_status="false"
    compliance_status="false"
    overall_status="unhealthy"
    
    # Run health checks
    if check_frontend; then frontend_status="true"; fi
    if check_backend; then backend_status="true"; fi
    if check_database; then database_status="true"; fi
    if check_redis; then redis_status="true"; fi
    if check_docker_containers; then containers_status="true"; fi
    if check_ssl_certificates; then ssl_status="true"; fi
    if check_medical_compliance; then compliance_status="true"; fi
    
    # Determine overall status
    if [[ "$frontend_status" == "true" && "$backend_status" == "true" && "$database_status" == "true" ]]; then
        overall_status="healthy"
        log_success "🎉 Overall system health: HEALTHY"
    else
        overall_status="unhealthy"
        log_error "❌ Overall system health: UNHEALTHY"
    fi
    
    generate_health_report
    
    # Exit with appropriate code
    if [[ "$overall_status" == "healthy" ]]; then
        exit 0
    else
        exit 1
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
