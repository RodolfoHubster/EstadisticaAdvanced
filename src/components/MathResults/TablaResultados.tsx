import { cx } from '../../utils/clases';
import { formatearFijo, formatearNumero, formatearValorP } from '../../utils/formato';
import type { CeldaTabla, TablaResultado } from './tipos';

/**
 * Una columna numérica se muestra con decimales fijos cuando contiene al menos un valor
 * no entero; las columnas enteras (grados de libertad, conteos) se muestran sin decimales.
 */
function columnasConDecimales(tabla: TablaResultado): boolean[] {
  return tabla.columnas.map((_, j) =>
    tabla.filas.some((fila) => typeof fila[j] === 'number' && !Number.isInteger(fila[j] as number)),
  );
}

function formatearCelda(celda: CeldaTabla, esValorP: boolean, conDecimales: boolean, decimales: number): string {
  if (celda === null) return '';
  if (typeof celda === 'string') return celda;
  if (esValorP) return formatearValorP(celda);
  return conDecimales ? formatearFijo(celda, decimales) : formatearNumero(celda, decimales);
}

export function TablaResultados({ tabla, decimales }: { tabla: TablaResultado; decimales: number }) {
  const decimalesPorColumna = columnasConDecimales(tabla);
  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-uabc-verde-noche">
        <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-uabc-dorado" />
        {tabla.titulo}
      </h3>
      <div className="overflow-x-auto rounded-tarjeta border border-fondo">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="bg-fondo/70">
              {tabla.columnas.map((columna, j) => (
                <th
                  key={`${columna}-${j}`}
                  scope="col"
                  className={cx(
                    'whitespace-nowrap px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-tinta-secundaria',
                    j === 0 ? 'pl-4 text-left' : 'text-right',
                  )}
                >
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabla.filas.map((fila, i) => {
              const resaltada = tabla.filasResaltadas?.includes(i);
              return (
                <tr key={i} className={cx('border-t border-fondo', resaltada && 'bg-uabc-dorado-tenue')}>
                  {fila.map((celda, j) => (
                    <td
                      key={j}
                      className={cx(
                        'whitespace-nowrap px-3 py-2',
                        j === 0 ? 'pl-4 text-left font-medium text-tinta' : 'text-right font-mono text-[13px] text-tinta cifra',
                      )}
                    >
                      {formatearCelda(celda, Boolean(tabla.columnasValorP?.includes(j)), decimalesPorColumna[j], decimales)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {tabla.nota && <p className="mt-2 text-xs text-tinta-secundaria">{tabla.nota}</p>}
    </section>
  );
}
