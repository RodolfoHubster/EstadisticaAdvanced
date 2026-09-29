/**
 * Unidad IV. Pruebas de bondad de ajuste y análisis de varianza.
 *
 * Temas 4.1 (tablas de contingencia), 4.2 (bondad de ajuste) y 4.3 (ANOVA y
 * comparación de medias de tratamiento). Los valores críticos se consultan en
 * tablasCriticas.json; cuando la combinación no está tabulada, se calculan con el motor.
 *
 * Referencias: Walpole et al. (2012), caps. 10, 13 y 14; Montgomery (2017), caps. 3-5.
 */
import {
  valorCriticoChiCuadrada,
  valorCriticoF,
  valorCriticoT,
  valorCriticoTukey,
  type OrigenValor,
} from './consultaTablas';
import { validarAlfa } from './contraste';
import { desviacionEstandar, media, ordenar, rangos, suma } from './descriptiva';
import { cdfNormal, cdfRangoEstudentizado, sfChiCuadrada, sfF, sfT } from './distribuciones';
import { ErrorCalculo, ErrorPendiente } from './tipos';

/* -------------------------------------------------------------------------- */
/* Tipos comunes                                                               */
/* -------------------------------------------------------------------------- */

/** Resultado de un contraste de cola derecha con valor crítico tabulado. */
export interface ContrasteCritico {
  estadistico: number;
  valorP: number;
  valorCritico: number;
  origenCritico: OrigenValor;
  rechazarH0: boolean;
}

/** Fila de una tabla de análisis de varianza. */
export interface FilaAnova {
  fuente: string;
  sumaCuadrados: number;
  gl: number;
  cuadradoMedio?: number;
  F?: number;
  valorP?: number;
  valorCritico?: number;
}

function contrasteChiCuadrada(estadistico: number, gl: number, alfa: number): ContrasteCritico {
  const critico = valorCriticoChiCuadrada(alfa, gl);
  return {
    estadistico,
    valorP: sfChiCuadrada(estadistico, gl),
    valorCritico: critico.valor,
    origenCritico: critico.origen,
    rechazarH0: estadistico > critico.valor,
  };
}

function contrasteF(estadistico: number, gl1: number, gl2: number, alfa: number): ContrasteCritico {
  const critico = valorCriticoF(alfa, gl1, gl2);
  return {
    estadistico,
    valorP: sfF(estadistico, gl1, gl2),
    valorCritico: critico.valor,
    origenCritico: critico.origen,
    rechazarH0: estadistico > critico.valor,
  };
}

function validarTablaRectangular(tabla: readonly (readonly number[])[], nombre: string): void {
  if (tabla.length < 2) throw new ErrorCalculo(`La ${nombre} requiere al menos dos filas.`);
  const columnas = tabla[0].length;
  if (columnas < 2) throw new ErrorCalculo(`La ${nombre} requiere al menos dos columnas.`);
  if (tabla.some((fila) => fila.length !== columnas)) {
    throw new ErrorCalculo(`Todas las filas de la ${nombre} deben tener ${columnas} columnas.`);
  }
}

/* -------------------------------------------------------------------------- */
/* 4.1 Tablas de contingencia                                                  */
/* -------------------------------------------------------------------------- */

export interface AnalisisContingencia {
  filas: number;
  columnas: number;
  total: number;
  totalesFila: number[];
  totalesColumna: number[];
  /** P(F_i y C_j). */
  probabilidadConjunta: number[][];
  /** P(F_i). */
  marginalFila: number[];
  /** P(C_j). */
  marginalColumna: number[];
  /** P(C_j | F_i). */
  condicionalDadaFila: number[][];
  /** P(F_i | C_j). */
  condicionalDadaColumna: number[][];
}

