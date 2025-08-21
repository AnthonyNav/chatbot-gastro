# 🏥 Gastro Chatbot - Asistente Médico Gastrointestinal

Un chatbot especializado en proporcionar información sobre enfermedades gastrointestinales, síntomas y orientación médica preliminar.

## ⚠️ DISCLAIMER MÉDICO IMPORTANTE

**Esta aplicación es ÚNICAMENTE para fines informativos y educativos. NO reemplaza la consulta médica profesional. Siempre consulte con un médico calificado para diagnósticos y tratamientos.**

## 🚀 Características

- **Chat Inteligente**: Interfaz conversacional con IA especializada en gastroenterología
- **Base de Conocimientos**: Información médica verificada sobre enfermedades digestivas
- **Detección de Emergencias**: Identificación automática de síntomas graves
- **Múltiples Idiomas**: Soporte para español e inglés
- **Responsive Design**: Compatible con móvil y desktop
- **Seguridad Médica**: Cumple con estándares de privacidad y seguridad

## 🏗️ Arquitectura Técnica

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** + componentes personalizados
- **Zustand** para manejo de estado
- **React Query** para cache y sincronización
- **Vite** como bundler

### Backend
- **Node.js** con Express y TypeScript
- **PostgreSQL** con Prisma ORM
- **Google Gemini Pro** para procesamiento de lenguaje natural
- **Winston** para logging
- **Rate limiting** y seguridad robusta

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 13+
- npm o yarn
- API Key de Google Gemini (gratuito)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd gastro-chatbot
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
npx prisma migrate dev
npx prisma db seed
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
```

## 🚀 Ejecución

### Desarrollo
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### Producción
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📊 Variables de Entorno

### Backend (.env)
```bash
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/gastro_chatbot"

# Google Gemini
GEMINI_API_KEY="your-gemini-key"

# Servidor
PORT=5000
NODE_ENV=development
JWT_SECRET="your-jwt-secret"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:3000"
```

## 🤖 Integración con Google Gemini

Este proyecto utiliza **Google Gemini Pro** como modelo de IA para el procesamiento de consultas médicas, ofreciendo las siguientes ventajas:

### ✅ Ventajas de Gemini vs OpenAI
- **Costo**: Gratuito hasta 15 solicitudes por minuto (60 por hora)
- **Latencia**: Respuestas más rápidas en promedio
- **Multimodal**: Soporte nativo para texto e imágenes
- **Precisión**: Excelente rendimiento en tareas médicas
- **Límites generosos**: 1 millón de tokens por minuto gratis

### 🔑 Configuración de API Key
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API Key
3. Agrega la key a tu archivo `.env`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### 📊 Límites de la API Gratuita
- **Requests por minuto**: 15
- **Requests por día**: 1,500  
- **Tokens por minuto**: 1,000,000
- **Tokens por día**: 50,000,000

## 🗄️ Estructura de Base de Datos

```sql
-- Principales tablas
diseases          -- Enfermedades gastrointestinales
symptoms          -- Síntomas y señales
disease_symptoms  -- Relaciones enfermedad-síntoma
conversations     -- Historiales de chat
feedback          -- Calificaciones de usuarios
treatments        -- Tratamientos y recomendaciones
emergency_info    -- Información de emergencia
activity_logs     -- Logs del sistema
```

## 🔗 API Endpoints

### Chat
- `POST /api/chat/message` - Enviar mensaje al chatbot
- `GET /api/chat/history/:sessionId` - Obtener historial

### Información Médica  
- `GET /api/diseases` - Lista de enfermedades
- `GET /api/symptoms/search` - Búsqueda de síntomas
- `GET /api/treatments/recommendations` - Recomendaciones

### Emergencias
- `GET /api/emergency/info` - Información de emergencia
- `POST /api/emergency/alert` - Alertas críticas

### Sistema
- `GET /health` - Health check
- `GET /api/disclaimer` - Disclaimer médico

## 🛡️ Seguridad

### Medidas Implementadas
- **Rate Limiting**: Previene abuso de API
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para dominios específicos
- **Validación de Entrada**: Sanitización de datos
- **Logging de Auditoría**: Registro de actividades
- **Encriptación**: Datos sensibles protegidos

### Consideraciones Médicas
- **Disclaimer Visible**: En toda la aplicación
- **Detección de Emergencias**: Redirección automática
- **Fuentes Verificadas**: Información médica confiable
- **Privacidad**: Cumplimiento GDPR/HIPAA

## 🧪 Testing

```bash
# Backend
cd backend
npm test
npm run test:coverage

# Frontend
cd frontend
npm test
npm run test:e2e
```

## 📈 Monitoreo

### Métricas Disponibles
- Tiempo de respuesta de API
- Uso de IA (tokens/costo)
- Detecciones de emergencia
- Satisfacción de usuarios
- Performance de la aplicación

### Logs
- Actividad de usuarios (anonimizada)
- Errores del sistema
- Alertas de seguridad
- Métricas de rendimiento

## 🚀 Deployment

### Docker (Recomendado)
```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d
```

### Manual
1. Configurar PostgreSQL en producción
2. Configurar variables de entorno de producción
3. Construir aplicaciones (`npm run build`)
4. Configurar proxy reverso (Nginx)
5. Configurar SSL/TLS
6. Configurar monitoreo

## 📝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- TypeScript estricto
- ESLint + Prettier
- Tests para nuevas funcionalidades
- Documentación de APIs
- Comentarios médicos obligatorios

## 📚 Recursos Adicionales

### APIs Médicas Utilizadas
- [UMLS API](https://uts.nlm.nih.gov/uts/) - Terminología médica
- [SNOMED CT](https://www.snomed.org/) - Códigos médicos estándar

### Documentación Médica
- [Mayo Clinic](https://www.mayoclinic.org/)
- [MedlinePlus](https://medlineplus.gov/)
- [World Health Organization](https://www.who.int/)

## ⚖️ Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE.md](LICENSE.md) para detalles.

## 📞 Soporte

- **Issues**: [GitHub Issues](link-to-issues)
- **Email**: support@gastrochatbot.com
- **Documentación**: [Wiki del proyecto](link-to-wiki)

## 🙏 Reconocimientos

- Comunidad médica por validación de contenido
- Google AI por tecnología Gemini gratuita y eficiente
- Contribuidores del proyecto open source

---

**Recordatorio Final**: Este chatbot es una herramienta educativa. En caso de emergencia médica real, contacte inmediatamente a los servicios de emergencia (911) o su médico.
