/**
 * Layout principal: encabezado institucional, navegación superior fija y
 * contenedor central sobre fondo gris claro.
 */
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../Header/Header';
import { NavegacionPrincipal } from '../Header/NavegacionPrincipal';
import { EstadoCarga } from './EstadoCarga';
import { LimiteErrores } from './LimiteErrores';

function PiePagina() {
  return (
    <footer className="border-t border-borde/70 bg-white">
      <div className="mx-auto flex max-w-contenido flex-col gap-3 px-4 py-6 text-xs text-tinta-secundaria sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>
          <span className="font-semibold text-uabc-verde">Universidad Autónoma de Baja California</span> · Facultad de
          Ciencias de la Ingeniería y Tecnología, Valle de las Palmas
        </p>
        <p className="font-mono">Estadística Avanzada · PUA plan 2021-2</p>
      </div>
    </footer>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  // Cada cambio de ruta inicia en la parte superior de la página.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <NavegacionPrincipal />
      <main className="relative flex-1">
        <div
          aria-hidden="true"
          className="papel-milimetrado pointer-events-none absolute inset-x-0 top-0 h-80 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="relative mx-auto max-w-contenido px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <LimiteErrores clave={pathname}>
            <Suspense fallback={<EstadoCarga />}>
              <Outlet />
            </Suspense>
          </LimiteErrores>
        </div>
      </main>
      <PiePagina />
    </div>
  );
}
