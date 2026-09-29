/**
 * Sistema de diseño del Sistema de Apoyo Digital para Estadística Avanzada.
 * Los tokens replican la tabla de la propuesta (sección 5, Identidad visual).
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        uabc: {
          verde: '#006633',
          'verde-profundo': '#004d26',
          'verde-noche': '#00331a',
          'verde-tenue': '#e8f1ec',
          'verde-claro': '#cfe8da',
          dorado: '#f9b233',
          'dorado-hover': '#e5a322',
          'dorado-tenue': '#fff8ea',
          azul: '#003366',
        },
        fondo: '#f4f4f4',
        superficie: '#ffffff',
        tinta: {
          DEFAULT: '#333333',
          secundaria: '#666666',
        },
        borde: '#cccccc',
        estado: {
          error: '#dc3545',
          exito: '#28a745',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      borderRadius: {
        tarjeta: '10px',
        contenedor: '12px',
      },
      boxShadow: {
        tarjeta: '0 4px 8px rgba(0, 0, 0, 0.102)',
        profunda: '0 4px 10px rgba(0, 0, 0, 0.2)',
      },
      maxWidth: {
        contenido: '1400px',
      },
      height: {
        encabezado: '80px',
      },
      borderWidth: {
        encabezado: '5px',
      },
      letterSpacing: {
        etiqueta: '0.14em',
      },
    },
  },
  plugins: [],
};
