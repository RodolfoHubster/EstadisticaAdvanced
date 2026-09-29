/**
 * Unidad I. Métodos de inferencia estadística.
 *
 * Fórmulas directas para intervalos de confianza y pruebas de hipótesis
 * de los temas 1.3 a 1.9 del Programa de Unidad de Aprendizaje (plan 2021-2).
 * Todas las funciones operan con estadísticos resumidos; las muestras pareadas
 * aceptan directamente los datos observados.
 *
 * Referencia principal: Walpole, Myers, Myers y Ye (2012), caps. 9 y 10.
 */
import { validarAlfa, validarNivelConfianza, evaluarContraste } from './contraste';
import { media, desviacionEstandar } from './descriptiva';
import { cuantilChiCuadrada, cuantilF, cuantilNormal, cuantilT } from './distribuciones';
import { ErrorCalculo, type IntervaloConfianza, type ResultadoPrueba, type TipoPrueba } from './tipos';

/* -------------------------------------------------------------------------- */
/* Tipos de entrada                                                            */
/* -------------------------------------------------------------------------- */

/** Estadísticos resumidos de una muestra. */
export interface MuestraResumida {
  n: number;
  media: number;
  /** Desviación estándar: poblacional (sigma) si se conoce, muestral (s) en otro caso. */
  desviacion: number;
}

export interface MuestraProporcion {
  n: number;
  /** Número de éxitos observados en la muestra. */
  exitos: number;
}

export interface MuestraVarianza {
  n: number;
  /** Varianza muestral s^2. */
  varianza: number;
}

export interface ParametrosPrueba {
  alfa: number;
  tipo: TipoPrueba;
}

/* -------------------------------------------------------------------------- */
/* Validaciones                                                                */
/* -------------------------------------------------------------------------- */

function validarTamano(n: number, minimo: number, nombre = 'n'): void {
  if (!Number.isInteger(n) || n < minimo) {
    throw new ErrorCalculo(`El tamaño de muestra ${nombre} debe ser un entero mayor o igual que ${minimo}.`);
  }
}

function validarPositivo(valor: number, descripcion: string): void {
  if (!(valor > 0) || !Number.isFinite(valor)) {
    throw new ErrorCalculo(`${descripcion} debe ser un número positivo.`);
  }
}

function validarMuestra(muestra: MuestraResumida, sufijo = ''): void {
  validarTamano(muestra.n, 2, `n${sufijo}`);
  validarPositivo(muestra.desviacion, `La desviación estándar${sufijo ? ` de la muestra ${sufijo}` : ''}`);
}

function validarProporcion(muestra: MuestraProporcion, sufijo = ''): void {
  validarTamano(muestra.n, 1, `n${sufijo}`);
  if (!Number.isInteger(muestra.exitos) || muestra.exitos < 0 || muestra.exitos > muestra.n) {
    throw new ErrorCalculo(`El número de éxitos x${sufijo} debe ser un entero entre 0 y n${sufijo}.`);
  }
}

/* -------------------------------------------------------------------------- */
/* Construcción de intervalos simétricos                                       */
/* -------------------------------------------------------------------------- */

function intervaloSimetrico(
  estimador: number,
  errorEstandar: number,
  valorCritico: number,
  nivelConfianza: number,
  distribucion: IntervaloConfianza['distribucion'],
): IntervaloConfianza {
  const margenError = valorCritico * errorEstandar;
  return {
    estimador,
    limiteInferior: estimador - margenError,
    limiteSuperior: estimador + margenError,
    nivelConfianza,
    valoresCriticos: [valorCritico],
    distribucion,
    errorEstandar,
    margenError,
  };
}

/* -------------------------------------------------------------------------- */
/* 1.3.1 Media, muestras grandes (distribución normal)                         */
/* -------------------------------------------------------------------------- */

/** Intervalo x_barra +/- z_(alfa/2) * sigma / sqrt(n). */
export function intervaloMediaZ(muestra: MuestraResumida, nivelConfianza: number): IntervaloConfianza {
  validarMuestra(muestra);
  validarNivelConfianza(nivelConfianza);
  const z = cuantilNormal(1 - (1 - nivelConfianza) / 2);
  const errorEstandar = muestra.desviacion / Math.sqrt(muestra.n);
  return intervaloSimetrico(muestra.media, errorEstandar, z, nivelConfianza, { tipo: 'normal' });
}

