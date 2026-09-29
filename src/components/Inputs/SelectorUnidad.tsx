/** Filtro por unidad del temario, sincronizado con el parámetro ?unidad= de la URL. */
import { UNIDADES, type NumeroUnidad } from '../../data/temario';
import { cx } from '../../utils/clases';

interface SelectorUnidadProps {
  valor: NumeroUnidad | null;
  onCambio: (unidad: NumeroUnidad | null) => void;
  conteos?: Partial<Record<NumeroUnidad, number>>;
}

export function SelectorUnidad({ valor, onCambio, conteos }: SelectorUnidadProps) {
  const opciones: { unidad: NumeroUnidad | null; etiqueta: string; titulo: string }[] = [
    { unidad: null, etiqueta: 'Todas', titulo: 'Todas las unidades' },
    ...UNIDADES.map((u) => ({ unidad: u.numero, etiqueta: `Unidad ${u.romano}`, titulo: u.titulo })),
  ];
  return (
    <div role="tablist" aria-label="Filtrar por unidad" className="flex flex-wrap gap-1.5">
      {opciones.map((opcion) => {
        const activa = opcion.unidad === valor;
        const conteo = opcion.unidad ? conteos?.[opcion.unidad] : undefined;
        return (
          <button
            key={opcion.etiqueta}
            type="button"
            role="tab"
            aria-selected={activa}
            title={opcion.titulo}
            onClick={() => onCambio(opcion.unidad)}
            className={cx(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors',
              activa
                ? 'border-uabc-verde bg-uabc-verde font-semibold text-white'
                : 'border-borde bg-white font-medium text-tinta-secundaria hover:border-uabc-verde hover:text-uabc-verde',
            )}
          >
            {opcion.etiqueta}
            {conteo !== undefined && (
              <span
                className={cx(
                  'rounded-full px-1.5 font-mono text-[11px]',
                  activa ? 'bg-white/20 text-white' : 'bg-fondo text-tinta-secundaria',
                )}
              >
                {conteo}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
