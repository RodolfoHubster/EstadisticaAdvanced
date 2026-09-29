/** Representación del intervalo de confianza sobre la recta numérica. */
import { escalaLineal, etiquetaMarca, marcasEje } from './escalas';
import { Formula } from './Formula';

interface GraficaIntervaloProps {
  inferior: number;
  superior: number;
  estimador: number;
  parametro: string;
  referencia?: { valor: number; etiqueta: string };
}

const ANCHO = 640;
const ALTO = 132;
const MARGEN = 28;

export function GraficaIntervalo({ inferior, superior, estimador, parametro, referencia }: GraficaIntervaloProps) {
  const amplitud = superior - inferior || Math.abs(estimador) || 1;
  let d0 = inferior - amplitud * 0.45;
  let d1 = superior + amplitud * 0.45;
  if (referencia) {
    d0 = Math.min(d0, referencia.valor - amplitud * 0.2);
    d1 = Math.max(d1, referencia.valor + amplitud * 0.2);
  }
  const x = escalaLineal([d0, d1], [MARGEN, ANCHO - MARGEN]);
  const ejeY = 96;
  const barraY = 58;
  const marcas = marcasEje(d0, d1, 7);
  const contieneReferencia = referencia ? referencia.valor >= inferior && referencia.valor <= superior : false;

  return (
    <figure>
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-auto w-full" role="img" aria-label="Intervalo de confianza">
        <line x1={MARGEN} x2={ANCHO - MARGEN} y1={ejeY} y2={ejeY} stroke="#cccccc" />
        {marcas.map((marca) => (
          <g key={marca}>
            <line x1={x(marca)} x2={x(marca)} y1={ejeY} y2={ejeY + 4} stroke="#cccccc" />
            <text x={x(marca)} y={ejeY + 17} textAnchor="middle" className="fill-tinta-secundaria font-mono text-[10px]">
              {etiquetaMarca(marca)}
            </text>
          </g>
        ))}
        <rect x={x(inferior)} y={ejeY - 1} width={Math.max(1, x(superior) - x(inferior))} height="2" fill="#006633" opacity="0.35" />
        {referencia && (
          <g>
            <line x1={x(referencia.valor)} x2={x(referencia.valor)} y1={22} y2={ejeY} stroke="#003366" strokeDasharray="3 3" />
            <text x={x(referencia.valor)} y={16} textAnchor="middle" className="fill-uabc-azul font-mono text-[10.5px] font-semibold">
              {referencia.etiqueta}
            </text>
          </g>
        )}
        <line x1={x(inferior)} x2={x(superior)} y1={barraY} y2={barraY} stroke="#006633" strokeWidth="8" strokeLinecap="round" />
        <line x1={x(inferior)} x2={x(inferior)} y1={barraY - 12} y2={barraY + 12} stroke="#f9b233" strokeWidth="3" strokeLinecap="round" />
        <line x1={x(superior)} x2={x(superior)} y1={barraY - 12} y2={barraY + 12} stroke="#f9b233" strokeWidth="3" strokeLinecap="round" />
        <circle cx={x(estimador)} cy={barraY} r="6.5" fill="#ffffff" stroke="#006633" strokeWidth="2.5" />
        <text x={x(inferior)} y={barraY - 18} textAnchor="middle" className="fill-uabc-verde font-mono text-[11px] font-semibold">
          {etiquetaMarca(inferior)}
        </text>
        <text x={x(superior)} y={barraY - 18} textAnchor="middle" className="fill-uabc-verde font-mono text-[11px] font-semibold">
          {etiquetaMarca(superior)}
        </text>
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-tinta-secundaria">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-uabc-verde" />
          Intervalo para <Formula expresion={parametro} className="text-uabc-verde" />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-uabc-verde bg-white" />
          Estimador puntual
        </span>
        {referencia && (
          <span className="text-uabc-azul">
            {contieneReferencia
              ? `El intervalo contiene a ${referencia.etiqueta}.`
              : `El intervalo no contiene a ${referencia.etiqueta}.`}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
