#!/bin/bash

# GastroChatbot Deployment Script
# This script handles deployment for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENTS=("development" "staging" "production")

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

show_usage() {
    cat << EOF
🏥 GastroChatbot Deployment Script

Usage: $0 [ENVIRONMENT] [OPTIONS]

ENVIRONMENTS:
  development    Deploy to development environment
  staging        Deploy to staging environment  
  production     Deploy to production environment

OPTIONS:
  --build-only   Only build containers, don't deploy
  --no-cache     Build without using Docker cache
  --migrate      Run database migrations after deployment
  --seed         Seed database with initial data
  --backup       Create backup before deployment
  --rollback     Rollback to previous version
  --health-check Run health checks after deployment
  --logs         Show logs after deployment
  --help         Show this help message

EXAMPLES:
  $0 development --seed --logs
  $0 production --backup --migrate --health-check
  $0 staging --build-only --no-cache

EOF
}

validate_environment() {
    local env=$1
    if [[ ! " ${ENVIRONMENTS[@]} " =~ " ${env} " ]]; then
        log_error "Invalid environment: $env. Valid options: ${ENVIRONMENTS[*]}"
    fi
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
    fi
    
    # Check if .env file exists
    if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
        log_warning ".env file not found. Creating from template..."
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        log_warning "Please update .env file with your configuration"
    fi
    
    log_success "Prerequisites check passed"
}

backup_database() {
    local env=$1
    log_info "Creating database backup for $env environment..."
    
    local backup_file="backup_${env}_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose exec -T postgres pg_dump \
        -U "${POSTGRES_USER:-postgres}" \
        -d "${POSTGRES_DB:-gastro_chatbot}" \
        > "$PROJECT_ROOT/backups/$backup_file"
    
    log_success "Database backup created: $backup_file"
}

build_containers() {
    local env=$1
    local no_cache=$2
    
    log_info "Building containers for $env environment..."
    
    cd "$PROJECT_ROOT"
    
    local build_args=""
    if [[ "$no_cache" == "true" ]]; then
        build_args="--no-cache"
    fi
    
    # Copy environment-specific files
    cp "frontend/.env.$env" "frontend/.env.local" 2>/dev/null || true
    
    # Build containers
    docker-compose build $build_args
    
    log_success "Containers built successfully"
}

deploy_application() {
    local env=$1
    local migrate=$2
    local seed=$3
    
    log_info "Deploying to $env environment..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment
    export NODE_ENV=$env
    
    # Deploy based on environment
    case $env in
        "development")
            docker-compose up -d postgres redis backend frontend
            ;;
        "staging")
            docker-compose up -d postgres redis backend frontend
            ;;
        "production")
            docker-compose --profile production up -d
            ;;
    esac
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Run migrations if requested
    if [[ "$migrate" == "true" ]]; then
        log_info "Running database migrations..."
        docker-compose exec backend npm run migrate
    fi
    
    # Seed database if requested
    if [[ "$seed" == "true" ]]; then
        log_info "Seeding database..."
        docker-compose exec backend npm run seed
    fi
    
    log_success "Deployment completed"
}

run_health_checks() {
    log_info "Running health checks..."
    
    local services=("backend" "frontend" "postgres" "redis")
    local failed=false
    
    for service in "${services[@]}"; do
        log_info "Checking $service health..."
        if docker-compose exec $service echo "healthy" &>/dev/null; then
            log_success "$service is healthy"
        else
            log_error "$service health check failed"
            failed=true
        fi
    done
    
    if [[ "$failed" == "true" ]]; then
        log_error "Health checks failed"
    fi
    
    # Check API endpoints
    log_info "Checking API endpoints..."
    if curl -f http://localhost:3001/api/health &>/dev/null; then
        log_success "Backend API is responding"
    else
        log_error "Backend API health check failed"
    fi
    
    if curl -f http://localhost:8080/health &>/dev/null; then
        log_success "Frontend is responding"
    else
        log_error "Frontend health check failed"
    fi
    
    log_success "All health checks passed"
}

show_logs() {
    log_info "Showing application logs..."
    docker-compose logs -f --tail=100
}

rollback() {
    log_info "Rolling back to previous version..."
    
    # This would typically involve:
    # 1. Stopping current containers
    # 2. Pulling previous image tags
    # 3. Restarting with previous version
    # 4. Restoring database backup if needed
    
    log_warning "Rollback functionality not fully implemented"
    log_info "To manually rollback:"
    log_info "1. docker-compose down"
    log_info "2. Restore database backup"
    log_info "3. Deploy previous version"
}

# Main execution
main() {
    local environment=""
    local build_only=false
    local no_cache=false
    local migrate=false
    local seed=false
    local backup=false
    local rollback_mode=false
    local health_check=false
    local show_logs_flag=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            development|staging|production)
                environment=$1
                shift
                ;;
            --build-only)
                build_only=true
                shift
                ;;
            --no-cache)
                no_cache=true
                shift
                ;;
            --migrate)
                migrate=true
                shift
                ;;
            --seed)
                seed=true
                shift
                ;;
            --backup)
                backup=true
                shift
                ;;
            --rollback)
                rollback_mode=true
                shift
                ;;
            --health-check)
                health_check=true
                shift
                ;;
            --logs)
                show_logs_flag=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                ;;
        esac
    done
    
    # Validate environment
    if [[ -z "$environment" ]]; then
        show_usage
        exit 1
    fi
    
    validate_environment "$environment"
    
    # Handle rollback
    if [[ "$rollback_mode" == "true" ]]; then
        rollback
        exit 0
    fi
    
    # Execute deployment steps
    log_info "🏥 Starting GastroChatbot deployment to $environment"
    
    check_prerequisites
    
    if [[ "$backup" == "true" ]]; then
        mkdir -p "$PROJECT_ROOT/backups"
        backup_database "$environment"
    fi
    
    build_containers "$environment" "$no_cache"
    
    if [[ "$build_only" != "true" ]]; then
        deploy_application "$environment" "$migrate" "$seed"
        
        if [[ "$health_check" == "true" ]]; then
            run_health_checks
        fi
        
        if [[ "$show_logs_flag" == "true" ]]; then
            show_logs
        fi
    fi
    
    log_success "🎉 GastroChatbot deployment completed successfully!"
    log_info "Access your application:"
    log_info "  Frontend: http://localhost:8080"
    log_info "  Backend API: http://localhost:3001/api"
    log_info "  Database: localhost:5432"
}

# Run main function with all arguments
main "$@"
