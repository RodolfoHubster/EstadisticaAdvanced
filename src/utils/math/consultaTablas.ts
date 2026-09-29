/**
 * Consulta tipada de tablasCriticas.json (base de datos local de valores críticos).
 *
 * Cada consulta busca primero el valor tabulado; si la combinación de parámetros
 * no está en la tabla, lo calcula con el motor de distribuciones. El campo `origen`
 * permite indicar al alumno de dónde proviene cada valor.
 */
import datos from './tablasCriticas.json';
import {
  cuantilChiCuadrada,
  cuantilF,
  cuantilNormal,
  cuantilRangoEstudentizado,
  cuantilT,
} from './distribuciones';

export type GradosLibertad = number | 'inf';

export interface FilaTabla {
  gl: GradosLibertad;
  valores: number[];
}

export interface TablaPorAlfa {
  descripcion: string;
  alfas: number[];
  filas: FilaTabla[];
}

export interface TablaFisher {
  alfa: number;
  descripcion: string;
  gl1: number[];
  filas: { gl2: GradosLibertad; valores: number[] }[];
}

export interface TablaRangoEstudentizado {
  alfa: number;
  descripcion: string;
  k: number[];
  filas: FilaTabla[];
}

export interface TablasCriticas {
  metadatos: {
    titulo: string;
    version: string;
    generado: string;
    convencion: string;
    generadoPor: string;
    referencias: string[];
  };
  normal: {
    criticos: { descripcion: string; alfas: number[]; valores: number[] };
    acumulada: { descripcion: string; columnas: number[]; filas: { z: string; valores: number[] }[] };
  };
  tStudent: TablaPorAlfa;
  chiCuadrada: TablaPorAlfa;
  fisher: TablaFisher[];
  rangoEstudentizado: TablaRangoEstudentizado[];
}

export const TABLAS_CRITICAS = datos as unknown as TablasCriticas;

export type OrigenValor = 'tabla' | 'motor';

export interface ValorCritico {
  valor: number;
  origen: OrigenValor;
}

const TOLERANCIA = 1e-9;

function iguales(a: number, b: number): boolean {
  return Math.abs(a - b) < TOLERANCIA;
}

function coincideGl(tabulado: GradosLibertad, gl: number): boolean {
  return tabulado === 'inf' ? !Number.isFinite(gl) : iguales(tabulado, gl);
}

/** Valor z_alfa con área alfa a la derecha. */
export function valorCriticoZ(alfaCola: number): ValorCritico {
  const { alfas, valores } = TABLAS_CRITICAS.normal.criticos;
  const indice = alfas.findIndex((a) => iguales(a, alfaCola));
  if (indice >= 0) return { valor: valores[indice], origen: 'tabla' };
  return { valor: cuantilNormal(1 - alfaCola), origen: 'motor' };
}

/** Valor t_alfa(gl) con área alfa a la derecha. */
export function valorCriticoT(alfaCola: number, gl: number): ValorCritico {
  const tabla = TABLAS_CRITICAS.tStudent;
  const columna = tabla.alfas.findIndex((a) => iguales(a, alfaCola));
  const fila = tabla.filas.find((f) => coincideGl(f.gl, gl));
  if (columna >= 0 && fila) return { valor: fila.valores[columna], origen: 'tabla' };
  const valor = Number.isFinite(gl) ? cuantilT(1 - alfaCola, gl) : cuantilNormal(1 - alfaCola);
  return { valor, origen: 'motor' };
}

/** Valor chi2_alfa(gl) con área alfa a la derecha. */
export function valorCriticoChiCuadrada(alfaCola: number, gl: number): ValorCritico {
  const tabla = TABLAS_CRITICAS.chiCuadrada;
  const columna = tabla.alfas.findIndex((a) => iguales(a, alfaCola));
  const fila = tabla.filas.find((f) => coincideGl(f.gl, gl));
  if (columna >= 0 && fila) return { valor: fila.valores[columna], origen: 'tabla' };
  return { valor: cuantilChiCuadrada(1 - alfaCola, gl), origen: 'motor' };
}

/** Valor f_alfa(gl1, gl2) con área alfa a la derecha. */
export function valorCriticoF(alfaCola: number, gl1: number, gl2: number): ValorCritico {
  const tabla = TABLAS_CRITICAS.fisher.find((t) => iguales(t.alfa, alfaCola));
  if (tabla) {
    const columna = tabla.gl1.findIndex((g) => iguales(g, gl1));
    const fila = tabla.filas.find((f) => coincideGl(f.gl2, gl2));
    if (columna >= 0 && fila) return { valor: fila.valores[columna], origen: 'tabla' };
  }
  return { valor: cuantilF(1 - alfaCola, gl1, gl2), origen: 'motor' };
}

/** Valor q_alfa(k, gl) del rango estudentizado. */
export function valorCriticoTukey(alfa: number, k: number, gl: number): ValorCritico {
  const tabla = TABLAS_CRITICAS.rangoEstudentizado.find((t) => iguales(t.alfa, alfa));
  if (tabla) {
    const columna = tabla.k.findIndex((valor) => valor === k);
    const fila = tabla.filas.find((f) => coincideGl(f.gl, gl));
    if (columna >= 0 && fila) return { valor: fila.valores[columna], origen: 'tabla' };
  }
  return { valor: cuantilRangoEstudentizado(1 - alfa, k, gl), origen: 'motor' };
}