/** 4.1.1 Análisis probabilístico: probabilidades conjuntas, marginales y condicionales. */
export function analizarTablaContingencia(tabla: readonly (readonly number[])[]): AnalisisContingencia {
  validarTablaRectangular(tabla, 'tabla de contingencia');
  if (tabla.some((fila) => fila.some((valor) => !Number.isInteger(valor) || valor < 0))) {
    throw new ErrorCalculo('Las frecuencias observadas deben ser enteros no negativos.');
  }
  const totalesFila = tabla.map((fila) => suma(fila));
  const totalesColumna = tabla[0].map((_, j) => suma(tabla.map((fila) => fila[j])));
  const total = suma(totalesFila);
  if (totalesFila.some((t) => t === 0) || totalesColumna.some((t) => t === 0)) {
    throw new ErrorCalculo('Cada fila y cada columna de la tabla debe tener al menos una observación.');
  }
  return {
    filas: tabla.length,
    columnas: tabla[0].length,
    total,
    totalesFila,
    totalesColumna,
    probabilidadConjunta: tabla.map((fila) => fila.map((valor) => valor / total)),
    marginalFila: totalesFila.map((t) => t / total),
    marginalColumna: totalesColumna.map((t) => t / total),
    condicionalDadaFila: tabla.map((fila, i) => fila.map((valor) => valor / totalesFila[i])),
    condicionalDadaColumna: tabla.map((fila) => fila.map((valor, j) => valor / totalesColumna[j])),
  };
}

export interface ResultadoIndependencia extends ContrasteCritico {
  gl: number;
  alfa: number;
  esperadas: number[][];
  /** Aporte (o - e)^2 / e de cada celda al estadístico. */
  contribuciones: number[][];
  /** Coeficiente V de Cramér como medida de asociación. */
  vCramer: number;
  celdasEsperadaMenorCinco: number;
  analisis: AnalisisContingencia;
}

/** 4.1.2 y 4.2.2 Prueba ji-cuadrada de independencia. */
export function pruebaIndependencia(tabla: readonly (readonly number[])[], alfa: number): ResultadoIndependencia {
  validarAlfa(alfa);
  const analisis = analizarTablaContingencia(tabla);
  const esperadas = analisis.totalesFila.map((tf) => analisis.totalesColumna.map((tc) => (tf * tc) / analisis.total));
  const contribuciones = tabla.map((fila, i) => fila.map((o, j) => (o - esperadas[i][j]) ** 2 / esperadas[i][j]));
  const estadistico = suma(contribuciones.flat());
  const gl = (analisis.filas - 1) * (analisis.columnas - 1);
  const minimo = Math.min(analisis.filas, analisis.columnas) - 1;
  return {
    ...contrasteChiCuadrada(estadistico, gl, alfa),
    gl,
    alfa,
    esperadas,
    contribuciones,
    vCramer: Math.sqrt(estadistico / (analisis.total * minimo)),
    celdasEsperadaMenorCinco: esperadas.flat().filter((e) => e < 5).length,
    analisis,
  };
}

/* -------------------------------------------------------------------------- */
/* 4.2 Pruebas de bondad de ajuste                                             */
/* -------------------------------------------------------------------------- */

export interface OpcionesBondadAjuste {
  /** Probabilidades teóricas de cada categoría; si se omiten se asume distribución uniforme. */
  probabilidades?: readonly number[];
  /** Frecuencias esperadas; alternativa a `probabilidades`. */
  esperadas?: readonly number[];
  /** Número de parámetros estimados a partir de la muestra (resta grados de libertad). */
  parametrosEstimados?: number;
}

export interface ResultadoBondadAjuste extends ContrasteCritico {
  gl: number;
  alfa: number;
  n: number;
  esperadas: number[];
  contribuciones: number[];
  celdasEsperadaMenorCinco: number;
}

