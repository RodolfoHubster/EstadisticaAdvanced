/**
 * Unidad III. Regresión lineal múltiple.
 *
 * Estimación por mínimos cuadrados en notación matricial (tema 3.3):
 *
 *   y = X beta + epsilon,    beta_gorro = (X^T X)^(-1) X^T y
 *
 * La inversión y multiplicación de matrices se delegan a math.js. Se utiliza la
 * función `create` con dependencias explícitas para incluir en el paquete final
 * únicamente las operaciones de álgebra lineal requeridas.
 *
 * Referencia principal: Walpole et al. (2012), cap. 12; Montgomery y Runger (2010), cap. 12.
 */
import { create, invDependencies, multiplyDependencies, transposeDependencies } from 'mathjs';
import { validarNivelConfianza } from './contraste';
import { media, suma } from './descriptiva';
import { cuantilT, sfF, sfT } from './distribuciones';
import { ErrorCalculo, type TipoPrueba } from './tipos';
import { pruebaAndersonDarling, type ResultadoAndersonDarling } from './unidad4_anova';

const math = create({ invDependencies, multiplyDependencies, transposeDependencies });

export type Matriz = number[][];

/* -------------------------------------------------------------------------- */
/* Operaciones matriciales (math.js)                                           */
/* -------------------------------------------------------------------------- */

function transpuesta(A: Matriz): Matriz {
  return math.transpose(A) as Matriz;
}

function producto(A: Matriz, B: Matriz): Matriz {
  return math.multiply(A, B) as Matriz;
}

function inversa(A: Matriz): Matriz {
  let resultado: Matriz;
  try {
    resultado = math.inv(A) as Matriz;
  } catch {
    throw new ErrorCalculo(
      'La matriz X^T X es singular: existe dependencia lineal exacta entre las variables independientes (multicolinealidad perfecta).',
    );
  }
  // Verificación numérica de A * A^(-1) = I para detectar matrices casi singulares.
  const identidad = producto(A, resultado);
  const desviacion = Math.max(...identidad.flatMap((fila, i) => fila.map((v, j) => Math.abs(v - (i === j ? 1 : 0)))));
  if (!Number.isFinite(desviacion) || desviacion > 1e-6) {
    throw new ErrorCalculo(
      'La matriz X^T X está mal condicionada (multicolinealidad severa); los coeficientes no pueden estimarse con precisión.',
    );
  }
  return resultado;
}

/** Agrega la columna de unos correspondiente al intercepto: X = [1 | x1 ... xk]. */
export function construirMatrizDiseno(predictores: readonly (readonly number[])[]): Matriz {
  return predictores.map((fila) => [1, ...fila]);
}

export interface EcuacionesNormales {
  xtx: Matriz;
  xtxInversa: Matriz;
  xty: number[];
  beta: number[];
}

/** Resuelve las ecuaciones normales (X^T X) beta = X^T y. */
export function resolverEcuacionesNormales(matrizDiseno: Matriz, y: readonly number[]): EcuacionesNormales {
  const Xt = transpuesta(matrizDiseno);
  const xtx = producto(Xt, matrizDiseno);
  const xtxInversa = inversa(xtx);
  const columnaY = y.map((valor) => [valor]);
  const xty = producto(Xt, columnaY).map((fila) => fila[0]);
  const beta = producto(xtxInversa, xty.map((valor) => [valor])).map((fila) => fila[0]);
  return { xtx, xtxInversa, xty, beta };
}

/* -------------------------------------------------------------------------- */
/* 3.1 - 3.5 Modelo de regresión múltiple                                      */
/* -------------------------------------------------------------------------- */

export interface CoeficienteRegresion {
  nombre: string;
  estimado: number;
  errorEstandar: number;
  t: number;
  valorP: number;
  limiteInferior: number;
  limiteSuperior: number;
}

export interface ModeloRegresionMultiple {
  n: number;
  /** Número de variables independientes. */
  k: number;
  nombres: string[];
  matrizDiseno: Matriz;
  xtx: Matriz;
  xtxInversa: Matriz;
  beta: number[];
  coeficientes: CoeficienteRegresion[];
  ajustados: number[];
  residuales: number[];
  sse: number;
  ssr: number;
  sst: number;
  glRegresion: number;
  glError: number;
  /** s^2 = SSE / (n - k - 1). */
  mse: number;
  s: number;
  r2: number;
  r2Ajustado: number;
  /** Coeficiente de correlación múltiple R = sqrt(R^2). */
  r: number;
  F: number;
  valorPModelo: number;
  nivelConfianza: number;
  valorCriticoT: number;
  /** 3.4 Matriz de varianzas y covarianzas estimada: s^2 (X^T X)^(-1). */
  matrizVarianzasCovarianzas: Matriz;
}

/**
 * Ajusta y = b0 + b1 x1 + ... + bk xk por mínimos cuadrados.
 * @param predictores Matriz n x k con las variables independientes (una fila por observación).
 * @param y Vector de respuestas de longitud n.
 * @param nombres Nombres opcionales de las k variables independientes.
 */
