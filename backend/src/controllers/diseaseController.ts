import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { dbService } from '../services/database';
import { DiseaseFilter, PaginatedResponse, Disease } from '../types/medical';
import { createMedicalError } from '../middleware/errorHandler';

export class DiseaseController {
  /**
   * Obtiene lista de enfermedades con filtros y paginación
   */
  public async getDiseases(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        severityLevel,
        symptoms,
        searchTerm,
        limit = 20,
        offset = 0,
      } = req.query;

      // Validar parámetros
      const limitNum = Math.min(Number(limit), 100); // Máximo 100 por página
      const offsetNum = Math.max(Number(offset), 0);

      // Construir filtros
      const whereClause: any = {
        isActive: true,
      };

      if (category) {
        whereClause.category = category;
      }

      if (severityLevel) {
        whereClause.severityLevel = severityLevel;
      }

      if (searchTerm) {
        whereClause.OR = [
          {
            name: {
              contains: searchTerm as string,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm as string,
              mode: 'insensitive',
            },
          },
        ];
      }

      if (symptoms && Array.isArray(symptoms)) {
        whereClause.symptoms = {
          hasSome: symptoms,
        };
      }

      // Obtener enfermedades con conteo total
      const [diseases, totalCount] = await Promise.all([
        dbService.client.disease.findMany({
          where: whereClause,
          include: {
            symptoms_rel: {
              include: {
                symptom: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    urgencyLevel: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { severityLevel: 'desc' },
            { name: 'asc' },
          ],
          take: limitNum,
          skip: offsetNum,
        }),
        dbService.client.disease.count({
          where: whereClause,
        }),
      ]);

      // Formatear respuesta
      const formattedDiseases = diseases.map(disease => ({
        id: disease.id,
        name: disease.name,
        description: disease.description,
        symptoms: disease.symptoms,
        causes: disease.causes,
        treatments: disease.treatments,
        severityLevel: disease.severityLevel,
        riskFactors: disease.riskFactors,
        prevention: disease.prevention,
        complications: disease.complications,
        category: disease.category,
        prevalence: disease.prevalence,
        icdCode: disease.icdCode,
        relatedSymptoms: disease.symptoms_rel.map(rel => ({
          ...rel.symptom,
          frequency: rel.frequency,
          severity: rel.severity,
        })),
        createdAt: disease.createdAt,
        updatedAt: disease.updatedAt,
      }));

      const response: PaginatedResponse<any> = {
        data: formattedDiseases,
        total: totalCount,
        page: Math.floor(offsetNum / limitNum) + 1,
        limit: limitNum,
        hasNext: offsetNum + limitNum < totalCount,
        hasPrev: offsetNum > 0,
      };

      // Log de consulta
      logger.info('Diseases retrieved', {
        filters: { category, severityLevel, symptoms, searchTerm },
        resultsCount: diseases.length,
        totalCount,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error('Error retrieving diseases:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error retrieving diseases information',
          userMessage: 'No se pudo obtener la información de enfermedades.',
        },
      });
    }
  }

  /**
   * Obtiene detalles de una enfermedad específica
   */
  public async getDiseaseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const diseaseId = parseInt(id);

      if (isNaN(diseaseId) || diseaseId <= 0) {
        throw createMedicalError(
          'Invalid disease ID',
          'validation',
          400
        );
      }

