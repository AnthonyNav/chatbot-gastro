import { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, AlertTriangle, Heart, Navigation } from 'lucide-react';
import { useEmergencyContacts } from '../../hooks';
import { EmergencyContact } from '../../types/medical';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface EmergencySystemProps {
  className?: string;
  emergencyMode?: boolean;
}

const EmergencySystem: React.FC<EmergencySystemProps> = ({ 
  className = '', 
  emergencyMode = false 
}) => {
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [emergencyType, setEmergencyType] = useState<'general' | 'ambulance' | 'poison' | 'telehealth'>('general');

  const { contacts, isLoading, error } = useEmergencyContacts();

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación:', error);
        }
      );
    }
  }, []);

  // Síntomas críticos que requieren atención inmediata
  const criticalSymptoms = [
    {
      symptom: 'Dolor abdominal severo repentino',
      description: 'Posible apendicitis, perforación intestinal o obstrucción',
      action: 'Llamar ambulancia inmediatamente'
    },
    {
      symptom: 'Vómito con sangre',
      description: 'Sangrado gastrointestinal que requiere atención urgente',
      action: 'Ir a emergencias o llamar ambulancia'
    },
    {
      symptom: 'Sangre en heces (abundante)',
      description: 'Sangrado intestinal severo',
      action: 'Atención médica inmediata'
    },
    {
      symptom: 'Dificultad para tragar con dolor',
      description: 'Posible obstrucción esofágica',
      action: 'Evaluación médica urgente'
    },
    {
      symptom: 'Fiebre alta con dolor abdominal',
      description: 'Posible infección grave o peritonitis',
      action: 'Atención médica inmediata'
    }
  ];

  // Filtrar contactos por tipo
  const getContactsByType = (type: EmergencyContact['type']) => {
    return contacts.filter(contact => contact.type === type);
  };

  // Calcular distancia aproximada (si hay coordenadas)
  const calculateDistance = (contact: EmergencyContact) => {
    if (!userLocation || !contact.coordinates) return null;
    
    const R = 6371; // Radio de la Tierra en km
    const dLat = (contact.coordinates.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (contact.coordinates.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(contact.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  // Realizar llamada telefónica
  const makeCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // Abrir direcciones en mapa
  const openDirections = (contact: EmergencyContact) => {
    if (contact.coordinates) {
      const url = `https://maps.google.com/maps?daddr=${contact.coordinates.lat},${contact.coordinates.lng}`;
      window.open(url, '_blank');
    } else if (contact.address) {
      const url = `https://maps.google.com/maps?daddr=${encodeURIComponent(contact.address)}`;
      window.open(url, '_blank');
    }
  };

  // Renderizar tarjeta de contacto
  const ContactCard = ({ contact }: { contact: EmergencyContact }) => {
    const distance = calculateDistance(contact);
    
    return (
      <Card 
        className={`
          transition-all duration-200 
          ${emergencyMode ? 'border-red-300 bg-red-50' : 'hover:border-blue-300'}
        `}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{contact.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`
                  px-2 py-1 text-xs rounded-full
                  ${contact.type === 'AMBULANCE' ? 'bg-red-100 text-red-800' :
                    contact.type === 'HOSPITAL' ? 'bg-blue-100 text-blue-800' :
                    contact.type === 'CLINIC' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {contact.type === 'AMBULANCE' ? 'Ambulancia' :
                   contact.type === 'HOSPITAL' ? 'Hospital' :
                   contact.type === 'CLINIC' ? 'Clínica' :
                   contact.type === 'POISON_CONTROL' ? 'Centro de Toxicología' :
                   'Telemedicina'}
                </span>
                
                {distance && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={12} />
                    {distance}
                  </span>
                )}
              </div>
            </div>

            {emergencyMode && (
              <div className="flex items-center text-red-600">
                <AlertTriangle size={16} />
              </div>
            )}
          </div>

          {/* Información */}
          <div className="space-y-2 text-sm">
            {contact.specialization && (
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-gray-400" />
                <span className="text-gray-700">{contact.specialization}</span>
              </div>
            )}
            
            {contact.availability && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-gray-700">{contact.availability}</span>
              </div>
            )}
            
            {contact.address && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-400 mt-0.5" />
                <span className="text-gray-700">{contact.address}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              variant={emergencyMode ? "danger" : "primary"}
              size="sm"
              leftIcon={<Phone size={14} />}
              onClick={() => makeCall(contact.phone)}
              className="flex-1"
            >
              Llamar
            </Button>
            
            {(contact.address || contact.coordinates) && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Navigation size={14} />}
                onClick={() => openDirections(contact)}
              >
                Direcciones
              </Button>
            )}
          </div>

          {/* Número de teléfono visible */}
          <div className="text-center pt-2 border-t border-gray-200">
            <span className="text-lg font-mono font-semibold text-gray-900">
              {contact.phone}
            </span>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Alerta de emergencia */}
      {emergencyMode && (
        <Card className="border-red-300 bg-red-50">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-800">
              <AlertTriangle size={24} className="animate-pulse" />
              <h2 className="text-xl font-bold">EMERGENCIA MÉDICA DETECTADA</h2>
            </div>
            
            <p className="text-red-700">
              Se han identificado síntomas que requieren atención médica inmediata. 
              Contacta los servicios de emergencia de inmediato.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="danger"
                size="lg"
                leftIcon={<Phone size={20} />}
                onClick={() => makeCall('911')}
                className="animate-pulse"
              >
                LLAMAR 911
              </Button>
              
              <Button
                variant="danger"
                size="lg"
                leftIcon={<Phone size={20} />}
                onClick={() => makeCall('066')}
              >
                CRUZ ROJA 066
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Síntomas críticos */}
      <Card title="⚠️ Síntomas que Requieren Atención Inmediata">
        <div className="space-y-3">
          {criticalSymptoms.map((item, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
              <h4 className="font-semibold text-gray-900">{item.symptom}</h4>
              <p className="text-sm text-gray-600 mb-1">{item.description}</p>
              <p className="text-sm font-medium text-red-600">{item.action}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Selector de tipo de emergencia */}
      <Card title="Contactos de Emergencia">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'general', label: 'Todos', icon: <AlertTriangle size={16} /> },
              { value: 'ambulance', label: 'Ambulancias', icon: <Phone size={16} /> },
              { value: 'poison', label: 'Toxicología', icon: <Heart size={16} /> },
              { value: 'telehealth', label: 'Telemedicina', icon: <Clock size={16} /> }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setEmergencyType(type.value as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                  ${emergencyType === type.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }
                `}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>

          {/* Lista de contactos */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
              <p className="text-red-600 font-medium mb-2">Error al cargar contactos</p>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(emergencyType === 'general' 
                ? contacts 
                : emergencyType === 'ambulance'
                ? getContactsByType('AMBULANCE')
                : emergencyType === 'poison'
                ? getContactsByType('POISON_CONTROL')
                : getContactsByType('TELEHEALTH')
              ).map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Números de emergencia nacionales */}
      <Card title="📞 Números de Emergencia Nacionales">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Emergencias Generales', number: '911', description: 'Policía, Bomberos, Ambulancia' },
            { name: 'Cruz Roja', number: '066', description: 'Servicios médicos de emergencia' },
            { name: 'LOCATEL', number: '066', description: 'Información y emergencias CDMX' },
            { name: 'Centro de Toxicología', number: '01-800-0147-47', description: 'Intoxicaciones y envenenamientos' },
            { name: 'Línea de la Vida', number: '800-911-2000', description: 'Crisis y salud mental' },
            { name: 'IMSS', number: '800-623-2323', description: 'Información médica IMSS' }
          ].map((service, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 text-sm">{service.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{service.description}</p>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Phone size={12} />}
                onClick={() => makeCall(service.number)}
                fullWidth
                className="text-xs"
              >
                {service.number}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Instrucciones de emergencia */}
      <Card title="🚨 Qué Hacer en una Emergencia Médica">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Antes de llamar:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Mantén la calma</li>
                <li>Evalúa la situación</li>
                <li>Asegura el lugar sea seguro</li>
                <li>Reúne información del paciente</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Durante la llamada:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Proporciona tu ubicación exacta</li>
                <li>Describe los síntomas claramente</li>
                <li>Menciona medicamentos que toma</li>
                <li>Sigue las instrucciones del operador</li>
              </ol>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-yellow-800 text-sm">
                <p className="font-medium mb-1">Recordatorio importante:</p>
                <p>
                  En caso de emergencia real, siempre llama a los servicios de emergencia (911) 
                  antes de usar esta aplicación. Esta herramienta es complementaria, no un sustituto 
                  de la atención médica profesional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmergencySystem;
