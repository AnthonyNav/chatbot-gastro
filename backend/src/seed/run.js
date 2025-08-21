#!/usr/bin/env node

/**
 * Script de ejecutor de seeding para la base de datos médica
 * 
 * Uso:
 *   npm run seed              # Seeding completo
 *   npm run seed:clean        # Limpiar y re-seed
 *   npm run seed:prod         # Seeding para producción (sin datos de prueba)
 */

const { execSync } = require('child_process');
const path = require('path');

// Colores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, description) {
  log(`\n${description}...`, 'cyan');
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    log(`✅ ${description} completado`, 'green');
  } catch (error) {
    log(`❌ Error en ${description}: ${error.message}`, 'red');
    process.exit(1);
  }
}

function showBanner() {
  log('\n' + '='.repeat(60), 'magenta');
  log('🌱  GASTRO CHATBOT - DATABASE SEEDING  🌱', 'magenta');
  log('='.repeat(60), 'magenta');
  log('Poblando base de datos con datos médicos iniciales\n', 'cyan');
}

function showCompletion() {
  log('\n' + '='.repeat(60), 'green');
  log('🎉  SEEDING COMPLETADO EXITOSAMENTE  🎉', 'green');
  log('='.repeat(60), 'green');
  log('La base de datos está lista para usar\n', 'cyan');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  showBanner();

  // Verificar que Prisma esté configurado
  log('🔍 Verificando configuración de Prisma...', 'yellow');
  
  try {
    execSync('npx prisma --version', { stdio: 'pipe' });
    log('✅ Prisma configurado correctamente', 'green');
  } catch (error) {
    log('❌ Prisma no está configurado. Ejecute "npm install" primero', 'red');
    process.exit(1);
  }

  // Verificar variables de entorno
  if (!process.env.DATABASE_URL) {
    log('⚠️  DATABASE_URL no está configurado en .env', 'yellow');
    log('Usando configuración por defecto...', 'yellow');
  }

  switch (command) {
    case 'clean':
      log('🧹 Modo: Limpiar y re-seed completo', 'yellow');
      executeCommand('npx prisma db push --force-reset', 'Reiniciar base de datos');
      executeCommand('npx prisma generate', 'Generar cliente Prisma');
      executeCommand('npx ts-node src/seed/index.ts', 'Ejecutar seeding completo');
      break;

    case 'prod':
      log('🏭 Modo: Seeding para producción', 'yellow');
      // Establecer NODE_ENV=production para evitar datos de prueba
      process.env.NODE_ENV = 'production';
      executeCommand('npx prisma generate', 'Generar cliente Prisma');
      executeCommand('npx ts-node src/seed/index.ts', 'Ejecutar seeding de producción');
      break;

    case 'verify':
      log('🔍 Modo: Verificar integridad de datos', 'yellow');
      executeCommand('npx ts-node -e "' +
        'import { verifyDataIntegrity, showStatistics } from \"./src/seed/index\"; ' +
        'verifyDataIntegrity().then(() => showStatistics()).catch(console.error)' +
        '"', 'Verificar datos');
      break;

    case 'stats':
      log('📊 Modo: Mostrar estadísticas', 'yellow');
      executeCommand('npx ts-node -e "' +
        'import { showStatistics } from \"./src/seed/index\"; ' +
        'showStatistics().catch(console.error)' +
        '"', 'Mostrar estadísticas');
      break;

    case 'help':
      showHelp();
      return;

    default:
      log('🌱 Modo: Seeding estándar', 'yellow');
      executeCommand('npx prisma generate', 'Generar cliente Prisma');
      executeCommand('npx prisma db push', 'Sincronizar esquema de base de datos');
      executeCommand('npx ts-node src/seed/index.ts', 'Ejecutar seeding');
      break;
  }

  showCompletion();
  
  // Mostrar información útil
  log('📝 Comandos útiles:', 'cyan');
  log('  npm run seed:verify    # Verificar integridad de datos', 'blue');
  log('  npm run seed:stats     # Ver estadísticas de datos', 'blue');
  log('  npm run dev            # Iniciar servidor de desarrollo', 'blue');
  log('  npx prisma studio      # Abrir Prisma Studio para ver datos\n', 'blue');
}

function showHelp() {
  log('\n📖 Ayuda - Scripts de Seeding:', 'cyan');
  log('');
  log('Comandos disponibles:', 'bright');
  log('  npm run seed           # Seeding estándar con datos de desarrollo', 'blue');
  log('  npm run seed:clean     # Limpiar DB y hacer seeding completo', 'blue');
  log('  npm run seed:prod      # Seeding para producción (sin datos de prueba)', 'blue');
  log('  npm run seed:verify    # Verificar integridad de los datos', 'blue');
  log('  npm run seed:stats     # Mostrar estadísticas de datos', 'blue');
  log('  npm run seed:help      # Mostrar esta ayuda', 'blue');
  log('');
  log('Datos incluidos en el seeding:', 'bright');
  log('  💊 Síntomas médicos gastrointestinales', 'green');
  log('  🏥 Enfermedades gastrointestinales comunes', 'green');
  log('  💉 Tratamientos y recomendaciones', 'green');
  log('  🔗 Relaciones síntoma-enfermedad', 'green');
  log('  🧪 Datos de prueba (solo en desarrollo)', 'green');
  log('');
  log('Variables de entorno requeridas:', 'bright');
  log('  DATABASE_URL           # URL de conexión a PostgreSQL', 'yellow');
  log('  NODE_ENV              # development|production', 'yellow');
  log('');
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Error no manejado: ${reason}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Excepción no capturada: ${error.message}`, 'red');
  process.exit(1);
});

// Ejecutar script principal
main().catch((error) => {
  log(`❌ Error ejecutando seeding: ${error.message}`, 'red');
  process.exit(1);
});