/** 4.2.1 Prueba ji-cuadrada de Pearson: chi2 = sum (o_i - e_i)^2 / e_i, con k - 1 - m grados de libertad. */
export function pruebaBondadAjuste(
  observadas: readonly number[],
  opciones: OpcionesBondadAjuste,
  alfa: number,
): ResultadoBondadAjuste {
  validarAlfa(alfa);
  const k = observadas.length;
  if (k < 2) throw new ErrorCalculo('Se requieren al menos dos categorías.');
  if (observadas.some((o) => !Number.isInteger(o) || o < 0)) {
    throw new ErrorCalculo('Las frecuencias observadas deben ser enteros no negativos.');
  }
  const n = suma(observadas);
  if (n === 0) throw new ErrorCalculo('El total de frecuencias observadas debe ser mayor que cero.');

  let esperadas: number[];
  if (opciones.esperadas) {
    if (opciones.esperadas.length !== k) {
      throw new ErrorCalculo('Debe haber una frecuencia esperada por cada categoría observada.');
    }
    const totalEsperado = suma(opciones.esperadas);
    if (Math.abs(totalEsperado - n) > 1e-6 * Math.max(1, n)) {
      throw new ErrorCalculo(`La suma de frecuencias esperadas (${totalEsperado}) debe coincidir con el total observado (${n}).`);
    }
    esperadas = [...opciones.esperadas];
  } else {
    const probabilidades = opciones.probabilidades ?? observadas.map(() => 1 / k);
    if (probabilidades.length !== k) {
      throw new ErrorCalculo('Debe haber una probabilidad teórica por cada categoría observada.');
    }
    if (Math.abs(suma(probabilidades) - 1) > 1e-6) {
      throw new ErrorCalculo('Las probabilidades teóricas deben sumar 1.');
    }
    esperadas = probabilidades.map((p) => p * n);
  }
  if (esperadas.some((e) => !(e > 0))) {
    throw new ErrorCalculo('Todas las frecuencias esperadas deben ser positivas.');
  }

  const gl = k - 1 - (opciones.parametrosEstimados ?? 0);
  if (gl < 1) throw new ErrorCalculo('Los grados de libertad k - 1 - m deben ser al menos 1.');
  const contribuciones = observadas.map((o, i) => (o - esperadas[i]) ** 2 / esperadas[i]);
  return {
    ...contrasteChiCuadrada(suma(contribuciones), gl, alfa),
    gl,
    alfa,
    n,
    esperadas,
    contribuciones,
    celdasEsperadaMenorCinco: esperadas.filter((e) => e < 5).length,
  };
}

/** Probabilidad de cola de la distribución de Kolmogorov: Q(lambda) = 2 sum (-1)^(j-1) exp(-2 j^2 lambda^2). */
function probabilidadKolmogorov(lambda: number): number {
  if (lambda <= 0) return 1;
  let total = 0;
  for (let j = 1; j <= 200; j++) {
    const termino = Math.exp(-2 * j * j * lambda * lambda);
    total += (j % 2 === 1 ? 1 : -1) * termino;
    if (termino < 1e-16) break;
  }
  return Math.min(1, Math.max(0, 2 * total));
}

export interface ResultadoKolmogorovSmirnov {
  n: number;
  D: number;
  dMas: number;
  dMenos: number;
  valorP: number;
  /** Valor crítico aproximado (Stephens, 1970). */
  valorCritico: number;
  rechazarH0: boolean;
  alfa: number;
  media: number;
  desviacion: number;
  /** Verdadero si media y desviación se estimaron de la muestra (caso de Lilliefors; valor p conservador). */
  parametrosEstimados: boolean;
}

