/**
 * Calculadora de la Unidad III: regresión lineal múltiple en notación matricial.
 */
import type { TablaResultado } from '../../../components/MathResults/tipos';
import { formatearPorcentaje } from '../../../utils/formato';
import { valorCriticoF } from '../../../utils/math/consultaTablas';
import { normalidadDelErrorMultiple, predecirMultiple, regresionMultiple } from '../../../utils/math/unidad3_multivariable';
import { campoConfianza, separador, textoDecision } from './comunes';
import { ErrorCampo, leerConfianza, leerMatriz, leerVectorOpcional } from './lectura';
import type { DefinicionCalculadora } from './tipos';
import { intentar, tablaNormalidad } from './unidad2';

const EJEMPLO = `tiempo_ms usuarios carga_kb
70 10 12
92 15 30
94 20 18
122 25 42
119 30 25
145 35 50
142 40 33
141 45 20
169 50 45
166 55 28
195 60 55
192 65 38`;

function tablaMatriz(titulo: string, nombres: string[], matriz: number[][], nota?: string): TablaResultado {
  return {
    titulo,
    columnas: ['', ...nombres],
    filas: matriz.map((fila, i) => [nombres[i], ...fila]),
    nota,
  };
}

const regresionMultipleCalculadora: DefinicionCalculadora = {
  id: 'regresion-multiple',
  unidad: 3,
  seccion: '3.1–3.6',
  titulo: 'Regresión lineal múltiple',
  resumen: 'Estimación matricial β̂ = (XᵀX)⁻¹Xᵀy, significancia global e individual, matriz de varianzas y covarianzas y predicción.',
  modalidades: ['Modelo', 'Prueba de hipótesis', 'Intervalo'],
  campos: [
    separador('s-datos', 'Datos del modelo'),
    {
      tipo: 'datos',
      id: 'datos',
      etiqueta: 'Observaciones (y, x₁, x₂, …, xₖ)',
      formato: 'matriz',
      filas: 9,
      placeholder: 'y x1 x2\n70 10 12\n92 15 30\n…',
      ayuda: 'Una observación por línea; la primera columna es la respuesta y. La primera línea puede contener nombres.',
    },
    separador('s-parametros', 'Parámetros'),
    campoConfianza(undefined),
    {
      tipo: 'datos',
      id: 'x0',
      etiqueta: 'Punto de predicción x₁, …, xₖ (opcional)',
      formato: 'vector',
      filas: 1,
      placeholder: '42 30',
    },
  ],
  valoresIniciales: { datos: '', confianza: '95', x0: '' },
  ejemplo: {
    descripcion: 'Ejemplo ilustrativo: tiempo de respuesta de un servicio web según usuarios concurrentes y tamaño de carga útil.',
    valores: { datos: EJEMPLO, confianza: '95', x0: '42 30' },
  },
  formulas: ['β̂ = (X^{T}X)^{−1}X^{T}y', 'Var(β̂) = s^{2}(X^{T}X)^{−1}', 'F = (SSR/k) / (SSE/(n − k − 1))'],
  calcular: (v) => {
    const { encabezados, filas } = leerMatriz(v, 'datos', {
      etiqueta: 'Las observaciones',
      columnasMinimas: 2,
      filasMinimas: 3,
      permitirEncabezado: true,
    });
    const confianza = leerConfianza(v);
    const alfa = 1 - confianza;
    const nivel = formatearPorcentaje(confianza);
    const y = filas.map((fila) => fila[0]);
    const predictores = filas.map((fila) => fila.slice(1));
    const nombreY = encabezados?.[0] ?? 'y';

    let modelo;
    try {
      modelo = regresionMultiple(predictores, y, confianza, encabezados?.slice(1));
    } catch (error) {
      throw new ErrorCampo('datos', error instanceof Error ? error.message : String(error));
    }

    const punto = leerVectorOpcional(v, 'x0', { etiqueta: 'El punto de predicción' });
    if (punto && punto.length !== modelo.k) {
      throw new ErrorCampo('x0', `Capture ${modelo.k} valores, uno por variable independiente.`);
    }
    const prediccion = punto ? predecirMultiple(modelo, punto) : undefined;
    const normalidad = intentar(() => normalidadDelErrorMultiple(modelo, alfa));
    const critico = valorCriticoF(Number(alfa.toFixed(10)), modelo.glRegresion, modelo.glError);
    const rechazarH0 = modelo.F > critico.valor;
    const etiquetas = modelo.coeficientes.map((c) => c.nombre);
    const significativos = modelo.coeficientes.slice(1).filter((c) => c.valorP < alfa).map((c) => c.nombre);

    const tablas: TablaResultado[] = [
      {
        titulo: `Coeficientes estimados (IC al ${nivel})`,
        columnas: ['Variable', 'β̂', 'Error estándar', 't', 'Valor p', 'Límite inferior', 'Límite superior'],
        filas: modelo.coeficientes.map((c) => [c.nombre, c.estimado, c.errorEstandar, c.t, c.valorP, c.limiteInferior, c.limiteSuperior]),
        columnasValorP: [4],
        filasResaltadas: modelo.coeficientes.map((c, i) => (i > 0 && c.valorP < alfa ? i : -1)).filter((i) => i >= 0),
        nota: 'Las filas resaltadas corresponden a variables significativas al nivel α (H₀: βⱼ = 0).',
      },
      {
        titulo: 'Análisis de varianza del modelo',
        columnas: ['Fuente', 'SC', 'gl', 'CM', 'F', 'Valor p'],
        filas: [
          ['Regresión', modelo.ssr, modelo.glRegresion, modelo.ssr / modelo.glRegresion, modelo.F, modelo.valorPModelo],
          ['Error', modelo.sse, modelo.glError, modelo.mse, null, null],
          ['Total', modelo.sst, modelo.n - 1, null, null, null],
        ],
        columnasValorP: [5],
      },
      tablaMatriz('Matriz (XᵀX)⁻¹', etiquetas, modelo.xtxInversa),
      tablaMatriz(
        'Matriz de varianzas y covarianzas s²(XᵀX)⁻¹',
        etiquetas,
        modelo.matrizVarianzasCovarianzas,
        'La diagonal contiene las varianzas de los coeficientes; su raíz cuadrada es el error estándar.',
      ),
      ...(prediccion
        ? [
            {
              titulo: `Predicción en x₀ = (${punto?.join(', ')}) (${nivel})`,
              columnas: ['Concepto', 'ŷ₀', 'Límite inferior', 'Límite superior'],
              filas: [
                ['Respuesta media', prediccion.yEstimada, ...prediccion.intervaloMedia],
                ['Nueva observación', prediccion.yEstimada, ...prediccion.intervaloPrediccion],
              ],
            },
          ]
        : []),
      ...tablaNormalidad(normalidad, alfa),
    ];

    return {
      etiqueta: 'Modelo de regresión lineal múltiple',
      principal: {
        tipo: 'ecuacion',
        respuesta: 'ŷ',
        terminos: modelo.coeficientes.map((c, j) => ({ coeficiente: c.estimado, variable: j === 0 ? undefined : c.nombre })),
      },
      secundario: { etiqueta: 'Coeficiente de determinación R²', valor: modelo.r2 },
      hipotesis: { nula: 'β_{1} = β_{2} = … = β_{k} = 0', alternativa: 'al menos un β_{j} ≠ 0' },
      decision: {
        rechazarH0,
        texto: textoDecision(rechazarH0, 'F', modelo.F, modelo.valorPModelo, Number(alfa.toFixed(4))),
      },
      metricas: [
        { simbolo: 'R^{2}', etiqueta: 'Determinación', valor: modelo.r2 },
        { simbolo: 'R^{2}_{aj}', etiqueta: 'Determinación ajustada', valor: modelo.r2Ajustado },
        { simbolo: 'R', etiqueta: 'Correlación múltiple', valor: modelo.r },
        { simbolo: 's', etiqueta: 'Error estándar de estimación', valor: modelo.s },
        { simbolo: 'F', etiqueta: 'Prueba global', valor: modelo.F },
        { simbolo: 'p', etiqueta: 'Valor p del modelo', valor: modelo.valorPModelo, esValorP: true },
        { simbolo: 'f_{α}', etiqueta: 'Valor crítico', valor: critico.valor },
        { simbolo: 'n', etiqueta: 'Observaciones', valor: modelo.n },
        { simbolo: 'k', etiqueta: 'Variables independientes', valor: modelo.k },
      ],
      graficas: [
        {
          tipo: 'dispersion',
          puntos: y.map((valor, i) => ({ x: modelo.ajustados[i], y: valor })),
          identidad: true,
          etiquetaX: `${nombreY} ajustado (ŷ)`,
          etiquetaY: `${nombreY} observado`,
          titulo: 'Valores observados contra valores ajustados',
        },
        {
          tipo: 'distribucion',
          distribucion: { tipo: 'f', gl1: modelo.glRegresion, gl2: modelo.glError },
          estadistico: modelo.F,
          valoresCriticos: [critico.valor],
          tipoPrueba: 'derecha',
          simbolo: 'F',
          alfa: Number(alfa.toFixed(4)),
        },
      ],
      tablas,
      interpretacion: (f) =>
        `El modelo explica el ${formatearPorcentaje(modelo.r2)} de la variabilidad de ${nombreY} (R² ajustado = ${f(modelo.r2Ajustado)}). ${
          significativos.length > 0
            ? `Las variables con efecto significativo al nivel α = ${Number(alfa.toFixed(4))} son: ${significativos.join(', ')}.`
            : `Ninguna variable resulta significativa de forma individual al nivel α = ${Number(alfa.toFixed(4))}.`
        }`,
      origenCriticos: critico.origen,
    };
  },
};

export const CALCULADORAS_UNIDAD_3: DefinicionCalculadora[] = [regresionMultipleCalculadora];
