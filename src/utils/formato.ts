/**
 * Formato numérico para la presentación de resultados (configuración regional es-MX).
 */

const formateadores = new Map<string, Intl.NumberFormat>();

const SUPERINDICES: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

function superindice(texto: string): string {
  return [...texto].map((caracter) => SUPERINDICES[caracter] ?? caracter).join('');
}

function formateador(decimales: number, fijo: boolean): Intl.NumberFormat {
  const clave = `${decimales}-${fijo}`;
  let resultado = formateadores.get(clave);
  if (!resultado) {
    resultado = new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: fijo ? decimales : 0,
      maximumFractionDigits: decimales,
    });
    formateadores.set(clave, resultado);
  }
  return resultado;
}

/** Función que convierte un número en texto con una precisión dada. */
export type Formateador = (valor: number) => string;

/**
 * Formatea un número. Los enteros se muestran sin decimales; el resto con
 * `decimales` cifras fijas. Magnitudes menores a la precisión se muestran en notación científica.
 */
export function formatearNumero(valor: number, decimales = 4): string {
  if (Number.isNaN(valor)) return 'no definido';
  if (valor === Infinity) return '∞';
  if (valor === -Infinity) return '−∞';
  if (Number.isInteger(valor)) return formateador(0, false).format(valor);
  if (Math.abs(valor) < 0.5 * 10 ** -decimales) {
    const [mantisa, exponente] = valor.toExponential(Math.min(3, decimales)).split('e');
    return `${mantisa} × 10${superindice(String(Number(exponente)))}`;
  }
  return formateador(decimales, true).format(valor);
}

/** Formatea con decimales fijos incluso los enteros (para alinear columnas de tablas). */
export function formatearFijo(valor: number, decimales = 4): string {
  if (Number.isInteger(valor)) return formateador(decimales, true).format(valor);
  return formatearNumero(valor, decimales);
}

/** Formatea un valor p; los valores menores que 0.0001 se reportan como cota. */
export function formatearValorP(p: number): string {
  if (Number.isNaN(p)) return 'no definido';
  if (p < 0.0001) return '< 0.0001';
  return formateador(4, true).format(p);
}

/** Formatea una proporción como porcentaje: 0.95 -> "95%". */
export function formatearPorcentaje(proporcion: number): string {
  return `${formateador(2, false).format(proporcion * 100)}%`;
}

/** Crea un formateador con precisión fija para usarse en textos interpretativos. */
export function crearFormateador(decimales: number): Formateador {
  return (valor: number) => formatearNumero(valor, decimales);
}
