/**
 * Unidad II. Regresión lineal simple.
 *
 * Recta de mínimos cuadrados, significancia del modelo, coeficientes de correlación
 * y determinación, predicción de nuevas observaciones, inferencia sobre la pendiente
 * y prueba de normalidad del error (temas 2.1 a 2.4).
 *
 * Referencia principal: Walpole et al. (2012), cap. 11.
 */
import { evaluarContraste, validarNivelConfianza } from './contraste';
import { media, suma } from './descriptiva';
import { cuantilT, sfF } from './distribuciones';
import { ErrorCalculo, type IntervaloConfianza, type ResultadoPrueba, type TipoPrueba } from './tipos';
import { pruebaAndersonDarling, type ResultadoAndersonDarling } from './unidad4_anova';

export interface ModeloRegresionSimple {
  n: number;
  x: number[];
  y: number[];
  mediaX: number;
  mediaY: number;
  /** S_xx = sum (x_i - x_barra)^2 */
  sxx: number;
  /** S_yy = sum (y_i - y_barra)^2 = SST */
  syy: number;
  /** S_xy = sum (x_i - x_barra)(y_i - y_barra) */
  sxy: number;
  /** Intercepto estimado b0. */
  b0: number;
  /** Pendiente estimada b1. */
  b1: number;
  ajustados: number[];
  residuales: number[];
  /** Suma de cuadrados del error. */
  sse: number;
  /** Suma de cuadrados de la regresión. */
  ssr: number;
  /** Suma de cuadrados total. */
  sst: number;
  /** Grados de libertad del error: n - 2. */
  gl: number;
  /** Cuadrado medio del error s^2 = SSE / (n - 2). */
  mse: number;
  /** Error estándar de la estimación s. */
  s: number;
  errorEstandarB0: number;
  errorEstandarB1: number;
  /** Coeficiente de correlación de Pearson. */
  r: number;
  /** Coeficiente de determinación. */
  r2: number;
  /** Significancia del modelo: F = MSR / MSE con (1, n - 2) grados de libertad. */
  F: number;
  valorPModelo: number;
}

function validarPares(x: readonly number[], y: readonly number[]): void {
  if (x.length !== y.length) {
    throw new ErrorCalculo(`Las variables deben tener el mismo número de observaciones (x: ${x.length}, y: ${y.length}).`);
  }
  if (x.length < 3) throw new ErrorCalculo('La regresión lineal simple requiere al menos tres pares de observaciones.');
}

/** 2.1 Recta de mínimos cuadrados y_gorro = b0 + b1 x, con b1 = S_xy / S_xx y b0 = y_barra - b1 x_barra. */
export function minimosCuadrados(x: readonly number[], y: readonly number[]): ModeloRegresionSimple {
  validarPares(x, y);
  const n = x.length;
  const mediaX = media(x);
  const mediaY = media(y);
  const sxx = suma(x.map((xi) => (xi - mediaX) ** 2));
  const syy = suma(y.map((yi) => (yi - mediaY) ** 2));
  const sxy = suma(x.map((xi, i) => (xi - mediaX) * (y[i] - mediaY)));
  if (sxx === 0) throw new ErrorCalculo('La variable independiente x es constante; la pendiente no está definida.');

  const b1 = sxy / sxx;
  const b0 = mediaY - b1 * mediaX;
  const ajustados = x.map((xi) => b0 + b1 * xi);
  const residuales = y.map((yi, i) => yi - ajustados[i]);
  const sse = suma(residuales.map((e) => e * e));
  const sst = syy;
  const ssr = Math.max(0, sst - sse);
  const gl = n - 2;
  const mse = sse / gl;
  const s = Math.sqrt(mse);
  const r = syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);
  const F = mse === 0 ? Infinity : ssr / mse;

  return {
    n,
    x: [...x],
    y: [...y],
    mediaX,
    mediaY,
    sxx,
    syy,
    sxy,
    b0,
    b1,
    ajustados,
    residuales,
    sse,
    ssr,
    sst,
    gl,
    mse,
    s,
    errorEstandarB0: s * Math.sqrt(1 / n + (mediaX * mediaX) / sxx),
    errorEstandarB1: s / Math.sqrt(sxx),
    r,
    r2: sst === 0 ? 0 : ssr / sst,
    F,
    valorPModelo: sfF(F, 1, gl),
  };
}

