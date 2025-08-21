# Changelog - Gastro Chatbot

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [2.0.0] - 2025-08-21

### 🔄 CAMBIO MAYOR: Migración de OpenAI a Google Gemini

#### ✨ Nuevo
- **Google Gemini Pro** como modelo de IA principal
- API gratuita con límites generosos (15 req/min, 1M tokens/min)
- Respuestas más rápidas y eficientes
- Soporte multimodal nativo para futuras expansiones

#### 🔧 Cambios
- Reemplazada dependencia `openai` por `@google/generative-ai`
- Actualizado `MedicalAIService` para usar Gemini API
- Nuevas variables de entorno: `GEMINI_API_KEY`, `GEMINI_MODEL`
- Actualizados archivos de configuración (.env.example, docker-compose.yml)

#### 🗑️ Eliminado
- Dependencia de OpenAI
- Variables de entorno: `OPENAI_API_KEY`, `OPENAI_MODEL`

#### 💰 Beneficios Económicos
- **Costos reducidos**: API gratuita vs pago por token
- **Sin límites de crédito**: No requiere tarjeta de crédito
- **Escalabilidad**: Mejor para proyectos educativos y demos

#### 🔄 Migración
Para actualizar desde la versión anterior:

1. Obtener API key gratuita de [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Actualizar variables de entorno:
   ```bash
   # Remover
   OPENAI_API_KEY=xxx
   OPENAI_MODEL=xxx
   
   # Agregar
   GEMINI_API_KEY=your_gemini_key_here
   GEMINI_MODEL=gemini-pro
   ```
3. Reinstalar dependencias:
   ```bash
   cd backend
   npm uninstall openai
   npm install @google/generative-ai
   ```

#### ⚠️ Notas de Compatibilidad
- La API de respuesta mantiene la misma estructura
- No hay cambios en el frontend
- Todas las funcionalidades médicas preservadas
- Misma calidad de respuestas médicas

---

## [1.0.0] - 2025-08-20

### ✨ Lanzamiento Inicial
- Chatbot médico gastrointestinal completo
- Interfaz React con TypeScript
- Backend Node.js con Express
- Base de datos PostgreSQL con Prisma
- Sistema de emergencias médicas
- Detección automática de síntomas críticos
- Soporte multiidioma (ES/EN)
- Docker ready para producción
