/** Diagrama de dispersión con recta ajustada o recta identidad. */
import { useId } from 'react';
import { ampliarDominio, escalaLineal, etiquetaMarca, marcasEje } from './escalas';

interface GraficaDispersionProps {
  puntos: { x: number; y: number }[];
  recta?: { b0: number; b1: number };
  identidad?: boolean;
  etiquetaX: string;
  etiquetaY: string;
}

const ANCHO = 640;
const ALTO = 300;
const MARGEN = { izquierda: 56, derecha: 18, superior: 16, inferior: 44 };

export function GraficaDispersion({ puntos, recta, identidad, etiquetaX, etiquetaY }: GraficaDispersionProps) {
  const idRecorte = `recorte-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const xs = puntos.map((p) => p.x);
  const ys = puntos.map((p) => p.y);
  let [x0, x1] = ampliarDominio(Math.min(...xs), Math.max(...xs));
  let [y0, y1] = ampliarDominio(Math.min(...ys), Math.max(...ys), 0.12);
  if (identidad) {
    x0 = y0 = Math.min(x0, y0);
    x1 = y1 = Math.max(x1, y1);
  }
  const escalaX = escalaLineal([x0, x1], [MARGEN.izquierda, ANCHO - MARGEN.derecha]);
  const escalaY = escalaLineal([y0, y1], [ALTO - MARGEN.inferior, MARGEN.superior]);
  const marcasX = marcasEje(x0, x1, 7);
  const marcasY = marcasEje(y0, y1, 5);

  return (
    <figure>
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-auto w-full" role="img" aria-label="Diagrama de dispersión">
        <defs>
          <clipPath id={idRecorte}>
            <rect
              x={MARGEN.izquierda}
              y={MARGEN.superior}
              width={ANCHO - MARGEN.izquierda - MARGEN.derecha}
              height={ALTO - MARGEN.superior - MARGEN.inferior}
            />
          </clipPath>
        </defs>
        {marcasY.map((marca) => (
          <g key={`y-${marca}`}>
            <line x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={escalaY(marca)} y2={escalaY(marca)} stroke="#f4f4f4" />
            <text x={MARGEN.izquierda - 8} y={escalaY(marca) + 3.5} textAnchor="end" className="fill-tinta-secundaria font-mono text-[10px]">
              {etiquetaMarca(marca)}
            </text>
          </g>
        ))}
        {marcasX.map((marca) => (
          <g key={`x-${marca}`}>
            <line x1={escalaX(marca)} x2={escalaX(marca)} y1={MARGEN.superior} y2={ALTO - MARGEN.inferior} stroke="#f4f4f4" />
            <text x={escalaX(marca)} y={ALTO - MARGEN.inferior + 16} textAnchor="middle" className="fill-tinta-secundaria font-mono text-[10px]">
              {etiquetaMarca(marca)}
            </text>
          </g>
        ))}
        <line x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={ALTO - MARGEN.inferior} y2={ALTO - MARGEN.inferior} stroke="#cccccc" />
        <line x1={MARGEN.izquierda} x2={MARGEN.izquierda} y1={MARGEN.superior} y2={ALTO - MARGEN.inferior} stroke="#cccccc" />
        <g clipPath={`url(#${idRecorte})`}>
          {identidad && (
            <line x1={escalaX(x0)} y1={escalaY(x0)} x2={escalaX(x1)} y2={escalaY(x1)} stroke="#666666" strokeDasharray="5 4" />
          )}
          {recta && (
            <line
              x1={escalaX(x0)}
              y1={escalaY(recta.b0 + recta.b1 * x0)}
              x2={escalaX(x1)}
              y2={escalaY(recta.b0 + recta.b1 * x1)}
              stroke="#e5a322"
              strokeWidth="2.5"
            />
          )}
          {puntos.map((p, i) => (
            <circle key={i} cx={escalaX(p.x)} cy={escalaY(p.y)} r="4.5" fill="#006633" fillOpacity="0.85" stroke="#ffffff" strokeWidth="1.5" />
          ))}
        </g>
        <text x={(MARGEN.izquierda + ANCHO - MARGEN.derecha) / 2} y={ALTO - 8} textAnchor="middle" className="fill-tinta text-[11px] font-medium">
          {etiquetaX}
        </text>
        <text
          transform={`translate(14 ${(MARGEN.superior + ALTO - MARGEN.inferior) / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-tinta text-[11px] font-medium"
        >
          {etiquetaY}
        </text>
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-tinta-secundaria">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-uabc-verde" />
          Observaciones (n = {puntos.length})
        </span>
        {recta && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-5 bg-uabc-dorado-hover" />
            Recta ajustada
          </span>
        )}
        {identidad && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-5 border-t border-dashed border-tinta-secundaria" />
            Ajuste perfecto (y = ŷ)
          </span>
        )}
      </figcaption>
    </figure>
  );
}
