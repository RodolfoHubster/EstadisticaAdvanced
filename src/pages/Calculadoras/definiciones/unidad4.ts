/**
 * Calculadoras de la Unidad IV: tablas de contingencia, bondad de ajuste,
 * normalidad, pruebas no paramétricas y análisis de varianza.
 */
import type { MetricaResultado, TablaResultado } from '../../../components/MathResults/tipos';
import { formatearPorcentaje, formatearValorP } from '../../../utils/formato';
import { desviacionEstandar, ordenar } from '../../../utils/math/descriptiva';
import { cuantilNormal } from '../../../utils/math/distribuciones';
import {
  anovaBloques,
  anovaFactorial,
  anovaUnFactor,
  comparacionesLSD,
  comparacionesTukey,
  pruebaAndersonDarling,
  pruebaBondadAjuste,
  pruebaIndependencia,
  pruebaKolmogorovSmirnov,
  pruebaKruskalWallis,
  type ContrasteCritico,
  type FilaAnova,
} from '../../../utils/math/unidad4_anova';
import { campoAlfa, separador, textoDecision } from './comunes';
import { ErrorCampo, leerAlfa, leerFactorial, leerGrupos, leerMatriz, leerNumero, leerVector, leerVectorOpcional } from './lectura';
import type { DefinicionCalculadora } from './tipos';

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                  */
/* -------------------------------------------------------------------------- */

function tablaAnova(filas: FilaAnova[], titulo = 'Tabla de análisis de varianza'): TablaResultado {
  return {
    titulo,
    columnas: ['Fuente', 'SC', 'gl', 'CM', 'F', 'Valor p', 'f crítico'],
    filas: filas.map((fila) => [
      fila.fuente,
      fila.sumaCuadrados,
      fila.gl,
      fila.cuadradoMedio ?? null,
      fila.F ?? null,
      fila.valorP ?? null,
      fila.valorCritico ?? null,
    ]),
    columnasValorP: [5],
  };
}

function decisionEfecto(efecto: ContrasteCritico): string {
  return efecto.rechazarH0 ? 'Significativo' : 'No significativo';
}

/** Evita que un error del motor se muestre sin asociarlo al campo de datos. */
function conCampo<T>(campo: string, calculo: () => T): T {
  try {
    return calculo();
  } catch (error) {
    if (error instanceof ErrorCampo) throw error;
    throw new ErrorCampo(campo, error instanceof Error ? error.message : String(error));
  }
}

/* -------------------------------------------------------------------------- */
/* 4.1 y 4.2.2 Tablas de contingencia e independencia                          */
/* -------------------------------------------------------------------------- */

