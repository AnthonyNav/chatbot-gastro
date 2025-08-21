import EmergencySystem from '../components/medical/EmergencySystem';

const EmergencyPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-700 mb-4">
          🚨 Sistema de Emergencias Médicas
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Acceso rápido a contactos de emergencia, protocolos de atención urgente y 
          información sobre síntomas que requieren atención médica inmediata.
        </p>
      </div>
      
      <EmergencySystem emergencyMode={true} />
    </div>
  );
};

export default EmergencyPage;