/** 4.2.3 Prueba de Kolmogorov-Smirnov contra una distribución normal. */
export function pruebaKolmogorovSmirnov(
  datos: readonly number[],
  alfa: number,
  parametros?: { media: number; desviacion: number },
): ResultadoKolmogorovSmirnov {
  validarAlfa(alfa);
  const n = datos.length;
  if (n < 3) throw new ErrorCalculo('La prueba de Kolmogorov-Smirnov requiere al menos tres observaciones.');
  const mu = parametros?.media ?? media(datos);
  const sigma = parametros?.desviacion ?? desviacionEstandar(datos);
  if (!(sigma > 0)) throw new ErrorCalculo('La desviación estándar debe ser positiva.');
  const ordenados = ordenar(datos);
  let dMas = 0;
  let dMenos = 0;
  ordenados.forEach((x, i) => {
    const F = cdfNormal(x, mu, sigma);
    dMas = Math.max(dMas, (i + 1) / n - F);
    dMenos = Math.max(dMenos, F - i / n);
  });
  const D = Math.max(dMas, dMenos);
  const ajuste = Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n);
  const valorCritico = Math.sqrt(-0.5 * Math.log(alfa / 2)) / ajuste;
  return {
    n,
    D,
    dMas,
    dMenos,
    valorP: probabilidadKolmogorov(ajuste * D),
    valorCritico,
    rechazarH0: D > valorCritico,
    alfa,
    media: mu,
    desviacion: sigma,
    parametrosEstimados: parametros === undefined,
  };
}

export interface ResultadoAndersonDarling {
  n: number;
  media: number;
  desviacion: number;
  A2: number;
  /** Estadístico corregido A2* = A2 (1 + 0.75/n + 2.25/n^2) para parámetros estimados. */
  A2Ajustado: number;
  valorP: number;
  rechazarH0: boolean;
  alfa: number;
}

/**
 * 4.2.4 Prueba de Anderson-Darling de normalidad con media y varianza estimadas.
 * Valor p según D'Agostino y Stephens (1986), tabla 4.9.
 */
export function pruebaAndersonDarling(datos: readonly number[], alfa: number): ResultadoAndersonDarling {
  validarAlfa(alfa);
  const n = datos.length;
  if (n < 3) throw new ErrorCalculo('La prueba de Anderson-Darling requiere al menos tres observaciones.');
  const mu = media(datos);
  const sigma = desviacionEstandar(datos);
  if (!(sigma > 0)) throw new ErrorCalculo('Los datos no presentan variabilidad; la prueba no está definida.');
  const acotar = (p: number) => Math.min(1 - 1e-15, Math.max(1e-15, p));
  const F = ordenar(datos).map((x) => acotar(cdfNormal(x, mu, sigma)));
  let acumulado = 0;
  for (let i = 0; i < n; i++) {
    acumulado += (2 * i + 1) * (Math.log(F[i]) + Math.log(1 - F[n - 1 - i]));
  }
  const A2 = -n - acumulado / n;
  const A = A2 * (1 + 0.75 / n + 2.25 / (n * n));
  let valorP: number;
  if (A >= 0.6) valorP = Math.exp(1.2937 - 5.709 * A + 0.0186 * A * A);
  else if (A >= 0.34) valorP = Math.exp(0.9177 - 4.279 * A - 1.38 * A * A);
  else if (A >= 0.2) valorP = 1 - Math.exp(-8.318 + 42.796 * A - 59.938 * A * A);
  else valorP = 1 - Math.exp(-13.436 + 101.14 * A - 223.73 * A * A);
  valorP = Math.min(1, Math.max(0, valorP));
  return { n, media: mu, desviacion: sigma, A2, A2Ajustado: A, valorP, rechazarH0: valorP < alfa, alfa };
}

/** 4.2.5 Prueba de Shapiro-Wilk. Planificada: requiere los coeficientes a_i de Royston (1995). */
export function pruebaShapiroWilk(_datos: readonly number[], _alfa: number): never {
  throw new ErrorPendiente('Prueba de Shapiro-Wilk');
}

export interface ResultadoKruskalWallis extends ContrasteCritico {
  H: number;
  /** H corregido por empates. */
  HCorregido: number;
  gl: number;
  alfa: number;
  tamanos: number[];
  sumaRangos: number[];
  rangosPromedio: number[];
}