const tablaContingencia: DefinicionCalculadora = {
  id: 'tabla-contingencia',
  unidad: 4,
  seccion: '4.1–4.2.2',
  titulo: 'Tabla de contingencia e independencia',
  resumen: 'Probabilidades conjuntas, marginales y condicionales, y prueba ji-cuadrada de independencia.',
  modalidades: ['Análisis', 'Prueba de hipótesis'],
  campos: [
    separador('s-datos', 'Frecuencias observadas'),
    {
      tipo: 'datos',
      id: 'tabla',
      etiqueta: 'Tabla r × c',
      formato: 'matriz',
      filas: 5,
      placeholder: 'Bajo Medio Alto\nA favor: 182 213 203\nEn contra: 154 138 110',
      ayuda: 'Una fila por línea. Opcional: primera línea con nombres de columna y "Nombre:" al inicio de cada fila.',
    },
    separador('s-parametros', 'Prueba de independencia'),
    campoAlfa(),
  ],
  valoresIniciales: { tabla: '', alfa: '0.05' },
  ejemplo: {
    descripcion: 'Walpole et al. (2012), cap. 10: opinión sobre una reforma fiscal según nivel de ingreso (1000 votantes).',
    valores: { tabla: 'Bajo Medio Alto\nA favor: 182 213 203\nEn contra: 154 138 110', alfa: '0.05' },
  },
  formulas: ['e_{ij} = (total fila i)(total columna j)/n', 'χ^{2} = ΣΣ(o_{ij} − e_{ij})^{2}/e_{ij},   ν = (r − 1)(c − 1)'],
  calcular: (v) => {
    const { encabezados, etiquetasFila, filas } = leerMatriz(v, 'tabla', {
      etiqueta: 'La tabla',
      columnasMinimas: 2,
      filasMinimas: 2,
      permitirEncabezado: true,
      enteros: true,
      noNegativos: true,
    });
    const alfa = leerAlfa(v);
    const prueba = conCampo('tabla', () => pruebaIndependencia(filas, alfa));
    const { analisis } = prueba;
    const columnas = encabezados ?? filas[0].map((_, j) => `Columna ${j + 1}`);

    const tablas: TablaResultado[] = [
      {
        titulo: 'Frecuencias observadas con totales',
        columnas: ['', ...columnas, 'Total'],
        filas: [
          ...filas.map((fila, i) => [etiquetasFila[i], ...fila, analisis.totalesFila[i]]),
          ['Total', ...analisis.totalesColumna, analisis.total],
        ],
      },
      {
        titulo: 'Frecuencias esperadas bajo independencia',
        columnas: ['', ...columnas],
        filas: prueba.esperadas.map((fila, i) => [etiquetasFila[i], ...fila]),
      },
      {
        titulo: 'Contribución de cada celda (o − e)² / e',
        columnas: ['', ...columnas],
        filas: prueba.contribuciones.map((fila, i) => [etiquetasFila[i], ...fila]),
      },
      {
        titulo: 'Probabilidad condicional P(columna | fila)',
        columnas: ['', ...columnas, 'P(fila)'],
        filas: analisis.condicionalDadaFila.map((fila, i) => [etiquetasFila[i], ...fila, analisis.marginalFila[i]]),
      },
      {
        titulo: 'Probabilidad conjunta P(fila y columna)',
        columnas: ['', ...columnas],
        filas: [
          ...analisis.probabilidadConjunta.map((fila, i) => [etiquetasFila[i], ...fila]),
          ['P(columna)', ...analisis.marginalColumna],
        ],
      },
    ];

    return {
      etiqueta: 'Prueba ji-cuadrada de independencia',
      principal: { tipo: 'numero', simbolo: 'χ^{2}', valor: prueba.estadistico },
      secundario: { etiqueta: 'Valor p', valor: prueba.valorP, esValorP: true },
      hipotesis: { nula: 'las variables son independientes', alternativa: 'las variables están asociadas' },
      decision: {
        rechazarH0: prueba.rechazarH0,
        texto: textoDecision(prueba.rechazarH0, 'χ^{2}', prueba.estadistico, prueba.valorP, alfa),
      },
      metricas: [
        { simbolo: 'χ^{2}', etiqueta: 'Estadístico', valor: prueba.estadistico },
        { simbolo: 'p', etiqueta: 'Valor p', valor: prueba.valorP, esValorP: true },
        { simbolo: 'χ^{2}_{α}', etiqueta: 'Valor crítico', valor: prueba.valorCritico },
        { simbolo: 'ν', etiqueta: 'Grados de libertad', valor: prueba.gl },
        { simbolo: 'V', etiqueta: 'V de Cramér', valor: prueba.vCramer },
        { simbolo: 'n', etiqueta: 'Total de observaciones', valor: analisis.total },
      ],
      graficas: [
        {
          tipo: 'distribucion',
          distribucion: { tipo: 'chi2', gl: prueba.gl },
          estadistico: prueba.estadistico,
          valoresCriticos: [prueba.valorCritico],
          tipoPrueba: 'derecha',
          simbolo: 'χ^{2}',
          alfa,
        },
      ],
      tablas,
      interpretacion: (f) =>
        prueba.rechazarH0
          ? `Existe evidencia de asociación entre las variables (χ² = ${f(prueba.estadistico)}, valor p ${formatearValorP(prueba.valorP)}). La V de Cramér (${f(prueba.vCramer)}) cuantifica la intensidad de la asociación entre 0 y 1.`
          : `No hay evidencia suficiente para afirmar que las variables estén asociadas (χ² = ${f(prueba.estadistico)}, valor p ${formatearValorP(prueba.valorP)}).`,
      avisos:
        prueba.celdasEsperadaMenorCinco > 0
          ? [`${prueba.celdasEsperadaMenorCinco} celda(s) tienen frecuencia esperada menor que 5; la aproximación ji-cuadrada puede no ser válida.`]
          : undefined,
      origenCriticos: prueba.origenCritico,
    };
  },
};

/* -------------------------------------------------------------------------- */
/* 4.2.1 Bondad de ajuste de Pearson                                           */
/* -------------------------------------------------------------------------- */

