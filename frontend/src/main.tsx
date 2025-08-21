import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Configuración global de la aplicación
const initializeApp = () => {
  // Configurar modo de emergencia global si está habilitado
  if (import.meta.env.VITE_ENABLE_EMERGENCY_MODE === 'true') {
    console.log('🚨 Modo de emergencia habilitado');
  }

  // Configurar notificaciones
  if ('Notification' in window && import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true') {
    Notification.requestPermission();
  }

  // Configurar service worker para PWA (futuro)
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
};

// Inicializar la aplicación
initializeApp();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