/** Prueba Z para la media: z = (x_barra - mu0) / (sigma / sqrt(n)). */
export function pruebaMediaZ(muestra: MuestraResumida, mu0: number, parametros: ParametrosPrueba): ResultadoPrueba {
  validarMuestra(muestra);
  const errorEstandar = muestra.desviacion / Math.sqrt(muestra.n);
  const z = (muestra.media - mu0) / errorEstandar;
  return { ...evaluarContraste(z, { tipo: 'normal' }, parametros.alfa, parametros.tipo), errorEstandar };
}

/* -------------------------------------------------------------------------- */
/* 1.3.2 Media, muestras pequeñas (distribución t de Student)                  */
/* -------------------------------------------------------------------------- */

/** Intervalo x_barra +/- t_(alfa/2, n-1) * s / sqrt(n). */
export function intervaloMediaT(muestra: MuestraResumida, nivelConfianza: number): IntervaloConfianza {
  validarMuestra(muestra);
  validarNivelConfianza(nivelConfianza);
  const gl = muestra.n - 1;
  const t = cuantilT(1 - (1 - nivelConfianza) / 2, gl);
  const errorEstandar = muestra.desviacion / Math.sqrt(muestra.n);
  return intervaloSimetrico(muestra.media, errorEstandar, t, nivelConfianza, { tipo: 't', gl });
}

/** Prueba t para la media: t = (x_barra - mu0) / (s / sqrt(n)), con n - 1 grados de libertad. */
export function pruebaMediaT(muestra: MuestraResumida, mu0: number, parametros: ParametrosPrueba): ResultadoPrueba {
  validarMuestra(muestra);
  const errorEstandar = muestra.desviacion / Math.sqrt(muestra.n);
  const t = (muestra.media - mu0) / errorEstandar;
  return {
    ...evaluarContraste(t, { tipo: 't', gl: muestra.n - 1 }, parametros.alfa, parametros.tipo),
    errorEstandar,
  };
}

/* -------------------------------------------------------------------------- */
/* 1.4 Proporción, muestras grandes                                            */
/* -------------------------------------------------------------------------- */

/** Intervalo p_gorro +/- z_(alfa/2) * sqrt(p_gorro (1 - p_gorro) / n). */
export function intervaloProporcion(muestra: MuestraProporcion, nivelConfianza: number): IntervaloConfianza {
  validarProporcion(muestra);
  validarNivelConfianza(nivelConfianza);
  const p = muestra.exitos / muestra.n;
  const z = cuantilNormal(1 - (1 - nivelConfianza) / 2);
  const errorEstandar = Math.sqrt((p * (1 - p)) / muestra.n);
  return intervaloSimetrico(p, errorEstandar, z, nivelConfianza, { tipo: 'normal' });
}

/** Prueba Z para la proporción: z = (p_gorro - p0) / sqrt(p0 (1 - p0) / n). */
export function pruebaProporcion(muestra: MuestraProporcion, p0: number, parametros: ParametrosPrueba): ResultadoPrueba {
  validarProporcion(muestra);
  if (!(p0 > 0 && p0 < 1)) throw new ErrorCalculo('La proporción hipotética p0 debe estar entre 0 y 1 (exclusivo).');
  const errorEstandar = Math.sqrt((p0 * (1 - p0)) / muestra.n);
  const z = (muestra.exitos / muestra.n - p0) / errorEstandar;
  return { ...evaluarContraste(z, { tipo: 'normal' }, parametros.alfa, parametros.tipo), errorEstandar };
}

/* -------------------------------------------------------------------------- */
/* 1.5 Varianza (distribución ji-cuadrada)                                     */
/* -------------------------------------------------------------------------- */

export interface IntervaloVarianza extends IntervaloConfianza {
  /** Intervalo correspondiente para la desviación estándar sigma. */
  desviacionInferior: number;
  desviacionSuperior: number;
}

/** Intervalo (n-1)s^2 / chi2_(alfa/2) < sigma^2 < (n-1)s^2 / chi2_(1-alfa/2). */
export function intervaloVarianza(muestra: MuestraVarianza, nivelConfianza: number): IntervaloVarianza {
  validarTamano(muestra.n, 2);
  validarPositivo(muestra.varianza, 'La varianza muestral');
  validarNivelConfianza(nivelConfianza);
  const gl = muestra.n - 1;
  const alfa = 1 - nivelConfianza;
  const chiSuperior = cuantilChiCuadrada(1 - alfa / 2, gl);
  const chiInferior = cuantilChiCuadrada(alfa / 2, gl);
  const limiteInferior = (gl * muestra.varianza) / chiSuperior;
  const limiteSuperior = (gl * muestra.varianza) / chiInferior;
  return {
    estimador: muestra.varianza,
    limiteInferior,
    limiteSuperior,
    nivelConfianza,
    valoresCriticos: [chiSuperior, chiInferior],
    distribucion: { tipo: 'chi2', gl },
    desviacionInferior: Math.sqrt(limiteInferior),
    desviacionSuperior: Math.sqrt(limiteSuperior),
  };
}