const bondadAjuste: DefinicionCalculadora = {
  id: 'bondad-ajuste',
  unidad: 4,
  seccion: '4.2.1',
  titulo: 'Bondad de ajuste ji-cuadrada',
  resumen: 'Compara frecuencias observadas con las esperadas bajo una distribución teórica.',
  modalidades: ['Prueba de hipótesis'],
  campos: [
    separador('s-datos', 'Frecuencias'),
    { tipo: 'datos', id: 'observadas', etiqueta: 'Frecuencias observadas o₁, …, oₖ', formato: 'vector', filas: 2 },
    {
      tipo: 'datos',
      id: 'probabilidades',
      etiqueta: 'Probabilidades teóricas p₁, …, pₖ (opcional)',
      formato: 'vector',
      filas: 2,
      ayuda: 'Si se omiten, se asume una distribución uniforme. Deben sumar 1.',
    },
    separador('s-parametros', 'Parámetros'),
    {
      tipo: 'numero',
      id: 'parametros',
      etiqueta: 'Parámetros estimados de la muestra',
      simbolo: 'm',
      ayuda: 'Se restan de los grados de libertad: ν = k − 1 − m.',
      ancho: 'medio',
    },
    { ...campoAlfa(), ancho: 'medio' },
  ],
  valoresIniciales: { observadas: '', probabilidades: '', parametros: '0', alfa: '0.05' },
  ejemplo: {
    descripcion: 'Walpole et al. (2012), cap. 10: 120 lanzamientos de un dado para verificar que es legal.',
    valores: { observadas: '20 22 17 18 19 24', probabilidades: '', parametros: '0', alfa: '0.05' },
  },
  formulas: ['χ^{2} = Σ(o_{i} − e_{i})^{2}/e_{i},   e_{i} = n·p_{i}', 'ν = k − 1 − m'],
  calcular: (v) => {
    const observadas = leerVector(v, 'observadas', { etiqueta: 'Las frecuencias observadas', minimo: 2, enteros: true, noNegativos: true });
    const probabilidades = leerVectorOpcional(v, 'probabilidades', { etiqueta: 'Las probabilidades', minimo: 2, noNegativos: true });
    const parametrosEstimados = leerNumero(v, 'parametros', { etiqueta: 'El número de parámetros', entero: true, minimo: 0 });
    const alfa = leerAlfa(v);
    const prueba = conCampo(probabilidades ? 'probabilidades' : 'observadas', () =>
      pruebaBondadAjuste(observadas, { probabilidades, parametrosEstimados }, alfa),
    );
    const categorias = observadas.map((_, i) => `Categoría ${i + 1}`);
    return {
      etiqueta: 'Prueba de bondad de ajuste de Pearson',
      principal: { tipo: 'numero', simbolo: 'χ^{2}', valor: prueba.estadistico },
      secundario: { etiqueta: 'Valor p', valor: prueba.valorP, esValorP: true },
      hipotesis: { nula: 'los datos siguen la distribución propuesta', alternativa: 'los datos no siguen la distribución propuesta' },
      decision: {
        rechazarH0: prueba.rechazarH0,
        texto: textoDecision(prueba.rechazarH0, 'χ^{2}', prueba.estadistico, prueba.valorP, alfa),
      },
      metricas: [
        { simbolo: 'χ^{2}', etiqueta: 'Estadístico', valor: prueba.estadistico },
        { simbolo: 'p', etiqueta: 'Valor p', valor: prueba.valorP, esValorP: true },
        { simbolo: 'χ^{2}_{α}', etiqueta: 'Valor crítico', valor: prueba.valorCritico },
        { simbolo: 'ν', etiqueta: 'Grados de libertad', valor: prueba.gl },
        { simbolo: 'k', etiqueta: 'Categorías', valor: observadas.length },
        { simbolo: 'n', etiqueta: 'Total observado', valor: prueba.n },
      ],
      graficas: [
        {
          tipo: 'barras',
          categorias,
          series: [
            { nombre: 'Observadas', valores: observadas },
            { nombre: 'Esperadas', valores: prueba.esperadas },
          ],
          etiquetaY: 'Frecuencia',
        },
        {
          tipo: 'distribucion',
          distribucion: { tipo: 'chi2', gl: prueba.gl },
          estadistico: prueba.estadistico,
          valoresCriticos: [prueba.valorCritico],
          tipoPrueba: 'derecha',
          simbolo: 'χ^{2}',
          alfa,
        },
      ],
      tablas: [
        {
          titulo: 'Frecuencias observadas y esperadas',
          columnas: ['Categoría', 'Observada', 'Probabilidad', 'Esperada', '(o − e)² / e'],
          filas: observadas.map((o, i) => [categorias[i], o, prueba.esperadas[i] / prueba.n, prueba.esperadas[i], prueba.contribuciones[i]]),
        },
      ],
      avisos:
        prueba.celdasEsperadaMenorCinco > 0
          ? [`${prueba.celdasEsperadaMenorCinco} categoría(s) con frecuencia esperada menor que 5; considere agrupar categorías.`]
          : undefined,
      origenCriticos: prueba.origenCritico,
    };
  },
};

/* -------------------------------------------------------------------------- */
/* 4.2.3 - 4.2.5 Normalidad                                                    */
/* -------------------------------------------------------------------------- */