/** 4.2.6 Prueba no paramétrica de Kruskal-Wallis para k muestras independientes. */
export function pruebaKruskalWallis(grupos: readonly (readonly number[])[], alfa: number): ResultadoKruskalWallis {
  validarAlfa(alfa);
  if (grupos.length < 2) throw new ErrorCalculo('Se requieren al menos dos grupos.');
  if (grupos.some((g) => g.length === 0)) throw new ErrorCalculo('Ningún grupo puede estar vacío.');
  const todos = grupos.flat();
  const N = todos.length;
  const { rangos: r, correccionEmpates } = rangos(todos);
  const tamanos = grupos.map((g) => g.length);
  const sumaRangos: number[] = [];
  let desplazamiento = 0;
  for (const n of tamanos) {
    sumaRangos.push(suma(r.slice(desplazamiento, desplazamiento + n)));
    desplazamiento += n;
  }
  const H = (12 / (N * (N + 1))) * suma(sumaRangos.map((R, i) => (R * R) / tamanos[i])) - 3 * (N + 1);
  const factor = 1 - correccionEmpates / (N ** 3 - N);
  if (factor <= 0) throw new ErrorCalculo('Todas las observaciones son iguales; la prueba no está definida.');
  const HCorregido = H / factor;
  const gl = grupos.length - 1;
  return {
    ...contrasteChiCuadrada(HCorregido, gl, alfa),
    H,
    HCorregido,
    gl,
    alfa,
    tamanos,
    sumaRangos,
    rangosPromedio: sumaRangos.map((R, i) => R / tamanos[i]),
  };
}

/* -------------------------------------------------------------------------- */
/* 4.3.2 ANOVA de un factor                                                    */
/* -------------------------------------------------------------------------- */

export interface ResultadoAnovaUnFactor extends ContrasteCritico {
  tabla: FilaAnova[];
  alfa: number;
  k: number;
  N: number;
  medias: number[];
  tamanos: number[];
  mediaGeneral: number;
  cuadradoMedioError: number;
  glTratamientos: number;
  glError: number;
}

/** ANOVA de un factor (diseño completamente aleatorizado), con tamaños de grupo posiblemente distintos. */
export function anovaUnFactor(grupos: readonly (readonly number[])[], alfa: number): ResultadoAnovaUnFactor {
  validarAlfa(alfa);
  const k = grupos.length;
  if (k < 2) throw new ErrorCalculo('El análisis de varianza requiere al menos dos tratamientos.');
  if (grupos.some((g) => g.length === 0)) throw new ErrorCalculo('Ningún tratamiento puede estar vacío.');
  const tamanos = grupos.map((g) => g.length);
  const N = suma(tamanos);
  if (N - k < 1) throw new ErrorCalculo('Se requieren más observaciones que tratamientos (N - k >= 1).');

  const medias = grupos.map((g) => media(g));
  const mediaGeneral = media(grupos.flat());
  const scTratamientos = suma(medias.map((m, i) => tamanos[i] * (m - mediaGeneral) ** 2));
  const scError = suma(grupos.map((g, i) => suma(g.map((x) => (x - medias[i]) ** 2))));
  const scTotal = scTratamientos + scError;
  if (scTotal === 0) throw new ErrorCalculo('Todas las observaciones son idénticas; no existe variabilidad que analizar.');

  const glTratamientos = k - 1;
  const glError = N - k;
  const cmTratamientos = scTratamientos / glTratamientos;
  const cuadradoMedioError = scError / glError;
  const F = cmTratamientos / cuadradoMedioError;
  const contraste = contrasteF(F, glTratamientos, glError, alfa);

  return {
    ...contraste,
    tabla: [
      {
        fuente: 'Tratamientos',
        sumaCuadrados: scTratamientos,
        gl: glTratamientos,
        cuadradoMedio: cmTratamientos,
        F,
        valorP: contraste.valorP,
        valorCritico: contraste.valorCritico,
      },
      { fuente: 'Error', sumaCuadrados: scError, gl: glError, cuadradoMedio: cuadradoMedioError },
      { fuente: 'Total', sumaCuadrados: scTotal, gl: N - 1 },
    ],
    alfa,
    k,
    N,
    medias,
    tamanos,
    mediaGeneral,
    cuadradoMedioError,
    glTratamientos,
    glError,
  };
}

