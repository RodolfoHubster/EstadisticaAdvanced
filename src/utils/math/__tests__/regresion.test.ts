import { describe, expect, it } from 'vitest';
import { correlacionPearson, inferenciaPendiente, minimosCuadrados, predecir } from '../unidad2_regresion';
import { predecirMultiple, regresionMultiple } from '../unidad3_multivariable';
import { ErrorCalculo } from '../tipos';

const x = [1, 2, 3, 4, 5];
const y = [2.2, 4.1, 6.2, 7.9, 10.1];

describe('Unidad II. Regresión lineal simple', () => {
  it('estima la recta de mínimos cuadrados', () => {
    const modelo = minimosCuadrados(x, y);
    expect(modelo.sxx).toBeCloseTo(10, 10);
    expect(modelo.sxy).toBeCloseTo(19.6, 10);
    expect(modelo.b1).toBeCloseTo(1.96, 10);
    expect(modelo.b0).toBeCloseTo(0.22, 10);
    expect(modelo.sse + modelo.ssr).toBeCloseTo(modelo.sst, 10);
    expect(modelo.r2).toBeGreaterThan(0.99);
  });

  it('la prueba t de la pendiente equivale a la F del modelo (t^2 = F)', () => {
    const modelo = minimosCuadrados(x, y);
    const inferencia = inferenciaPendiente(modelo, { alfa: 0.05, tipo: 'bilateral' });
    expect(inferencia.estadistico ** 2).toBeCloseTo(modelo.F, 6);
    expect(inferencia.valorP).toBeCloseTo(modelo.valorPModelo, 10);
  });

  it('el intervalo de predicción es más amplio que el de la media', () => {
    const modelo = minimosCuadrados(x, y);
    const prediccion = predecir(modelo, 3.5, 0.95);
    expect(prediccion.yEstimada).toBeCloseTo(0.22 + 1.96 * 3.5, 10);
    const anchoMedia = prediccion.intervaloMedia[1] - prediccion.intervaloMedia[0];
    const anchoPrediccion = prediccion.intervaloPrediccion[1] - prediccion.intervaloPrediccion[0];
    expect(anchoPrediccion).toBeGreaterThan(anchoMedia);
  });

  it('el coeficiente de Pearson coincide con la raíz de R^2', () => {
    const modelo = minimosCuadrados(x, y);
    const correlacion = correlacionPearson(x, y, { alfa: 0.05, tipo: 'bilateral' });
    expect(correlacion.r).toBeCloseTo(Math.sqrt(modelo.r2), 10);
    expect(correlacion.rechazarH0).toBe(true);
  });

  it('rechaza una variable independiente constante', () => {
    expect(() => minimosCuadrados([2, 2, 2], [1, 2, 3])).toThrow(ErrorCalculo);
  });
});

describe('Unidad III. Regresión lineal múltiple (notación matricial)', () => {
  it('con una sola variable reproduce la regresión simple', () => {
    const simple = minimosCuadrados(x, y);
    const multiple = regresionMultiple(
      x.map((valor) => [valor]),
      y,
    );
    expect(multiple.beta[0]).toBeCloseTo(simple.b0, 10);
    expect(multiple.beta[1]).toBeCloseTo(simple.b1, 10);
    expect(multiple.coeficientes[1].errorEstandar).toBeCloseTo(simple.errorEstandarB1, 10);
    expect(multiple.r2).toBeCloseTo(simple.r2, 10);
    expect(multiple.F).toBeCloseTo(simple.F, 6);
  });

  it('recupera un plano conocido y = 1 + 2 x1 - 3 x2', () => {
    const predictores = [
      [1, 2],
      [2, 1],
      [3, 4],
      [4, 3],
      [5, 6],
      [6, 4],
    ];
    const ruido = [0.1, -0.1, 0.05, -0.05, 0.02, -0.02];
    const respuesta = predictores.map(([x1, x2], i) => 1 + 2 * x1 - 3 * x2 + ruido[i]);
    const modelo = regresionMultiple(predictores, respuesta);
    expect(modelo.beta[0]).toBeCloseTo(1, 0);
    expect(modelo.beta[1]).toBeCloseTo(2, 1);
    expect(modelo.beta[2]).toBeCloseTo(-3, 1);
    expect(modelo.glError).toBe(3);
    expect(modelo.matrizVarianzasCovarianzas).toHaveLength(3);
    const prediccion = predecirMultiple(modelo, [3, 3]);
    expect(prediccion.yEstimada).toBeCloseTo(1 + 6 - 9, 0);
  });

  it('detecta multicolinealidad perfecta', () => {
    const predictores = [
      [1, 2],
      [2, 4],
      [3, 6],
      [4, 8],
    ];
    expect(() => regresionMultiple(predictores, [1, 2, 3, 5])).toThrow(ErrorCalculo);
  });
});