const normalidad: DefinicionCalculadora = {
  id: 'normalidad',
  unidad: 4,
  seccion: '4.2.3–4.2.5',
  titulo: 'Pruebas de normalidad',
  resumen: 'Anderson-Darling y Kolmogorov-Smirnov con gráfica de probabilidad normal.',
  modalidades: ['Prueba de hipótesis'],
  campos: [
    separador('s-datos', 'Muestra'),
    { tipo: 'datos', id: 'datos', etiqueta: 'Observaciones', formato: 'vector', filas: 4 },
    separador('s-parametros', 'Parámetros'),
    campoAlfa(),
  ],
  valoresIniciales: { datos: '', alfa: '0.05' },
  ejemplo: {
    descripcion: 'Ejemplo ilustrativo: latencia (ms) de 20 solicitudes a un servicio.',
    valores: {
      datos: '12.4 11.8 13.1 12.9 12.2 11.5 13.6 12.7 12.0 12.5 13.3 11.9 12.8 12.3 12.6 11.7 13.0 12.1 12.4 12.9',
      alfa: '0.05',
    },
  },
  formulas: ['A^{2} = −n − (1/n)Σ(2i − 1)[ln F(x_{(i)}) + ln(1 − F(x_{(n+1−i)}))]', 'D = máx |F_{n}(x) − F_{0}(x)|'],
  calcular: (v) => {
    const datos = leerVector(v, 'datos', { etiqueta: 'Las observaciones', minimo: 3 });
    const alfa = leerAlfa(v);
    const ad = conCampo('datos', () => pruebaAndersonDarling(datos, alfa));
    const ks = conCampo('datos', () => pruebaKolmogorovSmirnov(datos, alfa));
    const n = datos.length;
    const ordenados = ordenar(datos);
    const cuantiles = ordenados.map((_, i) => cuantilNormal((i + 1 - 0.375) / (n + 0.25)));
    const avisos = [
      'La prueba de Kolmogorov-Smirnov con media y varianza estimadas (caso de Lilliefors) produce un valor p conservador.',
      'La prueba de Shapiro-Wilk (§4.2.5) está planificada para una fase posterior.',
    ];
    if (n < 8) avisos.unshift('Con n < 8, la aproximación del valor p de Anderson-Darling pierde precisión.');
    return {
      etiqueta: 'Prueba de Anderson-Darling',
      principal: { tipo: 'numero', simbolo: 'A^{2}', valor: ad.A2 },
      secundario: { etiqueta: 'Valor p', valor: ad.valorP, esValorP: true },
      hipotesis: { nula: 'los datos provienen de una distribución normal', alternativa: 'los datos no provienen de una distribución normal' },
      decision: {
        rechazarH0: ad.rechazarH0,
        texto: textoDecision(ad.rechazarH0, 'A^{2}', ad.A2Ajustado, ad.valorP, alfa),
      },
      metricas: [
        { simbolo: 'A^{2}', etiqueta: 'Anderson-Darling', valor: ad.A2 },
        { simbolo: 'A^{2}*', etiqueta: 'Ajustado por n', valor: ad.A2Ajustado },
        { simbolo: 'p', etiqueta: 'Valor p (A-D)', valor: ad.valorP, esValorP: true },
        { simbolo: 'D', etiqueta: 'Kolmogorov-Smirnov', valor: ks.D },
        { simbolo: 'p', etiqueta: 'Valor p (K-S)', valor: ks.valorP, esValorP: true },
        { simbolo: 'D_{α}', etiqueta: 'Crítico K-S', valor: ks.valorCritico },
        { simbolo: 'x̄', etiqueta: 'Media', valor: ad.media },
        { simbolo: 's', etiqueta: 'Desviación estándar', valor: ad.desviacion },
        { simbolo: 'n', etiqueta: 'Observaciones', valor: n },
      ],
      graficas: [
        {
          tipo: 'dispersion',
          puntos: ordenados.map((valor, i) => ({ x: cuantiles[i], y: valor })),
          recta: { b0: ad.media, b1: desviacionEstandar(datos) },
          etiquetaX: 'Cuantil normal estándar',
          etiquetaY: 'Dato ordenado',
          titulo: 'Gráfica de probabilidad normal',
        },
      ],
      tablas: [
        {
          titulo: 'Resumen de pruebas de normalidad',
          columnas: ['Prueba', 'Estadístico', 'Valor p', 'Decisión'],
          filas: [
            ['Anderson-Darling (§4.2.4)', ad.A2Ajustado, ad.valorP, ad.rechazarH0 ? 'Se rechaza H₀' : 'No se rechaza H₀'],
            ['Kolmogorov-Smirnov (§4.2.3)', ks.D, ks.valorP, ks.rechazarH0 ? 'Se rechaza H₀' : 'No se rechaza H₀'],
            ['Shapiro-Wilk (§4.2.5)', 'Pendiente', null, 'Planificada'],
          ],
          columnasValorP: [2],
        },
      ],
      interpretacion: () =>
        ad.rechazarH0
          ? `La muestra presenta desviaciones significativas respecto a la normalidad (valor p ${formatearValorP(ad.valorP)} < α = ${alfa}). Los procedimientos que suponen normalidad deben aplicarse con cautela.`
          : `No se detectan desviaciones significativas respecto a la normalidad (valor p ${formatearValorP(ad.valorP)}). Si los puntos de la gráfica de probabilidad siguen la recta, el supuesto es razonable.`,
      avisos,
    };
  },
};

/* -------------------------------------------------------------------------- */
/* 4.2.6 Kruskal-Wallis                                                        */
/* -------------------------------------------------------------------------- */