/* -------------------------------------------------------------------------- */
/* 4.3.3 Diseño de bloques completamente aleatorizados                         */
/* -------------------------------------------------------------------------- */

export interface ResultadoAnovaBloques {
  tabla: FilaAnova[];
  alfa: number;
  tratamientos: number;
  bloques: number;
  mediasTratamiento: number[];
  mediasBloque: number[];
  mediaGeneral: number;
  cuadradoMedioError: number;
  glError: number;
  efectoTratamiento: ContrasteCritico;
  efectoBloque: ContrasteCritico;
}

/**
 * ANOVA para un diseño de bloques completos aleatorizados.
 * @param datos Matriz t x b: filas = tratamientos, columnas = bloques (una observación por celda).
 */
export function anovaBloques(datos: readonly (readonly number[])[], alfa: number): ResultadoAnovaBloques {
  validarAlfa(alfa);
  validarTablaRectangular(datos, 'matriz de tratamientos por bloques');
  const t = datos.length;
  const b = datos[0].length;
  const mediaGeneral = media(datos.flat());
  const mediasTratamiento = datos.map((fila) => media(fila));
  const mediasBloque = datos[0].map((_, j) => media(datos.map((fila) => fila[j])));

  const scTotal = suma(datos.flat().map((x) => (x - mediaGeneral) ** 2));
  const scTratamientos = b * suma(mediasTratamiento.map((m) => (m - mediaGeneral) ** 2));
  const scBloques = t * suma(mediasBloque.map((m) => (m - mediaGeneral) ** 2));
  const scError = Math.max(0, scTotal - scTratamientos - scBloques);
  if (scError === 0) throw new ErrorCalculo('La suma de cuadrados del error es cero; el cociente F no está definido.');

  const glTratamientos = t - 1;
  const glBloques = b - 1;
  const glError = glTratamientos * glBloques;
  const cmTratamientos = scTratamientos / glTratamientos;
  const cmBloques = scBloques / glBloques;
  const cuadradoMedioError = scError / glError;
  const efectoTratamiento = contrasteF(cmTratamientos / cuadradoMedioError, glTratamientos, glError, alfa);
  const efectoBloque = contrasteF(cmBloques / cuadradoMedioError, glBloques, glError, alfa);

  return {
    tabla: [
      {
        fuente: 'Tratamientos',
        sumaCuadrados: scTratamientos,
        gl: glTratamientos,
        cuadradoMedio: cmTratamientos,
        F: efectoTratamiento.estadistico,
        valorP: efectoTratamiento.valorP,
        valorCritico: efectoTratamiento.valorCritico,
      },
      {
        fuente: 'Bloques',
        sumaCuadrados: scBloques,
        gl: glBloques,
        cuadradoMedio: cmBloques,
        F: efectoBloque.estadistico,
        valorP: efectoBloque.valorP,
        valorCritico: efectoBloque.valorCritico,
      },
      { fuente: 'Error', sumaCuadrados: scError, gl: glError, cuadradoMedio: cuadradoMedioError },
      { fuente: 'Total', sumaCuadrados: scTotal, gl: t * b - 1 },
    ],
    alfa,
    tratamientos: t,
    bloques: b,
    mediasTratamiento,
    mediasBloque,
    mediaGeneral,
    cuadradoMedioError,
    glError,
    efectoTratamiento,
    efectoBloque,
  };
}

/* -------------------------------------------------------------------------- */
/* 4.3.4 Diseño factorial de dos factores                                      */
/* -------------------------------------------------------------------------- */

export interface ResultadoAnovaFactorial {
  tabla: FilaAnova[];
  alfa: number;
  nivelesA: number;
  nivelesB: number;
  replicas: number;
  mediasCelda: number[][];
  mediasA: number[];
  mediasB: number[];
  mediaGeneral: number;
  cuadradoMedioError: number;
  glError: number;
  efectoA: ContrasteCritico;
  efectoB: ContrasteCritico;
  interaccion: ContrasteCritico;
}

