/**
 * Encabezado institucional: franja verde UABC de 80 px con línea inferior dorada de 5 px.
 */
import { Link } from 'react-router-dom';
import { Emblema } from './Emblema';

/** Trazo decorativo de fondo: familia de curvas de densidad t con distintos grados de libertad. */
function DecoracionDensidades() {
  const curva = (escala: number, altura: number) => {
    const puntos: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = -4 + (8 * i) / 60;
      const y = Math.exp((-x * x) / (2 * escala * escala));
      puntos.push(`${(i * 520) / 60},${80 - y * altura}`);
    }
    return `M${puntos.join(' L')}`;
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 80"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[46%] md:block"
    >
      <defs>
        <linearGradient id="desvanecido-encabezado" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#desvanecido-encabezado)" strokeWidth="1.2">
        <path d={curva(0.9, 64)} />
        <path d={curva(1.25, 50)} />
        <path d={curva(1.7, 38)} />
      </g>
      <g stroke="#f9b233" strokeOpacity="0.35" strokeWidth="1">
        <path d="M130 80V68" />
        <path d="M390 80V68" />
      </g>
    </svg>
  );
}

export function Header() {
  return (
    <header className="relative overflow-hidden border-b-encabezado border-uabc-dorado bg-uabc-verde text-white">
      <div aria-hidden="true" className="papel-milimetrado-claro absolute inset-0 opacity-60" />
      <DecoracionDensidades />
      <div className="relative mx-auto flex h-encabezado max-w-contenido items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-3.5" aria-label="Ir al inicio">
          <Emblema className="h-11 w-11 shrink-0 transition-transform duration-300 group-hover:-rotate-6" />
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold leading-tight tracking-tight sm:text-xl">
              Estadística Avanzada
            </p>
            <p className="truncate text-xs text-uabc-verde-claro">
              Sistema de Apoyo Digital · Universidad Autónoma de Baja California
            </p>
          </div>
        </Link>
        <div className="hidden shrink-0 text-right md:block">
          <p className="font-mono text-[11px] font-medium uppercase tracking-etiqueta text-uabc-dorado">
            Plan de estudios 2021-2
          </p>
          <p className="mt-0.5 text-xs text-uabc-verde-claro">Ingeniería en Software y Tecnologías Emergentes</p>
        </div>
      </div>
    </header>
  );
}
