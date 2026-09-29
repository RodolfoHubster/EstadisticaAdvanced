/**
 * Tarjeta base del sistema: superficie blanca, radio de 10 px y sombra general
 * 0 4px 8px rgba(0,0,0,.102), según los tokens de la propuesta.
 */
import type { ReactNode } from 'react';
import { cx } from '../../utils/clases';
import { Icono, type NombreIcono } from '../Iconos/Icono';

interface TarjetaProps {
  titulo?: ReactNode;
  etiqueta?: string;
  icono?: NombreIcono;
  acciones?: ReactNode;
  /** Franja lateral de acento, como en el selector de unidades del prototipo. */
  acento?: 'verde' | 'dorado';
  children: ReactNode;
  className?: string;
  /** Sustituye las clases de relleno predeterminadas del cuerpo. */
  cuerpoClassName?: string;
  as?: 'section' | 'article' | 'div' | 'aside';
}

export function Tarjeta({
  titulo,
  etiqueta,
  icono,
  acciones,
  acento,
  children,
  className,
  cuerpoClassName,
  as: Elemento = 'section',
}: TarjetaProps) {
  const tieneEncabezado = Boolean(titulo || etiqueta || acciones);
  return (
    <Elemento
      className={cx(
        'relative overflow-hidden rounded-tarjeta bg-superficie shadow-tarjeta ring-1 ring-black/[0.035]',
        className,
      )}
    >
      {acento && (
        <span
          aria-hidden="true"
          className={cx('absolute inset-y-0 left-0 w-[5px]', acento === 'verde' ? 'bg-uabc-verde' : 'bg-uabc-dorado')}
        />
      )}
      {tieneEncabezado && (
        <header className="flex items-start justify-between gap-4 border-b border-fondo px-5 pb-4 pt-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            {icono && (
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-uabc-verde-tenue text-uabc-verde">
                <Icono nombre={icono} className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              {etiqueta && <p className="etiqueta-seccion">{etiqueta}</p>}
              {titulo && <h2 className="mt-0.5 text-[15px] font-semibold text-uabc-verde-noche">{titulo}</h2>}
            </div>
          </div>
          {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
        </header>
      )}
      <div className={cuerpoClassName ?? 'px-5 py-5 sm:px-6'}>{children}</div>
    </Elemento>
  );
}