/** Prueba ji-cuadrada para la varianza: chi2 = (n-1)s^2 / sigma0^2, con n - 1 grados de libertad. */
export function pruebaVarianza(muestra: MuestraVarianza, varianza0: number, parametros: ParametrosPrueba): ResultadoPrueba {
  validarTamano(muestra.n, 2);
  validarPositivo(muestra.varianza, 'La varianza muestral');
  validarPositivo(varianza0, 'La varianza hipotética');
  const gl = muestra.n - 1;
  const chi2 = (gl * muestra.varianza) / varianza0;
  return evaluarContraste(chi2, { tipo: 'chi2', gl }, parametros.alfa, parametros.tipo);
}

/* -------------------------------------------------------------------------- */
/* 1.6.1 Diferencia de medias, varianzas conocidas                             */
/* -------------------------------------------------------------------------- */

/** Intervalo (x1 - x2) +/- z_(alfa/2) * sqrt(sigma1^2/n1 + sigma2^2/n2). */
export function intervaloDiferenciaMediasZ(
  muestra1: MuestraResumida,
  muestra2: MuestraResumida,
  nivelConfianza: number,
): IntervaloConfianza {
  validarMuestra(muestra1, '1');
  validarMuestra(muestra2, '2');
  validarNivelConfianza(nivelConfianza);
  const z = cuantilNormal(1 - (1 - nivelConfianza) / 2);
  const errorEstandar = Math.sqrt(muestra1.desviacion ** 2 / muestra1.n + muestra2.desviacion ** 2 / muestra2.n);
  return intervaloSimetrico(muestra1.media - muestra2.media, errorEstandar, z, nivelConfianza, { tipo: 'normal' });
}

/** Prueba Z para mu1 - mu2 = d0 con varianzas poblacionales conocidas. */
export function pruebaDiferenciaMediasZ(
  muestra1: MuestraResumida,
  muestra2: MuestraResumida,
  d0: number,
  parametros: ParametrosPrueba,
): ResultadoPrueba {
  validarMuestra(muestra1, '1');
  validarMuestra(muestra2, '2');
  const errorEstandar = Math.sqrt(muestra1.desviacion ** 2 / muestra1.n + muestra2.desviacion ** 2 / muestra2.n);
  const z = (muestra1.media - muestra2.media - d0) / errorEstandar;
  return { ...evaluarContraste(z, { tipo: 'normal' }, parametros.alfa, parametros.tipo), errorEstandar };
}

/* -------------------------------------------------------------------------- */
/* 1.6.2 Diferencia de medias, varianzas desconocidas                          */
/* -------------------------------------------------------------------------- */

export interface DetalleDosMuestrasT {
  /** Grados de libertad utilizados (Welch-Satterthwaite redondeado hacia abajo, o n1 + n2 - 2). */
  gl: number;
  /** Grados de libertad exactos de Welch-Satterthwaite (solo con varianzas distintas). */
  glExactos?: number;
  /** Desviación estándar combinada s_p (solo con varianzas iguales). */
  desviacionCombinada?: number;
  errorEstandar: number;
}

function detalleDosMuestrasT(
  muestra1: MuestraResumida,
  muestra2: MuestraResumida,
  varianzasIguales: boolean,
): DetalleDosMuestrasT {
  validarMuestra(muestra1, '1');
  validarMuestra(muestra2, '2');
  const v1 = muestra1.desviacion ** 2;
  const v2 = muestra2.desviacion ** 2;
  if (varianzasIguales) {
    const gl = muestra1.n + muestra2.n - 2;
    const desviacionCombinada = Math.sqrt(((muestra1.n - 1) * v1 + (muestra2.n - 1) * v2) / gl);
    const errorEstandar = desviacionCombinada * Math.sqrt(1 / muestra1.n + 1 / muestra2.n);
    return { gl, desviacionCombinada, errorEstandar };
  }
  const a = v1 / muestra1.n;
  const b = v2 / muestra2.n;
  const glExactos = (a + b) ** 2 / (a ** 2 / (muestra1.n - 1) + b ** 2 / (muestra2.n - 1));
  // Se redondea hacia abajo, como en las tablas del texto, para obtener un intervalo conservador.
  const gl = Math.max(1, Math.floor(glExactos));
  return { gl, glExactos, errorEstandar: Math.sqrt(a + b) };
}

