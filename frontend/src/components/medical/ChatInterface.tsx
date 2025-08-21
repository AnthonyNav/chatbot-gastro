import { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, Phone, User, Bot } from 'lucide-react';
import { useChat } from '../../hooks';
import { useChatStore } from '../../stores';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { ChatMessage } from '../../types/medical';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [input, setInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    currentSession,
    messages,
    isLoading,
    isTyping,
    emergencyMode,
    error,
    startNewSession,
    sendMessage,
    clearError
  } = useChat();

  // Auto-scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Inicializar sesión si no existe
  useEffect(() => {
    if (!currentSession && !isInitialized) {
      startNewSession();
      setIsInitialized(true);
    }
  }, [currentSession, isInitialized, startNewSession]);

  // Manejar envío de mensaje
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !currentSession || isLoading) return;

    const message = input.trim();
    setInput('');
    
    // Enfocar el input después de enviar
    setTimeout(() => inputRef.current?.focus(), 100);

    await sendMessage(message);
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Renderizar mensaje individual
  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.isFromUser;
    const isEmergency = message.messageType === 'EMERGENCY';

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
          {/* Avatar */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${isUser 
              ? 'bg-blue-600 text-white' 
              : isEmergency 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }
          `}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>

          {/* Mensaje */}
          <div className={`
            px-4 py-2 rounded-lg
            ${isUser 
              ? 'bg-blue-600 text-white' 
              : isEmergency 
                ? 'bg-red-50 border border-red-200 text-red-900' 
                : 'bg-gray-100 text-gray-900'
            }
          `}>
            {isEmergency && (
              <div className="flex items-center gap-1 mb-2 text-red-600">
                <AlertTriangle size={16} />
                <span className="text-xs font-semibold">EMERGENCIA MÉDICA</span>
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap">
              {message.content}
            </p>
            
            {message.metadata?.recommendedAction && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-900 text-xs">
                <strong>Acción recomendada:</strong> {message.metadata.recommendedAction}
              </div>
            )}
            
            {message.symptoms && message.symptoms.length > 0 && (
              <div className="mt-2">
                <div className="text-xs opacity-75 mb-1">Síntomas mencionados:</div>
                <div className="flex flex-wrap gap-1">
                  {message.symptoms.map((symptom, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs opacity-50 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente de escritura
  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <Bot size={16} className="text-gray-600" />
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-lg">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={`flex flex-col h-full ${className}`} padding="none">
      {/* Header */}
      <div className={`
        p-4 border-b border-gray-200 
        ${emergencyMode ? 'bg-red-50 border-red-200' : 'bg-gray-50'}
      `}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Asistente Médico Gastroenterológico
            </h2>
            <p className="text-sm text-gray-600">
              {emergencyMode 
                ? '🚨 Modo de emergencia activado' 
                : 'Describe tus síntomas para recibir orientación médica'
              }
            </p>
          </div>
          
          {emergencyMode && (
            <Button 
              variant="danger" 
              size="sm"
              leftIcon={<Phone size={16} />}
              onClick={() => window.location.href = '/emergency'}
            >
              Contactar Emergencias
            </Button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">Error de conexión</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <Button 
              variant="tertiary" 
              size="sm" 
              onClick={clearError}
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        )}

        {!currentSession && (
          <div className="text-center py-8">
            <Bot size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Iniciando consulta médica...</p>
          </div>
        )}

        {currentSession && messages.length === 0 && (
          <div className="text-center py-8">
            <Bot size={48} className="mx-auto text-blue-600 mb-4" />
            <p className="text-gray-900 font-medium mb-2">
              ¡Hola! Soy tu asistente médico gastroenterológico.
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Puedo ayudarte a entender síntomas gastrointestinales y orientarte sobre cuándo buscar atención médica.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
              <p className="text-yellow-800 text-xs">
                <strong>Importante:</strong> Esta información es solo orientativa y no reemplaza la consulta médica profesional.
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                emergencyMode 
                  ? "Describe tu emergencia médica (presiona Enter para enviar)"
                  : "Describe tus síntomas o haz una pregunta médica..."
              }
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${emergencyMode ? 'border-red-300 focus:ring-red-500' : ''}
              `}
              rows={2}
              maxLength={1000}
              disabled={!currentSession || isLoading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {input.length}/1000 caracteres • Presiona Shift+Enter para nueva línea
            </div>
          </div>
          
          <Button
            type="submit"
            variant={emergencyMode ? "danger" : "primary"}
            disabled={!input.trim() || !currentSession || isLoading}
            loading={isLoading}
            leftIcon={<Send size={16} />}
          >
            Enviar
          </Button>
        </form>

        <div className="mt-2 text-xs text-gray-500 text-center">
          🔒 Conversación privada y segura • HIPAA Compatible
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
