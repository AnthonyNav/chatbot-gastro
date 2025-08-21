/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores médicos profesionales (azules y verdes)
        medical: {
          primary: '#2563eb', // Azul médico
          secondary: '#059669', // Verde médico
          accent: '#0891b2', // Azul cyan
          background: '#f8fafc', // Gris muy claro
          surface: '#ffffff',
          text: {
            primary: '#1e293b',
            secondary: '#64748b',
            muted: '#94a3b8',
          },
          border: '#e2e8f0',
          emergency: '#dc2626', // Rojo para emergencias
          warning: '#f59e0b', // Ámbar para advertencias
          success: '#10b981', // Verde para éxito
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        medical: ['Source Sans Pro', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'typing': 'typing 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        typing: {
          '0%, 60%': { opacity: '1' },
          '30%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
