# 🏥 GastroChatbot - Configuración y Deployment

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Configuración de Entorno](#configuración-de-entorno)
3. [Docker y Containerización](#docker-y-containerización)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoreo y Logging](#monitoreo-y-logging)
6. [Seguridad y Compliance](#seguridad-y-compliance)
7. [Deployment en Producción](#deployment-en-producción)
8. [Troubleshooting](#troubleshooting)

## 🔧 Prerrequisitos

### Software Requerido

- **Docker**: `>= 24.0.0`
- **Docker Compose**: `>= 2.20.0`
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **PostgreSQL**: `>= 15.0` (para desarrollo local)
- **Redis**: `>= 7.0` (para desarrollo local)

### Verificación de Prerrequisitos

```bash
# Verificar versiones
docker --version
docker-compose --version
node --version
npm --version

# Verificar Docker está corriendo
docker info

# Verificar recursos disponibles
docker system df
```

## ⚙️ Configuración de Entorno

### 1. Variables de Entorno

Copia y configura los archivos de entorno:

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env
```

### 2. Configuración por Ambiente

#### Development
```bash
cp frontend/.env.development frontend/.env.local
```

#### Staging
```bash
cp frontend/.env.staging frontend/.env.local
```

#### Production
```bash
cp frontend/.env.production frontend/.env.local
```

### 3. Generación de Claves de Seguridad

```bash
# JWT Secret (32+ caracteres)
openssl rand -base64 32

# Encryption Key (32 caracteres exactos)
openssl rand -base64 32

# Database Password
openssl rand -base64 16

# Redis Password
openssl rand -base64 16
```

### 4. Configuración de Base de Datos

```sql
-- Crear usuario y base de datos
CREATE USER gastro_admin WITH PASSWORD 'your_secure_password';
CREATE DATABASE gastro_chatbot OWNER gastro_admin;
GRANT ALL PRIVILEGES ON DATABASE gastro_chatbot TO gastro_admin;

-- Habilitar extensiones necesarias
\c gastro_chatbot
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

## 🐳 Docker y Containerización

### 1. Construcción de Contenedores

```bash
# Construcción completa
docker-compose build

# Construcción sin caché
docker-compose build --no-cache

# Construcción específica
docker-compose build frontend
docker-compose build backend
```

### 2. Deployment Local

```bash
# Desarrollo completo
docker-compose up -d

# Solo servicios esenciales
docker-compose up -d postgres redis backend frontend

# Con logs en tiempo real
docker-compose up
```

### 3. Gestión de Contenedores

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar servicios
docker-compose restart backend

# Parar servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v
```

### 4. Scripts de Deployment

```bash
# Deployment automatizado
./scripts/deploy.sh development --seed --logs

# Deployment con backup
./scripts/deploy.sh production --backup --migrate --health-check

# Solo construcción
./scripts/deploy.sh staging --build-only --no-cache
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions Workflow

El pipeline incluye:

- ✅ **Security Scan**: Análisis de vulnerabilidades
- ✅ **Frontend CI**: Tests, lint, build
- ✅ **Backend CI**: Tests, migrations, build
- ✅ **Compliance Tests**: Verificación HIPAA
- ✅ **E2E Tests**: Tests de extremo a extremo
- ✅ **Docker Build**: Construcción de imágenes
- ✅ **Deployment**: Deploy automático por ambiente

### 2. Configuración de Secrets

En GitHub Actions, configura estos secrets:

```yaml
# Database
POSTGRES_PASSWORD: "secure_postgres_password"
REDIS_PASSWORD: "secure_redis_password"

# API Keys
GEMINI_API_KEY: "your_gemini_key"
JWT_SECRET: "your_jwt_secret"
ENCRYPTION_KEY: "your_encryption_key"

# Monitoring
SENTRY_DSN: "your_sentry_dsn"
NEW_RELIC_LICENSE_KEY: "your_newrelic_key"

# Notifications
SLACK_WEBHOOK_URL: "your_slack_webhook"

# Production URLs
VITE_API_URL: "https://api.gastro-chatbot.com/api"
```

### 3. Ambientes de Deployment

#### Development
- **Trigger**: Push a `develop`
- **URL**: `https://dev.gastro-chatbot.com`
- **Database**: Desarrollo con datos de prueba

#### Staging
- **Trigger**: Push a `staging`
- **URL**: `https://staging.gastro-chatbot.com`
- **Database**: Réplica de producción

#### Production
- **Trigger**: Release/Tag
- **URL**: `https://gastro-chatbot.com`
- **Database**: Producción con backups

## 📊 Monitoreo y Logging

### 1. Inicio de Monitoreo

```bash
# Iniciar con monitoreo
docker-compose --profile monitoring up -d

# Acceder a servicios
open http://localhost:9090  # Prometheus
open http://localhost:3000  # Grafana
```

### 2. Configuración de Grafana

**Credenciales por defecto:**
- Usuario: `admin`
- Password: `admin123` (cambiar en producción)

**Dashboards incluidos:**
- 🏥 **Medical Dashboard**: Métricas médicas y compliance
- 📊 **System Dashboard**: Recursos y performance
- 🔒 **Security Dashboard**: Eventos de seguridad

### 3. Health Checks

```bash
# Check manual
./scripts/health-check.sh

# Check programado (crontab)
*/5 * * * * /path/to/health-check.sh

# Logs de health check
tail -f /var/log/gastrochatbot/health-check.log
```

### 4. Logs Centralizados

```bash
# Logs de aplicación
docker-compose logs -f backend | grep ERROR
docker-compose logs -f frontend | grep WARNING

# Logs de base de datos
docker-compose exec postgres tail -f /var/log/postgresql/postgresql.log

# Logs de nginx
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

## 🔒 Seguridad y Compliance

### 1. HIPAA Compliance Checklist

- ✅ **Cifrado en tránsito**: HTTPS/TLS 1.3
- ✅ **Cifrado en reposo**: AES-256 para base de datos
- ✅ **Control de acceso**: Autenticación JWT
- ✅ **Audit logging**: Registro completo de actividades
- ✅ **Backup y recovery**: Backups cifrados diarios
- ✅ **Segmentación de red**: Redes Docker aisladas

### 2. Configuración SSL/TLS

```bash
# Generar certificados (Let's Encrypt)
certbot certonly --webroot -w /var/www/html -d gastro-chatbot.com

# Configurar renovación automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### 3. Backup y Recovery

```bash
# Backup manual
docker-compose exec postgres pg_dump -U postgres gastro_chatbot > backup.sql

# Backup automatizado
./scripts/backup.sh --env production --encrypt

# Restore
docker-compose exec -T postgres psql -U postgres gastro_chatbot < backup.sql
```

### 4. Configuración de Firewall

```bash
# UFW básico
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Para desarrollo
ufw allow 3000/tcp  # Grafana
ufw allow 3001/tcp  # Backend API
ufw allow 8080/tcp  # Frontend
```

## 🚀 Deployment en Producción

### 1. Preparación del Servidor

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
pip3 install docker-compose

# Crear usuario para aplicación
useradd -m -s /bin/bash gastrochatbot
usermod -aG docker gastrochatbot
```

### 2. Deployment con Zero-Downtime

```bash
# 1. Preparar nueva versión
docker-compose pull
docker-compose build

# 2. Backup de base de datos
./scripts/backup.sh --env production

# 3. Deploy con rolling update
docker-compose up -d --scale backend=2
sleep 30
docker-compose up -d --scale backend=1

# 4. Verificar health checks
./scripts/health-check.sh
```

### 3. Load Balancer (Nginx)

```nginx
upstream backend {
    least_conn;
    server backend1:3001 max_fails=3 fail_timeout=30s;
    server backend2:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name gastro-chatbot.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/gastro-chatbot.com.crt;
    ssl_certificate_key /etc/ssl/private/gastro-chatbot.com.key;
    
    # Security headers for HIPAA
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://frontend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting for medical compliance
        limit_req zone=api burst=10 nodelay;
    }
}
```

### 4. Auto-scaling (Kubernetes)

```yaml
# deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gastrochatbot-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gastrochatbot-backend
  template:
    metadata:
      labels:
        app: gastrochatbot-backend
    spec:
      containers:
      - name: backend
        image: gastrochatbot/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: gastrochatbot-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🔧 Troubleshooting

### 1. Problemas Comunes

#### Frontend no carga
```bash
# Verificar logs
docker-compose logs frontend

# Verificar variables de entorno
docker-compose exec frontend env | grep VITE

# Rebuild sin caché
docker-compose build --no-cache frontend
```

#### Backend no responde
```bash
# Verificar conectividad a base de datos
docker-compose exec backend npm run test:db

# Verificar migraciones
docker-compose exec backend npm run migrate:status

# Reiniciar con logs
docker-compose restart backend
docker-compose logs -f backend
```

#### Base de datos no conecta
```bash
# Verificar estado de PostgreSQL
docker-compose exec postgres pg_isready

# Verificar configuración
docker-compose exec postgres psql -U postgres -l

# Recrear base de datos
docker-compose down
docker volume rm gastrochatbot_postgres_data
docker-compose up -d postgres
```

### 2. Performance Issues

```bash
# Verificar recursos
docker stats

# Verificar logs de performance
docker-compose logs backend | grep "slow query"

# Optimizar base de datos
docker-compose exec postgres psql -U postgres -d gastro_chatbot -c "ANALYZE;"
```

### 3. Logs de Debug

```bash
# Activar modo debug
export VITE_DEBUG_MODE=true
export NODE_ENV=development

# Logs detallados
docker-compose up --log-level debug

# Logs de aplicación
tail -f backend/logs/app.log
tail -f backend/logs/error.log
```

### 4. Recovery Procedures

```bash
# 1. Rollback a versión anterior
git checkout previous-stable-tag
./scripts/deploy.sh production --backup --rollback

# 2. Restore desde backup
./scripts/restore.sh --backup-file backup_20231201_120000.sql --env production

# 3. Reinicio completo
docker-compose down -v
docker system prune -af
./scripts/deploy.sh production --migrate --seed
```

## 📞 Soporte y Contacto

- **Documentación**: [docs.gastro-chatbot.com](https://docs.gastro-chatbot.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/gastrochatbot/issues)
- **Slack**: `#gastrochatbot-support`
- **Email**: `devops@gastro-chatbot.com`

## 📝 Changelog

### v1.0.0 (2024-01-01)
- ✅ Implementación inicial
- ✅ Configuración Docker completa
- ✅ CI/CD Pipeline
- ✅ Monitoreo básico
- ✅ HIPAA Compliance inicial

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

⚠️ **Aviso Médico**: Este software es para fines educativos y de investigación. No reemplaza el consejo médico profesional.
