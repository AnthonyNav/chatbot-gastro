/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_ENABLE_EMERGENCY_MODE: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_EMERGENCY_PHONE: string;
  readonly VITE_POISON_CONTROL: string;
  readonly VITE_CRUZ_ROJA: string;
  readonly VITE_HIPAA_COMPLIANCE: string;
  readonly VITE_ENCRYPTION_ENABLED: string;
  readonly VITE_DEFAULT_THEME: string;
  readonly VITE_ENABLE_DARK_MODE: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_MOCK_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
