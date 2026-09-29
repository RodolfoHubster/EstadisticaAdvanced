/**
 * Enrutamiento de la aplicación. Se usa HashRouter para que el sitio estático
 * funcione en GitHub Pages y en el servidor de la Facultad sin reglas de reescritura.
 * Cada página se carga bajo demanda para reducir el tiempo de carga inicial.
 */
import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Glosario = lazy(() => import('./pages/Glosario/Glosario'));
const Formulario = lazy(() => import('./pages/Formulario/Formulario'));
const Calculadoras = lazy(() => import('./pages/Calculadoras/Calculadoras'));
const CalculadoraView = lazy(() => import('./pages/Calculadoras/CalculadoraView'));
const Tablas = lazy(() => import('./pages/Tablas/Tablas'));
const NoEncontrado = lazy(() => import('./pages/NoEncontrado'));

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="glosario" element={<Glosario />} />
          <Route path="formulario" element={<Formulario />} />
          <Route path="calculadoras" element={<Calculadoras />} />
          <Route path="calculadoras/:calculadoraId" element={<CalculadoraView />} />
          <Route path="tablas" element={<Tablas />} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
