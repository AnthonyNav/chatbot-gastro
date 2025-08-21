import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Importar configuración y middleware
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { securityMiddleware } from './middleware/security';
import { validateEnvironment } from './utils/validateEnv';

// Importar rutas
import chatRoutes from './routes/chat';
import diseaseRoutes from './routes/diseases';
import symptomRoutes from './routes/symptoms';
import treatmentRoutes from './routes/treatments';
import emergencyRoutes from './routes/emergency';
import feedbackRoutes from './routes/feedback';

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy para rate limiting detrás de proxy
app.set('trust proxy', 1);

// Rate limiting - Configuración específica para aplicación médica
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intente nuevamente en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Excluir rutas de emergencia del rate limiting
  skip: (req) => req.path.includes('/api/emergency'),
});

// Rate limiting más estricto para rutas de IA
const aiLimiter = rateLimit({
  windowMs: 60000, // 1 minuto
  max: 10, // máximo 10 requests por minuto para IA
  message: {
    error: 'Demasiadas consultas al chatbot, intente nuevamente en un minuto.',
    code: 'AI_RATE_LIMIT_EXCEEDED'
  }
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configurado específicamente para la aplicación médica
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
}));

// Compression para mejor performance
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { 
    stream: { 
      write: (message: string) => logger.info(message.trim()) 
    } 
  }));
}

// Rate limiting general
app.use(limiter);

// Middleware de seguridad personalizado
app.use(securityMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Gastro Chatbot API',
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Disclaimer médico endpoint
app.get('/api/disclaimer', (req, res) => {
  res.json({
    disclaimer: {
      es: "IMPORTANTE: Esta aplicación es solo para fines informativos y educativos. NO reemplaza el consejo médico profesional, diagnóstico o tratamiento. Siempre busque el consejo de su médico u otro proveedor de salud calificado con cualquier pregunta que pueda tener sobre una condición médica. En caso de emergencia médica, llame inmediatamente a los servicios de emergencia.",
      en: "IMPORTANT: This application is for informational and educational purposes only. It does NOT replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In case of medical emergency, call emergency services immediately."
    },
    emergencyNumbers: {
      general: "911",
      poisonControl: "1-800-222-1222",
      mentalHealth: "988"
    },
    lastUpdated: new Date().toISOString()
  });
});

// API Routes
app.use('/api/chat', aiLimiter, chatRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/emergency', emergencyRoutes); // Sin rate limiting para emergencias
app.use('/api/feedback', feedbackRoutes);

// Catch all para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe en este servidor.`,
    availableEndpoints: [
      '/health',
      '/api/disclaimer',
      '/api/chat',
      '/api/diseases',
      '/api/symptoms',
      '/api/treatments',
      '/api/emergency',
      '/api/feedback'
    ]
  });
});

// Error handling middleware (debe ser el último)
app.use(errorHandler);

// Manejo de señales para graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`🏥 Gastro Chatbot API iniciado en puerto ${PORT}`);
  logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 Health check disponible en: http://localhost:${PORT}/health`);
  logger.info(`⚕️  Disclaimer médico en: http://localhost:${PORT}/api/disclaimer`);
});

export default app;