export function regresionMultiple(
  predictores: readonly (readonly number[])[],
  y: readonly number[],
  nivelConfianza = 0.95,
  nombres?: readonly string[],
): ModeloRegresionMultiple {
  validarNivelConfianza(nivelConfianza);
  const n = y.length;
  if (predictores.length !== n) {
    throw new ErrorCalculo('La matriz de variables independientes debe tener una fila por cada observación de y.');
  }
  const k = predictores[0]?.length ?? 0;
  if (k < 1) throw new ErrorCalculo('Se requiere al menos una variable independiente.');
  if (predictores.some((fila) => fila.length !== k)) {
    throw new ErrorCalculo(`Todas las observaciones deben tener ${k} variables independientes.`);
  }
  if (n <= k + 1) {
    throw new ErrorCalculo(`Se requieren más de ${k + 1} observaciones para estimar ${k + 1} coeficientes (n > k + 1).`);
  }

  const matrizDiseno = construirMatrizDiseno(predictores);
  const { xtx, xtxInversa, beta } = resolverEcuacionesNormales(matrizDiseno, y);

  const ajustados = producto(matrizDiseno, beta.map((b) => [b])).map((fila) => fila[0]);
  const residuales = y.map((valor, i) => valor - ajustados[i]);
  const mediaY = media(y);
  const sse = suma(residuales.map((e) => e * e));
  const sst = suma(y.map((valor) => (valor - mediaY) ** 2));
  const ssr = Math.max(0, sst - sse);
  const glRegresion = k;
  const glError = n - k - 1;
  const mse = sse / glError;
  const s = Math.sqrt(mse);
  const r2 = sst === 0 ? 0 : ssr / sst;
  const r2Ajustado = 1 - ((1 - r2) * (n - 1)) / glError;
  const F = mse === 0 ? Infinity : ssr / glRegresion / mse;

  const matrizVarianzasCovarianzas = xtxInversa.map((fila) => fila.map((c) => mse * c));
  const valorCriticoT = cuantilT(1 - (1 - nivelConfianza) / 2, glError);
  const etiquetas = ['Intercepto', ...(nombres ?? Array.from({ length: k }, (_, j) => `x${j + 1}`))];

  const coeficientes = beta.map((estimado, j) => {
    const errorEstandar = Math.sqrt(matrizVarianzasCovarianzas[j][j]);
    const t = errorEstandar === 0 ? Infinity : estimado / errorEstandar;
    return {
      nombre: etiquetas[j],
      estimado,
      errorEstandar,
      t,
      valorP: Math.min(1, 2 * sfT(Math.abs(t), glError)),
      limiteInferior: estimado - valorCriticoT * errorEstandar,
      limiteSuperior: estimado + valorCriticoT * errorEstandar,
    };
  });

  return {
    n,
    k,
    nombres: etiquetas.slice(1),
    matrizDiseno,
    xtx,
    xtxInversa,
    beta,
    coeficientes,
    ajustados,
    residuales,
    sse,
    ssr,
    sst,
    glRegresion,
    glError,
    mse,
    s,
    r2,
    r2Ajustado,
    r: Math.sqrt(r2),
    F,
    valorPModelo: sfF(F, glRegresion, glError),
    nivelConfianza,
    valorCriticoT,
    matrizVarianzasCovarianzas,
  };
}

/* -------------------------------------------------------------------------- */
/* 3.5 Inferencias con el modelo                                               */
/* -------------------------------------------------------------------------- */

/** Prueba individual H0: beta_j = 0 con la dirección indicada. */
export function pruebaCoeficiente(
  modelo: ModeloRegresionMultiple,
  indice: number,
  tipo: TipoPrueba,
): { t: number; valorP: number } {
  const coeficiente = modelo.coeficientes[indice];
  if (!coeficiente) throw new ErrorCalculo(`El modelo no tiene un coeficiente con índice ${indice}.`);
  const { t } = coeficiente;
  const valorP =
    tipo === 'bilateral' ? Math.min(1, 2 * sfT(Math.abs(t), modelo.glError)) : tipo === 'derecha' ? sfT(t, modelo.glError) : sfT(-t, modelo.glError);
  return { t, valorP };
}

export interface PrediccionMultiple {
  x0: number[];
  yEstimada: number;
  /** x0^T (X^T X)^(-1) x0 */
  varianzaRelativa: number;
  intervaloMedia: [number, number];
  intervaloPrediccion: [number, number];
}

/** Predicción en el punto x0 = (x1, ..., xk) con intervalos para la media y para una nueva observación. */
export function predecirMultiple(modelo: ModeloRegresionMultiple, punto: readonly number[]): PrediccionMultiple {
  if (punto.length !== modelo.k) {
    throw new ErrorCalculo(`El punto de predicción debe tener ${modelo.k} valores (uno por variable independiente).`);
  }
  const x0 = [1, ...punto];
  const yEstimada = suma(x0.map((valor, j) => valor * modelo.beta[j]));
  const varianzaRelativa = producto(producto([x0], modelo.xtxInversa), x0.map((valor) => [valor]))[0][0];
  const margenMedia = modelo.valorCriticoT * modelo.s * Math.sqrt(varianzaRelativa);
  const margenPrediccion = modelo.valorCriticoT * modelo.s * Math.sqrt(1 + varianzaRelativa);
  return {
    x0,
    yEstimada,
    varianzaRelativa,
    intervaloMedia: [yEstimada - margenMedia, yEstimada + margenMedia],
    intervaloPrediccion: [yEstimada - margenPrediccion, yEstimada + margenPrediccion],
  };
}

/** 3.6 Prueba de normalidad del error (Anderson-Darling sobre los residuales). */
export function normalidadDelErrorMultiple(modelo: ModeloRegresionMultiple, alfa: number): ResultadoAndersonDarling {
  return pruebaAndersonDarling(modelo.residuales, alfa);
}
