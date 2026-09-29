/**
 * Calculadoras de la Unidad II: regresión lineal simple y correlación.
 */
import type { TablaResultado } from '../../../components/MathResults/tipos';
import { formatearPorcentaje } from '../../../utils/formato';
import { cuantilT, sfT } from '../../../utils/math/distribuciones';
import {
  correlacionPearson,
  inferenciaPendiente,
  minimosCuadrados,
  normalidadDelError,
  predecir,
} from '../../../utils/math/unidad2_regresion';
import type { ResultadoAndersonDarling } from '../../../utils/math/unidad4_anova';
import { campoAlfa, campoConfianza, campoTipoPrueba, leerTipoPrueba, resultadoPrueba, separador, textoDecision } from './comunes';
import { ErrorCampo, leerAlfa, leerConfianza, leerNumeroOpcional, leerVector } from './lectura';
import type { DefinicionCalculadora, ValoresFormulario } from './tipos';

const EJEMPLO_X = '2.1 3.4 4.0 5.2 6.1 7.3 8.0 9.4 10.2 11.5';
const EJEMPLO_Y = '18 26 30 38 45 50 57 66 70 80';

function leerPares(v: ValoresFormulario): { x: number[]; y: number[] } {
  const x = leerVector(v, 'x', { etiqueta: 'La variable x', minimo: 3 });
  const y = leerVector(v, 'y', { etiqueta: 'La variable y', minimo: 3 });
  if (x.length !== y.length) {
    throw new ErrorCampo('y', `Se capturaron ${x.length} valores de x y ${y.length} de y; deben coincidir.`);
  }
  return { x, y };
}

/** Tabla de normalidad del error compartida por las unidades II y III. */
export function tablaNormalidad(prueba: ResultadoAndersonDarling | undefined, alfa: number): TablaResultado[] {
  if (!prueba) return [];
  return [
    {
      titulo: 'Prueba de normalidad del error (Anderson-Darling sobre residuales)',
      columnas: ['Datos', 'A²', 'A² ajustado', 'Valor p', 'Conclusión'],
      filas: [
        [
          'Residuales',
          prueba.A2,
          prueba.A2Ajustado,
          prueba.valorP,
          prueba.valorP < alfa ? 'Se rechaza la normalidad' : 'No se rechaza la normalidad',
        ],
      ],
      columnasValorP: [3],
      nota: `Nivel de significancia α = ${Number(alfa.toFixed(4))}. H₀: los errores siguen una distribución normal.`,
    },
  ];
}

/** Ejecuta una prueba que puede no estar definida (por ejemplo, residuales nulos) sin interrumpir el cálculo. */
export function intentar<T>(calculo: () => T): T | undefined {
  try {
    return calculo();
  } catch {
    return undefined;
  }
}