const kruskalWallis: DefinicionCalculadora = {
  id: 'kruskal-wallis',
  unidad: 4,
  seccion: '4.2.6',
  titulo: 'Prueba no paramétrica de Kruskal-Wallis',
  resumen: 'Comparación de k muestras independientes mediante rangos, sin suponer normalidad.',
  modalidades: ['Prueba de hipótesis'],
  campos: [
    separador('s-datos', 'Muestras'),
    {
      tipo: 'datos',
      id: 'grupos',
      etiqueta: 'Grupos (uno por línea)',
      formato: 'grupos',
      filas: 5,
      placeholder: 'Algoritmo A: 12.1 14.3 11.8\nAlgoritmo B: 15.2 16.8 14.9',
      ayuda: 'Formato: "Nombre: valores". El nombre es opcional.',
    },
    separador('s-parametros', 'Parámetros'),
    campoAlfa(),
  ],
  valoresIniciales: { grupos: '', alfa: '0.05' },
  ejemplo: {
    descripcion: 'Ejemplo ilustrativo: tiempo de ejecución (s) de tres algoritmos sobre cinco instancias.',
    valores: {
      grupos: 'Algoritmo A: 12.1 14.3 11.8 13.5 12.9\nAlgoritmo B: 15.2 16.8 14.9 17.1 15.5\nAlgoritmo C: 13.0 12.4 14.1 13.8 12.7',
      alfa: '0.05',
    },
  },
  formulas: ['H = 12/(N(N + 1)) · ΣR^{2}_{i}/n_{i} − 3(N + 1)'],
  calcular: (v) => {
    const { nombres, grupos } = leerGrupos(v, 'grupos', { etiqueta: 'Los grupos', minimoGrupos: 2 });
    const alfa = leerAlfa(v);
    const prueba = conCampo('grupos', () => pruebaKruskalWallis(grupos, alfa));
    return {
      etiqueta: 'Prueba de Kruskal-Wallis',
      principal: { tipo: 'numero', simbolo: 'H', valor: prueba.HCorregido },
      secundario: { etiqueta: 'Valor p', valor: prueba.valorP, esValorP: true },
      hipotesis: { nula: 'las k poblaciones tienen la misma distribución', alternativa: 'al menos una población difiere' },
      decision: {
        rechazarH0: prueba.rechazarH0,
        texto: textoDecision(prueba.rechazarH0, 'H', prueba.HCorregido, prueba.valorP, alfa),
      },
      metricas: [
        { simbolo: 'H', etiqueta: 'Estadístico', valor: prueba.H },
        { simbolo: 'H_{c}', etiqueta: 'Corregido por empates', valor: prueba.HCorregido },
        { simbolo: 'p', etiqueta: 'Valor p', valor: prueba.valorP, esValorP: true },
        { simbolo: 'χ^{2}_{α}', etiqueta: 'Valor crítico', valor: prueba.valorCritico },
        { simbolo: 'ν', etiqueta: 'Grados de libertad', valor: prueba.gl },
        { simbolo: 'N', etiqueta: 'Observaciones', valor: prueba.tamanos.reduce((a, b) => a + b, 0) },
      ],
      graficas: [
        {
          tipo: 'barras',
          categorias: nombres,
          series: [{ nombre: 'Rango promedio', valores: prueba.rangosPromedio }],
          etiquetaY: 'Rango promedio',
        },
      ],
      tablas: [
        {
          titulo: 'Rangos por grupo',
          columnas: ['Grupo', 'n', 'Suma de rangos', 'Rango promedio'],
          filas: nombres.map((nombre, i) => [nombre, prueba.tamanos[i], prueba.sumaRangos[i], prueba.rangosPromedio[i]]),
        },
      ],
      avisos:
        Math.min(...prueba.tamanos) < 5
          ? ['Con grupos de menos de 5 observaciones, la aproximación ji-cuadrada de H es poco precisa.']
          : undefined,
      origenCriticos: prueba.origenCritico,
    };
  },
};

/* -------------------------------------------------------------------------- */
/* 4.3.2 ANOVA de un factor con comparaciones múltiples                        */
/* -------------------------------------------------------------------------- */

