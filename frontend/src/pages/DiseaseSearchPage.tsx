import DiseaseSearch from '../components/medical/DiseaseSearch';

const DiseaseSearchPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Base de Conocimiento Médico
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Explora nuestra completa base de datos de enfermedades gastrointestinales. 
          Busca por síntomas, categorías o nombres específicos para obtener información detallada 
          sobre diagnósticos, tratamientos y cuándo buscar atención médica.
        </p>
      </div>
      
      <DiseaseSearch />
    </div>
  );
};

export default DiseaseSearchPage;