const regresionSimple: DefinicionCalculadora = {
  id: 'regresion-simple',
  unidad: 2,
  seccion: '2.1–2.4',
  titulo: 'Regresión lineal simple',
  resumen: 'Recta de mínimos cuadrados, significancia, inferencia sobre la pendiente, predicción y normalidad del error.',
  modalidades: ['Modelo', 'Prueba de hipótesis', 'Intervalo'],
  campos: [
    separador('s-datos', 'Datos pareados'),
    { tipo: 'datos', id: 'x', etiqueta: 'Variable independiente x', formato: 'vector', filas: 3, placeholder: '2.1 3.4 4.0 …' },
    {
      tipo: 'datos',
      id: 'y',
      etiqueta: 'Variable de respuesta y',
      formato: 'vector',
      filas: 3,
      placeholder: '18 26 30 …',
      ayuda: 'Los valores se emparejan por posición con los de x.',
    },
    separador('s-parametros', 'Parámetros'),
    campoConfianza(undefined),
    {
      tipo: 'numero',
      id: 'x0',
      etiqueta: 'Valor para predicción (opcional)',
      simbolo: 'x_{0}',
      ayuda: 'Si se captura, se calculan los intervalos para la respuesta media y para una nueva observación.',
    },
  ],
  valoresIniciales: { x: '', y: '', confianza: '95', x0: '' },
  ejemplo: {
    descripcion: 'Ejemplo ilustrativo: tamaño de un módulo (miles de líneas de código) y esfuerzo de desarrollo (horas-persona).',
    valores: { x: EJEMPLO_X, y: EJEMPLO_Y, confianza: '95', x0: '7' },
  },
  formulas: ['b_{1} = S_{xy}/S_{xx},   b_{0} = ȳ − b_{1}x̄', 't = b_{1} / (s/√S_{xx})', 'R^{2} = 1 − SSE/SST'],
  calcular: (v) => {
    const { x, y } = leerPares(v);
    const confianza = leerConfianza(v);
    const alfa = 1 - confianza;
    const nivel = formatearPorcentaje(confianza);
    const x0 = leerNumeroOpcional(v, 'x0', { etiqueta: 'El valor x₀' });
    const modelo = minimosCuadrados(x, y);
    const pendiente = inferenciaPendiente(modelo, { alfa, tipo: 'bilateral' });
    const prediccion = x0 !== undefined ? predecir(modelo, x0, confianza) : undefined;
    const normalidad = intentar(() => normalidadDelError(modelo, alfa));
    const tCritico = cuantilT(1 - alfa / 2, modelo.gl);
    const tIntercepto = modelo.b0 / modelo.errorEstandarB0;

    const tablas: TablaResultado[] = [
      {
        titulo: 'Análisis de varianza de la regresión',
        columnas: ['Fuente', 'SC', 'gl', 'CM', 'F', 'Valor p'],
        filas: [
          ['Regresión', modelo.ssr, 1, modelo.ssr, modelo.F, modelo.valorPModelo],
          ['Error', modelo.sse, modelo.gl, modelo.mse, null, null],
          ['Total', modelo.sst, modelo.n - 1, null, null, null],
        ],
        columnasValorP: [5],
      },
      {
        titulo: `Inferencia sobre los coeficientes (IC al ${nivel})`,
        columnas: ['Coeficiente', 'Estimado', 'Error estándar', 't', 'Valor p', 'Límite inferior', 'Límite superior'],
        filas: [
          [
            'Intercepto b₀',
            modelo.b0,
            modelo.errorEstandarB0,
            tIntercepto,
            Math.min(1, 2 * sfT(Math.abs(tIntercepto), modelo.gl)),
            modelo.b0 - tCritico * modelo.errorEstandarB0,
            modelo.b0 + tCritico * modelo.errorEstandarB0,
          ],
          [
            'Pendiente b₁',
            modelo.b1,
            modelo.errorEstandarB1,
            pendiente.estadistico,
            pendiente.valorP,
            pendiente.intervalo.limiteInferior,
            pendiente.intervalo.limiteSuperior,
          ],
        ],
        columnasValorP: [4],
      },
      ...(prediccion
        ? [
            {
              titulo: `Predicción en x₀ = ${x0} (${nivel})`,
              columnas: ['Concepto', 'ŷ₀', 'Límite inferior', 'Límite superior'],
              filas: [
                ['Respuesta media E(Y | x₀)', prediccion.yEstimada, ...prediccion.intervaloMedia],
                ['Nueva observación y₀', prediccion.yEstimada, ...prediccion.intervaloPrediccion],
              ],
              nota:
                x0 !== undefined && (x0 < Math.min(...x) || x0 > Math.max(...x))
                  ? 'x₀ está fuera del rango observado de x: la predicción es una extrapolación.'
                  : undefined,
            },
          ]
        : []),
      ...tablaNormalidad(normalidad, alfa),
      ...(modelo.n <= 40
        ? [
            {
              titulo: 'Valores ajustados y residuales',
              columnas: ['i', 'x', 'y', 'ŷ', 'e = y − ŷ'],
              filas: x.map((xi, i) => [String(i + 1), xi, y[i], modelo.ajustados[i], modelo.residuales[i]]),
            },
          ]
        : []),
    ];

    return {
      etiqueta: 'Recta de mínimos cuadrados',
      principal: {
        tipo: 'ecuacion',
        respuesta: 'ŷ',
        terminos: [{ coeficiente: modelo.b0 }, { coeficiente: modelo.b1, variable: 'x' }],
      },
      secundario: { etiqueta: 'Coeficiente de determinación R²', valor: modelo.r2 },
      hipotesis: { nula: 'β_{1} = 0', alternativa: 'β_{1} ≠ 0' },
      decision: {
        rechazarH0: pendiente.rechazarH0,
        texto: textoDecision(pendiente.rechazarH0, 't', pendiente.estadistico, pendiente.valorP, Number(alfa.toFixed(4))),
      },
      metricas: [
        { simbolo: 'b_{0}', etiqueta: 'Intercepto', valor: modelo.b0 },
        { simbolo: 'b_{1}', etiqueta: 'Pendiente', valor: modelo.b1 },
        { simbolo: 'r', etiqueta: 'Correlación', valor: modelo.r },
        { simbolo: 'R^{2}', etiqueta: 'Determinación', valor: modelo.r2 },
        { simbolo: 's', etiqueta: 'Error estándar de estimación', valor: modelo.s },
        { simbolo: 'F', etiqueta: 'Significancia del modelo', valor: modelo.F },
        { simbolo: 'S_{xx}', etiqueta: 'Suma de cuadrados de x', valor: modelo.sxx },
        { simbolo: 'S_{xy}', etiqueta: 'Productos cruzados', valor: modelo.sxy },
        { simbolo: 'n', etiqueta: 'Observaciones', valor: modelo.n },
      ],
      graficas: [
        {
          tipo: 'dispersion',
          puntos: x.map((xi, i) => ({ x: xi, y: y[i] })),
          recta: { b0: modelo.b0, b1: modelo.b1 },
          etiquetaX: 'x',
          etiquetaY: 'y',
          titulo: 'Diagrama de dispersión y recta ajustada',
        },
      ],
      tablas,
      interpretacion: (f) =>
        `Por cada unidad que aumenta x, la respuesta ${modelo.b1 >= 0 ? 'aumenta' : 'disminuye'} en promedio ${f(Math.abs(modelo.b1))} unidades. El modelo explica el ${formatearPorcentaje(modelo.r2)} de la variabilidad observada en y (R² = ${f(modelo.r2)}).`,
    };
  },
};

