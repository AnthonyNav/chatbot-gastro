import Card from '../components/ui/Card';

const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Mi Perfil Médico
        </h1>
        <p className="text-lg text-gray-600">
          Gestiona tu información médica personal y preferencias de la aplicación.
        </p>
      </div>

      <Card title="🚧 Función en Desarrollo">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Esta funcionalidad estará disponible próximamente.
          </p>
          <div className="text-sm text-gray-500">
            Podrás configurar tu historial médico, alergias, medicamentos actuales y contactos de emergencia.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