/**
 * Intervalo para mu1 - mu2 con varianzas desconocidas.
 * Con varianzas iguales usa la varianza combinada s_p^2; en caso contrario, la aproximación de Welch.
 */
export function intervaloDiferenciaMediasT(
  muestra1: MuestraResumida,
  muestra2: MuestraResumida,
  nivelConfianza: number,
  varianzasIguales: boolean,
): IntervaloConfianza & DetalleDosMuestrasT {
  validarNivelConfianza(nivelConfianza);
  const detalle = detalleDosMuestrasT(muestra1, muestra2, varianzasIguales);
  const t = cuantilT(1 - (1 - nivelConfianza) / 2, detalle.gl);
  return {
    ...intervaloSimetrico(muestra1.media - muestra2.media, detalle.errorEstandar, t, nivelConfianza, {
      tipo: 't',
      gl: detalle.gl,
    }),
    ...detalle,
  };
}

/** Prueba t para mu1 - mu2 = d0 con varianzas desconocidas (combinada o Welch). */
export function pruebaDiferenciaMediasT(
  muestra1: MuestraResumida,
  muestra2: MuestraResumida,
  d0: number,
  parametros: ParametrosPrueba,
  varianzasIguales: boolean,
): ResultadoPrueba & DetalleDosMuestrasT {
  const detalle = detalleDosMuestrasT(muestra1, muestra2, varianzasIguales);
  const t = (muestra1.media - muestra2.media - d0) / detalle.errorEstandar;
  return {
    ...evaluarContraste(t, { tipo: 't', gl: detalle.gl }, parametros.alfa, parametros.tipo),
    ...detalle,
  };
}

/* -------------------------------------------------------------------------- */
/* 1.7 Diferencia de dos proporciones                                          */
/* -------------------------------------------------------------------------- */

/** Intervalo (p1 - p2) +/- z_(alfa/2) * sqrt(p1 q1 / n1 + p2 q2 / n2). */
export function intervaloDiferenciaProporciones(
  muestra1: MuestraProporcion,
  muestra2: MuestraProporcion,
  nivelConfianza: number,
): IntervaloConfianza {
  validarProporcion(muestra1, '1');
  validarProporcion(muestra2, '2');
  validarNivelConfianza(nivelConfianza);
  const p1 = muestra1.exitos / muestra1.n;
  const p2 = muestra2.exitos / muestra2.n;
  const z = cuantilNormal(1 - (1 - nivelConfianza) / 2);
  const errorEstandar = Math.sqrt((p1 * (1 - p1)) / muestra1.n + (p2 * (1 - p2)) / muestra2.n);
  return intervaloSimetrico(p1 - p2, errorEstandar, z, nivelConfianza, { tipo: 'normal' });
}

/**
 * Prueba Z para H0: p1 = p2 con proporción combinada
 * p_gorro = (x1 + x2) / (n1 + n2).
 */
export function pruebaDiferenciaProporciones(
  muestra1: MuestraProporcion,
  muestra2: MuestraProporcion,
  parametros: ParametrosPrueba,
): ResultadoPrueba & { proporcionCombinada: number } {
  validarProporcion(muestra1, '1');
  validarProporcion(muestra2, '2');
  const proporcionCombinada = (muestra1.exitos + muestra2.exitos) / (muestra1.n + muestra2.n);
  const errorEstandar = Math.sqrt(proporcionCombinada * (1 - proporcionCombinada) * (1 / muestra1.n + 1 / muestra2.n));
  if (errorEstandar === 0) {
    throw new ErrorCalculo('La proporción combinada es 0 o 1; el estadístico Z no está definido.');
  }
  const z = (muestra1.exitos / muestra1.n - muestra2.exitos / muestra2.n) / errorEstandar;
  return {
    ...evaluarContraste(z, { tipo: 'normal' }, parametros.alfa, parametros.tipo),
    errorEstandar,
    proporcionCombinada,
  };
}

/* -------------------------------------------------------------------------- */
/* 1.8 Cociente de dos varianzas (distribución F)                              */
/* -------------------------------------------------------------------------- */

/**
 * Intervalo (s1^2/s2^2) / f_(alfa/2)(v1, v2) < sigma1^2/sigma2^2 < (s1^2/s2^2) * f_(alfa/2)(v2, v1),
 * donde f_(alfa/2) es el valor con área alfa/2 a la derecha.
 */
