/** Control segmentado de selección única. */
import { cx } from '../../utils/clases';
import { Formula } from '../MathResults/Formula';

export interface OpcionCampo {
  valor: string;
  etiqueta: string;
  /** Notación breve mostrada bajo la etiqueta, por ejemplo "μ ≠ μ_{0}". */
  detalle?: string;
}

interface CampoOpcionesProps {
  id: string;
  etiqueta: string;
  valor: string;
  opciones: OpcionCampo[];
  onCambio: (valor: string) => void;
  ayuda?: string;
  /** Presentación destacada para el selector de modo de la calculadora. */
  destacado?: boolean;
}

export function CampoOpciones({ id, etiqueta, valor, opciones, onCambio, ayuda, destacado = false }: CampoOpcionesProps) {
  return (
    <fieldset>
      <legend id={`${id}-leyenda`} className="mb-1.5 text-sm font-medium text-tinta">
        {etiqueta}
      </legend>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-leyenda`}
        className={cx(
          'grid auto-cols-fr grid-flow-col gap-1 rounded-tarjeta p-1',
          destacado ? 'bg-uabc-verde-noche/[0.06]' : 'bg-fondo ring-1 ring-inset ring-borde/60',
        )}
      >
        {opciones.map((opcion) => {
          const activa = opcion.valor === valor;
          return (
            <button
              key={opcion.valor}
              type="button"
              role="radio"
              aria-checked={activa}
              onClick={() => onCambio(opcion.valor)}
              className={cx(
                'flex min-w-0 flex-col items-center justify-center rounded-[7px] px-2 py-2 text-center text-sm transition-all',
                activa
                  ? destacado
                    ? 'bg-uabc-verde font-semibold text-white shadow-sm'
                    : 'bg-white font-semibold text-uabc-verde shadow-sm ring-1 ring-black/5'
                  : 'font-medium text-tinta-secundaria hover:bg-white/60 hover:text-tinta',
              )}
            >
              <span className="truncate">{opcion.etiqueta}</span>
              {opcion.detalle && (
                <Formula
                  expresion={opcion.detalle}
                  className={cx('mt-0.5 text-[11px]', activa && destacado ? 'text-uabc-verde-claro' : 'text-tinta-secundaria')}
                />
              )}
            </button>
          );
        })}
      </div>
      {ayuda && <p className="mt-1.5 text-xs text-tinta-secundaria">{ayuda}</p>}
    </fieldset>
  );
}
