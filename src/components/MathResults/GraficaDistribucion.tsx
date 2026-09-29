/**
 * Curva de densidad de la distribución de referencia con la región de rechazo
 * sombreada y el estadístico observado.
 */
import { useMemo } from 'react';
import { cuantil, densidad, type Distribucion } from '../../utils/math/distribuciones';
import type { TipoPrueba } from '../../utils/math/tipos';
import { escalaLineal, etiquetaMarca, marcasEje } from './escalas';
import { Formula } from './Formula';

interface GraficaDistribucionProps {
  distribucion: Distribucion;
  estadistico: number;
  valoresCriticos: number[];
  tipoPrueba: TipoPrueba;
  simbolo: string;
  alfa: number;
}

const ANCHO = 640;
const ALTO = 230;
const MARGEN = { izquierda: 18, derecha: 18, superior: 34, inferior: 34 };

function dominio(distribucion: Distribucion, estadistico: number, criticos: number[]): [number, number] {
  if (distribucion.tipo === 'normal' || distribucion.tipo === 't') {
    const extremo = Math.min(7, Math.max(4, Math.abs(estadistico) + 0.6, ...criticos.map((c) => Math.abs(c) + 0.6)));
    return [-extremo, extremo];
  }
  const cola = cuantil(distribucion, distribucion.tipo === 'chi2' ? 0.999 : 0.995);
  const superior = Math.max(cola, ...criticos.map((c) => c * 1.25), Math.min(estadistico * 1.1, cola * 2.5));
  return [0, superior];
}

export function GraficaDistribucion({
  distribucion,
  estadistico,
  valoresCriticos,
  tipoPrueba,
  simbolo,
  alfa,
}: GraficaDistribucionProps) {
  const datos = useMemo(() => {
    const [x0, x1] = dominio(distribucion, estadistico, valoresCriticos);
    const muestras = 260;
    const puntos = Array.from({ length: muestras + 1 }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / muestras;
      return { x, y: densidad(distribucion, x) };
    });
    const finitos = puntos.slice(2).map((p) => p.y).filter(Number.isFinite);
    const yMaximo = Math.max(...finitos) * 1.08;
    const recortados = puntos.map((p) => ({ x: p.x, y: Number.isFinite(p.y) ? Math.min(p.y, yMaximo) : yMaximo }));
    return { x0, x1, yMaximo, puntos: recortados };
  }, [distribucion, estadistico, valoresCriticos]);

  const escalaX = escalaLineal([datos.x0, datos.x1], [MARGEN.izquierda, ANCHO - MARGEN.derecha]);
  const escalaY = escalaLineal([0, datos.yMaximo], [ALTO - MARGEN.inferior, MARGEN.superior]);
  const base = ALTO - MARGEN.inferior;

  const trazo = datos.puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${escalaX(p.x).toFixed(2)},${escalaY(p.y).toFixed(2)}`).join('');
  const area = `${trazo}L${escalaX(datos.x1)},${base}L${escalaX(datos.x0)},${base}Z`;

  const segmentoRechazo = (desde: number, hasta: number) => {
    const tramo = datos.puntos.filter((p) => p.x >= desde && p.x <= hasta);
    if (tramo.length === 0) return '';
    const bordeIzquierdo = { x: desde, y: Math.min(densidad(distribucion, desde), datos.yMaximo) };
    const bordeDerecho = { x: hasta, y: Math.min(densidad(distribucion, hasta), datos.yMaximo) };
    const contorno = [bordeIzquierdo, ...tramo, bordeDerecho].filter((p) => Number.isFinite(p.y));
    return `M${escalaX(desde)},${base}${contorno.map((p) => `L${escalaX(p.x).toFixed(2)},${escalaY(p.y).toFixed(2)}`).join('')}L${escalaX(hasta)},${base}Z`;
  };

  const regiones: string[] = [];
  if (tipoPrueba === 'derecha') regiones.push(segmentoRechazo(valoresCriticos[0], datos.x1));
  else if (tipoPrueba === 'izquierda') regiones.push(segmentoRechazo(datos.x0, valoresCriticos[0]));
  else {
    regiones.push(segmentoRechazo(datos.x0, valoresCriticos[0]));
    regiones.push(segmentoRechazo(valoresCriticos[1], datos.x1));
  }

  const fueraDeRango = estadistico > datos.x1 || estadistico < datos.x0;
  const xEstadistico = escalaX(Math.min(datos.x1, Math.max(datos.x0, estadistico)));
  const yEstadistico = escalaY(Math.min(densidad(distribucion, Math.min(datos.x1, Math.max(datos.x0, estadistico))), datos.yMaximo));
  const marcas = marcasEje(datos.x0, datos.x1, 8);
  const anclaEtiqueta = xEstadistico > ANCHO - 90 ? 'end' : xEstadistico < 90 ? 'start' : 'middle';

  return (
    <figure>
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-auto w-full" role="img" aria-label="Distribución de referencia con región de rechazo">
        <path d={area} fill="#006633" fillOpacity="0.06" />
        {regiones.map((region, i) => (
          <path key={i} d={region} fill="#f9b233" fillOpacity="0.75" />
        ))}
        <path d={trazo} fill="none" stroke="#006633" strokeWidth="2" strokeLinejoin="round" />
        <line x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={base} y2={base} stroke="#cccccc" />
        {marcas.map((marca) => (
          <g key={marca}>
            <line x1={escalaX(marca)} x2={escalaX(marca)} y1={base} y2={base + 4} stroke="#cccccc" />
            <text x={escalaX(marca)} y={base + 17} textAnchor="middle" className="fill-tinta-secundaria font-mono text-[10px]">
              {etiquetaMarca(marca)}
            </text>
          </g>
        ))}
        {valoresCriticos.map((critico) => (
          <g key={critico}>
            <line x1={escalaX(critico)} x2={escalaX(critico)} y1={MARGEN.superior - 6} y2={base} stroke="#e5a322" strokeDasharray="4 3" />
            <text x={escalaX(critico)} y={MARGEN.superior - 11} textAnchor="middle" className="fill-[#9a6a0f] font-mono text-[10.5px] font-semibold">
              {critico.toFixed(3)}
            </text>
          </g>
        ))}
        <line x1={xEstadistico} x2={xEstadistico} y1={yEstadistico} y2={base} stroke="#003366" strokeWidth="2" />
        <circle cx={xEstadistico} cy={yEstadistico} r="4.5" fill="#ffffff" stroke="#003366" strokeWidth="2" />
        <text
          x={xEstadistico + (anclaEtiqueta === 'start' ? 6 : anclaEtiqueta === 'end' ? -6 : 0)}
          y={Math.max(MARGEN.superior + 4, yEstadistico - 12)}
          textAnchor={anclaEtiqueta}
          className="fill-uabc-azul font-mono text-[11px] font-semibold"
        >
          {fueraDeRango ? (estadistico > datos.x1 ? '→ ' : '← ') : ''}
          {estadistico.toFixed(3)}
        </text>
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-tinta-secundaria">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-uabc-dorado/75" />
          Región de rechazo (α = {alfa})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-uabc-azul" />
          Estadístico observado <Formula expresion={simbolo} className="text-uabc-azul" />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0 w-4 border-t border-dashed border-uabc-dorado-hover" />
          Valor crítico
        </span>
      </figcaption>
    </figure>
  );
}
