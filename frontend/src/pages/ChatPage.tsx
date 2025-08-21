import { useState } from 'react';
import { MessageSquare, Search, AlertTriangle, TrendingUp } from 'lucide-react';
import ChatInterface from '../components/medical/ChatInterface';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ChatPage: React.FC = () => {
  const [showQuickStart, setShowQuickStart] = useState(true);

  // Preguntas de inicio rápido
  const quickStartQuestions = [
    {
      category: 'Síntomas digestivos',
      questions: [
        'Tengo dolor de estómago después de comer',
        'He tenido náuseas y vómitos por 2 días',
        'Siento ardor en el pecho después de las comidas',
        'Tengo diarrea desde hace una semana'
      ]
    },
    {
      category: 'Síntomas de emergencia',
      questions: [
        'Tengo dolor abdominal muy fuerte y repentino',
        'Estoy vomitando sangre',
        'Mis heces tienen sangre',
        'Tengo fiebre alta y dolor abdominal'
      ]
    },
    {
      category: 'Consultas generales',
      questions: [
        '¿Qué puedo comer si tengo gastritis?',
        '¿Cuándo debo preocuparme por el reflujo?',
        '¿Cómo puedo prevenir úlceras estomacales?',
        '¿Qué medicamentos puedo tomar para la acidez?'
      ]
    }
  ];

  // Estadísticas de ejemplo
  const stats = [
    { label: 'Consultas procesadas', value: '12,547', icon: <MessageSquare size={20} /> },
    { label: 'Emergencias detectadas', value: '89', icon: <AlertTriangle size={20} /> },
    { label: 'Precisión diagnóstica', value: '94.7%', icon: <TrendingUp size={20} /> },
    { label: 'Tiempo promedio', value: '2.3 min', icon: <Search size={20} /> }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Consulta Médica Gastroenterológica
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Describe tus síntomas y recibe orientación médica especializada. 
          Nuestro asistente de IA está entrenado para identificar condiciones gastrointestinales 
          y determinar cuándo necesitas atención médica urgente.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel de inicio rápido */}
        {showQuickStart && (
          <div className="lg:col-span-1">
            <Card title="🚀 Inicio Rápido" className="h-fit">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Selecciona una pregunta común para comenzar tu consulta:
                </p>
                
                {quickStartQuestions.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">
                      {category.category}
                    </h4>
                    <div className="space-y-1">
                      {category.questions.map((question, qIndex) => (
                        <button
                          key={qIndex}
                          className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                          onClick={() => {
                            // Aquí se puede integrar con el sistema de chat
                            // para enviar automáticamente la pregunta
                            console.log('Pregunta seleccionada:', question);
                          }}
                        >
                          "{question}"
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => setShowQuickStart(false)}
                    fullWidth
                  >
                    Ocultar panel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Interfaz de chat */}
        <div className={showQuickStart ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="h-[700px]">
            <ChatInterface className="h-full" />
          </div>
        </div>
      </div>

      {/* Información importante */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="⚠️ Cuándo Buscar Atención Inmediata">
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Contacta servicios de emergencia si experimentas:
            </p>
            <div className="space-y-2">
              {[
                'Dolor abdominal severo y repentino',
                'Vómito con sangre o material que parece café molido',
                'Sangre roja brillante o heces negras y alquitranadas',
                'Dificultad para tragar con dolor intenso',
                'Fiebre alta (>38.5°C) con dolor abdominal',
                'Signos de deshidratación severa'
              ].map((symptom, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{symptom}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="🔒 Privacidad y Seguridad">
          <div className="space-y-3">
            <div className="space-y-2">
              {[
                {
                  title: 'Conversaciones encriptadas',
                  description: 'Todas las comunicaciones están protegidas con cifrado de extremo a extremo'
                },
                {
                  title: 'HIPAA Compatible',
                  description: 'Cumplimos con estándares de privacidad médica internacionales'
                },
                {
                  title: 'Datos no compartidos',
                  description: 'Tu información médica nunca se comparte con terceros'
                },
                {
                  title: 'Almacenamiento seguro',
                  description: 'Los datos se almacenan en servidores seguros y certificados'
                }
              ].map((item, index) => (
                <div key={index} className="pb-2">
                  <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Disclaimer médico */}
      <Card className="border-yellow-300 bg-yellow-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
          <div className="text-yellow-800">
            <h3 className="font-semibold mb-2">Aviso Médico Importante</h3>
            <p className="text-sm leading-relaxed">
              Este asistente de IA proporciona información educativa y orientación general sobre salud gastrointestinal. 
              <strong> No reemplaza el consejo médico profesional, diagnóstico o tratamiento.</strong> Siempre consulta 
              con un médico calificado para cualquier condición médica. En caso de emergencia, contacta inmediatamente 
              los servicios de emergencia o acude al hospital más cercano.
            </p>
          </div>
        </div>
      </Card>

      {/* Botón para mostrar panel de inicio si está oculto */}
      {!showQuickStart && (
        <div className="fixed bottom-4 right-4">
          <Button
            variant="primary"
            onClick={() => setShowQuickStart(true)}
            leftIcon={<MessageSquare size={16} />}
            className="shadow-lg"
          >
            Mostrar preguntas rápidas
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
