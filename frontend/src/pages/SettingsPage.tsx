import Card from '../components/ui/Card';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Configuración
        </h1>
        <p className="text-lg text-gray-600">
          Personaliza tu experiencia con GastroBot.
        </p>
      </div>

      <Card title="🚧 Configuraciones en Desarrollo">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Las opciones de configuración estarán disponibles próximamente.
          </p>
          <div className="text-sm text-gray-500">
            Podrás configurar tema, idioma, notificaciones, privacidad y accesibilidad.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
