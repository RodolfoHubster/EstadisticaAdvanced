/** Historial de cálculos realizados en la sesión actual del navegador. */
import { Link } from 'react-router-dom';
import { UNIDADES } from '../../data/temario';
import { limpiarHistorial, type EntradaHistorial } from '../../hooks/useHistorialSesion';
import { Icono } from '../Iconos/Icono';
import { Tarjeta } from './Tarjeta';

const formatoHora = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' });

interface TarjetaHistorialProps {
  entradas: EntradaHistorial[];
  maximo?: number;
  className?: string;
}

export function TarjetaHistorial({ entradas, maximo = 6, className }: TarjetaHistorialProps) {
  const visibles = entradas.slice(0, maximo);
  return (
    <Tarjeta
      etiqueta="Sesión actual"
      titulo="Historial de cálculos"
      icono="historial"
      className={className}
      acciones={
        entradas.length > 0 ? (
          <button type="button" onClick={limpiarHistorial} className="boton-texto text-xs text-tinta-secundaria">
            Limpiar
          </button>
        ) : undefined
      }
    >
      {visibles.length === 0 ? (
        <p className="text-sm leading-relaxed text-tinta-secundaria">
          Los cálculos que realice se registrarán aquí durante la sesión. No se solicitan ni almacenan datos personales.
        </p>
      ) : (
        <ol className="-my-2 divide-y divide-fondo">
          {visibles.map((entrada) => (
            <li key={entrada.id}>
              <Link
                to={`/calculadoras/${entrada.calculadora}`}
                className="group flex items-start gap-3 py-2.5 transition-colors hover:text-uabc-verde"
              >
                <span className="mt-0.5 shrink-0 rounded bg-uabc-verde-tenue px-1.5 py-0.5 font-mono text-[10px] font-semibold text-uabc-verde">
                  {UNIDADES.find((u) => u.numero === entrada.unidad)?.romano}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-tinta group-hover:text-uabc-verde">{entrada.titulo}</span>
                  <span className="block truncate font-mono text-xs text-tinta-secundaria">{entrada.resumen}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-tinta-secundaria">{formatoHora.format(entrada.fecha)}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      {entradas.length > maximo && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-tinta-secundaria">
          <Icono nombre="info" className="h-3.5 w-3.5" />
          Se muestran los {maximo} cálculos más recientes de {entradas.length}.
        </p>
      )}
    </Tarjeta>
  );
}