      const disease = await dbService.client.disease.findUnique({
        where: {
          id: diseaseId,
          isActive: true,
        },
        include: {
          symptoms_rel: {
            include: {
              symptom: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  category: true,
                  urgencyLevel: true,
                  severityIndicators: true,
                  redFlags: true,
                  bodyLocation: true,
                },
              },
            },
          },
        },
      });

      if (!disease) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Disease not found',
            userMessage: 'La enfermedad solicitada no fue encontrada.',
          },
        });
        return;
      }

      // Obtener tratamientos relacionados
      const relatedTreatments = await dbService.getTreatmentsByCondition(disease.name);

      // Formatear respuesta completa
      const formattedDisease = {
        id: disease.id,
        name: disease.name,
        description: disease.description,
        symptoms: disease.symptoms,
        causes: disease.causes,
        treatments: disease.treatments,
        severityLevel: disease.severityLevel,
        riskFactors: disease.riskFactors,
        prevention: disease.prevention,
        complications: disease.complications,
        category: disease.category,
        prevalence: disease.prevalence,
        icdCode: disease.icdCode,
        relatedSymptoms: disease.symptoms_rel.map(rel => ({
          ...rel.symptom,
          frequency: rel.frequency,
          severity: rel.severity,
        })),
        relatedTreatments: relatedTreatments.map(treatment => ({
          id: treatment.id,
          name: treatment.name,
          description: treatment.description,
          type: treatment.type,
          category: treatment.category,
          instructions: treatment.instructions,
          precautions: treatment.precautions,
        })),
        disclaimer: 'Esta información es solo educativa. Consulte con un profesional médico para diagnóstico y tratamiento específico.',
        createdAt: disease.createdAt,
        updatedAt: disease.updatedAt,
      };

      // Log de consulta detallada
      logger.info('Disease details retrieved', {
        diseaseId,
        diseaseName: disease.name,
        severityLevel: disease.severityLevel,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        data: formattedDisease,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error('Error retrieving disease details:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error retrieving disease details',
          userMessage: 'No se pudo obtener los detalles de la enfermedad.',
        },
      });
    }
  }

  /**
   * Busca enfermedades por síntomas proporcionados
   */
  public async searchDiseasesBySymptoms(req: Request, res: Response): Promise<void> {
    try {
      const { symptoms } = req.body;

      if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        throw createMedicalError(
          'Symptoms array is required and must not be empty',
          'validation',
          400
        );
      }

      if (symptoms.length > 20) {
        throw createMedicalError(
          'Too many symptoms provided (maximum 20)',
          'validation',
          400
        );
      }

      // Sanitizar síntomas
      const sanitizedSymptoms = symptoms
        .filter(symptom => typeof symptom === 'string' && symptom.trim().length > 0)
        .map(symptom => symptom.trim().toLowerCase());

      if (sanitizedSymptoms.length === 0) {
        throw createMedicalError(
          'No valid symptoms provided',
          'validation',
          400
        );
      }

      // Buscar enfermedades que coincidan con los síntomas
      const matchingDiseases = await dbService.findDiseasesBySymptoms(sanitizedSymptoms);

      // Calcular score de coincidencia para cada enfermedad
      const diseasesWithScore = matchingDiseases.map(disease => {
        const matchingSymptoms = disease.symptoms.filter((symptom: string) =>
          sanitizedSymptoms.some(userSymptom => 
            symptom.toLowerCase().includes(userSymptom) ||
            userSymptom.includes(symptom.toLowerCase())
          )
        );

        const score = matchingSymptoms.length / disease.symptoms.length;
        
        return {
          id: disease.id,
          name: disease.name,
          description: disease.description,
          severityLevel: disease.severityLevel,
          category: disease.category,
          matchingSymptoms,
          totalSymptoms: disease.symptoms.length,
          matchScore: score,
          urgencyIndicators: this.getUrgencyIndicators(disease, matchingSymptoms),
          disclaimer: 'Esta es una coincidencia informativa, no un diagnóstico médico.',
        };
      });

      // Ordenar por score y severidad
      const sortedDiseases = diseasesWithScore
        .sort((a, b) => {
          if (a.matchScore !== b.matchScore) {
            return b.matchScore - a.matchScore;
          }
          
          const severityOrder = { emergency: 4, severe: 3, moderate: 2, mild: 1 };
          return (severityOrder[b.severityLevel as keyof typeof severityOrder] || 0) - 
                 (severityOrder[a.severityLevel as keyof typeof severityOrder] || 0);
        })
        .slice(0, 10); // Limitar a top 10 resultados

      // Determinar nivel de urgencia general
      const hasEmergencyDiseases = sortedDiseases.some(d => d.severityLevel === 'emergency');
      const hasSevereDiseases = sortedDiseases.some(d => d.severityLevel === 'severe');

      const urgencyLevel = hasEmergencyDiseases ? 'emergency' : 
                          hasSevereDiseases ? 'high' : 
                          sortedDiseases.length > 0 ? 'medium' : 'low';

      // Log de búsqueda médica
      logger.info('Disease search by symptoms', {
        symptomsCount: sanitizedSymptoms.length,
        matchingDiseases: sortedDiseases.length,
        urgencyLevel,
        topMatches: sortedDiseases.slice(0, 3).map(d => ({
          name: d.name,
          score: d.matchScore,
          severity: d.severityLevel,
        })),
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        data: {
          searchedSymptoms: sanitizedSymptoms,
          matchingDiseases: sortedDiseases,
          urgencyLevel,
          totalMatches: sortedDiseases.length,
          recommendations: this.getSearchRecommendations(urgencyLevel, sortedDiseases),
          disclaimer: 'IMPORTANTE: Esta búsqueda es solo informativa. Los resultados NO constituyen un diagnóstico médico. Consulte siempre con un profesional de la salud.',
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error('Error searching diseases by symptoms:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error searching diseases by symptoms',
          userMessage: 'No se pudo realizar la búsqueda de enfermedades por síntomas.',
        },
      });
    }
  }

  /**
   * Obtiene categorías de enfermedades disponibles
   */
  public async getDiseaseCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await dbService.client.disease.groupBy({
        by: ['category'],
        where: {
          isActive: true,
        },
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
      });

      const formattedCategories = categories.map(cat => ({
        name: cat.category,
        count: cat._count.category,
        description: this.getCategoryDescription(cat.category),
      }));

      res.status(200).json({
        success: true,
        data: {
          categories: formattedCategories,
          total: categories.length,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error('Error retrieving disease categories:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error retrieving disease categories',
          userMessage: 'No se pudieron obtener las categorías de enfermedades.',
        },
      });
    }
  }

  /**
   * Determina indicadores de urgencia basados en la enfermedad y síntomas
   */
  private getUrgencyIndicators(disease: any, matchingSymptoms: string[]): string[] {
    const indicators: string[] = [];

    if (disease.severityLevel === 'emergency') {
      indicators.push('Requiere atención médica inmediata');
      indicators.push('Contacte servicios de emergencia');
    } else if (disease.severityLevel === 'severe') {
      indicators.push('Consulte con un médico pronto');
      indicators.push('Monitoree síntomas de cerca');
    }

    // Verificar síntomas específicos de alarma
    const alarmSymptoms = ['sangre', 'sangrado', 'dolor intenso', 'fiebre alta', 'dificultad respirar'];
    const hasAlarmSymptoms = matchingSymptoms.some(symptom =>
      alarmSymptoms.some(alarm => symptom.toLowerCase().includes(alarm))
    );

    if (hasAlarmSymptoms) {
      indicators.push('Síntomas de alarma detectados');
    }

    return indicators;
  }

  /**
   * Genera recomendaciones basadas en el nivel de urgencia
   */
  private getSearchRecommendations(urgencyLevel: string, diseases: any[]): string[] {
    switch (urgencyLevel) {
      case 'emergency':
        return [
          'Busque atención médica inmediata',
          'Llame al 911 o acuda a emergencias',
          'No espere a que los síntomas mejoren',
          'Mantenga un registro detallado de síntomas',
        ];
      
      case 'high':
        return [
          'Consulte con un médico en las próximas 24 horas',
          'Monitoree síntomas de cerca',
          'Evite automedicarse',
          'Busque atención si los síntomas empeoran',
        ];
      
      case 'medium':
        return [
          'Considere consultar con un médico',
          'Mantenga un registro de síntomas',
          'Practique medidas de autocuidado apropiadas',
          'Busque atención si los síntomas persisten',
        ];
      
      default:
        return [
          'Mantenga hábitos saludables',
          'Monitoree síntomas ocasionalmente',
          'Consulte si los síntomas persisten o empeoran',
          'Practique medidas preventivas',
        ];
    }
  }

  /**
   * Obtiene descripción de categoría
   */
  private getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      'gastrointestinal': 'Enfermedades del sistema digestivo',
      'inflammatory': 'Condiciones inflamatorias del tracto digestivo',
      'infectious': 'Infecciones gastrointestinales',
      'functional': 'Trastornos funcionales digestivos',
      'autoimmune': 'Enfermedades autoinmunes del sistema digestivo',
      'neoplastic': 'Tumores y cánceres gastrointestinales',
    };

    return descriptions[category] || 'Categoría de enfermedades gastrointestinales';
  }
}

// Exportar instancia del controlador
export const diseaseController = new DiseaseController();
export default diseaseController;