export function intervaloCocienteVarianzas(
  muestra1: MuestraVarianza,
  muestra2: MuestraVarianza,
  nivelConfianza: number,
): IntervaloConfianza {
  validarTamano(muestra1.n, 2, 'n1');
  validarTamano(muestra2.n, 2, 'n2');
  validarPositivo(muestra1.varianza, 'La varianza de la muestra 1');
  validarPositivo(muestra2.varianza, 'La varianza de la muestra 2');
  validarNivelConfianza(nivelConfianza);
  const v1 = muestra1.n - 1;
  const v2 = muestra2.n - 1;
  const alfa = 1 - nivelConfianza;
  const f12 = cuantilF(1 - alfa / 2, v1, v2);
  const f21 = cuantilF(1 - alfa / 2, v2, v1);
  const cociente = muestra1.varianza / muestra2.varianza;
  return {
    estimador: cociente,
    limiteInferior: cociente / f12,
    limiteSuperior: cociente * f21,
    nivelConfianza,
    valoresCriticos: [f12, f21],
    distribucion: { tipo: 'f', gl1: v1, gl2: v2 },
  };
}

/** Prueba F para H0: sigma1^2 = sigma2^2, con F = s1^2 / s2^2 y (n1 - 1, n2 - 1) grados de libertad. */
export function pruebaCocienteVarianzas(
  muestra1: MuestraVarianza,
  muestra2: MuestraVarianza,
  parametros: ParametrosPrueba,
): ResultadoPrueba {
  validarTamano(muestra1.n, 2, 'n1');
  validarTamano(muestra2.n, 2, 'n2');
  validarPositivo(muestra1.varianza, 'La varianza de la muestra 1');
  validarPositivo(muestra2.varianza, 'La varianza de la muestra 2');
  const f = muestra1.varianza / muestra2.varianza;
  return evaluarContraste(f, { tipo: 'f', gl1: muestra1.n - 1, gl2: muestra2.n - 1 }, parametros.alfa, parametros.tipo);
}

/* -------------------------------------------------------------------------- */
/* 1.9 Diferencia de medias con muestras pareadas                              */
/* -------------------------------------------------------------------------- */

export interface ResumenPareado {
  diferencias: number[];
  n: number;
  mediaDiferencias: number;
  desviacionDiferencias: number;
}

/** Calcula d_i = x1_i - x2_i y sus estadísticos resumidos. */
export function resumirPareadas(muestra1: readonly number[], muestra2: readonly number[]): ResumenPareado {
  if (muestra1.length !== muestra2.length) {
    throw new ErrorCalculo('Las muestras pareadas deben tener el mismo número de observaciones.');
  }
  if (muestra1.length < 2) {
    throw new ErrorCalculo('Se requieren al menos dos pares de observaciones.');
  }
  const diferencias = muestra1.map((valor, i) => valor - muestra2[i]);
  const desviacionDiferencias = desviacionEstandar(diferencias);
  if (desviacionDiferencias === 0) {
    throw new ErrorCalculo('Todas las diferencias son idénticas; la desviación estándar de las diferencias es cero.');
  }
  return {
    diferencias,
    n: diferencias.length,
    mediaDiferencias: media(diferencias),
    desviacionDiferencias,
  };
}

/** Intervalo d_barra +/- t_(alfa/2, n-1) * s_d / sqrt(n). */
export function intervaloMuestrasPareadas(
  muestra1: readonly number[],
  muestra2: readonly number[],
  nivelConfianza: number,
): IntervaloConfianza & ResumenPareado {
  const resumen = resumirPareadas(muestra1, muestra2);
  return {
    ...intervaloMediaT(
      { n: resumen.n, media: resumen.mediaDiferencias, desviacion: resumen.desviacionDiferencias },
      nivelConfianza,
    ),
    ...resumen,
  };
}

/** Prueba t pareada: t = (d_barra - d0) / (s_d / sqrt(n)), con n - 1 grados de libertad. */
export function pruebaMuestrasPareadas(
  muestra1: readonly number[],
  muestra2: readonly number[],
  d0: number,
  parametros: ParametrosPrueba,
): ResultadoPrueba & ResumenPareado {
  validarAlfa(parametros.alfa);
  const resumen = resumirPareadas(muestra1, muestra2);
  return {
    ...pruebaMediaT(
      { n: resumen.n, media: resumen.mediaDiferencias, desviacion: resumen.desviacionDiferencias },
      d0,
      parametros,
    ),
    ...resumen,
  };
}
