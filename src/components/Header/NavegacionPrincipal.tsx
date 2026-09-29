/**
 * Panel de navegación superior. Permanece fijo al desplazarse para facilitar
 * el cambio entre módulos durante sesiones largas de estudio.
 */
import { NavLink } from 'react-router-dom';
import { cx } from '../../utils/clases';
import { Icono, type NombreIcono } from '../Iconos/Icono';

const ENLACES: { ruta: string; etiqueta: string; icono: NombreIcono; exacta?: boolean }[] = [
  { ruta: '/', etiqueta: 'Inicio', icono: 'inicio', exacta: true },
  { ruta: '/glosario', etiqueta: 'Glosario', icono: 'libro' },
  { ruta: '/formulario', etiqueta: 'Formulario', icono: 'formula' },
  { ruta: '/calculadoras', etiqueta: 'Calculadoras', icono: 'calculadora' },
  { ruta: '/tablas', etiqueta: 'Tablas', icono: 'tabla' },
];

export function NavegacionPrincipal() {
  return (
    <nav
      aria-label="Navegación principal"
      className="sticky top-0 z-30 border-b border-borde/70 bg-white/90 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-[var(--altura-nav)] max-w-contenido items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {ENLACES.map((enlace) => (
          <NavLink
            key={enlace.ruta}
            to={enlace.ruta}
            end={enlace.exacta}
            className={({ isActive }) =>
              cx(
                'inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-uabc-dorado font-semibold text-uabc-verde-noche shadow-sm'
                  : 'font-medium text-tinta-secundaria hover:bg-uabc-verde-tenue hover:text-uabc-verde',
              )
            }
          >
            <Icono nombre={enlace.icono} className="h-4 w-4" />
            {enlace.etiqueta}
          </NavLink>
        ))}
        <div className="ml-auto hidden shrink-0 items-center gap-2 pl-4 text-xs text-tinta-secundaria lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-uabc-verde opacity-30" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-uabc-verde" />
          </span>
          Motor de cálculo local en el navegador
        </div>
      </div>
    </nav>
  );
}