function intensidad(r: number): string {
  const absoluto = Math.abs(r);
  const sentido = r >= 0 ? 'positiva' : 'negativa';
  if (absoluto >= 0.9) return `Muy fuerte, ${sentido}`;
  if (absoluto >= 0.7) return `Fuerte, ${sentido}`;
  if (absoluto >= 0.5) return `Moderada, ${sentido}`;
  if (absoluto >= 0.3) return `Débil, ${sentido}`;
  return 'Muy débil o nula';
}

const correlacion: DefinicionCalculadora = {
  id: 'correlacion',
  unidad: 2,
  seccion: '2.2',
  titulo: 'Coeficiente de correlación de Pearson',
  resumen: 'Coeficientes de correlación y determinación con prueba t de H₀: ρ = 0.',
  modalidades: ['Análisis', 'Prueba de hipótesis'],
  campos: [
    separador('s-datos', 'Datos pareados'),
    { tipo: 'datos', id: 'x', etiqueta: 'Variable x', formato: 'vector', filas: 3 },
    { tipo: 'datos', id: 'y', etiqueta: 'Variable y', formato: 'vector', filas: 3 },
    separador('s-parametros', 'Prueba de significancia'),
    campoAlfa(),
    campoTipoPrueba('ρ', '0', true),
  ],
  valoresIniciales: { x: '', y: '', alfa: '0.05', tipo: 'bilateral' },
  ejemplo: {
    descripcion: 'Ejemplo ilustrativo: tamaño del módulo (KLOC) y esfuerzo de desarrollo (horas-persona).',
    valores: { x: EJEMPLO_X, y: EJEMPLO_Y, alfa: '0.05', tipo: 'bilateral' },
  },
  formulas: ['r = S_{xy} / √(S_{xx}S_{yy})', 't = r√(n − 2) / √(1 − r^{2})'],
  calcular: (v) => {
    const { x, y } = leerPares(v);
    const prueba = correlacionPearson(x, y, { alfa: leerAlfa(v), tipo: leerTipoPrueba(v) });
    const base = resultadoPrueba({
      prueba,
      parametro: 'ρ',
      valorNulo: '0',
      simbolo: 't',
      metricas: [
        { simbolo: 'r', etiqueta: 'Coeficiente de correlación', valor: prueba.r },
        { simbolo: 'r^{2}', etiqueta: 'Coeficiente de determinación', valor: prueba.r2 },
        { etiqueta: 'Intensidad de la relación', valor: intensidad(prueba.r) },
      ],
    });
    return {
      ...base,
      etiqueta: 'Coeficiente de correlación de Pearson',
      principal: { tipo: 'numero', valor: prueba.r, simbolo: 'r' },
      graficas: [
        {
          tipo: 'dispersion',
          puntos: x.map((xi, i) => ({ x: xi, y: y[i] })),
          etiquetaX: 'x',
          etiquetaY: 'y',
          titulo: 'Diagrama de dispersión',
        },
        ...(base.graficas ?? []),
      ],
      interpretacion: (f) =>
        `La relación lineal entre x e y es ${intensidad(prueba.r).toLowerCase()} (r = ${f(prueba.r)}); el ${formatearPorcentaje(prueba.r2)} de la variabilidad de una variable se asocia linealmente con la otra. La correlación no implica causalidad.`,
    };
  },
};

export const CALCULADORAS_UNIDAD_2: DefinicionCalculadora[] = [regresionSimple, correlacion];
