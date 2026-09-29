/**
 * Estadística descriptiva básica utilizada por los módulos de inferencia.
 */
import { ErrorCalculo } from './tipos';

export function suma(datos: readonly number[]): number {
  let total = 0;
  for (const valor of datos) total += valor;
  return total;
}

export function media(datos: readonly number[]): number {
  if (datos.length === 0) throw new ErrorCalculo('No es posible calcular la media de un conjunto vacío.');
  return suma(datos) / datos.length;
}

/** Suma de cuadrados de las desviaciones respecto a la media: sum (x_i - x_barra)^2. */
export function sumaCuadradosDesviaciones(datos: readonly number[]): number {
  const promedio = media(datos);
  let total = 0;
  for (const valor of datos) total += (valor - promedio) ** 2;
  return total;
}

/** Varianza muestral insesgada (divisor n - 1). */
export function varianzaMuestral(datos: readonly number[]): number {
  if (datos.length < 2) throw new ErrorCalculo('La varianza muestral requiere al menos dos observaciones.');
  return sumaCuadradosDesviaciones(datos) / (datos.length - 1);
}

/** Desviación estándar muestral (divisor n - 1). */
export function desviacionEstandar(datos: readonly number[]): number {
  return Math.sqrt(varianzaMuestral(datos));
}

/** Copia ordenada de forma ascendente. */
export function ordenar(datos: readonly number[]): number[] {
  return [...datos].sort((a, b) => a - b);
}

/**
 * Rangos de las observaciones (1 = menor). Los empates reciben el rango promedio.
 * Devuelve también la suma de t^3 - t sobre los grupos de empates, necesaria
 * para las correcciones por empates de las pruebas no paramétricas.
 */
export function rangos(datos: readonly number[]): { rangos: number[]; correccionEmpates: number } {
  const indices = datos.map((valor, indice) => ({ valor, indice })).sort((a, b) => a.valor - b.valor);
  const resultado = new Array<number>(datos.length);
  let correccionEmpates = 0;
  let i = 0;
  while (i < indices.length) {
    let j = i;
    while (j + 1 < indices.length && indices[j + 1].valor === indices[i].valor) j++;
    const rangoPromedio = (i + j + 2) / 2;
    for (let m = i; m <= j; m++) resultado[indices[m].indice] = rangoPromedio;
    const empatados = j - i + 1;
    if (empatados > 1) correccionEmpates += empatados ** 3 - empatados;
    i = j + 1;
  }
  return { rangos: resultado, correccionEmpates };
}
