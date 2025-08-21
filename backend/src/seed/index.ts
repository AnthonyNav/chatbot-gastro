import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { seedDiseases } from './diseases';
import { seedSymptoms } from './symptoms';
import { seedTreatments } from './treatments';
import { seedDiseaseSymptomRelations } from './relations';
import { seedTestData } from './testData';

const prisma = new PrismaClient();

/**
 * Script principal de seeding para la base de datos médica
 */
async function main() {
  try {
    logger.info('🌱 Iniciando seeding de base de datos médica...');

    // 1. Verificar conexión a la base de datos
    await prisma.$connect();
    logger.info('✅ Conexión a base de datos establecida');

    // 2. Limpiar datos existentes (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      logger.info('🧹 Limpiando datos existentes...');
      await cleanDatabase();
      logger.info('✅ Base de datos limpiada');
    }

    // 3. Seed básico de síntomas
    logger.info('💊 Creando síntomas médicos...');
    const symptoms = await seedSymptoms(prisma);
    logger.info(`✅ ${symptoms.length} síntomas creados`);

    // 4. Seed de enfermedades gastrointestinales
    logger.info('🏥 Creando enfermedades gastrointestinales...');
    const diseases = await seedDiseases(prisma);
    logger.info(`✅ ${diseases.length} enfermedades creadas`);

    // 5. Seed de tratamientos y recomendaciones
    logger.info('💉 Creando tratamientos y recomendaciones...');
    const treatments = await seedTreatments(prisma);
    logger.info(`✅ ${treatments.length} tratamientos creados`);

    // 6. Crear relaciones entre enfermedades y síntomas
    logger.info('🔗 Creando relaciones enfermedad-síntoma...');
    const relations = await seedDiseaseSymptomRelations(prisma, diseases, symptoms);
    logger.info(`✅ ${relations.length} relaciones creadas`);

    // 7. Datos de prueba para desarrollo
    if (process.env.NODE_ENV === 'development') {
      logger.info('🧪 Creando datos de prueba...');
      await seedTestData(prisma);
      logger.info('✅ Datos de prueba creados');
    }

    // 8. Verificar integridad de datos
    logger.info('🔍 Verificando integridad de datos...');
    await verifyDataIntegrity();
    logger.info('✅ Integridad de datos verificada');

    logger.info('🎉 Seeding completado exitosamente!');
    
    // Mostrar estadísticas finales
    await showStatistics();

  } catch (error) {
    logger.error('❌ Error durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Limpia la base de datos eliminando todos los datos
 */
async function cleanDatabase() {
  try {
    // Eliminar en orden correcto respetando foreign keys
    await prisma.diseaseSymptomRel.deleteMany();
    await prisma.conversationMessage.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.emergencyInfo.deleteMany();
    await prisma.treatment.deleteMany();
    await prisma.disease.deleteMany();
    await prisma.symptom.deleteMany();

    logger.info('🗑️ Todos los datos eliminados');
  } catch (error) {
    logger.error('Error limpiando base de datos:', error);
    throw error;
  }
}

/**
 * Verifica la integridad de los datos creados
 */
async function verifyDataIntegrity() {
  try {
    // Verificar que existan datos básicos
    const symptomsCount = await prisma.symptom.count();
    const diseasesCount = await prisma.disease.count();
    const treatmentsCount = await prisma.treatment.count();
    const relationsCount = await prisma.diseaseSymptomRel.count();

    if (symptomsCount === 0) throw new Error('No se crearon síntomas');
    if (diseasesCount === 0) throw new Error('No se crearon enfermedades');
    if (treatmentsCount === 0) throw new Error('No se crearon tratamientos');
    if (relationsCount === 0) throw new Error('No se crearon relaciones');

    // Verificar que todas las enfermedades tengan al menos un síntoma
    const diseasesWithoutSymptoms = await prisma.disease.findMany({
      where: {
        symptoms_rel: {
          none: {}
        }
      }
    });

    if (diseasesWithoutSymptoms.length > 0) {
      logger.warn(`⚠️ ${diseasesWithoutSymptoms.length} enfermedades sin síntomas asociados`);
    }

    // Verificar que los datos críticos estén presentes
    const emergencyDiseases = await prisma.disease.count({
      where: { severityLevel: 'severe' }
    });

    if (emergencyDiseases === 0) {
      logger.warn('⚠️ No se encontraron enfermedades de severidad alta');
    }

    logger.info('✅ Verificación de integridad completada');

  } catch (error) {
    logger.error('Error verificando integridad:', error);
    throw error;
  }
}

/**
 * Muestra estadísticas de los datos creados
 */
async function showStatistics() {
  try {
    const stats = {
      symptoms: await prisma.symptom.count(),
      diseases: await prisma.disease.count(),
      treatments: await prisma.treatment.count(),
      relations: await prisma.diseaseSymptomRel.count(),
    };

    const diseasesByCategory = await prisma.disease.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    const diseasesBySeverity = await prisma.disease.groupBy({
      by: ['severityLevel'],
      _count: { severityLevel: true }
    });

    logger.info('📊 Estadísticas finales:');
    logger.info(`   💊 Síntomas: ${stats.symptoms}`);
    logger.info(`   🏥 Enfermedades: ${stats.diseases}`);
    logger.info(`   💉 Tratamientos: ${stats.treatments}`);
    logger.info(`   🔗 Relaciones: ${stats.relations}`);
    
    logger.info('📋 Por categoría:');
    diseasesByCategory.forEach(cat => {
      logger.info(`   ${cat.category}: ${cat._count.category} enfermedades`);
    });

    logger.info('⚠️ Por severidad:');
    diseasesBySeverity.forEach(sev => {
      logger.info(`   ${sev.severityLevel}: ${sev._count.severityLevel} enfermedades`);
    });

  } catch (error) {
    logger.error('Error mostrando estadísticas:', error);
  }
}

// Ejecutar seeding si este archivo se ejecuta directamente
if (require.main === module) {
  main()
    .catch((error) => {
      logger.error('Seeding falló:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export {
  main as runSeeding,
  cleanDatabase,
  verifyDataIntegrity,
  showStatistics
};