const anovaUnFactorCalculadora: DefinicionCalculadora = {
  id: 'anova-un-factor',
  unidad: 4,
  seccion: '4.3.2 y 4.3.5',
  titulo: 'ANOVA de un factor y comparación de medias',
  resumen: 'Análisis de varianza para k tratamientos con comparaciones múltiples HSD de Tukey o LSD de Fisher.',
  modalidades: ['Análisis', 'Prueba de hipótesis'],
  campos: [
    separador('s-datos', 'Tratamientos'),
    {
      tipo: 'datos',
      id: 'grupos',
      etiqueta: 'Observaciones por tratamiento (uno por línea)',
      formato: 'grupos',
      filas: 6,
      placeholder: '160 W: 575 542 530 539 570\n180 W: 565 593 590 579 610',
      ayuda: 'Formato: "Nombre: valores". El nombre es opcional.',
    },
    separador('s-parametros', 'Parámetros'),
    campoAlfa(),
    {
      tipo: 'opciones',
      id: 'posthoc',
      etiqueta: 'Comparación de parejas de medias',
      opciones: [
        { valor: 'tukey', etiqueta: 'HSD de Tukey' },
        { valor: 'lsd', etiqueta: 'LSD de Fisher' },
        { valor: 'ninguno', etiqueta: 'Ninguna' },
      ],
    },
  ],
  valoresIniciales: { grupos: '', alfa: '0.05', posthoc: 'tukey' },
  ejemplo: {
    descripcion: 'Montgomery (2017), cap. 3: tasa de grabado en plasma según potencia de radiofrecuencia.',
    valores: {
      grupos:
        '160 W: 575 542 530 539 570\n180 W: 565 593 590 579 610\n200 W: 600 651 610 637 629\n220 W: 725 700 715 685 710',
      alfa: '0.05',
      posthoc: 'tukey',
    },
  },
  formulas: ['F = [SSTr/(k − 1)] / [SSE/(N − k)]', 'HSD = q_{α}(k, N − k) √(MSE/n)', 'LSD = t_{α/2, N−k} √(MSE(1/n_{i} + 1/n_{j}))'],
  calcular: (v) => {
    const { nombres, grupos } = leerGrupos(v, 'grupos', { etiqueta: 'Los tratamientos', minimoGrupos: 2, prefijo: 'Tratamiento' });
    const alfa = leerAlfa(v);
    const anova = conCampo('grupos', () => anovaUnFactor(grupos, alfa));
    const comparaciones =
      v.posthoc === 'lsd' ? comparacionesLSD(anova, alfa) : v.posthoc === 'ninguno' ? undefined : comparacionesTukey(anova, alfa);

    const tablas: TablaResultado[] = [
      tablaAnova(anova.tabla),
      {
        titulo: 'Estadísticos por tratamiento',
        columnas: ['Tratamiento', 'n', 'Media', 'Desviación estándar'],
        filas: nombres.map((nombre, i) => [nombre, anova.tamanos[i], anova.medias[i], grupos[i].length > 1 ? desviacionEstandar(grupos[i]) : null]),
      },
    ];
    if (comparaciones) {
      tablas.push({
        titulo: `Comparaciones múltiples: ${comparaciones.metodo} (valor crítico ${comparaciones.valorCritico.toFixed(4)})`,
        columnas: ['Pareja', 'Diferencia', 'Umbral', 'Límite inferior', 'Límite superior', 'Valor p', 'Conclusión'],
        filas: comparaciones.comparaciones.map((c) => [
          `${nombres[c.i]} − ${nombres[c.j]}`,
          c.diferencia,
          c.umbral,
          c.limiteInferior,
          c.limiteSuperior,
          c.valorP,
          c.significativa ? 'Difieren' : 'No difieren',
        ]),
        columnasValorP: [5],
        filasResaltadas: comparaciones.comparaciones.map((c, i) => (c.significativa ? i : -1)).filter((i) => i >= 0),
        nota: 'Las filas resaltadas corresponden a parejas de medias con diferencia significativa.',
      });
    }

    return {
      etiqueta: 'ANOVA de un factor',
      principal: { tipo: 'numero', simbolo: 'F', valor: anova.estadistico },
      secundario: { etiqueta: 'Valor p', valor: anova.valorP, esValorP: true },
      hipotesis: { nula: 'μ_{1} = μ_{2} = … = μ_{k}', alternativa: 'al menos una media difiere' },
      decision: {
        rechazarH0: anova.rechazarH0,
        texto: textoDecision(anova.rechazarH0, 'F', anova.estadistico, anova.valorP, alfa),
      },
      metricas: [
        { simbolo: 'F', etiqueta: 'Estadístico', valor: anova.estadistico },
        { simbolo: 'p', etiqueta: 'Valor p', valor: anova.valorP, esValorP: true },
        { simbolo: 'f_{α}', etiqueta: 'Valor crítico', valor: anova.valorCritico },
        { simbolo: 'MSE', etiqueta: 'Cuadrado medio del error', valor: anova.cuadradoMedioError },
        { simbolo: 'ν_{1}, ν_{2}', etiqueta: 'Grados de libertad', valor: `${anova.glTratamientos}, ${anova.glError}` },
        { simbolo: 'N', etiqueta: 'Observaciones', valor: anova.N },
      ],
      graficas: [
        { tipo: 'barras', categorias: nombres, series: [{ nombre: 'Media', valores: anova.medias }], etiquetaY: 'Media del tratamiento' },
        {
          tipo: 'distribucion',
          distribucion: { tipo: 'f', gl1: anova.glTratamientos, gl2: anova.glError },
          estadistico: anova.estadistico,
          valoresCriticos: [anova.valorCritico],
          tipoPrueba: 'derecha',
          simbolo: 'F',
          alfa,
        },
      ],
      tablas,
      interpretacion: () => {
        const base = anova.rechazarH0
          ? 'Existe evidencia de que al menos un tratamiento tiene una media distinta.'
          : 'No hay evidencia de diferencias entre las medias de los tratamientos.';
        if (!comparaciones || !anova.rechazarH0) return base;
        const distintas = comparaciones.comparaciones.filter((c) => c.significativa).length;
        return `${base} Según ${comparaciones.metodo}, ${distintas} de ${comparaciones.comparaciones.length} parejas de medias difieren significativamente.`;
      },
      origenCriticos: anova.origenCritico,
    };
  },
};

/* -------------------------------------------------------------------------- */
/* 4.3.3 Bloques completos aleatorizados                                       */
/* -------------------------------------------------------------------------- */