/** 2.3.1 Inferencia sobre la pendiente: t = (b1 - beta10) / (s / sqrt(S_xx)) con n - 2 grados de libertad. */
export function inferenciaPendiente(
  modelo: ModeloRegresionSimple,
  parametros: { alfa: number; tipo: TipoPrueba; beta10?: number },
): ResultadoPrueba & { intervalo: IntervaloConfianza } {
  const beta10 = parametros.beta10 ?? 0;
  const t = (modelo.b1 - beta10) / modelo.errorEstandarB1;
  const prueba = evaluarContraste(t, { tipo: 't', gl: modelo.gl }, parametros.alfa, parametros.tipo);
  const tCritico = cuantilT(1 - parametros.alfa / 2, modelo.gl);
  const margenError = tCritico * modelo.errorEstandarB1;
  return {
    ...prueba,
    errorEstandar: modelo.errorEstandarB1,
    intervalo: {
      estimador: modelo.b1,
      limiteInferior: modelo.b1 - margenError,
      limiteSuperior: modelo.b1 + margenError,
      nivelConfianza: 1 - parametros.alfa,
      valoresCriticos: [tCritico],
      distribucion: { tipo: 't', gl: modelo.gl },
      errorEstandar: modelo.errorEstandarB1,
      margenError,
    },
  };
}

/** 2.2 Coeficiente de correlación de Pearson y prueba H0: rho = 0 con t = r sqrt(n - 2) / sqrt(1 - r^2). */
export function correlacionPearson(
  x: readonly number[],
  y: readonly number[],
  parametros: { alfa: number; tipo: TipoPrueba },
): ResultadoPrueba & { r: number; r2: number; n: number } {
  validarPares(x, y);
  const mediaX = media(x);
  const mediaY = media(y);
  const sxx = suma(x.map((xi) => (xi - mediaX) ** 2));
  const syy = suma(y.map((yi) => (yi - mediaY) ** 2));
  if (sxx === 0 || syy === 0) {
    throw new ErrorCalculo('Una de las variables es constante; el coeficiente de correlación no está definido.');
  }
  const sxy = suma(x.map((xi, i) => (xi - mediaX) * (y[i] - mediaY)));
  const r = Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
  const n = x.length;
  const t = Math.abs(r) === 1 ? Math.sign(r) * Infinity : (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r);
  return {
    ...evaluarContraste(t, { tipo: 't', gl: n - 2 }, parametros.alfa, parametros.tipo),
    r,
    r2: r * r,
    n,
  };
}

export interface Prediccion {
  x0: number;
  yEstimada: number;
  valorCritico: number;
  /** Intervalo de confianza para la respuesta media E(Y | x0). */
  intervaloMedia: [number, number];
  /** Intervalo de predicción para una nueva observación y0. */
  intervaloPrediccion: [number, number];
}

/**
 * 2.3 Predicción en x0:
 * media:      y_gorro0 +/- t s sqrt(1/n + (x0 - x_barra)^2 / S_xx)
 * individual: y_gorro0 +/- t s sqrt(1 + 1/n + (x0 - x_barra)^2 / S_xx)
 */
export function predecir(modelo: ModeloRegresionSimple, x0: number, nivelConfianza: number): Prediccion {
  validarNivelConfianza(nivelConfianza);
  const yEstimada = modelo.b0 + modelo.b1 * x0;
  const valorCritico = cuantilT(1 - (1 - nivelConfianza) / 2, modelo.gl);
  const palanca = 1 / modelo.n + (x0 - modelo.mediaX) ** 2 / modelo.sxx;
  const margenMedia = valorCritico * modelo.s * Math.sqrt(palanca);
  const margenPrediccion = valorCritico * modelo.s * Math.sqrt(1 + palanca);
  return {
    x0,
    yEstimada,
    valorCritico,
    intervaloMedia: [yEstimada - margenMedia, yEstimada + margenMedia],
    intervaloPrediccion: [yEstimada - margenPrediccion, yEstimada + margenPrediccion],
  };
}

/** 2.4 Prueba de normalidad del error (Anderson-Darling sobre los residuales). */
export function normalidadDelError(modelo: ModeloRegresionSimple, alfa: number): ResultadoAndersonDarling {
  return pruebaAndersonDarling(modelo.residuales, alfa);
}
