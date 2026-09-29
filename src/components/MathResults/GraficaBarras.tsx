/** Gráfica de barras agrupadas (hasta cuatro series con colores distintos). */
import { escalaLineal, etiquetaMarca, marcasEje } from './escalas';

interface GraficaBarrasProps {
  categorias: string[];
  series: { nombre: string; valores: number[] }[];
  etiquetaY: string;
}

const ANCHO = 640;
const ALTO = 260;
const MARGEN = { izquierda: 52, derecha: 12, superior: 14, inferior: 40 };
const COLORES = ['#006633', '#f9b233', '#003366', '#8fbfa3'];

export function GraficaBarras({ categorias, series, etiquetaY }: GraficaBarrasProps) {
  const valores = series.flatMap((s) => s.valores);
  const minimo = Math.min(0, ...valores);
  const maximo = Math.max(...valores) * 1.1 || 1;
  const marcas = marcasEje(minimo, maximo, 5);
  const y = escalaLineal([minimo, marcas[marcas.length - 1] ?? maximo], [ALTO - MARGEN.inferior, MARGEN.superior]);
  const anchoGrupo = (ANCHO - MARGEN.izquierda - MARGEN.derecha) / categorias.length;
  const anchoBarra = Math.min(34, (anchoGrupo * 0.72) / series.length);

  return (
    <figure>
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-auto w-full" role="img" aria-label={etiquetaY}>
        {marcas.map((marca) => (
          <g key={marca}>
            <line x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={y(marca)} y2={y(marca)} stroke="#f4f4f4" />
            <text x={MARGEN.izquierda - 8} y={y(marca) + 3.5} textAnchor="end" className="fill-tinta-secundaria font-mono text-[10px]">
              {etiquetaMarca(marca)}
            </text>
          </g>
        ))}
        {categorias.map((categoria, i) => {
          const centro = MARGEN.izquierda + anchoGrupo * (i + 0.5);
          const inicio = centro - (anchoBarra * series.length) / 2;
          return (
            <g key={categoria}>
              {series.map((serie, j) => {
                const valor = serie.valores[i];
                const alto = Math.abs(y(valor) - y(0));
                return (
                  <rect
                    key={serie.nombre}
                    x={inicio + j * anchoBarra + 1}
                    y={Math.min(y(valor), y(0))}
                    width={anchoBarra - 2}
                    height={alto}
                    rx="3"
                    fill={COLORES[j % COLORES.length]}
                  />
                );
              })}
              <text x={centro} y={ALTO - MARGEN.inferior + 16} textAnchor="middle" className="fill-tinta-secundaria text-[10.5px]">
                {categoria.length > 14 ? `${categoria.slice(0, 13)}…` : categoria}
              </text>
            </g>
          );
        })}
        <line x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={y(0)} y2={y(0)} stroke="#cccccc" />
        <text
          transform={`translate(12 ${(MARGEN.superior + ALTO - MARGEN.inferior) / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-tinta text-[11px] font-medium"
        >
          {etiquetaY}
        </text>
      </svg>
      {series.length > 1 && (
        <figcaption className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-tinta-secundaria">
          {series.map((serie, j) => (
            <span key={serie.nombre} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: COLORES[j % COLORES.length] }} />
              {serie.nombre}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