const anovaBloquesCalculadora: DefinicionCalculadora = {
  id: 'anova-bloques',
  unidad: 4,
  seccion: '4.3.3',
  titulo: 'Diseño de bloques completos aleatorizados',
  resumen: 'ANOVA con un factor de tratamiento y un factor de bloque, una observación por celda.',
  modalidades: ['Análisis', 'Prueba de hipótesis'],
  campos: [
    separador('s-datos', 'Matriz tratamientos × bloques'),
    {
      tipo: 'datos',
      id: 'datos',
      etiqueta: 'Filas: tratamientos; columnas: bloques',
      formato: 'matriz',
      filas: 6,
      placeholder: 'B1 B2 B3 B4\nPunta 1: 9.3 9.4 9.6 10.0',
      ayuda: 'Opcional: primera línea con nombres de bloques y "Nombre:" al inicio de cada tratamiento.',
    },
    separador('s-parametros', 'Parámetros'),
    campoAlfa(),
  ],
  valoresIniciales: { datos: '', alfa: '0.05' },
  ejemplo: {
    descripcion: 'Montgomery (2017), cap. 4: dureza medida con cuatro puntas sobre cuatro probetas (bloques).',
    valores: {
      datos:
        'Probeta1 Probeta2 Probeta3 Probeta4\nPunta 1: 9.3 9.4 9.6 10.0\nPunta 2: 9.4 9.3 9.8 9.9\nPunta 3: 9.2 9.4 9.5 9.7\nPunta 4: 9.7 9.6 10.0 10.2',
      alfa: '0.05',
    },
  },
  formulas: ['SST = SSTr + SSB + SSE', 'F_{Tr} = MSTr/MSE,   ν_{E} = (t − 1)(b − 1)'],
  calcular: (v) => {
    const { encabezados, etiquetasFila, filas } = leerMatriz(v, 'datos', {
      etiqueta: 'La matriz',
      columnasMinimas: 2,
      filasMinimas: 2,
      permitirEncabezado: true,
    });
    const alfa = leerAlfa(v);
    const anova = conCampo('datos', () => anovaBloques(filas, alfa));
    const bloques = encabezados ?? filas[0].map((_, j) => `Bloque ${j + 1}`);
    const tratamiento = anova.efectoTratamiento;
    return {
      etiqueta: 'ANOVA de bloques completos aleatorizados',
      principal: { tipo: 'numero', simbolo: 'F_{Tr}', valor: tratamiento.estadistico },
      secundario: { etiqueta: 'Valor p de tratamientos', valor: tratamiento.valorP, esValorP: true },
      hipotesis: { nula: 'τ_{1} = τ_{2} = … = τ_{t} = 0', alternativa: 'al menos un efecto de tratamiento τ_{i} ≠ 0' },
      decision: {
        rechazarH0: tratamiento.rechazarH0,
        texto: textoDecision(tratamiento.rechazarH0, 'F', tratamiento.estadistico, tratamiento.valorP, alfa),
      },
      metricas: [
        { simbolo: 'F_{Tr}', etiqueta: 'Tratamientos', valor: tratamiento.estadistico },
        { simbolo: 'p', etiqueta: 'Valor p (tratamientos)', valor: tratamiento.valorP, esValorP: true },
        { simbolo: 'f_{α}', etiqueta: 'Crítico (tratamientos)', valor: tratamiento.valorCritico },
        { simbolo: 'F_{B}', etiqueta: 'Bloques', valor: anova.efectoBloque.estadistico },
        { simbolo: 'p', etiqueta: 'Valor p (bloques)', valor: anova.efectoBloque.valorP, esValorP: true },
        { simbolo: 'MSE', etiqueta: 'Cuadrado medio del error', valor: anova.cuadradoMedioError },
      ],
      graficas: [
        {
          tipo: 'barras',
          categorias: etiquetasFila,
          series: [{ nombre: 'Media', valores: anova.mediasTratamiento }],
          etiquetaY: 'Media del tratamiento',
        },
      ],
      tablas: [
        tablaAnova(anova.tabla),
        {
          titulo: 'Datos con medias marginales',
          columnas: ['', ...bloques, 'Media'],
          filas: [
            ...filas.map((fila, i) => [etiquetasFila[i], ...fila, anova.mediasTratamiento[i]]),
            ['Media', ...anova.mediasBloque, anova.mediaGeneral],
          ],
        },
      ],
      interpretacion: () =>
        `${tratamiento.rechazarH0 ? 'Los tratamientos tienen un efecto significativo' : 'No se detecta efecto significativo de los tratamientos'} una vez descontada la variabilidad entre bloques. ${
          anova.efectoBloque.rechazarH0
            ? 'El bloqueo resultó efectivo: los bloques difieren significativamente.'
            : 'Los bloques no difieren significativamente.'
        }`,
      origenCriticos: tratamiento.origenCritico,
    };
  },
};

/* -------------------------------------------------------------------------- */
/* 4.3.4 Diseño factorial                                                      */
/* -------------------------------------------------------------------------- */

