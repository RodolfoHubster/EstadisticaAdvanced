import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rutas relativas: el sitio funciona en GitHub Pages bajo /<repositorio>/ y en el
  // servidor de la Facultad sin reconfigurar. El enrutamiento usa HashRouter.
  base: './',
});
