import { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Heart, Info } from 'lucide-react';
import { useDiseaseSearch, useDebounce } from '../../hooks';
import { Disease, SearchFilters } from '../../types/medical';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';

interface DiseaseSearchProps {
  className?: string;
  onDiseaseSelect?: (disease: Disease) => void;
}

const DiseaseSearch: React.FC<DiseaseSearchProps> = ({ 
  className = '', 
  onDiseaseSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { diseases, isLoading, error, searchDiseases, searchBySymptoms } = useDiseaseSearch();

  // Síntomas comunes para filtrado
  const commonSymptoms = [
    'Dolor abdominal', 'Náuseas', 'Vómitos', 'Diarrea', 'Estreñimiento',
    'Acidez', 'Hinchazón', 'Gases', 'Pérdida de apetito', 'Fiebre',
    'Sangre en heces', 'Dolor de estómago', 'Indigestión', 'Cólicos'
  ];

  // Categorías de enfermedades
  const diseaseCategories = [
    { value: 'GASTRITIS', label: 'Gastritis' },
    { value: 'ULCER', label: 'Úlceras' },
    { value: 'IBD', label: 'Enfermedad Inflamatoria Intestinal' },
    { value: 'REFLUX', label: 'Reflujo Gastroesofágico' },
    { value: 'EMERGENCY', label: 'Emergencias' },
    { value: 'FUNCTIONAL', label: 'Trastornos Funcionales' },
    { value: 'INFECTION', label: 'Infecciones' },
    { value: 'OTHER', label: 'Otras' }
  ];

  // Realizar búsqueda cuando cambian los filtros
  useEffect(() => {
    const searchFilters: SearchFilters = {
      ...filters,
      searchTerm: debouncedSearchTerm || undefined,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined
    };

    if (selectedSymptoms.length > 0) {
      searchBySymptoms(selectedSymptoms);
    } else {
      searchDiseases(searchFilters);
    }
  }, [debouncedSearchTerm, filters, selectedSymptoms, searchDiseases, searchBySymptoms]);

  // Manejar selección de síntomas
  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Manejar selección de enfermedad
  const handleDiseaseClick = (disease: Disease) => {
    setSelectedDisease(disease);
    onDiseaseSelect?.(disease);
  };

  // Obtener color de severidad
  const getSeverityColor = (severity: Disease['severity']) => {
    switch (severity) {
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Obtener icono de severidad
  const getSeverityIcon = (severity: Disease['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle size={16} />;
      case 'HIGH':
        return <Heart size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  // Renderizar tarjeta de enfermedad
  const DiseaseCard = ({ disease }: { disease: Disease }) => (
    <Card 
      hoverable
      className="cursor-pointer transition-all duration-200 hover:border-blue-300"
      onClick={() => handleDiseaseClick(disease)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {disease.name}
            </h3>
            {disease.icdCode && (
              <span className="text-xs text-gray-500">
                CIE-10: {disease.icdCode}
              </span>
            )}
          </div>
          
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium
            ${getSeverityColor(disease.severity)}
          `}>
            {getSeverityIcon(disease.severity)}
            {disease.severity}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {disease.description}
        </p>

        {/* Categoría */}
        <div className="flex items-center justify-between">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
            {diseaseCategories.find(cat => cat.value === disease.category)?.label || disease.category}
          </span>
          
          {disease.prevalence && (
            <span className="text-xs text-gray-500">
              Prevalencia: {disease.prevalence}
            </span>
          )}
        </div>

        {/* Síntomas asociados */}
        {disease.symptoms && disease.symptoms.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Síntomas principales:</div>
            <div className="flex flex-wrap gap-1">
              {disease.symptoms.slice(0, 3).map((symptom, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {symptom.name}
                </span>
              ))}
              {disease.symptoms.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{disease.symptoms.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Barra de búsqueda */}
      <Card>
        <div className="space-y-4">
          {/* Búsqueda por texto */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar enfermedades por nombre o síntomas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Síntomas comunes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona tus síntomas:
            </label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`
                    px-3 py-1 text-sm rounded-full border transition-colors
                    ${selectedSymptoms.includes(symptom)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }
                  `}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros avanzados */}
          <div className="flex items-center justify-between">
            <Button
              variant="tertiary"
              size="sm"
              leftIcon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros avanzados
            </Button>

            {(selectedSymptoms.length > 0 || Object.keys(filters).length > 0) && (
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => {
                  setFilters({});
                  setSelectedSymptoms([]);
                  setSearchTerm('');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Panel de filtros avanzados */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      category: e.target.value as Disease['category'] || undefined
                    }))}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las categorías</option>
                    {diseaseCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severidad
                  </label>
                  <select
                    value={filters.severity || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      severity: e.target.value as Disease['severity'] || undefined
                    }))}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las severidades</option>
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="CRITICAL">Crítica</option>
                  </select>
                </div>
              </div>

              {/* Solo emergencias */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.emergencyOnly || false}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    emergencyOnly: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Solo mostrar condiciones de emergencia
                </span>
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* Resultados */}
      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={16} />
              <span className="font-medium">Error en la búsqueda</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : diseases.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {diseases.length} enfermedad{diseases.length !== 1 ? 'es' : ''} encontrada{diseases.length !== 1 ? 's' : ''}
              </p>
              
              {selectedSymptoms.length > 0 && (
                <div className="text-sm text-blue-600">
                  Búsqueda por síntomas: {selectedSymptoms.join(', ')}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {diseases.map((disease) => (
                <DiseaseCard key={disease.id} disease={disease} />
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-8">
            <div className="text-gray-500">
              <Search size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No se encontraron enfermedades</p>
              <p className="text-sm">
                {searchTerm || selectedSymptoms.length > 0
                  ? 'Intenta con otros términos de búsqueda o síntomas'
                  : 'Usa la barra de búsqueda o selecciona síntomas para encontrar enfermedades'
                }
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de detalles de enfermedad */}
      <Modal
        isOpen={!!selectedDisease}
        onClose={() => setSelectedDisease(null)}
        title={selectedDisease?.name}
        size="lg"
      >
        {selectedDisease && (
          <div className="space-y-6">
            {/* Información básica */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`
                  flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium
                  ${getSeverityColor(selectedDisease.severity)}
                `}>
                  {getSeverityIcon(selectedDisease.severity)}
                  Severidad: {selectedDisease.severity}
                </div>
                
                {selectedDisease.icdCode && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    CIE-10: {selectedDisease.icdCode}
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                {selectedDisease.description}
              </p>
            </div>

            {/* Causas */}
            {selectedDisease.causes && selectedDisease.causes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Causas principales:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {selectedDisease.causes.map((cause, index) => (
                    <li key={index}>{cause}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Factores de riesgo */}
            {selectedDisease.riskFactors && selectedDisease.riskFactors.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Factores de riesgo:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {selectedDisease.riskFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Complicaciones */}
            {selectedDisease.complications && selectedDisease.complications.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Posibles complicaciones:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {selectedDisease.complications.map((complication, index) => (
                    <li key={index}>{complication}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              {selectedDisease.prevalence && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Prevalencia:</span>
                  <p className="text-sm text-gray-900">{selectedDisease.prevalence}</p>
                </div>
              )}
              
              {selectedDisease.ageGroup && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Grupo de edad:</span>
                  <p className="text-sm text-gray-900">{selectedDisease.ageGroup}</p>
                </div>
              )}
            </div>

            {/* Advertencia médica */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-yellow-800 text-sm">
                  <p className="font-medium mb-1">Importante:</p>
                  <p>
                    Esta información es solo educativa y no debe usarse para autodiagnóstico. 
                    Siempre consulta con un profesional médico para obtener un diagnóstico y tratamiento adecuados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DiseaseSearch;
