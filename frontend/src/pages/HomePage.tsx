import { Link } from 'react-router-dom';
import { MessageSquare, Search, AlertTriangle, TrendingUp, Users, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <MessageSquare className="text-blue-600" size={32} />,
      title: 'Consulta Inteligente',
      description: 'Describe tus síntomas y recibe orientación médica especializada basada en IA avanzada.',
      action: 'Iniciar consulta',
      link: '/chat'
    },
    {
      icon: <Search className="text-green-600" size={32} />,
      title: 'Base de Enfermedades',
      description: 'Explora información detallada sobre enfermedades gastrointestinales y sus tratamientos.',
      action: 'Buscar enfermedades',
      link: '/diseases'
    },
    {
      icon: <AlertTriangle className="text-red-600" size={32} />,
      title: 'Sistema de Emergencias',
      description: 'Acceso rápido a contactos de emergencia y protocolos de atención urgente.',
      action: 'Ver emergencias',
      link: '/emergency'
    }
  ];

  const stats = [
    { label: 'Consultas Procesadas', value: '15,847', change: '+12%' },
    { label: 'Precisión Diagnóstica', value: '94.7%', change: '+2.1%' },
    { label: 'Usuarios Atendidos', value: '8,234', change: '+18%' },
    { label: 'Emergencias Detectadas', value: '127', change: '-5%' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <MessageSquare className="text-blue-600" size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Gastro</span>Bot
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tu asistente médico gastroenterológico potenciado por inteligencia artificial. 
            Obtén orientación médica especializada las 24 horas del día.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/chat">
            <Button size="lg" leftIcon={<MessageSquare size={20} />}>
              Iniciar Consulta Médica
            </Button>
          </Link>
          <Link to="/diseases">
            <Button variant="secondary" size="lg" leftIcon={<Search size={20} />}>
              Explorar Enfermedades
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className={`text-xs font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} vs mes anterior
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Funcionalidades principales */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Funcionalidades Principales
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            GastroBot combina conocimiento médico avanzado con tecnología de IA 
            para proporcionar orientación médica precisa y oportuna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} hoverable className="text-center h-full flex flex-col">
              <div className="flex-1 space-y-4">
                <div className="flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="mt-6">
                <Link to={feature.link}>
                  <Button variant="secondary" fullWidth>
                    {feature.action}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Características adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Tecnología Médica Avanzada
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: <Shield className="text-blue-600" size={24} />,
                title: 'HIPAA Compliant',
                description: 'Máxima seguridad y privacidad de datos médicos'
              },
              {
                icon: <TrendingUp className="text-green-600" size={24} />,
                title: 'IA Entrenada',
                description: 'Algoritmos entrenados con miles de casos clínicos'
              },
              {
                icon: <Users className="text-purple-600" size={24} />,
                title: 'Validación Médica',
                description: 'Supervisado por gastroenterólogos certificados'
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Detección de Emergencias
            </h3>
            <p className="text-gray-600">
              Nuestro sistema puede identificar automáticamente síntomas que requieren 
              atención médica inmediata y conectarte con servicios de emergencia.
            </p>
            <Link to="/emergency">
              <Button variant="danger" size="lg">
                Sistema de Emergencias
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Disclaimer médico */}
      <Card className="border-yellow-300 bg-yellow-50">
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
          <div className="text-yellow-800">
            <h3 className="font-semibold text-lg mb-2">Aviso Médico Importante</h3>
            <p className="leading-relaxed">
              GastroBot es una herramienta de apoyo educativo y orientación médica inicial. 
              <strong> No reemplaza el consejo, diagnóstico o tratamiento médico profesional.</strong> 
              Siempre consulta con un médico calificado para obtener un diagnóstico definitivo y tratamiento adecuado. 
              En caso de emergencia, contacta inmediatamente los servicios de emergencia (911) o acude al hospital más cercano.
            </p>
          </div>
        </div>
      </Card>

      {/* Call to action final */}
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¿Listo para comenzar?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Describe tus síntomas y recibe orientación médica especializada en segundos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/chat">
            <Button size="lg" leftIcon={<MessageSquare size={20} />}>
              Comenzar Consulta
            </Button>
          </Link>
          <Link to="/diseases">
            <Button variant="tertiary" size="lg">
              Aprender más
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
