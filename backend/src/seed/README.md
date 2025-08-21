# 🌱 Database Seeding - Gastro Medical Chatbot

## 📋 Descripción

Este módulo contiene todos los scripts y datos necesarios para poblar la base de datos del chatbot médico gastrointestinal con información médica inicial, incluyendo:

- **💊 Síntomas médicos** - Catálogo completo de síntomas gastrointestinales
- **🏥 Enfermedades** - Base de datos de enfermedades gastrointestinales comunes
- **💉 Tratamientos** - Protocolos de tratamiento y recomendaciones médicas
- **🔗 Relaciones** - Vínculos entre síntomas y enfermedades con pesos y probabilidades
- **🧪 Datos de prueba** - Conversaciones, feedback y logs de ejemplo para desarrollo

## 🚀 Uso Rápido

### Seeding Completo (Recomendado para desarrollo)
```bash
npm run seed
```

### Limpiar y Re-seed
```bash
npm run seed:clean
```

### Seeding para Producción (Sin datos de prueba)
```bash
npm run seed:prod
```

### Verificar Integridad de Datos
```bash
npm run seed:verify
```

### Ver Estadísticas
```bash
npm run seed:stats
```

## 📊 Datos Incluidos

### 💊 Síntomas Médicos (21 síntomas)

#### Síntomas Gastrointestinales Comunes:
- Dolor abdominal
- Náuseas
- Vómitos
- Diarrea
- Estreñimiento
- Acidez estomacal
- Distensión abdominal
- Gases intestinales
- Pérdida de apetito
- Indigestión
- Regurgitación
- Disfagia
- Saciedad precoz
- Tenesmo

#### Síntomas de Emergencia:
- Vómito con sangre
- Sangre en las heces
- Dolor abdominal severo

#### Síntomas Generales:
- Fiebre
- Fatiga
- Pérdida de peso
- Deshidratación

### 🏥 Enfermedades Gastrointestinales (11 enfermedades)

#### Enfermedades Comunes del Estómago:
- **Gastritis** - Inflamación del revestimiento estomacal
- **Reflujo Gastroesofágico (ERGE)** - Retroceso del ácido estomacal
- **Úlcera Péptica** - Lesiones en estómago o duodeno

#### Trastornos Funcionales:
- **Síndrome del Intestino Irritable (SII)** - Trastorno funcional del colon
- **Dispepsia Funcional** - Dolor abdominal sin causa estructural

#### Enfermedades Infecciosas:
- **Gastroenteritis Aguda** - Inflamación por infección
- **Intoxicación Alimentaria** - Enfermedad por alimentos contaminados

#### Enfermedades Inflamatorias:
- **Enfermedad de Crohn** - EII que afecta todo el tracto digestivo
- **Colitis Ulcerosa** - EII que afecta colon y recto

#### Condiciones de Emergencia:
- **Apendicitis Aguda** - Inflamación del apéndice
- **Obstrucción Intestinal** - Bloqueo del intestino

### 💉 Tratamientos y Recomendaciones (7 protocolos)

#### Tratamientos Farmacológicos:
- Protocolo para Gastritis (Omeprazol, Sucralfato)
- Tratamiento de ERGE (Lansoprazol, Domperidona)
- Erradicación de H. pylori para úlceras (Triple terapia)

#### Tratamientos de Soporte:
- Manejo del SII (Mebeverina, fibra)
- Rehidratación para gastroenteritis
- Protocolos de emergencia

#### Cada tratamiento incluye:
- Medicaciones específicas con dosis
- Recomendaciones de estilo de vida
- Modificaciones dietéticas
- Programa de seguimiento
- Señales de alarma
- Contraindicaciones y efectos secundarios

### 🔗 Relaciones Síntoma-Enfermedad

Cada relación incluye:
- **Peso** (0.0-1.0) - Importancia del síntoma para la enfermedad
- **Probabilidad** (0.0-1.0) - Frecuencia de aparición del síntoma
- **Severidad** (mild/moderate/severe) - Intensidad típica del síntoma

#### Ejemplos de relaciones:
- **Gastritis**: Dolor abdominal (peso: 0.9, prob: 0.85)
- **ERGE**: Acidez estomacal (peso: 0.95, prob: 0.90)
- **Apendicitis**: Dolor abdominal severo (peso: 0.95, prob: 0.90)

### 🧪 Datos de Prueba (Solo en Desarrollo)

#### Conversaciones de Ejemplo:
- **Caso de bajo riesgo**: Gastritis leve
- **Caso de emergencia**: Dolor severo con detección automática
- **Caso de riesgo medio**: Gastroenteritis con seguimiento

