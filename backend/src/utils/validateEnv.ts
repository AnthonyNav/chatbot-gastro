import { z } from 'zod';
import { logger } from './logger';

// Schema de validación para variables de entorno
const envSchema = z.object({
  // Base de datos
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),
  
  // Configuración del servidor
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('5000'),
  API_VERSION: z.string().default('v1'),
  
  // Google Gemini
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY es requerida para funcionalidad de IA'),
  GEMINI_MODEL: z.string().default('gemini-pro'),
  
  // Seguridad
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  ENCRYPTION_KEY: z.string().optional(),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET debe tener al menos 32 caracteres'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Logs
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'medical', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  
  // Configuración médica
  EMERGENCY_KEYWORDS: z.string().default('dolor intenso,sangrado abundante,dificultad respirar'),
  MAX_CONVERSATION_LENGTH: z.string().transform(Number).pipe(z.number().positive()).default('50'),
  AI_CONFIDENCE_THRESHOLD: z.string().transform(Number).pipe(z.number().min(0).max(1)).default('0.7'),
  
  // Notificaciones de emergencia (opcionales)
  EMERGENCY_EMAIL: z.string().email().optional(),
  EMERGENCY_WEBHOOK_URL: z.string().url().optional(),
  
  // Base de datos de respaldo (opcional)
  BACKUP_DATABASE_URL: z.string().optional(),
  
  // Configuración de desarrollo (opcionales)
  DEV_ADMIN_EMAIL: z.string().email().optional(),
  DEV_ADMIN_PASSWORD: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

/**
 * Valida las variables de entorno requeridas para el funcionamiento seguro
 * de la aplicación médica
 */
export function validateEnvironment(): Environment {
  try {
    const env = envSchema.parse(process.env);
    
    // Validaciones adicionales específicas para aplicación médica
    validateMedicalSafetyRequirements(env);
    
    logger.info('✅ Variables de entorno validadas correctamente');
    logger.info(`🔧 Modo: ${env.NODE_ENV}`);
    logger.info(`🚀 Puerto: ${env.PORT}`);
    logger.info(`🧠 Modelo IA: ${env.GEMINI_MODEL}`);
    logger.info(`⏱️  Rate limit: ${env.RATE_LIMIT_MAX_REQUESTS} req/${env.RATE_LIMIT_WINDOW_MS}ms`);
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Error en validación de variables de entorno:');
      error.errors.forEach((err) => {
        logger.error(`  • ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      logger.error('❌ Error inesperado en validación de entorno:', error);
    }
    
    process.exit(1);
  }
}

/**
 * Validaciones adicionales específicas para seguridad médica
 */
function validateMedicalSafetyRequirements(env: Environment): void {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Verificar configuración de producción
  if (env.NODE_ENV === 'production') {
    if (!env.EMERGENCY_EMAIL) {
      warnings.push('EMERGENCY_EMAIL no configurado - recomendado para producción');
    }
    
    if (!env.EMERGENCY_WEBHOOK_URL) {
      warnings.push('EMERGENCY_WEBHOOK_URL no configurado - recomendado para alertas');
    }
    
    if (env.JWT_SECRET.length < 64) {
      warnings.push('JWT_SECRET debería tener al menos 64 caracteres en producción');
    }
    
    if (!env.BACKUP_DATABASE_URL) {
      warnings.push('BACKUP_DATABASE_URL no configurado - recomendado para respaldo');
    }
    
    // Verificar que no use valores por defecto inseguros
    if (env.JWT_SECRET.includes('your_super_secret') || env.SESSION_SECRET.includes('your_session_secret')) {
      errors.push('❌ CRÍTICO: Usando secretos por defecto en producción');
    }
    
    if (env.GEMINI_API_KEY.includes('your_gemini_api_key')) {
      errors.push('❌ CRÍTICO: API key de Gemini no configurada correctamente');
    }
  }
  
  // Verificar palabras clave de emergencia
  const emergencyKeywords = env.EMERGENCY_KEYWORDS.split(',').map(k => k.trim());
  if (emergencyKeywords.length < 3) {
    warnings.push('Pocas palabras clave de emergencia configuradas - recomendado al menos 5');
  }
  
  // Verificar configuración de rate limiting para aplicación médica
  if (env.RATE_LIMIT_MAX_REQUESTS > 200) {
    warnings.push('Rate limit muy alto - podría afectar la calidad de respuestas médicas');
  }
  
  if (env.AI_CONFIDENCE_THRESHOLD < 0.6) {
    warnings.push('Umbral de confianza de IA muy bajo - podría dar respuestas médicas inseguras');
  }
  
  // Log de advertencias
  if (warnings.length > 0) {
    logger.warn('⚠️  Advertencias de configuración médica:');
    warnings.forEach(warning => logger.warn(`  • ${warning}`));
  }
  
  // Errores críticos
  if (errors.length > 0) {
    logger.error('❌ Errores críticos de seguridad médica:');
    errors.forEach(error => logger.error(`  • ${error}`));
    throw new Error('Configuración de seguridad médica insuficiente');
  }
  
  // Log de configuración médica específica
  logger.info('🏥 Configuración médica cargada:');
  logger.info(`  • Palabras clave de emergencia: ${emergencyKeywords.length}`);
  logger.info(`  • Máximo mensajes por conversación: ${env.MAX_CONVERSATION_LENGTH}`);
  logger.info(`  • Umbral confianza IA: ${env.AI_CONFIDENCE_THRESHOLD}`);
  logger.info(`  • Email emergencias: ${env.EMERGENCY_EMAIL ? '✓' : '✗'}`);
  logger.info(`  • Webhook emergencias: ${env.EMERGENCY_WEBHOOK_URL ? '✓' : '✗'}`);
}

/**
 * Obtiene una variable de entorno validada
 */
export function getEnvVar(key: keyof Environment): string | number {
  const env = process.env as any;
  return env[key];
}

/**
 * Verifica si estamos en modo de desarrollo
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Verifica si estamos en modo de producción
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Verifica si estamos en modo de test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

export default {
  validateEnvironment,
  getEnvVar,
  isDevelopment,
  isProduction,
  isTest,
};
