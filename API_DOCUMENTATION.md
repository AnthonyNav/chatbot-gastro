# Gastro Medical Chatbot - API Documentation

## 🩺 APIs y Endpoints Funcionales

Este documento describe todas las rutas y endpoints disponibles en la API del Chatbot Médico Gastroenterológico.

## 📋 Tabla de Contenidos

- [Configuración Base](#configuración-base)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Endpoints de Chat](#endpoints-de-chat)
- [Endpoints de Enfermedades](#endpoints-de-enfermedades)
- [Endpoints del Sistema](#endpoints-del-sistema)
- [Códigos de Respuesta](#códigos-de-respuesta)
- [Ejemplos de Uso](#ejemplos-de-uso)

## ⚙️ Configuración Base

### URL Base
```
http://localhost:5000/api
```

### Headers Requeridos
```http
Content-Type: application/json
X-Session-ID: [session-id] (opcional para la mayoría de endpoints)
X-Request-ID: [request-id] (opcional, para tracking)
```

### Rate Limits
- **Chat**: 30 requests por minuto
- **Enfermedades**: 60 requests por minuto
- **Emergencias**: Sin límite
- **Sistema**: 100 requests por minuto

## 🔐 Autenticación y Seguridad

### Sesiones Médicas
- Las sesiones se manejan via `X-Session-ID` header
- Duración: 24 horas
- Encriptación: AES-256 para conversaciones
- Compliance: HIPAA-Ready

### Seguridad Implementada
- Rate limiting médico específico
- Helmet para headers de seguridad
- CORS configurado
- Detección automática de emergencias
- Logging completo para auditoría

## 💬 Endpoints de Chat

### 1. Enviar Mensaje al Chatbot

```http
POST /api/chat/message
```

**Body:**
```json
{
  "message": "¿Qué puede causarme dolor de estómago?",
  "sessionId": "optional-session-id",
  "language": "es",
  "userContext": {
    "age": 30,
    "symptoms": ["dolor abdominal", "náuseas"],
    "painLevel": 5,
    "duration": "2-3 días"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Basándome en sus síntomas...",
    "sessionId": "session-123",
    "emergencyDetected": false,
    "recommendations": ["Consulte con un médico", "..."],
    "riskLevel": "low"
  },
  "timestamp": "2025-01-21T10:30:00Z"
}
```

### 2. Obtener Historial de Conversación

```http
GET /api/chat/history/{sessionId}?limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-1",
        "type": "user",
        "content": "¿Qué puede causarme dolor de estómago?",
        "timestamp": "2025-01-21T10:29:00Z"
      },
      {
        "id": "msg-2",
        "type": "assistant",
        "content": "Basándome en sus síntomas...",
        "timestamp": "2025-01-21T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 10,
      "limit": 20,
      "offset": 0
    }
  }
}
```

### 3. Terminar Conversación

```http
POST /api/chat/end/{sessionId}
```

**Body:**
```json
{
  "feedback": {
    "rating": 5,
    "comment": "Muy útil",
    "category": "helpful",
    "wasHelpful": true,
    "foundAnswer": true,
    "wouldRecommend": true
  }
}
```

### 4. Crear Nueva Sesión

```http
GET /api/chat/session/new
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "ses_1234567890abcdef",
    "expiresAt": "2025-01-22T10:30:00Z",
    "disclaimer": "Esta sesión es para consultas médicas informativas..."
  }
}
```

### 5. Estado de Sesión

```http
GET /api/chat/session/{sessionId}/status
```

### 6. Contactos de Emergencia

```http
GET /api/chat/emergency-contacts
```

## 🏥 Endpoints de Enfermedades

### 1. Buscar por Síntomas

```http
POST /api/diseases/search-by-symptoms
```

**Body:**
```json
{
  "symptoms": ["dolor abdominal", "náuseas", "vómitos"],
  "patientAge": 30,
  "patientGender": "female",
  "painLevel": 7,
  "duration": "1 día",
  "location": "abdomen superior",
  "includeRareConditions": false,
  "emergencyMode": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "diseases": [
      {
        "id": "disease-1",
        "name": "Gastritis",
        "description": "Inflamación del revestimiento del estómago",
        "category": "digestive",
        "severity": "mild",
        "matchScore": 85,
        "urgencyLevel": "moderate",
        "recommendedAction": "Consulte con un médico en 1-2 días",
        "commonSymptoms": ["dolor abdominal", "náuseas", "indigestión"]
      }
    ],
    "searchCriteria": { ... },
    "disclaimer": "Esta búsqueda es solo informativa..."
  }
}
```

### 2. Detalles de Enfermedad

```http
GET /api/diseases/{id}?includeSymptoms=true&includeTreatments=true
```

### 3. Enfermedades por Categoría

```http
GET /api/diseases/category/{category}?limit=20&offset=0&sortBy=name&sortOrder=asc
```

**Categorías disponibles:**
- `digestive` - Sistema digestivo
- `respiratory` - Sistema respiratorio
- `cardiovascular` - Sistema cardiovascular
- `neurological` - Sistema nervioso
- `emergency` - Emergencias médicas

### 4. Búsqueda por Texto

```http
GET /api/diseases/search?q=gastritis&category=digestive&limit=20
```

### 5. Lista de Emergencias

```http
GET /api/diseases/emergency/checklist
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emergencySymptoms": {
      "immediate911": [
        "Dolor severo en el pecho",
        "Dificultad extrema para respirar",
        "Pérdida de consciencia"
      ],
      "urgent": [
        "Fiebre alta persistente (>39°C)",
        "Dolor abdominal severo",
        "Vómitos continuos"
      ]
    },
    "instructions": {
      "call911": "Llame al 911 inmediatamente...",
      "urgent": "Busque atención médica urgente...",
      "monitor": "Monitoree síntomas y consulte..."
    }
  }
}
```

### 6. Condiciones Gastrointestinales Comunes

```http
GET /api/diseases/gastro/common
```

## 🔧 Endpoints del Sistema

### 1. Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "version": "1.0.0",
    "environment": "development",
    "services": {
      "api": "operational",
      "database": "operational",
      "ai": "operational"
    },
    "memory": {
      "used": 128,
      "total": 256,
      "rss": 180
    }
  }
}
```

### 2. Información de la API

```http
GET /api/info
```

### 3. Documentación

```http
GET /api/docs
```

## 📊 Códigos de Respuesta

### Exitosos
- `200` - OK
- `201` - Created

### Errores del Cliente
- `400` - Bad Request (validación fallida)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limit)

### Errores del Servidor
- `500` - Internal Server Error
- `503` - Service Unavailable

### Formato de Error
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "userMessage": "Los datos proporcionados no son válidos.",
    "details": [
      {
        "field": "symptoms",
        "message": "Se requiere al menos 1 síntoma"
      }
    ]
  },
  "timestamp": "2025-01-21T10:30:00Z"
}
```

## 🧪 Ejemplos de Uso

### Flujo Completo de Consulta

```javascript
// 1. Crear nueva sesión
const sessionResponse = await fetch('/api/chat/session/new');
const { sessionId } = await sessionResponse.json();

// 2. Enviar mensaje
const chatResponse = await fetch('/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId
  },
  body: JSON.stringify({
    message: "Tengo dolor de estómago y náuseas desde ayer",
    userContext: {
      age: 25,
      symptoms: ["dolor abdominal", "náuseas"],
      painLevel: 6,
      duration: "1 día"
    }
  })
});

// 3. Buscar por síntomas para más información
const diseaseResponse = await fetch('/api/diseases/search-by-symptoms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    symptoms: ["dolor abdominal", "náuseas"],
    patientAge: 25,
    painLevel: 6,
    duration: "1 día"
  })
});

// 4. Terminar conversación con feedback
await fetch(`/api/chat/end/${sessionId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId
  },
  body: JSON.stringify({
    feedback: {
      rating: 5,
      wasHelpful: true,
      comment: "Información muy útil"
    }
  })
});
```

### Manejo de Emergencias

```javascript
// El sistema detecta automáticamente emergencias
const emergencyResponse = await fetch('/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId
  },
  body: JSON.stringify({
    message: "Tengo dolor severo en el pecho y dificultad para respirar",
    userContext: {
      symptoms: ["dolor de pecho severo", "dificultad para respirar"],
      painLevel: 10,
      duration: "minutos"
    }
  })
});

// Response incluirá:
// - emergencyDetected: true
// - riskLevel: "critical"
// - Instrucciones inmediatas para llamar al 911
```

## 🛡️ Consideraciones de Seguridad

### Datos Médicos
- Todas las conversaciones se encriptan
- No se almacenan datos personales identificables
- Sesiones expiran automáticamente
- Logs de auditoría completos

### Rate Limiting
- Protección contra abuso
- Excepciones para emergencias
- Mensajes informativos cuando se exceden límites

### Validación
- Validación estricta de todos los inputs
- Sanitización de contenido médico
- Detección de contenido malicioso

## 📞 Soporte

Para soporte técnico o preguntas sobre la API:
- Documentación completa: `/api/docs`
- Health status: `/api/health`
- Logs de sistema disponibles para debugging

---

**Disclaimer Médico**: Esta API es solo para fines informativos y educativos. NO reemplaza el consejo médico profesional. En emergencias, llame al 911 inmediatamente.