#### Feedback de Usuarios:
- Ratings y comentarios realistas
- Diferentes categorías de feedback
- Métricas de utilidad y precisión

#### Logs de Actividad:
- Seguimiento de sesiones
- Detección de emergencias
- Análisis de síntomas

## 🔧 Estructura de Archivos

```
backend/src/seed/
├── index.ts          # Script principal de seeding
├── symptoms.ts       # Datos de síntomas médicos
├── diseases.ts       # Datos de enfermedades
├── treatments.ts     # Datos de tratamientos
├── relations.ts      # Relaciones síntoma-enfermedad
├── testData.ts       # Datos de prueba para desarrollo
└── run.js           # Ejecutor de scripts con CLI
```

## ⚙️ Configuración

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/gastro_chatbot"

# Entorno (determina si incluir datos de prueba)
NODE_ENV="development"  # o "production"
```

### Prerequisitos

1. **PostgreSQL** instalado y ejecutándose
2. **Base de datos creada**:
   ```sql
   CREATE DATABASE gastro_chatbot;
   ```
3. **Prisma configurado**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🔍 Verificación de Datos

### Comandos de Verificación

```bash
# Verificar integridad completa
npm run seed:verify

# Ver estadísticas detalladas
npm run seed:stats

# Abrir Prisma Studio para explorar datos
npm run prisma:studio
```

### Checks de Integridad Incluidos

✅ **Verificación de existencia**: Todos los tipos de datos están presentes
✅ **Relaciones válidas**: Cada enfermedad tiene síntomas asociados
✅ **Datos críticos**: Enfermedades de emergencia están marcadas correctamente
✅ **Consistencia**: Metadatos y estructuras son coherentes

### Estadísticas Típicas Esperadas

```
📊 Estadísticas finales:
   💊 Síntomas: 21
   🏥 Enfermedades: 11  
   💉 Tratamientos: 7
   🔗 Relaciones: ~85

📋 Por categoría:
   gastrointestinal: 6 enfermedades
   functional: 2 enfermedades
   infectious: 2 enfermedades
   inflammatory: 2 enfermedades
   emergency: 2 enfermedades

⚠️ Por severidad:
   mild: 4 enfermedades
   moderate: 4 enfermedades
   severe: 3 enfermedades
```

## 🚨 Consideraciones de Seguridad Médica

### Datos de Emergencia
- **Síntomas de alarma** claramente marcados
- **Protocolos de emergencia** incluidos en tratamientos
- **Niveles de urgencia** clasificados apropiadamente

### Compliance Médico
- **Disclaimers** incluidos en todos los tratamientos
- **Indicaciones** de consulta médica profesional
- **Contraindicaciones** especificadas para medicamentos

### Validación de Datos
- **Códigos ICD-10** incluidos para enfermedades
- **Dosificaciones** basadas en guías clínicas
- **Referencias** a literatura médica en metadatos

## 🛠️ Desarrollo y Mantenimiento

### Agregar Nuevos Datos

1. **Síntomas**: Editar `symptoms.ts`
2. **Enfermedades**: Editar `diseases.ts`
3. **Tratamientos**: Editar `treatments.ts`
4. **Relaciones**: Editar `relations.ts`

### Volver a Ejecutar Seeding

```bash
# Limpiar y re-seed completo
npm run seed:clean

# Solo actualizar datos nuevos
npm run seed
```

### Testing de Datos

```bash
# Verificar después de cambios
npm run seed:verify

# Ver impacto en estadísticas
npm run seed:stats
```

## 📝 Logs y Debugging

### Niveles de Log
- **INFO**: Progreso normal del seeding
- **WARN**: Advertencias sobre datos faltantes
- **ERROR**: Errores en creación de datos

### Archivos de Log
Los logs se almacenan según la configuración de Winston en `utils/logger.ts`

### Debugging Common Issues

1. **Error de conexión DB**: Verificar `DATABASE_URL`
2. **Prisma no sincronizado**: Ejecutar `npx prisma db push`
3. **Datos duplicados**: Usar `npm run seed:clean`
4. **Falta de permisos**: Verificar permisos de usuario de DB

## 🤝 Contribución

### Agregar Nuevas Enfermedades

1. Agregar enfermedad en `diseases.ts`
2. Agregar síntomas relacionados en `relations.ts`
3. Crear tratamiento en `treatments.ts`
4. Verificar con `npm run seed:verify`

### Guidelines Médicas

- Usar **códigos ICD-10** oficiales
- Incluir **fuentes** en metadatos
- Especificar **niveles de evidencia**
- Seguir **guías clínicas** reconocidas

---

**Disclaimer Médico**: Todos los datos incluidos son para fines educativos e informativos. No reemplazan el consejo médico profesional.