const anovaFactorialCalculadora: DefinicionCalculadora = {
  id: 'anova-factorial',
  unidad: 4,
  seccion: '4.3.4',
  titulo: 'Diseño factorial de dos factores',
  resumen: 'ANOVA con efectos principales de A y B, e interacción AB, con réplicas por celda.',
  modalidades: ['Análisis', 'Prueba de hipótesis'],
  campos: [
    separador('s-datos', 'Celdas del diseño'),
    {
      tipo: 'datos',
      id: 'datos',
      etiqueta: 'Una línea por nivel de A; celdas de B separadas por |',
      formato: 'factorial',
      filas: 5,
      placeholder: 'Material 1: 130 155 74 180 | 34 40 80 75 | 20 70 82 58',
      ayuda: 'Cada celda contiene las réplicas; todas las celdas deben tener el mismo número de réplicas.',
    },
    separador('s-parametros', 'Parámetros'),
    campoAlfa(),
  ],
  valoresIniciales: { datos: '', alfa: '0.05' },
  ejemplo: {
    descripcion: 'Montgomery (2017), cap. 5: vida de baterías según material (A) y temperatura 15, 70 y 125 °F (B).',
    valores: {
      datos:
        'Material 1: 130 155 74 180 | 34 40 80 75 | 20 70 82 58\nMaterial 2: 150 188 159 126 | 136 122 106 115 | 25 70 58 45\nMaterial 3: 138 110 168 160 | 174 120 150 139 | 96 104 82 60',
      alfa: '0.05',
    },
  },
  formulas: ['SST = SSA + SSB + SSAB + SSE', 'ν_{E} = ab(n − 1)'],
  calcular: (v) => {
    const { nombresA, celdas } = leerFactorial(v, 'datos', { etiqueta: 'El diseño' });
    const alfa = leerAlfa(v);
    const anova = conCampo('datos', () => anovaFactorial(celdas, alfa));
    const nivelesB = celdas[0].map((_, j) => `B${j + 1}`);
    const efectos: [string, ContrasteCritico][] = [
      ['Factor A', anova.efectoA],
      ['Factor B', anova.efectoB],
      ['Interacción AB', anova.interaccion],
    ];
    const metricas: MetricaResultado[] = [
      { simbolo: 'F_{A}', etiqueta: 'Factor A', valor: anova.efectoA.estadistico },
      { simbolo: 'F_{B}', etiqueta: 'Factor B', valor: anova.efectoB.estadistico },
      { simbolo: 'F_{AB}', etiqueta: 'Interacción', valor: anova.interaccion.estadistico },
      { simbolo: 'p_{A}', etiqueta: 'Valor p', valor: anova.efectoA.valorP, esValorP: true },
      { simbolo: 'p_{B}', etiqueta: 'Valor p', valor: anova.efectoB.valorP, esValorP: true },
      { simbolo: 'p_{AB}', etiqueta: 'Valor p', valor: anova.interaccion.valorP, esValorP: true },
      { simbolo: 'MSE', etiqueta: 'Cuadrado medio del error', valor: anova.cuadradoMedioError },
      { simbolo: 'n', etiqueta: 'Réplicas por celda', valor: anova.replicas },
      { simbolo: 'a × b', etiqueta: 'Niveles', valor: `${anova.nivelesA} × ${anova.nivelesB}` },
      {
        simbolo: 'R^{2}',
        etiqueta: 'Variabilidad explicada',
        valor: 1 - anova.tabla[3].sumaCuadrados / anova.tabla[4].sumaCuadrados,
        nota: formatearPorcentaje(1 - anova.tabla[3].sumaCuadrados / anova.tabla[4].sumaCuadrados),
      },
    ];
    return {
      etiqueta: `ANOVA factorial ${anova.nivelesA} × ${anova.nivelesB}`,
      principal: { tipo: 'numero', simbolo: 'F_{AB}', valor: anova.interaccion.estadistico },
      secundario: { etiqueta: 'Valor p de la interacción', valor: anova.interaccion.valorP, esValorP: true },
      hipotesis: { nula: '(τβ)_{ij} = 0 para toda i, j', alternativa: 'al menos una interacción (τβ)_{ij} ≠ 0' },
      decision: {
        rechazarH0: anova.interaccion.rechazarH0,
        texto: textoDecision(anova.interaccion.rechazarH0, 'F_{AB}', anova.interaccion.estadistico, anova.interaccion.valorP, alfa),
      },
      metricas,
      graficas: [
        {
          tipo: 'barras',
          categorias: nombresA,
          series: nivelesB.map((nombre, j) => ({ nombre, valores: anova.mediasCelda.map((fila) => fila[j]) })),
          etiquetaY: 'Media de la celda',
        },
      ],
      tablas: [
        tablaAnova(anova.tabla),
        {
          titulo: 'Decisión por efecto',
          columnas: ['Efecto', 'F', 'f crítico', 'Valor p', 'Conclusión'],
          filas: efectos.map(([nombre, efecto]) => [nombre, efecto.estadistico, efecto.valorCritico, efecto.valorP, decisionEfecto(efecto)]),
          columnasValorP: [3],
          filasResaltadas: efectos.map(([, efecto], i) => (efecto.rechazarH0 ? i : -1)).filter((i) => i >= 0),
        },
        {
          titulo: 'Medias de celda y marginales',
          columnas: ['', ...nivelesB, 'Media A'],
          filas: [
            ...anova.mediasCelda.map((fila, i) => [nombresA[i], ...fila, anova.mediasA[i]]),
            ['Media B', ...anova.mediasB, anova.mediaGeneral],
          ],
        },
      ],
      interpretacion: () =>
        anova.interaccion.rechazarH0
          ? 'La interacción AB es significativa: el efecto de un factor depende del nivel del otro, por lo que los efectos principales deben interpretarse con cautela.'
          : `La interacción AB no es significativa. ${
              anova.efectoA.rechazarH0 ? 'El factor A tiene efecto significativo' : 'El factor A no tiene efecto significativo'
            } y ${anova.efectoB.rechazarH0 ? 'el factor B tiene efecto significativo.' : 'el factor B no tiene efecto significativo.'}`,
      origenCriticos: anova.interaccion.origenCritico,
    };
  },
};

export const CALCULADORAS_UNIDAD_4: DefinicionCalculadora[] = [
  tablaContingencia,
  bondadAjuste,
  normalidad,
  kruskalWallis,
  anovaUnFactorCalculadora,
  anovaBloquesCalculadora,
  anovaFactorialCalculadora,
];