/**
 * ANOVA factorial a x b con n réplicas por celda (diseño balanceado).
 * @param celdas celdas[i][j] contiene las réplicas del nivel i del factor A y el nivel j del factor B.
 */
export function anovaFactorial(
  celdas: readonly (readonly (readonly number[])[])[],
  alfa: number,
): ResultadoAnovaFactorial {
  validarAlfa(alfa);
  const a = celdas.length;
  if (a < 2) throw new ErrorCalculo('El factor A requiere al menos dos niveles.');
  const b = celdas[0].length;
  if (b < 2) throw new ErrorCalculo('El factor B requiere al menos dos niveles.');
  if (celdas.some((fila) => fila.length !== b)) {
    throw new ErrorCalculo(`Cada nivel del factor A debe contener ${b} celdas (una por nivel de B).`);
  }
  const n = celdas[0][0].length;
  if (n < 2) throw new ErrorCalculo('El diseño factorial requiere al menos dos réplicas por celda.');
  if (celdas.some((fila) => fila.some((celda) => celda.length !== n))) {
    throw new ErrorCalculo(`El diseño debe ser balanceado: todas las celdas deben tener ${n} réplicas.`);
  }

  const todos = celdas.flat(2);
  const mediaGeneral = media(todos);
  const mediasCelda = celdas.map((fila) => fila.map((celda) => media(celda)));
  const mediasA = mediasCelda.map((fila) => media(fila));
  const mediasB = mediasCelda[0].map((_, j) => media(mediasCelda.map((fila) => fila[j])));

  const scTotal = suma(todos.map((x) => (x - mediaGeneral) ** 2));
  const scA = b * n * suma(mediasA.map((m) => (m - mediaGeneral) ** 2));
  const scB = a * n * suma(mediasB.map((m) => (m - mediaGeneral) ** 2));
  let scAB = 0;
  let scError = 0;
  for (let i = 0; i < a; i++) {
    for (let j = 0; j < b; j++) {
      scAB += n * (mediasCelda[i][j] - mediasA[i] - mediasB[j] + mediaGeneral) ** 2;
      scError += suma(celdas[i][j].map((x) => (x - mediasCelda[i][j]) ** 2));
    }
  }
  if (scError === 0) throw new ErrorCalculo('La suma de cuadrados del error es cero; el cociente F no está definido.');

  const glA = a - 1;
  const glB = b - 1;
  const glAB = glA * glB;
  const glError = a * b * (n - 1);
  const cuadradoMedioError = scError / glError;
  const efectoA = contrasteF(scA / glA / cuadradoMedioError, glA, glError, alfa);
  const efectoB = contrasteF(scB / glB / cuadradoMedioError, glB, glError, alfa);
  const interaccion = contrasteF(scAB / glAB / cuadradoMedioError, glAB, glError, alfa);

  const fila = (fuente: string, sc: number, gl: number, efecto: ContrasteCritico): FilaAnova => ({
    fuente,
    sumaCuadrados: sc,
    gl,
    cuadradoMedio: sc / gl,
    F: efecto.estadistico,
    valorP: efecto.valorP,
    valorCritico: efecto.valorCritico,
  });

  return {
    tabla: [
      fila('Factor A', scA, glA, efectoA),
      fila('Factor B', scB, glB, efectoB),
      fila('Interacción AB', scAB, glAB, interaccion),
      { fuente: 'Error', sumaCuadrados: scError, gl: glError, cuadradoMedio: cuadradoMedioError },
      { fuente: 'Total', sumaCuadrados: scTotal, gl: a * b * n - 1 },
    ],
    alfa,
    nivelesA: a,
    nivelesB: b,
    replicas: n,
    mediasCelda,
    mediasA,
    mediasB,
    mediaGeneral,
    cuadradoMedioError,
    glError,
    efectoA,
    efectoB,
    interaccion,
  };
}

