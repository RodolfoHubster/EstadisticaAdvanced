/**
 * Evaluación genérica de pruebas de hipótesis: región de rechazo y valor p
 * para cualquier estadístico con distribución de referencia conocida.
 */
import { acumulada, cuantil, esSimetrica, supervivencia, type Distribucion } from './distribuciones';
import { ErrorCalculo, type ResultadoPrueba, type TipoPrueba } from './tipos';

export function validarAlfa(alfa: number): void {
  if (!(alfa > 0 && alfa < 1)) {
    throw new ErrorCalculo('El nivel de significancia debe estar entre 0 y 1 (exclusivo).');
  }
}

export function validarNivelConfianza(nivel: number): void {
  if (!(nivel > 0 && nivel < 1)) {
    throw new ErrorCalculo('El nivel de confianza debe estar entre 0 y 1 (exclusivo).');
  }
}

/**
 * Determina valores críticos, valor p y decisión para el estadístico observado.
 *
 * - Cola derecha: se rechaza H0 si el estadístico es mayor que el cuantil 1 - alfa.
 * - Cola izquierda: se rechaza H0 si el estadístico es menor que el cuantil alfa.
 * - Bilateral: en distribuciones simétricas se usan +/- cuantil(1 - alfa/2); en ji-cuadrada
 *   y F se usan los cuantiles alfa/2 y 1 - alfa/2, y el valor p es el doble de la cola menor.
 */
export function evaluarContraste(
  estadistico: number,
  distribucion: Distribucion,
  alfa: number,
  tipo: TipoPrueba,
): ResultadoPrueba {
  validarAlfa(alfa);
  if (Number.isNaN(estadistico)) {
    throw new ErrorCalculo('El estadístico de prueba no está definido para los datos proporcionados.');
  }

  let valoresCriticos: number[];
  let valorP: number;
  let rechazarH0: boolean;

  if (tipo === 'derecha') {
    const critico = cuantil(distribucion, 1 - alfa);
    valoresCriticos = [critico];
    valorP = supervivencia(distribucion, estadistico);
    rechazarH0 = estadistico > critico;
  } else if (tipo === 'izquierda') {
    const critico = cuantil(distribucion, alfa);
    valoresCriticos = [critico];
    valorP = acumulada(distribucion, estadistico);
    rechazarH0 = estadistico < critico;
  } else if (esSimetrica(distribucion)) {
    const critico = cuantil(distribucion, 1 - alfa / 2);
    valoresCriticos = [-critico, critico];
    valorP = Math.min(1, 2 * supervivencia(distribucion, Math.abs(estadistico)));
    rechazarH0 = Math.abs(estadistico) > critico;
  } else {
    const inferior = cuantil(distribucion, alfa / 2);
    const superior = cuantil(distribucion, 1 - alfa / 2);
    valoresCriticos = [inferior, superior];
    valorP = Math.min(1, 2 * Math.min(acumulada(distribucion, estadistico), supervivencia(distribucion, estadistico)));
    rechazarH0 = estadistico < inferior || estadistico > superior;
  }

  return { estadistico, valorP, valoresCriticos, rechazarH0, alfa, tipo, distribucion };
}