/* -------------------------------------------------------------------------- */
/* 4.3.4 Comparación de parejas de medias de tratamiento (post-hoc)            */
/* -------------------------------------------------------------------------- */

/** Datos mínimos de un ANOVA de un factor necesarios para las comparaciones múltiples. */
export type EntradaComparaciones = Pick<ResultadoAnovaUnFactor, 'medias' | 'tamanos' | 'cuadradoMedioError' | 'glError'>;

export interface ComparacionPareja {
  /** Índices (base 0) de los tratamientos comparados. */
  i: number;
  j: number;
  diferencia: number;
  /** Diferencia mínima significativa para esta pareja. */
  umbral: number;
  valorP: number;
  limiteInferior: number;
  limiteSuperior: number;
  significativa: boolean;
}

export interface ResultadoComparaciones {
  metodo: 'LSD de Fisher' | 'HSD de Tukey';
  alfa: number;
  valorCritico: number;
  origenCritico: OrigenValor;
  comparaciones: ComparacionPareja[];
}

function parejas(k: number): [number, number][] {
  const resultado: [number, number][] = [];
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) resultado.push([i, j]);
  return resultado;
}

/** Diferencia mínima significativa de Fisher: LSD = t_(alfa/2, N-k) sqrt(MSE (1/n_i + 1/n_j)). */
export function comparacionesLSD(anova: EntradaComparaciones, alfa: number): ResultadoComparaciones {
  validarAlfa(alfa);
  const critico = valorCriticoT(alfa / 2, anova.glError);
  const comparaciones = parejas(anova.medias.length).map(([i, j]) => {
    const errorEstandar = Math.sqrt(anova.cuadradoMedioError * (1 / anova.tamanos[i] + 1 / anova.tamanos[j]));
    const diferencia = anova.medias[i] - anova.medias[j];
    const umbral = critico.valor * errorEstandar;
    return {
      i,
      j,
      diferencia,
      umbral,
      valorP: Math.min(1, 2 * sfT(Math.abs(diferencia) / errorEstandar, anova.glError)),
      limiteInferior: diferencia - umbral,
      limiteSuperior: diferencia + umbral,
      significativa: Math.abs(diferencia) > umbral,
    };
  });
  return { metodo: 'LSD de Fisher', alfa, valorCritico: critico.valor, origenCritico: critico.origen, comparaciones };
}

/**
 * Diferencia honestamente significativa de Tukey (Tukey-Kramer con tamaños distintos):
 * HSD = q_alfa(k, N-k) sqrt((MSE / 2) (1/n_i + 1/n_j)).
 */
export function comparacionesTukey(anova: EntradaComparaciones, alfa: number): ResultadoComparaciones {
  validarAlfa(alfa);
  const k = anova.medias.length;
  const critico = valorCriticoTukey(alfa, k, anova.glError);
  const comparaciones = parejas(k).map(([i, j]) => {
    const errorEstandar = Math.sqrt((anova.cuadradoMedioError / 2) * (1 / anova.tamanos[i] + 1 / anova.tamanos[j]));
    const diferencia = anova.medias[i] - anova.medias[j];
    const umbral = critico.valor * errorEstandar;
    return {
      i,
      j,
      diferencia,
      umbral,
      valorP: 1 - cdfRangoEstudentizado(Math.abs(diferencia) / errorEstandar, k, anova.glError),
      limiteInferior: diferencia - umbral,
      limiteSuperior: diferencia + umbral,
      significativa: Math.abs(diferencia) > umbral,
    };
  });
  return { metodo: 'HSD de Tukey', alfa, valorCritico: critico.valor, origenCritico: critico.origen, comparaciones };
}

/** Método de Dunnett (comparación contra un control). Planificado: requiere tablas de la t multivariada. */
export function comparacionesDunnett(_anova: EntradaComparaciones, _control: number, _alfa: number): never {
  throw new ErrorPendiente('Comparaciones de Dunnett contra un tratamiento control');
}
